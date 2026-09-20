import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, Tag, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/categories'),
      ]);
      setProducts(prodRes.data?.product || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.product_id, 1);
      setAddedId(product.product_id);
      setTimeout(() => setAddedId(null), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || String(p.cate_id) === String(selectedCategory);
    const matchesSearch =
      (p.pro_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-8 sm:p-12 mb-8 shadow-lg">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome to KhmerStore
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg mb-6">
            Discover premium laptops, smartphones, and accessories with instant checkout and rapid delivery.
          </p>
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Products
        </button>
        {categories.map((c) => (
          <button
            key={c.cate_id}
            onClick={() => setSelectedCategory(c.cate_id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              String(selectedCategory) === String(c.cate_id)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {c.cate_name || c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 text-lg">No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.product_id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.pro_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag className="w-12 h-12 text-gray-300" />
                )}
                {p.qty <= 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                    {p.pro_name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {p.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Price</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${parseFloat(p.price).toFixed(2)}
                    </span>
                  </div>
                  <button
                    disabled={p.qty <= 0}
                    onClick={() => handleAddToCart(p)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      addedId === p.product_id
                        ? 'bg-emerald-600 text-white'
                        : p.qty > 0
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {addedId === p.product_id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Buy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
