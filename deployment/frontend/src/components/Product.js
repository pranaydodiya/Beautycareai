import React from "react";
import Rating from "./Rating";
import { Link } from "react-router-dom";
import { formatINR } from "../utils/currency";
const Product = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`}>
      <div className="flex items-center flex-col justify-center">
        <img className="max-w-[300px]" src={product.image} alt="" />
        <div>
          <h2>{product.name}</h2>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
            color={"#F6B900"}
          />
          <h3 className="font-semibold text-lg">{formatINR(product.price)}</h3>
        </div>
      </div>
    </Link>
  );
};

export default Product;
