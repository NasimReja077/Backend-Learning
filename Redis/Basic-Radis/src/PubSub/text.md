4. Understand all important Redis Pub/Sub methods
These are the main commands you should learn.
Redis command	ioredis method	Purpose
PUBLISH	redis.publish()	Send a message
SUBSCRIBE	redis.subscribe()	Subscribe to channels
UNSUBSCRIBE	redis.unsubscribe()	Stop listening
PSUBSCRIBE	redis.psubscribe()	Subscribe using patterns
PUNSUBSCRIBE	redis.punsubscribe()	Stop pattern subscriptions
PUBSUB CHANNELS	redis.pubsub("CHANNELS")	List active channels
PUBSUB NUMSUB	redis.pubsub("NUMSUB", ...)	Count subscribers for channels
PUBSUB NUMPAT	redis.pubsub("NUMPAT")	Count pattern subscriptions

Let's understand them individually.
