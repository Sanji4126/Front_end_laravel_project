import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, Edit2, X, Layers, Loader2, AlertCircle } from 'lucide-react';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/categories');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setName(cat.cate_name || cat.name || '');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All related products may be affected.')) return;
    try {
      await axiosClient.delete(`/delete-category/${id}`);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete category';
      alert(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim()) {
      setErrorMessage('Category name cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await axiosClient.post(`/update-category/${editingCategory.cate_id}`, { name: name.trim() });
      } else {
        await axiosClient.post('/add-category', { name: name.trim() });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Category save error:', err);
      const res = err.response?.data;
      let msg = 'Failed to save category';
      if (res?.errors && typeof res.errors === 'object') {
        msg = Object.values(res.errors).flat().join(' ');
      } else if (res?.error) {
        msg = res.error;
      } else if (res?.message) {
        msg = res.message;
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-sm text-gray-500">Organize store products into logical categories</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Layers className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No categories found. Click "Add Category" to create one.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="p-4">Category ID</th>
                <th className="p-4">Category Name</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((c) => (
                <tr key={c.cate_id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-gray-500 text-xs">#{c.cate_id}</td>
                  <td className="p-4 font-semibold text-gray-900">{c.cate_name || c.name}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.cate_id)}
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
              onClick={() => !submitting && setIsModalOpen(false)}
              disabled={submitting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Laptops, Accessories"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:bg-indigo-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingCategory ? 'Updating Category...' : 'Creating Category...'}
                  </>
                ) : (
                  editingCategory ? 'Update Category' : 'Create Category'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

