import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import './Home.css';

const tshirtFiles = import.meta.glob('/public/products/tshirts/*.{jpg,jpeg,png,webp}', { eager: true });
const cupFiles = import.meta.glob('/public/products/cups/*.{jpg,jpeg,png,webp}', { eager: true });
const bottleFiles = import.meta.glob('/public/products/water-bottles/*.{jpg,jpeg,png,webp}', { eager: true });
const mousepadFiles = import.meta.glob('/public/products/mousepads/*.{jpg,jpeg,png,webp}', { eager: true });

const getCleanPath = (path) => path ? path.replace(/^\/public/, '') : '';

const FALLBACK_IMAGE = 'https://placehold.co/400x400/1a1a2e/00f3ff?text=VERZ';

const defaultCategoryImages = {
  tshirts: Object.keys(tshirtFiles).length > 0 ? getCleanPath(Object.keys(tshirtFiles)[0]) : FALLBACK_IMAGE,
  cups: Object.keys(cupFiles).length > 0 ? getCleanPath(Object.keys(cupFiles)[0]) : FALLBACK_IMAGE,
  bottles: Object.keys(bottleFiles).length > 0 ? getCleanPath(Object.keys(bottleFiles)[0]) : FALLBACK_IMAGE,
  mousepads: Object.keys(mousepadFiles).length > 0 ? getCleanPath(Object.keys(mousepadFiles)[0]) : FALLBACK_IMAGE,
};

const Home = () => {
  const { banners } = useStore();

  const getCategoryImage = (category) => {
    return defaultCategoryImages[category] || '/placeholder.jpg';
  };

  return (
    <div className="home-page">
      <section className="hero">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
        >
          <source src="/verzlogo.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content fade-in">
          <h1 className="hero-brand">VERZ</h1>
          <p className="hero-tagline" style={{ color: 'white', textDecoration: 'underline', textDecorationColor: 'white', textUnderlineOffset: '8px', textDecorationThickness: '2px', textShadow: 'none' }}>Print Your Style. Wear Your Vibe.</p>
          <Link to="/shop" className="btn-primary hero-btn bw-theme">Shop Now</Link>
        </div>
      </section>

      <section className="featured container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {banners && banners.map((banner, index) => (
            <div key={index} className="category-card" style={{ position: 'relative', overflow: 'hidden', borderRadius: '1rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-glass)' }}>
              <img src={getCategoryImage(banner.category) || banner.image} alt={banner.title} style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '2rem 1.5rem 1.5rem', textAlign: 'center' }}>
                <h3 style={{ color: 'white', margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '600' }}>{banner.title}</h3>
                <Link to={banner.buttonLink || `/shop?category=${banner.category}`} className="btn-primary" style={{ display: 'inline-block' }}>Explore</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
