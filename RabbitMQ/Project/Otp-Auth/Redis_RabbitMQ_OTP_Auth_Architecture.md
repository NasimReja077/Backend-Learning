# How Redis + RabbitMQ Work in the OTP Authentication Project

> Project: Node.js + Express + Redis + RabbitMQ + MongoDB\
> Purpose: Understand exactly why Redis and RabbitMQ are both used, what
> data each one stores, and how they work together during OTP
> registration.

------------------------------------------------------------------------

## 1. Big picture

This application uses **Redis for short-lived authentication state** and
**RabbitMQ for asynchronous email jobs**.

They solve different problems:

  -----------------------------------------------------------------------
  Technology              Main responsibility     Example in this project
  ----------------------- ----------------------- -----------------------
  Redis                   Fast temporary          Store a hashed OTP for
                          key-value storage       5 minutes, count failed
                                                  attempts, enforce
                                                  resend cooldown

  RabbitMQ                Message broker / job    Queue OTP and
                          queue                   welcome-email jobs for
                                                  a background worker

  Email worker            Consume and process     Read a job from
                          jobs                    RabbitMQ and send an
                                                  email with Nodemailer

  MongoDB                 Persistent application  Store the verified user
                          data                    account
  -----------------------------------------------------------------------

**Important distinction:** Redis does not send emails, and RabbitMQ does
not verify the OTP. The Express API performs OTP verification. Redis
stores the temporary OTP data; RabbitMQ transports email jobs to a
worker.

## 2. Architecture diagram

``` mermaid
flowchart TD
    U[User / React / Postman] -->|POST email| API[Express API]

    API -->|Generate 6-digit OTP| GEN[OTP utility]
    GEN -->|HMAC hash| API

    API -->|Store hash + TTL| R[(Redis)]
    API -->|Publish OTP email job| Q[[RabbitMQ: email_queue]]

    Q -->|Consume job| W[Email Worker]
    W -->|Send OTP email| SMTP[Email provider / SMTP]
    SMTP -->|Email delivered| U

    U -->|Submit OTP| API
    API -->|Read stored hash| R
    API -->|Compare submitted OTP| V{OTP valid?}

    V -->|No| API
    V -->|Yes| DB[(MongoDB)]
    DB -->|Create/find verified user| API

    API -->|Publish welcome job for new user| Q
    Q -->|Consume welcome job| W
    W -->|Send welcome email| SMTP

    API -->|Return JWT| U
```

## 3. Why do we need both Redis and RabbitMQ?

Imagine the user enters `user@example.com` to register.

The backend has two separate tasks:

1.  It must remember the OTP temporarily so it can verify the code
    later.
2.  It must arrange for an email to be sent.

These are different jobs.

### Redis: temporary OTP storage

Redis stores data as key-value pairs in memory. In this project, the API
stores the **HMAC hash** of the OTP, not the plain OTP.

Example:

``` text
Key:   otp:user@example.com
Value: <HMAC-SHA256 hash>
TTL:   300 seconds
```

The API can also store:

``` text
otp:cooldown:user@example.com  -> "1"       TTL 60 seconds
otp:attempts:user@example.com  -> "3"       TTL up to 300 seconds
```

Redis is a good fit because:

-   Reads and writes are very fast.
-   Keys can expire automatically.
-   `INCR` can count failed attempts.
-   `DEL` can remove an OTP after successful verification.
-   It avoids keeping short-lived OTP state in the permanent user
    collection.

Redis is **not** the email queue in this design.

### RabbitMQ: asynchronous email jobs

RabbitMQ is a message broker. The API publishes a message to a queue; a
separate worker consumes that message and sends the email.

Example OTP job:

``` json
{
  "type": "OTP",
  "email": "user@example.com",
  "otp": "483921"
}
```

Example welcome job:

``` json
{
  "type": "WELCOME",
  "email": "user@example.com"
}
```

RabbitMQ is useful because:

-   The API does not need to wait for SMTP to send the email.
-   A worker can process jobs independently of the API request.
-   Messages can be acknowledged after successful processing.
-   Multiple workers can process jobs for higher throughput.
-   Durable queues and persistent messages can help jobs survive broker
    restarts.

RabbitMQ is **not** where the OTP is looked up or compared in this
design.

## 4. Flow A --- User requests an OTP

Endpoint:

``` http
POST /api/auth/send-otp
Content-Type: application/json
```

Request:

``` json
{
  "email": "user@example.com"
}
```

### Step-by-step

1.  Express receives the email.
2.  The API normalizes and validates the email address.
3.  Redis is checked for an active resend cooldown.
4.  The OTP utility generates a cryptographically random six-digit code.
5.  The API creates an HMAC hash using the OTP secret and email.
6.  Redis stores the hash with a 300-second expiration.
7.  Redis stores a 60-second resend cooldown.
8.  The API publishes an `OTP` job to RabbitMQ.
9.  RabbitMQ places the job in `email_queue`.
10. The email worker consumes the job and calls Nodemailer.
11. The worker acknowledges the message after the email send operation
    succeeds.

``` mermaid
sequenceDiagram
    actor User
    participant API as Express API
    participant Redis
    participant MQ as RabbitMQ
    participant Worker as Email Worker
    participant SMTP as SMTP Provider

    User->>API: POST /send-otp (email)
    API->>Redis: GET otp:cooldown:email
    Redis-->>API: No cooldown
    API->>API: Generate OTP + HMAC hash
    API->>Redis: SET otp:email hash EX 300
    API->>Redis: SET cooldown key EX 60
    API->>MQ: Publish OTP job
    MQ-->>API: Publisher confirm
    API-->>User: OTP request queued
    MQ->>Worker: Deliver OTP job
    Worker->>SMTP: Send OTP email
    SMTP-->>Worker: Send accepted
    Worker->>MQ: ACK message
```

### What happens in Redis?

Conceptually, after the request:

``` text
otp:user@example.com
    = HMAC hash of the OTP
    TTL = 300 seconds

otp:cooldown:user@example.com
    = 1
    TTL = 60 seconds
```

The plain OTP is included in the RabbitMQ email job so the worker can
put it in the email. Protect access to RabbitMQ and its messages. For
stronger production security, use a short-lived encrypted payload or
another secure delivery design, and never log OTP values.

### What happens in RabbitMQ?

The API publishes a message to:

``` text
Queue: email_queue
```

The message body identifies the job:

``` json
{
  "type": "OTP",
  "email": "user@example.com",
  "otp": "483921"
}
```

The worker checks `type` and calls `sendOTPEmail()`.

**The API response means the job was accepted by RabbitMQ, not that the
email has already reached the user's inbox.**

## 5. Flow B --- Worker sends the OTP email

The worker is a separate Node.js process. It connects to RabbitMQ and
subscribes to `email_queue`.

``` mermaid
flowchart TD
    A[Worker starts] --> B[Connect to RabbitMQ]
    B --> C[Assert email_queue]
    C --> D[Set prefetch limit]
    D --> E[Wait for message]
    E --> F[Parse JSON message]
    F --> G{Message type?}
    G -->|OTP| H[sendOTPEmail]
    G -->|WELCOME| I[sendWelcomeEmail]
    H --> J{Send succeeded?}
    I --> J
    J -->|Yes| K[ACK]
    J -->|No| L[NACK / failure handling]
    K --> E
    L --> E
```

### Important RabbitMQ worker methods

  -----------------------------------------------------------------------
  Code                                Meaning
  ----------------------------------- -----------------------------------
  `assertQueue()`                     Ensure the queue exists

  `consume()`                         Register a consumer

  `prefetch(5)`                       Limit this consumer to five
                                      unacknowledged deliveries

  `ack(message)`                      Tell RabbitMQ the job was processed
                                      successfully

  `nack(message, false, false)`       Reject the message without
                                      requeueing it

  `createConfirmChannel()`            Use publisher confirms for
                                      publishing
  -----------------------------------------------------------------------

### ACK vs NACK

**ACK:** The worker successfully completes the email-send operation.
RabbitMQ can remove the message from the queue.

**NACK:** The worker could not process the message. In the simple
sample, `requeue=false` rejects it without retrying. Without a
dead-letter exchange, that message may be discarded.

For production, configure retry queues and a dead-letter queue (DLQ).
Also make the email job idempotent where possible because a worker can
crash after sending an email but before acknowledging the message. In
that situation, RabbitMQ may redeliver the job and the email could be
sent twice.

## 6. Flow C --- User verifies the OTP

Endpoint:

``` http
POST /api/auth/verify-otp
Content-Type: application/json
```

Request:

``` json
{
  "email": "user@example.com",
  "otp": "483921"
}
```

### Step-by-step

1.  Express validates the email and six-digit OTP format.
2.  The API reads `otp:<email>` from Redis.
3.  If the key does not exist, the OTP has expired or was not issued.
4.  Redis increments the failed-attempt counter.
5.  The API calculates the HMAC hash of the submitted OTP.
6.  It compares the calculated hash with the stored hash using a
    timing-safe comparison.
7.  If invalid, the API returns an error and preserves the OTP until
    expiry or the attempt limit.
8.  If valid, the API deletes the OTP and attempt counter.
9.  The API finds or creates the user in MongoDB.
10. The API signs a JWT and returns it to the client.
11. If this is a newly created user, the API publishes a `WELCOME` job
    to RabbitMQ.
12. The worker sends the welcome email.

``` mermaid
sequenceDiagram
    actor User
    participant API as Express API
    participant Redis
    participant DB as MongoDB
    participant MQ as RabbitMQ
    participant Worker as Email Worker

    User->>API: POST /verify-otp (email, OTP)
    API->>Redis: GET otp:email
    Redis-->>API: Stored HMAC hash
    API->>Redis: INCR attempts key
    Redis-->>API: Attempt count
    API->>API: HMAC submitted OTP + compare

    alt OTP invalid
        API-->>User: 400 Invalid OTP
    else OTP valid
        API->>Redis: DEL OTP + attempts
        API->>DB: Find or create verified user
        DB-->>API: User document
        API->>API: Sign JWT
        opt Newly created user
            API->>MQ: Publish WELCOME job
            MQ-->>API: Publisher confirm
        end
        API-->>User: 200 + JWT + user
        MQ->>Worker: Deliver WELCOME job
        Worker-->>MQ: ACK after email send
    end
```

## 7. Redis commands used in this project

  ------------------------------------------------------------------------
  Command / operation      Usage                   Reason
  ------------------------ ----------------------- -----------------------
  `SET key value EX 300`   Save OTP hash           Automatically expire
                                                   after 5 minutes

  `GET key`                Read OTP hash           Verify submitted OTP

  `DEL key`                Remove OTP              Make OTP one-time use

  `INCR key`               Increment attempts      Limit brute-force
                                                   guesses

  `EXPIRE key 300`         Set attempt-counter TTL Clean up old counters

  `SET key value EX 60`    Set cooldown            Prevent repeated OTP
                                                   requests
  ------------------------------------------------------------------------

### Example Redis CLI practice

``` bash
# Store a temporary value for 5 minutes
SET otp:test@example.com sample_hash EX 300

# Read it
GET otp:test@example.com

# Check remaining lifetime
TTL otp:test@example.com

# Count failed attempts
INCR otp:attempts:test@example.com

# Delete after successful verification
DEL otp:test@example.com
```

The `sample_hash` above is only a placeholder, not a real OTP hash.

## 8. RabbitMQ concepts used in this project

### Producer

The Express API is the **producer** because it publishes email jobs.

``` js
await publishToQueue({
  type: "OTP",
  email,
  otp,
});
```

### Queue

`email_queue` temporarily holds jobs until a worker consumes them.

### Consumer

The email worker is the **consumer** because it reads jobs and sends
emails.

### Message acknowledgment

The worker calls `ack()` only after the email sending function resolves
successfully.

### Prefetch

``` js
channel.prefetch(5);
```

This limits the number of unacknowledged deliveries sent to this
consumer. It does not mean five emails are necessarily sent
simultaneously; that depends on how the consumer processes messages.

### Durable queue and persistent message

``` js
await channel.assertQueue("email_queue", {
  durable: true,
});

channel.sendToQueue(
  "email_queue",
  Buffer.from(JSON.stringify(job)),
  { persistent: true }
);
```

These settings request durable queue and message persistence. For
stronger delivery guarantees, use publisher confirms, durable topology,
appropriate replicated queues, and carefully designed retry/dead-letter
handling. Persistence alone is not a complete end-to-end guarantee.

## 9. Example: What if the user enters the wrong OTP?

Suppose the valid OTP is `483921`.

    Attempt User enters   Result      Attempts stored
  --------- ------------- --------- -----------------
          1 `111111`      Invalid                   1
          2 `222222`      Invalid                   2
          3 `333333`      Invalid                   3
          4 `444444`      Invalid                   4
          5 `555555`      Invalid                   5
          6 `483921`      Blocked         OTP deleted

In the sample controller, the attempt counter is incremented before
checking the OTP, and attempts greater than five are blocked. Therefore,
the correct OTP on attempt six is also rejected. The user must request a
new OTP.

For production, make checking and consuming the OTP atomic with a Redis
Lua script or equivalent atomic operation. This prevents concurrent
verification requests from bypassing attempt limits or consuming the
same OTP more than once.

## 10. Failure scenarios and reliability

  -----------------------------------------------------------------------
  Failure                 Simple implementation   Production improvement
                          behavior                
  ----------------------- ----------------------- -----------------------
  Redis is unavailable    OTP                     Monitor Redis,
                          request/verification    configure persistence
                          fails                   and recovery

  RabbitMQ is unavailable OTP request cannot      Return a temporary
                          queue the email         error; retry publishing
                                                  safely

  SMTP provider is        Worker rejects the job  Retry with backoff and
  unavailable                                     DLQ

  Worker crashes before   Message may be          Make processing
  ACK                     redelivered             idempotent

  OTP expires             Redis key disappears    Ask user to request a
                                                  new OTP

  User requests many OTPs Cooldown blocks         Add IP + email limits
                          frequent requests       and abuse monitoring

  Welcome job publish     User may be created but Use a transactional
  fails                   welcome email is not    outbox
                          queued                  
  -----------------------------------------------------------------------

### Recommended production retry design

``` mermaid
flowchart LR
    Q[Main email queue] --> W[Email worker]
    W -->|Success| ACK[ACK]
    W -->|Temporary failure| R[Retry queue with TTL]
    R -->|TTL expires / DLX| Q
    W -->|Permanent failure or retry limit| DLQ[Dead-letter queue]
```

A retry queue should use a dead-letter exchange (DLX) to route expired
retry messages back to the main queue. Add a retry-count limit so a
permanently failing job cannot loop forever.

## 11. Security checklist

-   Generate OTPs with a cryptographically secure random generator.
-   Store only an HMAC hash in Redis, using a strong secret from
    environment variables.
-   Use constant-time comparison for OTP hashes.
-   Expire OTPs quickly (for example, five minutes).
-   Limit attempts and resend frequency by both email and IP.
-   Never log OTP values, passwords, JWTs, or sensitive message
    payloads.
-   Restrict RabbitMQ and Redis network access; use authentication and
    TLS in production.
-   Do not expose RabbitMQ management credentials publicly.
-   Do not commit `.env` to Git.
-   Make verification atomic to prevent race conditions.
-   Use retry limits, a DLQ, and idempotency for email jobs.
-   Consider a transactional outbox so database changes and
    welcome-email events are not lost between separate operations.

## 12. Interview questions

**Q1. Why use Redis for OTP instead of MongoDB?**

Redis provides very fast temporary storage and key expiration. OTPs have
a short lifetime, so Redis TTL is convenient. MongoDB remains the
persistent store for user accounts.

**Q2. Why use RabbitMQ instead of sending email directly in the API?**

Email delivery can be slow or temporarily unavailable. RabbitMQ lets the
API enqueue a job and respond without waiting for the email provider. A
worker handles delivery independently.

**Q3. What is the difference between Redis and RabbitMQ?**

Redis is an in-memory data store used here for OTP state, cooldowns, and
attempt counters. RabbitMQ is a message broker used here to distribute
asynchronous email jobs.

**Q4. What is ACK in RabbitMQ?**

ACK is the consumer's confirmation that it successfully processed a
message. RabbitMQ can then remove that delivery from the queue.

**Q5. What happens if the worker crashes?**

If a message has not been acknowledged, RabbitMQ can requeue and
redeliver it when the consumer connection closes. This is why consumers
should be idempotent.

**Q6. Does a successful RabbitMQ publish mean the email was delivered?**

No. It means the broker accepted the published message when publisher
confirms are used. Email delivery is a later operation performed by the
worker and SMTP provider.

**Q7. Why should OTP verification be atomic?**

Two requests could read the same OTP before either deletes it. Atomic
verification ensures only one request can successfully consume the OTP
and that attempt limits cannot be bypassed by concurrent requests.

------------------------------------------------------------------------

## 13. Final mental model

Remember these four responsibilities:

``` text
REDIS
"Remember this OTP temporarily."
        |
        v
EXPRESS API
"Check whether the submitted OTP is correct."
        |
        v
RABBITMQ
"Hold this email job until a worker processes it."
        |
        v
EMAIL WORKER
"Send the email and acknowledge the job."
```

**One-line interview answer:**

"In my OTP authentication system, I use Redis to store hashed OTPs with
TTL, cooldowns, and failed-attempt counters. I use RabbitMQ to decouple
email delivery from the Express API. The API publishes OTP and
welcome-email jobs, and a background worker consumes those jobs and
sends emails through Nodemailer. This keeps authentication state
temporary and email processing asynchronous."
