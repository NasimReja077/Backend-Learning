# Redis in this notification system

This project uses MongoDB and Redis for different jobs:

- **MongoDB is the source of truth.** It permanently stores users and notifications.
- **Redis is a fast helper.** It caches unread counts and sends live notification events between backend processes.
- **Socket.IO delivers events to connected browsers.** Redis Pub/Sub carries an event from the process that created it to the process holding the recipient's socket connection.

Redis does not replace MongoDB, and the Pub/Sub channel is not a notification history.

## What Redis does here

### 1. Pub/Sub for real-time notifications

Redis Pub/Sub means **publish/subscribe**:

- A publisher sends a message to a named channel.
- Subscribers to that channel receive the message.
- Redis does not keep a message on the channel for subscribers that are offline.

In this app, the channel is named `notifications`.

When an authenticated sender posts to `POST /api/notifications`, the backend:

1. Saves the notification document in MongoDB.
2. Deletes the recipient's cached unread count.
3. Publishes a JSON event to the Redis `notifications` channel.

The Redis subscriber created in `backend/config/redis.js` listens to that channel. `backend/socket/socket.js` parses each event, finds the Socket.IO room named `user:<recipient-id>`, and emits the `newNotification` event to sockets in that room. A connected browser receives the event and adds the notification to its list.

The browser's Socket.IO connection sends its JWT. The backend verifies it and joins that socket to the matching user's room. This ensures the notification is delivered to the intended user's live connection.

The project creates a **separate Redis connection for the subscriber** using `redisClient.duplicate()`. The regular Redis connection handles commands such as `GET`, `SET`, `DEL`, and `PUBLISH`; the duplicate stays subscribed.

### 2. Unread-count cache

`GET /api/notifications/unread-count` uses a per-user Redis string key:

```text
unread:<user-id>
```

The value is the unread count as a string.

1. The backend checks Redis with `GET`.
2. On a cache hit, it returns the count without counting MongoDB documents.
3. On a cache miss, it counts unread notification documents in MongoDB, stores the result in Redis with a 60-second expiration, and returns it.
4. Creating, reading, or deleting a notification invalidates the key with `DEL`, so the next count request is recalculated from MongoDB.

The expiry is a fallback: if an invalidation is missed, a stale count cannot stay cached indefinitely.

## Request and event flow

```text
Sender browser
    |
    | POST /api/notifications (JWT, recipient, title, message)
    v
Backend API ---- save notification ----------------------> MongoDB
    |
    +---- DEL unread:<recipient-id> ---------------------> Redis
    |
    +---- PUBLISH notifications { recipient, notification } -> Redis
                                                              |
                                                subscriber on each backend
                                                              |
                                                Socket.IO room user:<id>
                                                              |
                                                              v
                                                  Recipient browser (live)

Recipient browser can also GET /api/notifications later.
That list is read from MongoDB, even if the recipient was offline for Pub/Sub.
```

## What happens when the recipient is offline?

Pub/Sub events are **ephemeral**. Redis does not queue this event for a disconnected browser. The notification is still saved in MongoDB before it is published, so the recipient can retrieve it later from `GET /api/notifications` after signing in or reconnecting.

This is why the app reads the notification list from MongoDB instead of treating Redis as the permanent inbox.

## What happens if Redis is unavailable?

Redis is currently **required by the backend**:

- `backend/config/redis.js` connects to Redis at module startup. The backend may fail to start if the connection cannot be established.
- The unread-count route returns an error if Redis commands fail; it does not currently fall back to counting MongoDB.
- Sending saves the notification to MongoDB first, then invalidates Redis and publishes. If a Redis operation fails after the save, the API can return an error even though the notification document was created. A retry could therefore create a duplicate notification.

These are current implementation behaviors, not guarantees that Redis itself provides.

## Redis configuration and Docker

The backend reads `REDIS_URL`, `REDIS_USERNAME`, and (when needed) `REDIS_TLS` from `backend/.env`. The Redis password is loaded from the Docker secret at `/run/secrets/redis_password` through `REDIS_PASSWORD_FILE`; it should not be put into a committed `.env` file.

The current connection code supports either:

- `REDIS_URL`, for example `redis://default@host:port` (or `rediss://...` if the provider requires TLS); the password is added from the secret file, or
- Separate `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`, and `REDIS_TLS` settings.

Compose maps the local secret file `secrets/redis_password.txt` into the backend container. Keep that real secret file private and out of version control.

Check Redis connectivity from the running app with:

```powershell
Invoke-RestMethod http://localhost:5000/api/redis-test
```

A healthy response includes `PONG`.

## If this project did not use Redis

### Benefits

- One fewer service and credential to configure and operate.
- Fewer external connections, outages, and deployment concerns.
- Less application complexity for a small, single-backend project.
- MongoDB already stores the notification history, so a simple version could count unread records directly from MongoDB.

### Costs

- Without another cross-process event mechanism, a notification created on one backend process cannot automatically reach a recipient's socket connected to a different process. A single-process version could emit directly through its local Socket.IO server; multiple processes need a Socket.IO adapter or another shared event system.
- Every unread-count request would query MongoDB instead of being served from the Redis cache. That may be perfectly acceptable at low traffic, but it adds database work as usage grows.
- This backend currently connects to Redis during startup and calls Redis in notification creation and unread-count routes. Removing Redis would require code changes and fallback behavior; merely deleting Redis settings or the Redis service would break the current backend.

For a small deployment, removing Redis can make sense if direct MongoDB counts and one backend process meet the performance and real-time requirements. For multiple backend instances and real-time cross-process delivery, keep Redis Pub/Sub or replace it with an equivalent shared messaging mechanism.

## Relevant implementation

- `backend/config/redis.js` — Redis connections and subscriber.
- `backend/services/notificationService.js` — MongoDB write, unread-cache invalidation, and publish.
- `backend/controllers/notificationController.js` — unread-count cache and invalidation on read/delete.
- `backend/socket/socket.js` — Redis subscription and Socket.IO room delivery.
- `backend/models/Notification.js` — durable notification schema and MongoDB indexes.
