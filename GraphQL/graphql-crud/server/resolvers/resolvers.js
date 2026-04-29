const User = require("../models/User");

const resolvers = {

  // 🔍 QUERIES
  Query: {
    getUsers: async () => {
      return await User.find();
    },

    getUser: async (_, { id }) => {
      return await User.findById(id);
    }
  },

  // ✏️ MUTATIONS (CRUD)
  Mutation: {

    // ➕ CREATE
    addUser: async (_, { name, email, age }) => {
      const user = new User({ name, email, age });
      return await user.save();
    },

    // ✏️ UPDATE
    updateUser: async (_, { id, name, email, age }) => {
      return await User.findByIdAndUpdate(
        id,
        { name, email, age },
        { new: true }
      );
    },

    // ❌ DELETE
    deleteUser: async (_, { id }) => {
      return await User.findByIdAndDelete(id);
    }
  }
};

module.exports = resolvers;