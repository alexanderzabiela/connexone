const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http = require('http');

const app = express();

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    epoch: Float!
    metrics: String!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    epoch: () => Date.now() / 1000,
    metrics: () => 'Your_Prometheus_Metrics_Here',  // Replace this with your actual metrics data
  },
};

// Start Apollo Server
async function startApolloServer(typeDefs, resolvers) {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  
  await server.start();

  // Apply the Apollo app to our express server
  server.applyMiddleware({ app, path: '/graphql' });
  
  // Handle CORS issues
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

  httpServer.listen({ port: 4001 }, () => {
    console.log(`🚀 Server ready at http://localhost:4001${server.graphqlPath}`);
  });
}

startApolloServer(typeDefs, resolvers);
