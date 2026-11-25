
require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { connectRabbitMQ } = require("./config/rabbitmq");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectRabbitMQ();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
