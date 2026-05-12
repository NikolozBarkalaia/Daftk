import React from 'react';
import DaftKImage from '../../../frontend/src/assets/aboutUsPageEng0.jpeg';

const About = () => {
  return (
    <section className="w-full bg-white text-black px-4 md:px-10 lg:px-20 py-16">

      {/* Image Section */}
      <div className="max-w-5xl mx-auto">
        <div className="overflow-hidden rounded-lg shadow-lg">
          <img
            src={DaftKImage}
            alt="DaftK"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
