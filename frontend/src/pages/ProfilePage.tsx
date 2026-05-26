import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, LogOut, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-stone-800 mb-8">My Profile</h1>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-green-700" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-stone-800">{user.name}</p>
            <div className="flex items-center gap-1.5 text-stone-400 text-sm mt-0.5">
              <Mail size={13} />
              {user.email}
            </div>
            <span
              className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                user.role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {user.role === 'admin' ? '⚡ Admin' : '🛒 Customer'}
            </span>
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-5"
        >
          <h2 className="font-semibold text-stone-800 mb-5">Edit Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-9 pr-4 py-3 border border-stone-100 rounded-xl text-sm bg-stone-50 text-stone-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+880 1700-000000"
                  className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Default Delivery Address
              </label>
              <div className="relative">
                <MapPin
                  size={15}
                  className="absolute left-3 top-3.5 text-stone-400"
                />
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  rows={3}
                  placeholder="House no, Road, Area, District..."
                  className="w-full pl-9 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-800 transition-colors disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-5">
          <h2 className="font-semibold text-stone-800 mb-3">Account Info</h2>
          <p className="text-sm text-stone-500">
            Member since:{' '}
            <span className="text-stone-700 font-medium">
              {new Date(user.created_at).toLocaleDateString('en-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors px-2 py-1"
        >
          <LogOut size={15} />
          Sign out of FruitBD
        </button>
      </div>
    </div>
  );
}
