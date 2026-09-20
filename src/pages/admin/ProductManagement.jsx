import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, Edit2, X, Package, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    pro_name: '',
    qty: '',
    price: '',
    description: '',
    cate_id: '',
    brand_id: '',
    image: null,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, bRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/categories'),
        axiosClient.get('/brands'),
      ]);
      setProducts(pRes.data?.product || []);
      const cats = cRes.data?.data || [];
      const brs = bRes.data?.brand || [];
      setCategories(cats);
      setBrands(brs);
    } catch (err) {
      console.error('Failed to load product data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setErrorMessage('');
    setImagePreview(null);
    setFormData({
      pro_name: '',
      qty: '',
      price: '',
      description: '',
      cate_id: categories.length > 0 ? categories[0].cate_id : '',
      brand_id: brands.length > 0 ? brands[0].brand_id : '',
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setErrorMessage('');
    setImagePreview(prod.image || null);
    setFormData({
      pro_name: prod.pro_name || prod.product_name || '',
      qty: prod.qty ?? prod.stock ?? '',
      price: prod.price || '',
      description: prod.description || '',
      cate_id: prod.cate_id || (categories.length > 0 ? categories[0].cate_id : ''),
      brand_id: prod.brand_id || (brands.length > 0 ? brands[0].brand_id : ''),
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await axiosClient.delete(`/delete-product/${id}`);
      loadAll();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete product';
      alert(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.cate_id) {
      setErrorMessage('Please select a valid Category. Create one if none exists.');
      return;
    }
    if (!formData.brand_id) {
      setErrorMessage('Please select a valid Brand. Create one if none exists.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('Please enter a valid product price.');
      return;
    }

    if (!editingProduct && !formData.image) {
      setErrorMessage('Please select a product image.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('pro_name', formData.pro_name.trim());
      data.append('qty', parseInt(formData.qty, 10) || 0);
      data.append('price', priceNum.toFixed(2));
      data.append('description', formData.description.trim());
      data.append('cate_id', formData.cate_id);
      data.append('brand_id', formData.brand_id);

      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingProduct) {
        await axiosClient.post(`/update-product/${editingProduct.product_id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axiosClient.post('/add-product', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      console.error('Save product error:', err);
      const res = err.response?.data;
      let msg = 'Error saving product';
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
          <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
          <p className="text-sm text-gray-500">Manage store items, pricing, and stock levels</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Warning if no categories or brands */}
      {(!loading && (categories.length === 0 || brands.length === 0)) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold">Setup Required:</span>{' '}
            {categories.length === 0 && 'You need to create at least one Category. '}
            {brands.length === 0 && 'You need to create at least one Brand. '}
            Please go to the Categories or Brands tab first before adding products.
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No products found. Click "Add Product" to create your first item.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Category</th>
                <th className="p-4">Brand</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.product_id} className="hover:bg-gray-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=60'}
                      alt={p.pro_name || p.product_name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=60';
                      }}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{p.pro_name || p.product_name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{p.description}</div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-800">${parseFloat(p.price || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        (p.qty ?? p.stock) > 5
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.qty ?? p.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{p.category?.cate_name || p.category?.name || `ID #${p.cate_id}`}</td>
                  <td className="p-4 text-gray-600">{p.brand?.brand_name || `ID #${p.brand_id}`}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100 transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.product_id)}
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => !submitting && setIsModalOpen(false)}
              disabled={submitting}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={formData.pro_name}
                  onChange={(e) => setFormData({ ...formData, pro_name: e.target.value })}
                  placeholder="e.g. MacBook Pro M3, iPhone 16 Pro"
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stock (Qty)</label>
                  <input
                    type="number"
                    required
                    disabled={submitting}
                    min={0}
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    placeholder="10"
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={submitting}
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="999.00"
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.cate_id}
                    disabled={submitting}
                    onChange={(e) => setFormData({ ...formData, cate_id: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.cate_id} value={c.cate_id}>{c.cate_name || c.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand</label>
                  <select
                    value={formData.brand_id}
                    disabled={submitting}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                  >
                    {brands.length === 0 ? (
                      <option value="">No brands available</option>
                    ) : (
                      brands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  disabled={submitting}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product specifications, features..."
                  className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Product Image {editingProduct && '(Leave blank to keep existing image)'}
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-lg border overflow-hidden bg-gray-50 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={submitting}
                    onChange={handleImageChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:bg-indigo-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingProduct ? 'Updating Product...' : 'Uploading & Creating Product...'}
                  </>
                ) : (
                  editingProduct ? 'Update Product' : 'Create Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

