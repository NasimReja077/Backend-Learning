const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

const managementUrl =
  process.env.RABBITMQ_MANAGEMENT_URL || "http://localhost:15672";
const username = process.env.RABBITMQ_USER || "guest";
const password = process.env.RABBITMQ_PASSWORD || "guest";

function getJson(endpoint) {
  const url = new URL(endpoint, managementUrl);

  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
          Accept: "application/json",
        },
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                `Management API returned ${response.statusCode}: ${body}`
              )
            );
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`Management API returned invalid JSON: ${error.message}`));
          }
        });
      }
    );

    req.on("error", reject);
  });
}

async function reportBroker() {
  const [overview, queues] = await Promise.all([
    getJson("/api/overview"),
    getJson("/api/queues"),
  ]);

  console.log(`RabbitMQ: ${overview.rabbitmq_version}`);
  console.log(`Node: ${overview.node}`);
  console.log(`Connections: ${overview.object_totals.connections}`);
  console.log(`Channels: ${overview.object_totals.channels}`);
  console.log(`Queues: ${overview.object_totals.queues}`);
  console.log(`Messages ready: ${overview.queue_totals.messages_ready}`);
  console.log(
    `Messages unacknowledged: ${overview.queue_totals.messages_unacknowledged}`
  );

  if (queues.length === 0) {
    console.log("No queues found.");
    return;
  }

  for (const queue of queues) {
    console.log(
      `${queue.vhost}/${queue.name}: ready=${queue.messages_ready}, ` +
        `unacked=${queue.messages_unacknowledged}, consumers=${queue.consumers}`
    );
  }
}

reportBroker().catch((error) => {
  console.error("Could not query RabbitMQ Management API:", error.message);
  process.exitCode = 1;
});
