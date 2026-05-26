import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-green-800">
              Fruit<span className="text-orange-500">BD</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-stone-600 hover:text-green-700 font-medium text-sm transition-colors">
              All Fruits
            </Link>
            <Link to="/products?season=summer" className="text-stone-600 hover:text-green-700 font-medium text-sm transition-colors">
              Summer
            </Link>
            <Link to="/products?season=winter" className="text-stone-600 hover:text-green-700 font-medium text-sm transition-colors">
              Winter
            </Link>
            <Link to="/products?season=year-round" className="text-stone-600 hover:text-green-700 font-medium text-sm transition-colors">
              Year Round
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-stone-600 hover:text-green-700 transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium hover:bg-green-200 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-stone-600 hover:text-green-700 p-2 transition-colors"
                  title="My Profile"
                >
                  <User size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-stone-400 hover:text-red-500 p-2 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-stone-600 hover:text-green-700 font-medium transition-colors px-3 py-1.5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-stone-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-stone-100 flex flex-col gap-3">
            <Link to="/products" className="text-stone-700 font-medium py-1" onClick={() => setMenuOpen(false)}>All Fruits</Link>
            <Link to="/products?season=summer" className="text-stone-700 py-1" onClick={() => setMenuOpen(false)}>Summer</Link>
            <Link to="/products?season=winter" className="text-stone-700 py-1" onClick={() => setMenuOpen(false)}>Winter</Link>
            <Link to="/orders" className="text-stone-700 py-1" onClick={() => setMenuOpen(false)}>My Orders</Link>
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-left text-red-500 py-1">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="text-stone-700 py-1" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="text-green-700 font-medium py-1" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
