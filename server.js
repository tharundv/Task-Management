// server.js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

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
    tasks: async () => {
      try {
        return await Task.find();
      } catch (error) {
        throw new Error('Error fetching tasks');
      }
    },
    task: async (_, { id }) => {
      try {
        return await Task.findById(id);
      } catch (error) {
        throw new Error(`Error fetching task with ID: ${id}`);
      }
    },
  },
  Mutation: {
    addTask: async (_, { title }) => {
      try {
        const task = new Task({ title, completed: false });
        await task.save();
        return task;
      } catch (error) {
        throw new Error('Error adding task');
      }
    },
    completeTask: async (_, { id }) => {
      try {
        const task = await Task.findById(id);
        if (!task) throw new Error(`Task with ID: ${id} not found`);
        task.completed = true;
        await task.save();
        return task;
      } catch (error) {
        throw new Error(`Error completing task with ID: ${id}`);
      }
    },
  },
};

// Create Apollo Server
async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  const app = express();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
});
