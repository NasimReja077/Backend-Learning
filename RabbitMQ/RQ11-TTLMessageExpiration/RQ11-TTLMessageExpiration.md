# RQ11: Message TTL and Expiration

**Time to live (TTL)** limits how long a message or queue remains valid. Once a
message expires, RabbitMQ removes it from the source queue. If dead-lettering is
configured, the expired message can instead be routed to a dead-letter queue.

```mermaid
flowchart LR
    P[Producer] -->|persistent messages| Q[(ttl_tasks<br/>message TTL: 10 s)]
    Q -->|expires| D[(expired_tasks<br/>dead-letter destination)]
    D --> C[Expiry consumer]
```

This example uses queue-level message TTL via `messageTtl`. RabbitMQ also
supports per-message expiration using the AMQP `expiration` property, expressed
as a string containing milliseconds. Queue-level and per-message TTL solve
different needs: a queue policy applies a common limit, while message
expiration can vary for each published message.

## Example files

- [`producer.js`](./producer.js) declares a durable queue with a 10-second
  message TTL and publishes persistent reminders.
- [`consumer.js`](./consumer.js) reads messages routed to `expired_tasks`.

The source queue and dead-letter queue are separate: the expiry consumer does
not consume from `ttl_tasks`.

## Run it

Install dependencies with `npm install` in this folder and start RabbitMQ at
`amqp://localhost`. Run the producer, wait longer than 10 seconds, then start
the consumer:

```sh
npm run producer
# Wait at least 10 seconds
npm run consumer
```

The expired messages should appear on the destination queue. Expiration timing
is broker-managed and should not be treated as an exact scheduler.

## Why and when to use it

Use TTL for temporary work that becomes stale after a time limit, such as
short-lived verification codes, cache-like messages, or delayed cleanup. Pair
it with dead-letter routing when expired work needs a follow-up action or
audit.

## Real-life use case

A checkout service publishes a reservation message with a short validity
window. If it is not processed before expiry, the message can be routed to a
queue that releases the reserved inventory.

## Advantages

- Expired messages do not remain useful work in the source queue indefinitely.
- Queue-level TTL applies a consistent limit; per-message TTL supports
  different deadlines.
- Dead-letter routing can turn expiration into an explicit workflow event.

## Disadvantages and trade-offs

- TTL is not a precise timer; expiration and dead-lettering can occur later than
  the configured duration.
- Without a dead-letter route, expired messages are discarded.
- Queue arguments are declarations; changing a queue's TTL may require policy
  updates or replacing the queue, depending on how it was configured.
- Expiration is not a substitute for application-level deadlines or scheduled
  jobs.
