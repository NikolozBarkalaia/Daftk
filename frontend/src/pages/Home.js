import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MediaShowcaseSwiper from '../components/MediaShowcaseSwiper';
import api from '../services/api';

const Home = () => {
  const [hero, setHero] = useState(null);
  const [sliderItems, setSliderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [heroRes, sliderRes] = await Promise.all([
        api.get('/hero'),
        api.get('/slider')
      ]);

      setHero(heroRes.data);

      // Transform slider items for display
      const transformedItems = sliderRes.data.map((item) => {
        const mediaUrl = item.mediaId?.url || '';
        return {
          id: item._id,
          type: item.mediaType,
          src: `http://localhost:5000${mediaUrl}`,
          thumb: `http://localhost:5000${mediaUrl}`,
          alt: item.title,
          label: item.subtitle || '',
          caption: item.title,
        };
      });

      setSliderItems(transformedItems);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      {hero && (
        <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
          {hero.mediaType === 'video' && hero.mediaId && (
            <video
              src={`http://localhost:5000${hero.mediaId.url}`}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            />
          )}
          {hero.mediaType === 'image' && hero.mediaId && (
            <img
              src={`http://localhost:5000${hero.mediaId.url}`}
              alt={hero.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 1,
            }}
          />
          <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
            <h1 className='text-5xl font-bold text-white'>{hero.title}</h1>
            <p className='text-yellow-500 text-2xl'>{hero.subtitle}</p>
            <Link to={hero.buttonLink} className="btn">{hero.buttonText}</Link>
          </div>
        </section>
      )}

      {/* Slider Section */}
      <div className="container">
        <h2 className="page-title">Featured Pieces</h2>
        {sliderItems?.length > 0 ? (
          <MediaShowcaseSwiper items={sliderItems} />
        ) : (
          <p className="text-center text-gray-dark py-8">No featured pieces available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
