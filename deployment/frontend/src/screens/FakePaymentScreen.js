import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Meta from "../components/Meta";

const FakePaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const productId = params.get('productId');
  const qty = Number(params.get('qty') || 1);
  const apiBase = process.env.REACT_APP_BACKEND_URL || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const res = await fetch(`${apiBase}/api/products/${productId}`);
        if (!res.ok) throw new Error('Failed to load product');
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        setError('Unable to load product details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, apiBase]);

  const total = product ? (product.price || 0) * qty : 0;

  return (
    <div className="min-h-screen bg-white pt-24">
      <Meta title="Demo Payment" />
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-pink-600 mb-4">Checkout (Demo)</h1>
        <p className="text-gray-600 mb-6">This is a fake payment page for testing. Do not enter real card details.</p>

        {loading && <div className="py-12">Loading…</div>}
        {error && <div className="py-3 text-red-600">{error}</div>}

        {product && (
          <div className="border border-pink-200 rounded-xl p-4 bg-pink-50 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-white rounded overflow-hidden">
                {(() => {
                  const img = product.image || '';
                  const src = img ? (/^https?:/i.test(img) ? img : `${apiBase}${img?.startsWith('/') ? img : '/' + img}`) : '/images/sample.webp';
                  return <img src={src} alt={product.name} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.src='/images/sample.webp';}} />;
                })()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600">Qty: {qty}</div>
              </div>
              <div className="text-lg font-bold text-gray-900">₹{(product.price || 0).toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Fake payment form */}
        <div className="border border-pink-200 rounded-xl p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Cardholder Name</label>
              <input className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Card Number</label>
              <input className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="4242 4242 4242 4242" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Expiry</label>
              <input className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="MM/YY" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">CVV</label>
              <input className="w-full border border-pink-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="123" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-lg font-semibold text-gray-900">Total: ₹{total.toFixed(2)}</div>
            <button
              type="button"
              onClick={() => navigate(`/order-success?amount=${encodeURIComponent(total.toFixed(2))}`)}
              className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white"
            >
              Pay Now (Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FakePaymentScreen;


