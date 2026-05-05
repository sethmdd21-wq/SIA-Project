import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Share2, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section brand-section">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">🍽️</span> SIA Food
          </Link>
          <p className="footer-desc">
            The premium online food ordering platform for seamless delivery and takeout experiences. Quality food, fast service.
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Website"><Globe size={20} /></a>
            <a href="#" className="social-icon" aria-label="Message"><MessageCircle size={20} /></a>
            <a href="#" className="social-icon" aria-label="Share"><Share2 size={20} /></a>
          </div>
        </div>



        <div className="footer-section contact-section">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="contact-info">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>123 Foodie Street, Culinary District, FC 12345</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>support@siafood.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} SIA Food Ordering Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
