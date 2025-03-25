import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../JS/Header';
import Footer from '../JS/Footer';
import '../CSS/Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigateToProducts = () => {
    navigate('/product');
  };

  return (
    <div className="home-container">
      <Header />
      <main>
        <section className="promo-section">
          <video autoPlay loop muted className="fullscreen-video">
            <source src="https://foilelectrique.fr/wp-content/uploads/2024/12/Water-toys-Lift-Lampuga-Foil-Drive-Sublue.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay">
            <div className="header-content">
              <h1>THE BEST WATER TOYS</h1>
              <button 
                className="info-button"
                onClick={handleNavigateToProducts}
              >
                BUY IT NOW
              </button>
            </div>
          </div>
        </section>

        <section className="introduction">
          <h4>Electric Water Toys</h4>
          <h2>Fun Vacations Without clutter</h2>
          <h3>Take Your Water Toys to Every Destination</h3>

          <div className="intro-text">
            <p>Dive into a <span className="highlight">world of fun and excitement</span> with our extensive range of water toys. Whether you're a thrill-seeker or someone who enjoys a leisurely day by the water, our water toys are designed to <span className="highlight">provide endless hours of entertainment and adventure for everyone.</span></p>
            <p>
              From <span className="highlight">high-speed</span> water scooters to tranquil paddleboards, our selection caters to all preferences and skill levels. Enjoy the <span className="highlight">versatility</span> of our toys, which are perfect for the sea, lakes, and even your backyard pool. <br />Suitable for kids and adults alike, water toys bring families together for <span className="highlight">unforgettable experiences</span>.
            </p>
          </div>
        </section>

        <section className="image-banner"> 
          <div className="image-overlay">
            <div className="image-banner-content">              
              <h3>Versatility and Fun for All Ages</h3>
              <h2>EXPLORE THE SEAFLOOR IN A NEW WAY</h2>
            </div>
          </div>
        </section>

        <section className="featured-products">
          <h2>Our Electric Water Toys</h2>
          <p>From the pool to deep-sea diving... Exploration and discovery made easy!</p>
          <div className="product-grid">
            <div className="product">
              <img src="images/gocycle.jpg" alt="GOCYCLE" />
              <h3>GOCYCLE</h3>
            </div>
            <div className="product">
              <img src="images/poolstar.jpg" alt="POOLSTAR" />
              <h3>POOLSTAR</h3>
            </div>
            <div className="product">
              <img src="images/zapata.jpg" alt="ZAPATA" />
              <h3>ZAPATA</h3>
            </div>
            <div className="product">
              <img src="images/sublue.jpg" alt="SUBLUE" />
              <h3>SUBLUE</h3>
            </div>
            <div className="product">
              <img src="images/tiwal.jpg" alt="TIWAL" />
              <h3>TIWAL</h3>
            </div>
          </div>
          <div className="see-more">             
            <span>See More</span>
            <button 
              className="see-more-btn"
              onClick={handleNavigateToProducts}
            >
 
              <img src="images/see_more_2.PNG" alt="See More Arrow" className="arrow" />
            </button>
          </div>
        </section>

        <section className="Titre-section">
          <h2>In search of an unforgettable, playful summer ?</h2>
          <h3>EXPLORE THE WORLD OF WATER TOYS</h3>
        </section>

        <section className="water-toys-section">
          <div className="item">
            <img className="image-ex-1" src="images/image_ex_1.jpg" alt="Explore the World of Water Toys" />
            <div className="text">
              <h3>Unleash Your Inner Adventurer</h3>
              <p>From high-speed water scooters to tranquil paddleboards, our selection caters to all preferences and skill levels. Enjoy the versatility of our toys, which are perfect for the sea, lakes, and even your backyard pool. Suitable for kids and adults alike, water toys bring families together for unforgettable experiences.</p>
            </div>
          </div>
          <div className="item">
            <img className="image-ex-2" src="images/image_ex_2.jpg" alt="Safety and Durability" />
            <div className="text">
              <h3>Safety and Durability</h3>
              <p>Safety is our top priority. Our water toys are built with high-quality materials to ensure durability and long-lasting use. Each product undergoes rigorous testing to meet safety standards, giving you peace of mind as you enjoy your time on the water.</p>
              <p>Our water toys are equipped with the latest technology and innovative designs to ensure maximum enjoyment while being mindful of the environment. With options like electric surfboards and eco-friendly materials, you can have fun knowing you're reducing your carbon footprint.</p>
            </div>
          </div>
          <div className="item">
            <img className="image-ex-3" src="images/image_ex_4.jpg" alt="Perfect for Any Occasion" />
            <div className="text">
              <h3>Perfect for Any Occasion</h3>
              <p>Whether you're planning a beach vacation, a pool party, or a weekend getaway, our water toys are the perfect companions. They are easy to transport, set up, and use, making them ideal for spontaneous adventures and planned outings alike.</p>
              <p>With our water toys, the possibilities are endless. Explore the underwater world, race across the waves, or simply relax and soak up the sun. Create memories that will last a lifetime with our exciting and diverse range of water toys.</p>
            </div>
          </div>
        </section>

        <section className="testimonials">
          <h2>Customer Testimonials</h2>
          <div className="testimonial">
            <p>"The best water toys I've ever used! The quality is exceptional, and the customer service is amazing."</p>
            <h4>- John Doe</h4>
          </div>
          <div className="testimonial">
            <p>"I love my new electric surfboard! It's so much fun and easy to use."</p>
            <h4>- Jane Smith</h4>
          </div>
        </section>

        <section className="info-section">
          <div className="info-box">
            <img src="images/photo_monde.PNG" alt="Free Shipping" />
            <h3>Free Shipping</h3>
            <p>in France on all our water toys</p>
          </div>
          <div className="info-box">
            <img src="images/photo_tel.PNG" alt="Customer Service" />
            <h3>Customer Service</h3>
            <p>Contact us for any questions or information</p>
          </div>
          <div className="info-box">
            <img src="images/photo_bouclier.PNG" alt="Secure Payment" />
            <h3>Secure Payment</h3>
            <p>At Water Toys Center France, you always buy securely!</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;