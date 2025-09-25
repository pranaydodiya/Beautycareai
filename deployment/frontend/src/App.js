import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import CartScreen from "./screens/CartScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ShippingScreen from "./screens/ShippingScreen";
import PaymentScreen from "./screens/PaymentScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import ProductListScreen from "./screens/ProductListScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import { SignIn, SignUp } from "@clerk/clerk-react";
import ShopScreen from "./screens/ShopScreen";
import ContactScreen from "./screens/ContactScreen";
import AdminDashboard from "./screens/AdminDashboard";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import SkincareTipsScreen from "./screens/SkincareTipsScreen";
import SkinQuizScreen from "./screens/SkinQuizScreen";
import FaceAnalysisScreen from "./screens/FaceAnalysisScreen";
import FakePaymentScreen from "./screens/FakePaymentScreen";
import OrderSuccessScreen from "./screens/OrderSuccessScreen";
function App() {
  return (
    <div className="position:relative">
        <Header />
        <Routes>
          <Route path="/" exact element={<HomeScreen />} />
          <Route path="/products" element={<ShopScreen />} />
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
          <Route
            path="/search/:keyword"
            exact
            element={<HomeScreen search />}
          />
          {/* <Route path="/page/:pageNumber" element={<HomeScreen search />} /> */}
          <Route path="/admin/productlist" element={<ProductListScreen />} />
          <Route path="/admin/login" element={<AdminLoginScreen />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productlist/:pageNumber" element={<ProductListScreen />} />
          <Route path="/admin/orderlist" element={<OrderListScreen />} />
          <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
          <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
          <Route path="/admin/userlist" element={<UserListScreen />} />
          <Route path="/order/:orderId" element={<OrderScreen />} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/shipping" element={<ShippingScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/cart/:id?" element={<CartScreen />} />
          <Route path="/contact" element={<ContactScreen />} />
          <Route path="/skincare-tips" element={<SkincareTipsScreen />} />
          <Route path="/skin-quiz" element={<SkinQuizScreen />} />
          <Route path="/face-analysis" element={<FaceAnalysisScreen />} />
          <Route path="/pay" element={<FakePaymentScreen />} />
          <Route path="/order-success" element={<OrderSuccessScreen />} />
        </Routes>
        <Footer />
    </div>
  );
}

export default App;
