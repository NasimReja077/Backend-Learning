const express = require("express");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const cors = require("cors");

const app = express();

app.use(cors());

mongoose.connect("mongodb://localhost:27017/graphqlCRUD", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use("/graphql", graphqlHTTP({
  schema,
  graphiql: true
}));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});