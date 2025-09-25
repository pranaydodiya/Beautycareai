import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getUserDetails, updateUserProfile } from "../actions/userActions";
import { listMyOrders } from "../actions/orderActions";
import { ImCross } from "react-icons/im";
import { TiTick } from "react-icons/ti";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const history = useNavigate();

  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const { success } = userUpdateProfile;

  const orderListMy = useSelector((state) => state.orderListMy);
  const { loading: loadingOrders, error: errorOrders, orders } = orderListMy;

  useEffect(() => {
    if (!userInfo) {
      history("/login");
    } else {
      if (!user?.name) {
        dispatch(getUserDetails("profile"));
        dispatch(listMyOrders());
      } else {
        setName(user?.name);
        setEmail(user?.email);
      }
    }
  }, [dispatch, history, userInfo, user]);
  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
    } else {
      dispatch(updateUserProfile({ id: user._id, name, email, password }));
    }
  };
  return (
    <div className="mt-[60px] px-24 py-10">
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-1">
          <h2 className="font-bold text-2xl">My Profile</h2>
          <div className="flex flex-col mt-6">
            {error && <Message message={error} type="error" />}
            {message && <Message message={message} type="error" />}
            {success && (
              <Message
                message={"Profile Updated Successfully"}
                type="success"
              />
            )}
            {loading ? (
              <Loader />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="outline-none border my-4 border-blue-300 text-lg rounded-lg px-4 py-2 focus:border focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="outline-none border my-4 border-blue-300 text-lg rounded-lg px-4 py-2 focus:border focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="outline-none border my-4 border-blue-300 text-lg rounded-lg px-4 py-2 focus:border focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="outline-none border my-4 border-blue-300 text-lg rounded-lg px-4 py-2 focus:border focus:border-blue-500"
                />
                <button
                  onClick={submitHandler}
                  className="bg-blue-600 px-4 py-2 rounded-lg mt-4 text-white font-semibold hover:bg-blue-700"
                >
                  Update
                </button>
              </>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <h2 className="font-bold text-2xl">My Orders</h2>
          <div>
            {orders?.length === 0 ? (
              <h2>No Orders</h2>
            ) : (
              <div>
                <div>
                  {orders?.map((order) => {
                    return (
                      <div className="flex justify-between relative">
                        <div>
                          <h2 className="font-bold my-3 text-lg">PRODUCT</h2>
                          {order.orderItems.map((orderItem) => {
                            return (
                              <div>
                                <img
                                  className="max-w-[100px] rounded-md"
                                  src={orderItem.image}
                                  alt=""
                                />
                                <p className="mt-4 max-w-[160px]">
                                  {orderItem.name}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <div>
                          <h2 className="font-bold my-3 text-lg">ORDERID</h2>
                          <p>{order._id}</p>
                        </div>
                        <div>
                          <h2 className="font-bold my-3 text-lg">DATE</h2>
                          <p>{order?.createdAt?.substr(0, 10)}</p>
                        </div>
                        <div>
                          <h2 className="font-bold my-3 text-lg">TOTAL</h2>
                          <p>{order.totalPrice} $</p>
                        </div>
                        <div>
                          <h2 className="font-bold my-3 text-lg">DELIVERED</h2>
                          {!order.isDelivered ? (
                            <ImCross className="text-red-600" />
                          ) : (
                            <TiTick className="text-green-600 text-2xl" />
                          )}
                        </div>
                        {/* <div>
                          <h2 className="font-bold my-3 text-lg">PAID</h2>
                          <p>{order?.paidAt.substr(0, 10)}</p>
                        </div> */}
                        <Link to={`/order/${order._id}`}>
                          <button className="absolute px-4 py-2 border border-blue-500 rounded-md right-5 bottom-5">
                            Details
                          </button>
                        </Link>
                      </div>
                    );
                  })}
                  <hr className="mt-2" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
