import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, Edit2, X, Award } from 'lucide-react';

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [cateId, setCateId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes] = await Promise.all([
        axiosClient.get('/brands'),
        axiosClient.get('/categories'),
      ]);
      setBrands(bRes.data?.brand || []);
      const cats = cRes.data?.data || [];
      setCategories(cats);
      if (cats.length > 0) setCateId(cats[0].cate_id);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setBrandName('');
    if (categories.length > 0) setCateId(categories[0].cate_id);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBrand(b);
    setBrandName(b.brand_name || '');
    setCateId(b.cate_id || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await axiosClient.delete(`/delete-brand/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to delete brand');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await axiosClient.post(`/update-brand/${editingBrand.brand_id}`, {
          brand_name: brandName,
          cate_id: cateId,
        });
      } else {
        await axiosClient.post('/add-brand', {
          brand_name: brandName,
          cate_id: cateId,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to save brand');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands Management</h1>
          <p className="text-sm text-gray-500">Manage manufacturers and product brand partners</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading brands...</div>
        ) : brands.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Award className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No brands found. Click "Add Brand" to create one.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="p-4">Brand ID</th>
                <th className="p-4">Brand Name</th>
                <th className="p-4">Category ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map((b) => (
                <tr key={b.brand_id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-gray-500 text-xs">#{b.brand_id}</td>
                  <td className="p-4 font-semibold text-gray-900">{b.brand_name}</td>
                  <td className="p-4 text-gray-600">Category #{b.cate_id}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.brand_id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 rounded hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Apple, Dell, Asus"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Associated Category</label>
                <select
                  value={cateId}
                  onChange={(e) => setCateId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.cate_id} value={c.cate_id}>
                      {c.cate_name || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
              >
                {editingBrand ? 'Update Brand' : 'Create Brand'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
