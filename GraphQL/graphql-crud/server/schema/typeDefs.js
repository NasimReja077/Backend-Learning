const { gql } = require("apollo-server-express");

const typeDefs = gql`

  # 👤 USER TYPE
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int!
  }

  # 🔍 QUERIES (READ)
  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  # ✏️ MUTATIONS (CREATE, UPDATE, DELETE)
  type Mutation {

    # ➕ CREATE
    addUser(
      name: String!
      email: String!
      age: Int!
    ): User

    # ✏️ UPDATE
    updateUser(
      id: ID!
      name: String
      email: String
      age: Int
    ): User

    # ❌ DELETE
    deleteUser(id: ID!): User
  }
`;

module.exports = typeDefs;