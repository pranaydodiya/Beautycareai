import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { register } from "../actions/userActions";
import FormContainer from "../components/FormContainer";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();

  const userRegister = useSelector((state) => state.userRegister);
  const { loading, error, userInfo } = userRegister;

  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/";
  const history = useNavigate();

  useEffect(() => {
    if (userInfo) {
      history(redirect);
    }
  }, [history, userInfo, redirect]);
  const submitHandler = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMessage("Passwords do not match");
    } else {
      dispatch(register(name, email, password));
    }
  };
  return (
    <>
      {error && <Message type="error" message={error} />}
      <div className="h-[100vh] flex items-center justify-center">
        <div className="w-[350px] h-[350px] flex items-center flex-col justify-center bg-gradient-to-tr rounded-xl from-slate-300 to-gray-300">
          <h2 className="font-bold text-2xl mb-6">Sign Up</h2>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            className="outline-none text-lg rounded-lg mb-5 px-4 py-2 focus:border border-blue-500"
          />

          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="outline-none text-lg rounded-lg px-4 py-2 focus:border border-blue-500"
          />

          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="outline-none text-lg my-5 rounded-lg px-4 py-2 focus:border border-blue-500"
          />

          {loading ? (
            <Loader />
          ) : (
            <button
              onClick={submitHandler}
              className="bg-blue-500 px-4 py-2 rounded-lg text-white"
            >
              Sign up
            </button>
          )}
          <p className="mt-4">
            Already have an acoount ?{" "}
            <Link to={redirect ? `/login?redirect=${redirect}` : "/login"}>
              <span className="text-blue-500">Log in</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterScreen;
