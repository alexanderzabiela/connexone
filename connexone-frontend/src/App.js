import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  headers: {
    authorization: 'mysecrettoken'
  },
  cache: new InMemoryCache()
});

const FETCH_EPOCH = gql`
  query GetEpoch {
    time {
      epoch
      description
    }
  }
`;

function App() {
  const [timeDiff, setTimeDiff] = useState(0);
  const [metrics, setMetrics] = useState(null);
  const { data, loading, error } = useQuery(FETCH_EPOCH, { pollInterval: 30000 });

  useEffect(() => {
    const fetchMetrics = async () => {
      const metricsResponse = await fetch('http://localhost:4000/metrics', {
        headers: { 'Authorization': 'mysecrettoken' }
      });
      const metricsData = await metricsResponse.text();
      setMetrics(metricsData);
    };

    fetchMetrics();

    const interval = setInterval(() => {
      if (data?.time?.epoch) {
        const currentClientTime = Date.now() / 1000;
        setTimeDiff(Math.floor(currentClientTime - data.time.epoch));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
      {/* Left Side */}
      <div className="w-1/2 bg-white p-8">
        <h2 className="text-2xl mb-4">{data?.time?.description}</h2>
        <p className="mb-8">{data?.time?.epoch}</p>
        <h2 className="text-2xl mb-4">Difference:</h2>
        <p>{new Date(timeDiff * 1000).toISOString().substring(11, 19)}</p>
      </div>

      {/* Right Side */}
      <div className="w-1/2 bg-gray-200 p-8">
        <pre>{metrics}</pre>
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
