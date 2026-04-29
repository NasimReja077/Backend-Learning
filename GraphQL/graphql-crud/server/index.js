const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./resolvers/resolvers");

const app = express();

app.use(cors());

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/graphqlCRUD", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ✅ Apollo Server Setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();

  server.applyMiddleware({ app });

  app.listen(5000, () => {
    console.log(`🚀 Server running at http://localhost:5000${server.graphqlPath}`);
  });
}

startServer();