import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-border h-16 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        {/* Placeholder for breadcrumbs or title */}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-sans">
          <p className="text-gray-dark">Welcome,</p>
          <p className="font-semibold text-black">{user?.name}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;
