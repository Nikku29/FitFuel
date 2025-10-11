
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="gradient-purple text-white font-bold text-xl p-2 rounded-lg">
                FIT
              </div>
              <span className="font-heading font-bold text-xl text-fitfuel-purple">FUEL</span>
            </Link>
            <p className="text-gray-500 text-sm">
              Your AI-powered fitness companion for personalized workouts and nutrition plans.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 flex items-center">
                <Mail size={16} className="mr-2 text-fitfuel-purple" />
                <a href="mailto:FitFuel@gmail.com" className="hover:text-fitfuel-purple">FitFuel@gmail.com</a>
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Phone size={16} className="mr-2 text-fitfuel-purple" />
                <a href="tel:7877490044" className="hover:text-fitfuel-purple">+91 7877490044</a>
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <Instagram size={16} className="mr-2 text-fitfuel-purple" />
                <a href="https://instagram.com/nothing__09___" target="_blank" rel="noreferrer" className="hover:text-fitfuel-purple">nothing__09___</a>
              </p>
              <p className="text-sm text-gray-600 flex items-start">
                <MapPin size={16} className="mr-2 text-fitfuel-purple mt-1 flex-shrink-0" />
                <span>Faridabad, Haryana, India 121002</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/recipes" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Recipes
                </Link>
              </li>
              <li>
                <Link to="/workouts" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Workouts
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-medium mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-500 hover:text-fitfuel-purple text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} FITFUEL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
