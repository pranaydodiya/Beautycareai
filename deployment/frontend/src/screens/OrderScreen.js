import React, { useEffect, useState } from "react";
import { Alert } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from "../actions/orderActions";
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from "../constants/orderConstants";
import { formatINR } from "../utils/currency";

const OrderScreen = ({ match }) => {
  const { orderId } = useParams();
  const [showQr, setShowQr] = useState(false);
  const dispatch = useDispatch();
  const history = useNavigate();

  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const orderPay = useSelector((state) => state.orderPay);
  const { loading: loadingPay, success: successPay } = orderPay;

  const orderDeliver = useSelector((state) => state.orderDeliver);
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver;

  if (!loading) {
    order.itemsPrice = order?.orderItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2);
  }

  useEffect(() => {
    if (!userInfo) {
      history("/login");
    }

    if (!order || successPay || successDeliver) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(getOrderDetails(orderId));
    }
  }, [dispatch, orderId, successPay, successDeliver, order]);

  const handlePayment = () => {
    const paymentResult = {
      id: `payment_${Date.now()}`,
      status: 'completed',
      update_time: new Date().toISOString(),
      email_address: order?.user?.email || userInfo?.email
    };
    dispatch(payOrder(orderId, paymentResult));
  };

  const deliverHandler = () => {
    dispatch(deliverOrder(order));
  };

  return (
    <>
    <div className="mt-24 md:px-24 sm:px-12 px-6 grid grid-cols-3 gap-5">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message />
      ) : (
        <>
          <div className="col-span-2">
            <div className="flex items-start flex-col">
              <h1 className="font-bold text-xl text-center mb-6">
                Order {orderId}
              </h1>
              <h2 className="font-semibold text-2xl">SHIPPING</h2>
              <p className="mt-2">
                <strong>Addresss : </strong>
                {order?.shippingAddress.address},{order?.shippingAddress.city},
                {order?.shippingAddress.postalCode},
                {order?.shippingAddress.country}
              </p>
              <div>
                <p>
                  <strong>Name : </strong>
                  {order?.user?.name}
                </p>
                <strong>
                  Mail :{" "}
                  <a
                    href={`mailto:${order?.user?.email}`}
                    className="font-normal"
                  >
                    {order?.user?.email}
                  </a>
                </strong>
              </div>
              {!order.isDelivered ? (
                <Alert
                  className="mt-4 w-[100%]"
                  message="Not Delivered"
                  type="error"
                  showIcon
                />
              ) : (
                <Alert
                  className="mt-4 w-[100%]"
                  message={order.deliveredAt}
                  type="success"
                  showIcon
                />
              )}
            </div>
            <hr className="my-4" />
            <div>
              <h2 className="font-semibold text-2xl">PAYMENT METHOD</h2>
              <p className="mt-2">
                <strong>Method : </strong> {order?.paymentMethod}
              </p>
              {!order.isPaid ? (
                <Alert
                  className="mt-4"
                  message="Not Paid"
                  type="error"
                  showIcon
                />
              ) : (
                <Alert
                  className="mt-4"
                  message={order.paidAt}
                  type="success"
                  showIcon
                />
              )}
            </div>
            <hr className="my-4" />
            <div>
              <h2 className="font-semibold text-2xl">ORDER ITEMS</h2>
              {order?.orderItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <div>
                  {order?.orderItems.map((item, index) => {
                    return (
                      <>
                        <div className="flex items-center my-3 justify-between w-[600px]">
                          <div className="flex items-center">
                            <img
                              className="max-w-[50px] rounded-md"
                              src={item.image}
                              alt=""
                            />
                            <Link
                              to={`/product/${item.product}`}
                              className="ml-4 hover:underline"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <p className="font-semibold">
                            {item.qty} X {formatINR(item.price)} = {formatINR(item.qty * item.price)}
                          </p>
                        </div>
                        <hr className="my-2" />
                      </>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="font-bold text-xl text-center">Order Summary</h1>
            <div className="border rounded-lg px-6 py-4 mt-4">
              <div className="flex justify-between my-2">
                <p className="font-semibold text-lg">Items</p>
                <p className="font-semibold">{formatINR(order?.itemsPrice)}</p>
              </div>
              <div className="flex justify-between my-2">
                <p className="font-semibold text-lg">Shipping</p>
                <p className="font-semibold">{formatINR(order?.shippingPrice)}</p>
              </div>
              <div className="flex justify-between my-2">
                <p className="font-semibold text-lg">Tax</p>
                <p className="font-semibold">{formatINR(order?.taxPrice)}</p>
              </div>
              <div className="flex justify-between my-2">
                <p className="font-semibold text-lg">Total</p>
                <p className="font-semibold">{formatINR(order?.totalPrice)}</p>
              </div>
              {!order.isPaid && (
                <div>
                  {loadingPay && <Loader />}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setShowQr(true)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Pay with QR (Demo)
                    </button>
                    <button
                      onClick={handlePayment}
                      className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg font-semibold hover:bg-black transition-colors"
                    >
                      Mark Paid (Skip QR)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>

    {showQr && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
        <div className="bg-white rounded-lg p-6 w-[90%] max-w-[420px] text-center">
          <h3 className="text-xl font-semibold">Scan to Pay (Demo)</h3>
          <p className="text-gray-600 mt-1">Use any UPI app to scan this sample QR. Then click "I have paid" to continue.</p>
          <img src="/images/sample.webp" alt="QR Code" className="mx-auto my-4 max-h-[260px] rounded" />
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowQr(false)} className="px-4 py-2 rounded-md border">Close</button>
            <button onClick={() => { setShowQr(false); handlePayment(); }} className="px-4 py-2 rounded-md bg-green-600 text-white">I have paid</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default OrderScreen;
