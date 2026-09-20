import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, Edit2, X, Package } from 'lucide-react';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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
      setCategories(cRes.data?.data || []);
      setBrands(bRes.data?.brand || []);
    } catch (err) {
      console.error('Failed to load product data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      pro_name: '',
      qty: '',
      price: '',
      description: '',
      cate_id: categories[0]?.cate_id || '',
      brand_id: brands[0]?.brand_id || '',
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      pro_name: prod.pro_name,
      qty: prod.qty,
      price: prod.price,
      description: prod.description,
      cate_id: prod.cate_id,
      brand_id: prod.brand_id,
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await axiosClient.delete(`/delete-product/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('pro_name', formData.pro_name);
      data.append('qty', formData.qty);
      data.append('price', parseFloat(formData.price).toFixed(2));
      data.append('description', formData.description);
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
        if (!formData.image) {
          alert('Please select a product image');
          return;
        }
        await axiosClient.post('/add-product', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Error saving product');
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

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
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
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.product_id} className="hover:bg-gray-50/50">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.image || 'https://via.placeholder.com/48'}
                      alt={p.pro_name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{p.pro_name}</div>
                      <div className="text-xs text-gray-400 line-clamp-1">{p.description}</div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-800">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        p.qty > 5
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {p.qty} in stock
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">ID: {p.cate_id}</td>
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
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.pro_name}
                  onChange={(e) => setFormData({ ...formData, pro_name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stock (Qty)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.cate_id}
                    onChange={(e) => setFormData({ ...formData, cate_id: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.cate_id} value={c.cate_id}>{c.cate_name || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    {brands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Product Image {editingProduct && '(Leave blank to keep existing image)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
