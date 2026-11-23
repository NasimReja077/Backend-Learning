const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

const managementUrl =
  process.env.RABBITMQ_MANAGEMENT_URL || "http://localhost:15672";
const username = process.env.RABBITMQ_USER || "guest";
const password = process.env.RABBITMQ_PASSWORD || "guest";
const queueName = process.env.RABBITMQ_QUEUE || "rq15_ready_unacked";

function getJson(endpoint) {
  const url = new URL(endpoint, managementUrl);

  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.get(
      url,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`
          ).toString("base64")}`,
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
            reject(new Error(`Invalid JSON: ${error.message}`));
          }
        });
      }
    );

    request.on("error", reject);
  });
}

async function monitorOnce() {
  const queues = await getJson("/api/queues");
  const queue = queues.find((item) => item.name === queueName);

  if (!queue) {
    console.log(
      `${new Date().toLocaleTimeString()}  queue="${queueName}" not found`
    );
    return;
  }

  console.log(
    `${new Date().toLocaleTimeString()}  ` +
      `ready=${queue.messages_ready ?? 0}  ` +
      `unacked=${queue.messages_unacknowledged ?? 0}  ` +
      `total=${queue.messages ?? 0}  ` +
      `consumers=${queue.consumers ?? 0}`
  );
}

setInterval(() => {
  monitorOnce().catch((error) => {
    console.error("Monitor error:", error.message);
  });
}, 1000);

monitorOnce().catch((error) => {
  console.error("Could not monitor queue:", error.message);
  process.exitCode = 1;
});
