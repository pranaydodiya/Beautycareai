import React, { useState } from "react";
import { Form, Button, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import { useNavigate } from "react-router-dom";
import { savePaymentMethod } from "../actions/cartActions";
import CheckoutSteps from "../components/CheckoutSteps";

const PaymentScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;
  const history = useNavigate();

  if (!shippingAddress) {
    history("/shipping");
  }

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const dispatch = useDispatch();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    history("/placeorder");
  };

  return (
    <div className="mt-24 md:px-24 sm:px-12 px-6 flex flex-col items-center justify-center">
      <CheckoutSteps step1 step2 step3 />
      <div className="flex flex-col ">
        <h2 className="text-xl font-bold mt-6">Payment Method</h2>

        <label htmlFor="" className="my-2">
          <input
            name="payment_method"
            className="mr-2"
            value="cod"
            type="radio"
            checked
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash on Delivery
        </label>

        <label htmlFor="" className="my-2">
          <input
            name="payment_method"
            className="mr-2"
            value="card"
            type="radio"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit/Debit Card (Demo)
        </label>
        <button
          onClick={submitHandler}
          className="bg-blue-600 px-4 py-2 rounded-lg mt-4 text-white font-semibold hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PaymentScreen;
