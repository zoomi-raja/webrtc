import React from 'react';
const notFound = (props) => (
  <div style={{ position: 'relative', height: '80vh', fontSize: '5rem' }}>
    <span
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      Path not found
    </span>
  </div>
);
export default notFound;
