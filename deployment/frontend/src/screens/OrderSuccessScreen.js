import React from "react";
import { useLocation, Link } from "react-router-dom";
import Meta from "../components/Meta";

const OrderSuccessScreen = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const amount = params.get('amount') || '0.00';

  return (
    <div className="min-h-screen bg-white pt-24">
      <Meta title="Order Success" />
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-6xl mb-3">🎉</div>
        <h1 className="text-3xl font-extrabold text-pink-600 mb-2">Payment Successful</h1>
        <p className="text-gray-700 mb-6">Your demo payment of ₹{amount} was processed successfully.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/products" className="px-4 py-2 rounded-lg border border-pink-300 text-pink-700 hover:bg-pink-50">Continue Shopping</Link>
          <Link to="/cart" className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700">View Cart</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;


