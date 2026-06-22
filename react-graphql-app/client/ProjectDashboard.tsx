import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
//import { GET_PROJECTS } from '../graphql/queries';

const ProjectDashboard = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    GET_PROJECTS().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 style={{ color: 'red', fontSize: '24px' }}>Project Dashboard</h1>
      <ul>
        {data.projects.map((project) => (
          <li style={{ padding: '10px', background: '#f0f0f0' }}>
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDashboard;