import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../actions/userActions";

const AdminLoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, userInfo } = useSelector((s) => s.userLogin);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      localStorage.setItem("admin:isAdmin", "true");
      navigate("/admin");
    }
  }, [userInfo, navigate]);

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 pt-24 pb-10 bg-gradient-to-br from-slate-50 to-white">
      <div className="w-full max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access the admin dashboard</p>
        </div>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dispatch(login(email, password));
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginScreen;


