import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import promMiddleware from 'express-prometheus-middleware';

const schema = buildSchema(`
    type Query {
        epoch: Float!
    }
`);

const rootValue = {
    epoch: () => Date.now() / 1000,
};

const app = express();

// Prometheus middleware
app.use(promMiddleware({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
}));

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
}));

app.listen(4001, () => {
    console.log('Server running at http://localhost:4000/graphql');
});
