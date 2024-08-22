import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  return (
    <div className="h-screen w-64 bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Sidebar</h1>
      </div>
      <ul className="mt-4">
        <Link to="/transaction"><li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Transactions</li></Link>
        <Link to="/transaction/summary"><li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Summary</li></Link>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={toggleSubMenu}>
          Menu Item 3
          <span className="ml-2">{isSubMenuOpen ? '-' : '+'}</span>
        </li>
        {isSubMenuOpen && (
          <ul className="ml-4 mt-2">
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Sub Menu Item 1</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Sub Menu Item 2</li>
          </ul>
        )}
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Menu Item 4</li>
      </ul>
    </div>
  );
};

export default Sidebar;