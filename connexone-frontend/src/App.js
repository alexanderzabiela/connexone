import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:4001/graphql',
  headers: {
    authorization: 'mysecrettoken'
  },
  cache: new InMemoryCache()
});

const FETCH_EPOCH = gql`
  query GetEpoch {
    epoch
    metrics
  }
`;

function App() {
  const [timeDiff, setTimeDiff] = useState(0);
  const { data, loading, error, refetch } = useQuery(FETCH_EPOCH, { pollInterval: 30000 }); 

  useEffect(() => {
    const interval = setInterval(() => {
      if (data?.epoch) {
        const currentClientTime = Date.now() / 1000;
        setTimeDiff(Math.floor(currentClientTime - data.epoch));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Side */}
      <div className="w-1/2 bg-white p-8">
        <h2 className="text-2xl mb-4">Server Time (Epoch):</h2>
        <p className="mb-8">{data?.epoch}</p>
        <h2 className="text-2xl mb-4">Difference:</h2>
        <p>{new Date(timeDiff * 1000).toISOString().substring(11, 19)}</p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-gray-200 p-8">
        {/* Metrics display logic will go here once you have the /metrics endpoint */}
        {/* For now, just an example */}
        <pre>{data?.metrics} hello</pre>
      </div>
    </div>
  );
}

function Main() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default Main;
