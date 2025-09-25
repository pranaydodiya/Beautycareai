import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Message from "../components/Message";
import CheckoutSteps from "../components/CheckoutSteps";
import { createOrder } from "../actions/orderActions";
import { formatINR } from "../utils/currency";

const PlaceOrderScreen = () => {
  const cart = useSelector((state) => state.cart);
  const [showPayment, setShowPayment] = useState(false);
  const dispatch = useDispatch();

  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  cart.itemsPrice = addDecimals(
    cart.cartItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2)
  );

  cart.shippingPrice = addDecimals(cart.itemsPrice > 100 ? 0 : 10);
  cart.taxPrice = addDecimals(Number((0.15 * cart.itemsPrice).toFixed(2)));
  cart.totalPrice = (
    Number(cart.itemsPrice) +
    Number(cart.shippingPrice) +
    Number(cart.taxPrice)
  ).toFixed(2);

  const orderCreate = useSelector((state) => state.orderCreate);
  const { order, success, error } = orderCreate;
  const history = useNavigate();

  useEffect(() => {
    if (success) {
      history(`/order/${order._id}`);
    }
  }, [history, success]);

  const placeOrderAfterPayment = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      })
    );
  };

  return (
    <>
    <div className="mt-24 md:px-24 sm:px-12 px-6 grid grid-cols-3,flex-col items-center gap-5">
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="col-span-2">
        <h1 className="font-bold text-xl text-center">Order Details</h1>
        <div className="flex items-start flex-col">
          <h2 className="font-semibold text-2xl">SHIPPING</h2>
          <p className="mt-2">
            <strong>Addresss : </strong>
            {cart.shippingAddress.address},{cart.shippingAddress.city},
            {cart.shippingAddress.postalCode},{cart.shippingAddress.country}
          </p>
        </div>
        <hr className="my-4" />
        <div>
          <h2 className="font-semibold text-2xl">PAYMENT METHOD</h2>
          <p className="mt-2">
            <strong>Method : </strong> {cart.paymentMethod}
          </p>
        </div>
        <hr className="my-4" />
        <div>
          <h2 className="font-semibold text-2xl">ORDER ITEMS</h2>
          {cart.cartItems.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div>
              {cart.cartItems.map((item, index) => {
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
        {error && <Message type="error" message={error} />}
        {success && (
          <Message type="success" message={"Order placed successfully"} />
        )}
        <h1 className="font-bold text-xl text-center">Order Summary</h1>
        <div className="border rounded-lg px-6 py-4 mt-4">
          <div className="flex justify-between my-2">
            <p className="font-semibold text-lg">Items</p>
            <p className="font-semibold">{formatINR(cart.itemsPrice)}</p>
          </div>
          <div className="flex justify-between my-2">
            <p className="font-semibold text-lg">Shipping</p>
            <p className="font-semibold">{formatINR(cart.shippingPrice)}</p>
          </div>
          <div className="flex justify-between my-2">
            <p className="font-semibold text-lg">Tax</p>
            <p className="font-semibold">{formatINR(cart.taxPrice)}</p>
          </div>
          <div className="flex justify-between my-2">
            <p className="font-semibold text-lg">Total</p>
            <p className="font-semibold">{formatINR(cart.totalPrice)}</p>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="bg-blue-500 text-lg text-white px-4 py-2 rounded-sm w-full mt-6"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
    {showPayment && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
        <div className="bg-white rounded-lg p-6 w-[90%] max-w-[420px] text-center">
          <h3 className="text-xl font-semibold">Pay with QR (Demo)</h3>
          <p className="text-gray-600 mt-1">Scan the QR and then confirm.</p>
          <img src="/images/sample.webp" alt="QR" className="mx-auto my-4 max-h-[260px] rounded" />
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowPayment(false)} className="px-4 py-2 rounded-md border">Cancel</button>
            <button onClick={() => { setShowPayment(false); placeOrderAfterPayment(); }} className="px-4 py-2 rounded-md bg-green-600 text-white">I have paid</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default PlaceOrderScreen;
