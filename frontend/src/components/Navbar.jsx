import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, TrendingUp, LayoutDashboard, LogOut } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const location = useLocation();

  const navLinks = [
    { to: '/marketplace', label: 'Browse', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/add-item', label: 'List Item', icon: PlusCircle },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/earnings', label: 'Earnings', icon: TrendingUp },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/marketplace" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-2xl">🐯</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary-500">Tiger</span>
                <span className="text-gray-900">Rentals</span>
              </span>
            </Link>

            <div className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive(link.to)
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
              <div className="text-xs text-gray-500">
                ⭐ {user.rating.toFixed(1)} ({user.total_ratings} reviews)
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center px-3 py-2 rounded-lg ${
                  isActive(link.to) ? 'text-primary-600' : 'text-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
