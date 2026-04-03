import React from 'react';
import './Features.css';

export default function Features() {
  const featureImages = [
    '/image/feature-img-1.png',
    '/image/feature-img-2.png',
    '/image/feature-img-3.png',
  ];

  const featuresData = [
    {
      title: 'Exclusive Offers',
      desc: 'Take advantage of our offers and purchase your desired book at the best prices!',
    },
    {
      title: 'Fast Delivery',
      desc: 'Get your books delivered quickly and safely, right to your doorstep.',
    },
    {
      title: 'Easy Payment',
      desc: 'Multiple payment options available for smooth and secure transactions.',
    },
  ];

  return (
    <section className="features" id="features">
      <div className="content">
        <h1 className="heading">
          our <span>features</span>
        </h1>
        <div className="box-container">
          {featuresData.map((feature, index) => (
            <div className="box" key={index}>
              <img src={featureImages[index]} alt={feature.title} />
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
