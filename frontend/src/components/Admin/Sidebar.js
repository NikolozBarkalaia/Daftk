import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, FileText, Image as ImageIcon, LogOut, Settings, ShoppingBag, Film } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag size={20} /> },
    { name: 'Hero Section', path: '/admin/hero', icon: <Film size={20} /> },
    { name: 'Slider', path: '/admin/slider', icon: <ImageIcon size={20} /> },
    { name: 'Posts', path: '/admin/posts', icon: <FileText size={20} /> },
    { name: 'Media', path: '/admin/media', icon: <ImageIcon size={20} /> },
  ];

  return (
    <div className="w-64 bg-black text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-dark">
        <h2 className="text-2xl font-serif tracking-wider font-bold">Admin Panel</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-white text-black' : 'hover:bg-gray-dark hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium font-sans">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-dark">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg hover:bg-gray-dark text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium font-sans">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
