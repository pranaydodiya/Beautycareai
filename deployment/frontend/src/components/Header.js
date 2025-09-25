import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userActions";
import { Link, useNavigate } from "react-router-dom";
import { BsBagCheck } from "react-icons/bs";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { Badge } from "antd";
import { AiOutlineSearch } from "react-icons/ai";
import { AiOutlineClose } from "react-icons/ai";
const Header = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const dispatch = useDispatch();
  const logoutHandler = () => {
    dispatch(logout());
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [keyWord, setKeyWord] = useState("");
  const navigate = useNavigate();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [isAdminLocal, setIsAdminLocal] = useState(false);
  useEffect(() => {
    const flag = localStorage.getItem("admin:isAdmin") === "true";
    if (flag) setIsAdminLocal(true);
  }, []);
  const handleSearch = (e) => {
    e.preventDefault();
    if (keyWord.trim()) {
      navigate(`/search/${keyWord}`);
      setSearchOpen(false);
    } else {
      navigate("/");
      setSearchOpen(false);
    }
  };
  // removed unused menu items variable
  return (
    <div className="lg:px-24 md:px-12 px-6 py-4 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm fixed top-0 right-0 left-0 z-10">
      <div className="flex items-center justify-between">
        {searchOpen ? (
          <div className="flex-1">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                x
                placeholder="Search.."
                onChange={(e) => setKeyWord(e.target.value)}
                className="w-[100%] px-4 py-1 outline-none border-b-[2px] border-black"
              />
            </form>
          </div>
        ) : (
          <>
            <div>
              <h2 className="font-bold text-2xl tracking-tight">MetizCare</h2>
            </div>
            <ul className="flex items-center">
              <Link to={"/"} className="mx-4 text-lg text-black">
                <li>Home</li>
              </Link>
              <Link to={"/products"} className="mx-4 text-lg text-black">
                <li>Products</li>
              </Link>
              <Link to={"/skincare-tips"} className="mx-4 text-lg text-black">
                <li>Skincare Tips</li>
              </Link>
              <Link to={"/skin-quiz"} className="mx-4 text-lg text-black">
                <li>Beauty Assistant</li>
              </Link>
              <Link to={"/face-analysis"} className="mx-4 text-lg text-black">
                <li>Face Analysis</li>
              </Link>
              <Link to={"/contact"} className="mx-4 text-lg text-black">
                <li>Contact</li>
              </Link>
            </ul>
          </>
        )}
        <div className="flex items-center gap-3">
          {searchOpen ? (
            <AiOutlineClose
              onClick={() => setSearchOpen(false)}
              className="text-2xl cursor-pointer"
            />
          ) : (
            <AiOutlineSearch
              onClick={() => setSearchOpen(true)}
              className="text-2xl cursor-pointer"
            />
          )}

          <Link to={"/cart"}>
            <Badge count={cartItems?.length}>
              <BsBagCheck className="text-2xl" />
            </Badge>
          </Link>
          {/* Clerk auth controls */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1 rounded-md border border-gray-800 hover:bg-gray-800 hover:text-white">Sign In</button>
            </SignInButton>
            <Link to="/admin/login" className="px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white ml-2">Admin Login</Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      {/* Admin modal removed in favor of dedicated page */}
    </div>
  );
};

export default Header;
