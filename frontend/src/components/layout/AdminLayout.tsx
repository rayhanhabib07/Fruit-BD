import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Leaf, Warehouse, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/products', icon: <Package size={18} />, label: 'Products' },
  { to: '/admin/orders', icon: <ShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/inventory', icon: <Warehouse size={18} />, label: 'Inventory' },
  { to: '/admin/users', icon: <Users size={18} />, label: 'Users' },
];

export default function AdminLayout() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-stone-100 flex flex-col fixed h-full">
        <div className="p-5 border-b border-stone-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-green-800">
              Fruit<span className="text-orange-500">BD</span>
            </span>
          </Link>
          <p className="text-xs text-stone-400 mt-1 ml-10">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-green-700 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-100">
          <Link to="/" className="text-xs text-stone-400 hover:text-green-700 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
