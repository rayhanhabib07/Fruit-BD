import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag } from 'lucide-react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone: string | null;
  address: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users?limit=100').then((r) => r.data),
  });

  const users: UserRow[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-800">Users</h1>
        <p className="text-sm text-stone-500">
          {meta?.total ?? users.length} total users
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">User</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-8 bg-stone-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              {!isLoading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-stone-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    No users found
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-semibold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{user.name}</p>
                        <p className="text-xs text-stone-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{user.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString('en-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders?user=${user.id}`}
                      className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
                    >
                      <ShoppingBag size={12} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
