// server.js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskdb', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Task model
const Task = mongoose.model('Task', {
  title: String,
  completed: Boolean,
});

// Define GraphQL schema
const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Query {
    tasks: [Task]
    task(id: ID!): Task
  }

  type Mutation {
    addTask(title: String!): Task
    completeTask(id: ID!): Task
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    tasks: () => Task.find(),
    task: (_, { id }) => Task.findById(id),
  },
  Mutation: {
    addTask: async (_, { title }) => {
      const task = new Task({ title, completed: false });
      await task.save();
      return task;
    },
    completeTask: async (_, { id }) => {
      const task = await Task.findById(id);
      task.completed = true;
      await task.save();
      return task;
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
});
