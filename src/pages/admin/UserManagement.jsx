import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Users, Shield, UserCheck } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Accounts Management</h1>
        <p className="text-sm text-gray-500">Registered shoppers and store administrator accounts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No registered users found.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="p-4">User ID</th>
                <th className="p-4">User Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.user_id || u.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-gray-500 text-xs">#{u.user_id || u.id}</td>
                  <td className="p-4 font-semibold text-gray-900">{u.user_name || u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <>
                          <Shield className="w-3.5 h-3.5" /> Administrator
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Customer
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
