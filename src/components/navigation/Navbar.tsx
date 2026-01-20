import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Sparkles, CreditCard, ChevronDown, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const userInitials = userData.name
    ? userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <nav className="bg-background shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="gradient-purple text-white font-bold text-xl p-2 rounded-lg group-hover:scale-105 transition-transform duration-300">
            FIT
          </div>
          <span className="font-heading font-bold text-xl text-fitfuel-purple tracking-tight">FUEL</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors focus:ring-0">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.photoURL || ''} alt={userData.name || 'User'} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData.name || user.email?.split('@')[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/subscription')} className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Subscription</span>
                  <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-[2px] font-bold">
                    PRO
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden lg:flex">Log in</Button>
                <Button variant="ghost" size="sm" className="lg:hidden text-fitfuel-purple">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-fitfuel-purple hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Sign up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-600 hover:text-fitfuel-purple transition-colors p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in absolute w-full bg-white border-b shadow-lg z-40">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block py-3 px-2 text-gray-700 hover:text-fitfuel-purple hover:bg-purple-50 rounded-md transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-2 py-2 mb-2 bg-purple-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="bg-purple-200 text-purple-800">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{userData.name || 'User'}</span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-gray-600"
                    onClick={() => {
                      navigate('/profile');
                      setIsOpen(false);
                    }}
                  >
                    <UserCircle size={18} className="mr-2" /> My Profile
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-gray-600"
                    onClick={() => {
                      navigate('/subscription');
                      setIsOpen(false);
                    }}
                  >
                    <CreditCard size={18} className="mr-2" /> Subscription
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut size={18} className="mr-2" /> Log out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-11">Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-11 bg-fitfuel-purple">Sign up</Button>
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
