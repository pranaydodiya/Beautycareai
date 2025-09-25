import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getUserDetails, updateUser } from "../actions/userActions";
import FormContainer from "../components/FormContainer";
import { USER_UPDATE_RESET } from "../constants/userConstants";
import { Checkbox } from "antd";

const UserEditScreen = (match) => {
  const { id } = useParams();
  const userId = id;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const dispatch = useDispatch();
  const history = useNavigate();

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userUpdate = useSelector((state) => state.userUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = userDetails;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET });
      history("/admin/userlist");
    } else {
      if (!user?.name || user?._id !== userId) {
        dispatch(getUserDetails(userId));
      } else {
        setName(user?.name);
        setEmail(user?.email);
        setIsAdmin(user?.isAdmin);
      }
    }
  }, [dispatch, history, userId, user, successUpdate]);
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateUser({ _id: userId, name, email, isAdmin }));
  };
  return (
    <>
      <div className="mt-[60px] px-24">
        <Link to="/admin/userlist" className="border border-blue-500 px-4 py-2">
          Go Back
        </Link>
        <h1 className="mt-4">Edit User</h1>
      </div>
      {loadingUpdate && <Loader />}
      {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="mt-[60px]">
          <form action="" className="flex flex-col items-center gap-5">
            <input
              type="text"
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="outline-none border border-blue-500 rounded-md px-4 py-2"
            />
            <input
              type="text"
              placeholder="name"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="outline-none border border-blue-500 rounded-md px-4 py-2"
            />
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            >
              isAdmin
            </Checkbox>
            <button
              className="text-white px-4 py-2 bg-blue-500 rounded-md"
              onClick={submitHandler}
            >
              Update
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default UserEditScreen;
