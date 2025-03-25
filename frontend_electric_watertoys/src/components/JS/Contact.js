import React, { useState, useEffect } from 'react';
import Head from '../JS/Header'; 
import Footer from '../JS/Footer';  
import '../CSS/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
    subject: 'Products',
    message: '',
    mathAnswer: ''
  });
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    
    // Calculer la réponse correcte
    let answer;
    switch (randomOperator) {
      case '+':
        answer = randomNum1 + randomNum2;
        break;
      case '-':
        answer = randomNum1 - randomNum2;
        break;
      case '*':
        answer = randomNum1 * randomNum2;
        break;
      default:
        answer = 0;
    }
    setCorrectAnswer(answer);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    
    // Vérifier la réponse mathématique
    if (parseInt(formData.mathAnswer) !== correctAnswer) {
      setFormError("The calculation answer is incorrect. Please try again.");
      setLoading(false);
      generateRandomCalculation(); // Générer un nouveau calcul
      return;
    }
    
    try {
      // Simulation d'envoi de formulaire - remplacer par un vrai appel API dans un environnement de production
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Form data submitted:", formData);
      
      // Réinitialiser le formulaire après soumission réussie
      setFormData({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        subject: 'Products',
        message: '',
        mathAnswer: ''
      });
      
      setFormSubmitted(true);
      generateRandomCalculation(); // Générer un nouveau calcul pour la prochaine soumission
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError("An error occurred while submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='full-page'>
      <Head />
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-header">
            <h1>Contact Us</h1>
            <p className="contact-subtitle">
              Have questions about our products or services ? <br></br>Get in touch with our team !
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-info-card">
              <h2>Contact Information</h2>
              <div className="contact-info-item">
                <i className="info-icon email-icon"></i>
                <div>
                  <h3>Email</h3>
                  <p className="information">info@electricwatertoys.com</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <i className="info-icon phone-icon"></i>
                <div>
                  <h3>Phone</h3>
                  <p className="information">09 27 51 48 92</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <i className="info-icon fax-icon"></i>
                <div>
                  <h3>Fax</h3>
                  <p className="information">07 51 95 36 48</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <i className="info-icon hours-icon"></i>
                <div>
                  <h3>Office Hours</h3>
                  <p className="information">Monday to Friday : <br></br>8am - 12pm & 1pm - 5pm</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <i className="info-icon address-icon"></i>
                <div>
                  <h3>Address</h3>
                  <p className="information">27 Avenue des Champs, 06000 Nice, France</p>
                </div>
              </div>
              
            </div>

            <div className="contact-form-card">
              <h2>Send Us a Message</h2>
              
              {formSubmitted ? (
                <div className="form-success-message">
                  <div className="success-icon">✓</div>
                  <h3>Thank you for contacting us!</h3>
                  <p>We've received your message and will get back to you shortly.</p>
                  <button className="new-message-btn" onClick={() => setFormSubmitted(false)}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  {formError && <div className="form-error">{formError}</div>}
                  
                  <div className="form-row">
                    <div className="form-groupe">
                      <label htmlFor="lastName">Last Name*</label>
                      <input 
                        id="lastName" 
                        name="lastName" 
                        type="text" 
                        required 
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="form-groupe">
                      <label htmlFor="firstName">First Name</label>
                      <input 
                        id="firstName" 
                        name="firstName" 
                        type="text" 
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-groupe">
                      <label htmlFor="email">Email Address*</label>
                      <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="form-groupe">
                      <label htmlFor="phone">Phone*</label>
                      <input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        required 
                        placeholder="XX XX XX XX XX"
                        value={formData.phone}
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="form-groupe">
                    <label htmlFor="subject">Subject</label>
                    <select 
                      id="subject" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="Products">Products</option>
                      <option value="Locations">Locations</option>
                      <option value="About Us">About Us</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-groupe">
                    <label htmlFor="message">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      placeholder="Please type your message here..."
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                  
                  <div className="form-groupe captcha-group">
                    <label htmlFor="mathAnswer">Verification: Calculate {num1} {operator} {num2}*</label>
                    <input 
                      id="mathAnswer" 
                      name="mathAnswer" 
                      type="number" 
                      required 
                      placeholder="Enter your answer"
                      value={formData.mathAnswer}
                      onChange={handleChange} 
                    />
                  </div>
                  
                  <div className="form-footer">
                    <p className="required-fields">* Required fields</p>
                    <button 
                      className="submit-btn" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="map-container">
            <h2>Find Us</h2>
            <iframe
              className="map"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11512.4422039951!2d7.0169874!3d43.5518291!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12ce8117d75a3d7b%3A0x1234567890abcdef!2sEfoil%20Cannes!5e0!3m2!1sfr!2sfr!4v1701376387107!5m2!1sfr!2sfr"
              title="Google Maps"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;