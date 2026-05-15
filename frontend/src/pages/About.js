import React from 'react';
import DaftKImage from '../../../frontend/src/assets/aboutUsPageEng0.jpeg';
import Logo1 from '../../../frontend/src/assets/page-2.png';
import Logo2 from '../../../frontend/src/assets/page-3.png';
import Image from '../../../frontend/src/assets/image.png';

const About = () => {
  return (
    <section className="w-full bg-white text-black px-6 md:px-16 lg:px-24 py-10">

      {/* Top Logos */}
      <div className="flex items-center justify-center gap-10 mb-10 flex-wrap">
        <img src={Logo1} alt="logo1" className="h-12 md:h-16 object-contain" />
        <img src={Logo2} alt="logo2" className="h-12 md:h-16 object-contain" />
      </div>

      {/* Title */}
      <h1
        className="text-center text-3xl md:text-5xl lg:text-6xl mb-10"
        style={{ fontFamily: "'Great Vibes', cursive" }}
      >
        Welcome to the world of Daftk
      </h1>

      <br />

      {/* Text Content */}
      <div className="max-w-4xl mx-auto text-left text-sm md:text-base leading-relaxed text-gray-700">

        <p>
          <span className="font-bold">Daftk</span> was created for those who choose to follow their own path.
        </p>

        <p>
          We believe style is more than what we wear —
        </p>

        <p>
          It reflects how we think, how we move, and how we exist in the world.
        </p>

        <br />

        <p>
          <span className="font-bold">"Daftk"</span>  represents a free spirit — the courage to be different,
        </p>

        <p>
          And <span className="font-bold">K</span> is the key — a symbol of the inner power each person holds to discover their own rhythm and their own way.
        </p>

        <br />

        <p>
          For us, clothing is an extension of character.
        </p>

        <p>
          Form, texture, and detail come together to create a story that moves with you.
        </p>

        <br />

        <p>
          Daftk is not only a brand.
        </p>

        <p>
          It is the feeling of being unapologetically yourself — free, bold, and authentic.
        </p>

        <br />

        <p className="font-medium text-black">
          Find your rhythm.
        </p>

        <p className="font-medium text-black">
          Find your key.
        </p>

      </div>

      {/* Main Image */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src={Image}
            alt="Daftk visual"
            className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

    </section>
  );
};

export default About;