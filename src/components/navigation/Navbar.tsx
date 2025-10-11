
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData, clearUserData, user } = useUser();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      await clearUserData();
      navigate('/login');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Assistant', path: '/assistant' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Recipes', path: '/recipes' },
    { name: 'Workouts', path: '/workouts' },
    { name: 'Community', path: '/community' },
  ];

  return (
    <nav className="bg-background shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="gradient-purple text-white font-bold text-xl p-2 rounded-lg">
            FIT
          </div>
          <span className="font-heading font-bold text-xl text-fitfuel-purple">FUEL</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="font-medium text-gray-600 hover:text-fitfuel-purple transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-fitfuel-purple after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-fitfuel-purple transition-colors">
                <User size={20} />
                <span className="font-medium">{userData.name || user.email?.split('@')[0]}</span>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-red-500 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden text-gray-600 hover:text-fitfuel-purple transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-4 bg-white shadow-md">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="block py-2 text-gray-600 hover:text-fitfuel-purple transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t">
              {user ? (
                <div className="space-y-3">
                  <Link to="/profile" className="flex items-center space-x-2 py-2 text-gray-700" onClick={() => setIsOpen(false)}>
                    <User size={20} />
                    <span>{userData.name || user.email?.split('@')[0]}</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-left text-gray-600 hover:text-red-500"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut size={20} className="mr-2" /> Log out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
