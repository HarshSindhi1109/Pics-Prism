// Banner
import React from 'react';
import './Banner.css';

export default function Banner() {
  return (
    <section
      className="banner"
      id="banner"
      style={{
        background: 'url("/image/BannerImage.png") no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="content">
        <h3 style={{ color: 'white' }}>
          Shop Smarter with <span>Everything You Need</span> in One Place
        </h3>

        <p style={{ color: 'white' }}>
          Explore a wide range of quality products at great prices. Easy
          browsing, secure payments, and fast delivery — all in one powerful
          e-commerce platform.
        </p>
      </div>
    </section>
  );
}
