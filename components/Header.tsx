
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 text-center">
          AI Outfit Stylist
        </h1>
        <p className="text-center text-gray-500 mt-1">Your Personal Wardrobe Assistant</p>
      </div>
    </header>
  );
};

export default Header;
