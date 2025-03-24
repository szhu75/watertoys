import React, { useState, useEffect } from 'react';
import Head from '../JS/Header'; 
import Footer from '../JS/Footer';  
import '../CSS/Contact.css';

const Contact = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');

  useEffect(() => {
    generateRandomCalculation();
  }, []);

  const generateRandomCalculation = () => {
    const operators = ['+', '-', '*'];
    const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    const randomNum1 = Math.floor(Math.random() * 10) + 1;
    const randomNum2 = Math.floor(Math.random() * 10) + 1;

    setNum1(randomNum1);
    setNum2(randomNum2);
    setOperator(randomOperator);
  };

  return (
    <div className='full-page'>
      <Head />
      <section className="contact-section">
        <h1>Contact Us</h1>
        <div className="contact-info">
          <p>
            <strong>Please reach us at:</strong>
            <br /><br />
            Email: <span className="information">info@electricwatertoys.com</span>
            <br /><br />
            Phone: <span className="information">09 27 51 48 92</span>
            <br /><br />
            Fax: <span className="information">07 51 95 36 48</span>
            <br /><br />
            Office hours Monday to Friday: <span className="information">8am - 12pm and 1pm - 5pm</span>
            <br /><br />
            Address: <span className="information">27 Avenue des Champs, 06000 Nice, France</span>
          </p>
        </div>

        <iframe
          className="map"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11512.4422039951!2d7.0169874!3d43.5518291!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ce8117d75a3d7b%3A0x1234567890abcdef!2sEfoil%20Cannes!5e0!3m2!1sfr!2sfr!4v1701376387107!5m2!1sfr!2sfr"
          title="Google Maps"
          allowFullScreen
        ></iframe>

        <div className="form">
          <form method="post">
            <label htmlFor="u_name">Last Name</label>
            <input id="u_name" name="user_lastname" type="text" required placeholder="Last Name" />
            <br />

            <label htmlFor="u_firstname">First Name</label>
            <input id="u_firstname" name="user_firstname" type="text" placeholder="First Name" />
            <br />

            <label htmlFor="u_mail">Email Address</label>
            <input id="u_mail" name="user_email" type="email" required placeholder="...@..." />
            <br />

            <label htmlFor="u_tel">Phone</label>
            <input id="u_tel" name="user_phone" type="tel" required placeholder="xx xx xx xx xx" />
            <br />

            <label htmlFor="u_subject">Subject</label>
            <select id="u_subject" name="user_subject">
              <option value="Products">Products</option>
              <option value="Locations">Locations</option>
              <option value="About Us">About Us</option>
              <option value="Other">Other</option>
            </select>
            <br />

            <label htmlFor="u_message">Question/Message</label>
            <textarea id="u_message" name="user_message" placeholder="Your message"></textarea>
            <br />

            <label htmlFor="u_math">How much is {num1} {operator} {num2}?</label>
            <input id="u_math" name="user_math" type="number" required placeholder="Answer" />
            <br />

            <input className="submit" type="submit" value="Send" />
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
