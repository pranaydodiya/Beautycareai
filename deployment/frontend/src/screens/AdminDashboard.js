import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listProducts } from "../actions/productActions";
import { listOrders } from "../actions/orderActions";
import { listUsers } from "../actions/userActions";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, to }) => (
  <Link to={to} className="block bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
    <h3 className="text-sm text-gray-500">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </Link>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((s) => s.productList);
  const { orders } = useSelector((s) => s.orderList);
  const { users } = useSelector((s) => s.userList);

  useEffect(() => {
    dispatch(listProducts());
    dispatch(listOrders());
    dispatch(listUsers());
  }, [dispatch]);

  return (
    <div className="mt-[80px] lg:px-24 md:px-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
        <StatCard title="Total Products" value={(products || []).length} to="/admin/productlist" />
        <StatCard title="Total Orders" value={(orders || []).length} to="/admin/orderlist" />
        <StatCard title="Total Users" value={(users || []).length} to="/admin/userlist" />
      </div>

      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 mt-8">
        <Link to="/admin/productlist" className="bg-blue-600 text-white px-4 py-3 rounded-md text-center">Manage Products</Link>
        <Link to="/admin/orderlist" className="bg-indigo-600 text-white px-4 py-3 rounded-md text-center">Manage Orders</Link>
        <Link to="/admin/userlist" className="bg-teal-600 text-white px-4 py-3 rounded-md text-center">Manage Users</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;


