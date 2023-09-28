import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import cors from 'cors';
import promMiddleware from 'express-prometheus-middleware';

const app = express();

// Use CORS middleware before other middlewares
app.use(cors({
    origin: 'http://localhost:3000', // adjust this if your front-end is hosted on a different domain
    credentials: true,
  }));

// Setting up Prometheus middleware
app.use(promMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true
}));

// GraphQL type definitions and resolvers
const typeDefs = gql`
  type Query {
    time: TimeData!
  }

  type TimeData {
    epoch: Float!
    description: String!
  }
`;

const resolvers = {
  Query: {
    time: () => ({
      epoch: Date.now() / 1000,
      description: "The current server time, in epoch seconds, at time of processing the request."
    }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

// Start the Apollo Server and apply middleware
(async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen({ port: 4000 }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
    console.log('Metrics available at http://localhost:4000/metrics');
  });
})();
