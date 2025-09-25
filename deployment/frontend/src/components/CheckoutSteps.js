import React from "react";
import { Button, message, Steps, theme } from "antd";
import { Link } from "react-router-dom";

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const { token } = theme.useToken();

  const contentStyle = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };
  return (
    <div className="flex flex-row ">
      <div className="px-8">
        {step1 ? (
          <Link to="/login">
            <h3>Sign In</h3>
          </Link>
        ) : (
          <h3 className="disabled">Sign In</h3>
        )}
      </div>

      <div className="px-8">
        {step2 ? (
          <Link to="/shipping">
            <h3>Shipping</h3>
          </Link>
        ) : (
          <h3 className="disabled">Shipping</h3>
        )}
      </div>

      <div className="px-8">
        {step3 ? (
          <Link to="/payment">
            <h3>Payment</h3>
          </Link>
        ) : (
          <h3 className="disabled">Payment</h3>
        )}
      </div>

      <div className="px-8">
        {step4 ? (
          <Link to="/placeorder">
            <h3>Place Order</h3>
          </Link>
        ) : (
          <h3 className="disabled">Place Order</h3>
        )}
      </div>
    </div>
  );
};

export default CheckoutSteps;
