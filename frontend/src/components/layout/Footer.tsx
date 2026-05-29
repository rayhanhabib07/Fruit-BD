import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Leaf size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Fruit<span className="text-orange-400">BD</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Bangladesh's freshest seasonal fruits delivered right to your door. 
              Farm-to-table quality you can taste.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-green-400 transition-colors">All Fruits</Link></li>
              <li><Link to="/products?season=summer" className="hover:text-green-400 transition-colors">Summer Fruits</Link></li>
              <li><Link to="/products?season=winter" className="hover:text-green-400 transition-colors">Winter Fruits</Link></li>
              <li><Link to="/products?season=year-round" className="hover:text-green-400 transition-colors">Year Round</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-green-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-green-400 transition-colors">Register</Link></li>
              <li><Link to="/orders" className="hover:text-green-400 transition-colors">My Orders</Link></li>
              <li><Link to="/cart" className="hover:text-green-400 transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-green-400 flex-shrink-0" />
                <span>Sylhet, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-green-400 flex-shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-green-400 flex-shrink-0" />
                <span>hello@fruitbd.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} FruitBD. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Fresh fruits, honest prices, happy customers 🍎</p>
        </div>
      </div>
    </footer>
  );
}
