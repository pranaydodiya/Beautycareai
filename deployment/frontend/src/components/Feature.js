import React from "react";
import customer from "../assests/customer.webp";
import return1 from "../assests/return1.webp";
import quality from "../assests/quality.webp";
import shipping from "../assests/shipping.webp";

const Feature = () => {
  return (
    <div className="flex items-center justify-around px-24 py-10 bg-slate-100 my-6">
      <div className="flex flex-col items-center">
        <img src={customer} alt="customer" />
        <h4 className="font-semibold text-l ">24/7 FRIENDLY SUPPORT</h4>
        <p className="text-sm text-center ">
          Our team always ready for you <br />
          to 7 days a week
        </p>
      </div>
      <div className="flex flex-col items-center">
        <img src={shipping} alt="shipping" />
        <h4 className="font-semibold text-l ">FREE SHIPPING</h4>
        <p className="text-sm text-center ">
          Free shipping on all order
          <br /> above $100
        </p>
      </div>
      <div className="flex flex-col items-center">
        <img src={quality} alt="quality" />
        <h4 className="font-semibold text-l ">QUALITY GUARANTEED</h4>
        <p className="text-sm text-center ">
          If your product aren't perfect,
          <br /> return them{" "}
        </p>
      </div>
      <div className="flex flex-col items-center">
        <img src={return1} alt="return1" />
        <h4 className="font-semibold text-l ">7 DAYS EASY RETURN</h4>
        <p className="text-sm text-center ">
          Product any fault within 7 days
          <br /> for an immediately exchange.
        </p>
      </div>
    </div>
  );
};

export default Feature;
