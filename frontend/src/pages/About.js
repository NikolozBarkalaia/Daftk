import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="page-title">About DaftK</h1>
      <div style={{ lineHeight: '1.8', color: 'var(--color-gray-dark)', fontSize: '1.1rem' }}>
        <p style={{ marginBottom: '20px' }}>
          Founded on the principles of minimalism and uncompromising quality, DaftK redefines modern luxury essentials.
        </p>
        <p style={{ marginBottom: '20px' }}>
          We believe that true elegance lies in simplicity. Our collections are meticulously crafted from the finest materials, designed not just for a season, but for a lifetime. Each piece is an exploration of form and function, stripped of excess to reveal its pure essence.
        </p>
        <p>
          Embrace the power of understated design. Welcome to DaftK.
        </p>
      </div>
    </div>
  );
};

export default About;
