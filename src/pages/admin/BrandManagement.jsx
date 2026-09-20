import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, Edit2, X, Award, Loader2, AlertCircle } from 'lucide-react';

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [cateId, setCateId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      if (cats.length > 0 && !cateId) setCateId(cats[0].cate_id);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setBrandName('');
    setErrorMessage('');
    setCateId(categories.length > 0 ? categories[0].cate_id : '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBrand(b);
    setBrandName(b.brand_name || '');
    setCateId(b.cate_id || (categories.length > 0 ? categories[0].cate_id : ''));
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand? Products linked to this brand may be affected.')) return;
    try {
      await axiosClient.delete(`/delete-brand/${id}`);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete brand';
      alert(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!brandName.trim()) {
      setErrorMessage('Brand name cannot be empty.');
      return;
    }
    if (!cateId) {
      setErrorMessage('Please select a Category. Create a category first if none exists.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBrand) {
        await axiosClient.post(`/update-brand/${editingBrand.brand_id}`, {
          brand_name: brandName.trim(),
          cate_id: cateId,
        });
      } else {
        await axiosClient.post('/add-brand', {
          brand_name: brandName.trim(),
          cate_id: cateId,
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Brand save error:', err);
      const res = err.response?.data;
      let msg = 'Failed to save brand';
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

      {(!loading && categories.length === 0) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold">Setup Required:</span> You need to create at least one Category before adding brands.
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Loading brands...
          </div>
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
                <th className="p-4">Associated Category</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map((b) => (
                <tr key={b.brand_id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-gray-500 text-xs">#{b.brand_id}</td>
                  <td className="p-4 font-semibold text-gray-900">{b.brand_name}</td>
                  <td className="p-4 text-gray-600">{b.category?.cate_name || b.category?.name || `Category #${b.cate_id}`}</td>
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
              onClick={() => !submitting && setIsModalOpen(false)}
              disabled={submitting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Apple, Dell, Asus"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Associated Category</label>
                <select
                  value={cateId}
                  disabled={submitting}
                  onChange={(e) => setCateId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.cate_id} value={c.cate_id}>
                        {c.cate_name || c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:bg-indigo-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingBrand ? 'Updating Brand...' : 'Creating Brand...'}
                  </>
                ) : (
                  editingBrand ? 'Update Brand' : 'Create Brand'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

