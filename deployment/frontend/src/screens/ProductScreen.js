import React, { useState, useEffect } from "react";
import { formatINR } from "../utils/currency";
import { useDispatch, useSelector } from "react-redux";
import Meta from "../components/Meta";
import { Link, useParams, useNavigate } from "react-router-dom";
import Rating from "../components/Rating";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineMinus } from "react-icons/ai";
import { Alert, Select } from "antd";
import {
  listProductDetails,
  createProductReview,
} from "../actions/productActions";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { PRODUCT_CREATE_REVIEW_RESET } from "../constants/productConstants";

const ProductScreen = ({ match }) => {
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState();
  const [comment, setComment] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const productReviewCreate = useSelector((state) => state.productReviewCreate);
  const { success: successProductReview, error: errorProductReview } =
    productReviewCreate;

  const { id } = useParams();

  useEffect(() => {
    if (successProductReview) {
      alert("Review Submitted");
      setRating(0);
      setComment("");
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET });
    }

    dispatch(listProductDetails(id));
  }, [dispatch, match]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}`);
  };

  const submitHandler = () => {
    dispatch(
      createProductReview(id, {
        rating,
        comment,
      })
    );
  };

  return (
    <div className="lg:px-24 md:px-12 px-6 mt-[60px]">
      <Link to="/">
        <button className="border border-blue-500 rounded-lg px-4 py-2 mb-4">
          Go Back
        </button>
      </Link>
      {/* {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : ( */}

      <Meta title={product?.name} />
      <div className="grid h-full items-center md:grid-cols-2 grid-cols-1">
        <img
          src={product?.image}
          alt={product?.name}
          className="w-[600px] h-[490px] object-cover rounded-xl"
        />

        <div>
          <h2 className="font-bold text-2xl text-gray-800">{product?.name}</h2>

          <Rating
            value={product?.rating}
            text={`${product?.numReviews} reviews`}
          />

          <p className="text-lg mt-3 text-gray-500">
            Description: {product?.description}
          </p>
          <p className="font-semibold text-xl mt-3 text-gray-800">
            Price: {formatINR(product?.price)}
          </p>

          <div className="flex items-center mt-4">
            {product?.countInStock > 0 && (
              <div className="flex items-center justify-between w-[100px] py-2 px-3 rounded-full border border-gray-700">
                <AiOutlineMinus
                  className="cursor-pointer"
                  onClick={() => (qty > 1 ? setQty(qty - 1) : setQty(1))}
                />

                <p>{qty}</p>

                <AiOutlinePlus
                  className="cursor-pointer"
                  onClick={() => setQty(qty + 1)}
                />
              </div>
            )}
            <button
              className="ml-10 bg-blue-500 text-white px-4 py-2 rounded-full"
              onClick={addToCartHandler}
            >
              Add to Cart
            </button>
          </div>

          <h3 className="font-semibold text-lg mt-4 inline-flex items-center">
            Availability:
            {product?.countInStock > 0 ? (
              <p className="text-base font-normal ml-3">In Stock</p>
            ) : (
              <p className="text-base font-normal ml-3">Out of Stock</p>
            )}
          </h3>
        </div>
      </div>

      <div className="mt-6">
        {product?.reviews.length === 0 ? (
          <h2 className="font-bold text-2xl underline underline-offset-2 decoration-blue-500 mb-2">
            No Reviews
          </h2>
        ) : (
          <h2 className="font-bold text-2xl underline underline-offset-2 decoration-blue-500 mb-2">
            Reviews
          </h2>
        )}

        <div className="flex flex-col">
          {product?.reviews.map((review, i) => {
            return (
              <div>
                <h2 className="font-semibold">{review.name}</h2>
                <p>{review.createdAt.substr(0, 10)}</p>
                <p>{review.comment}</p>
                <hr />
              </div>
            );
          })}
          {userInfo ? (
            <div className="flex flex-col w-[30%] mt-3">
              <Select
                defaultValue="Select"
                onChange={(value) => setRating(value)}
                options={[
                  {
                    value: "1",
                    label: "1-Poor",
                  },
                  {
                    value: "2",
                    label: "2-Average",
                  },
                  {
                    value: "3",
                    label: "3-Good",
                  },
                  {
                    value: "4",
                    label: "4-very Good",
                  },
                  {
                    value: "5",
                    label: "5-Excellent",
                  },
                ]}
              />
              <textarea
                type="text"
                placeholder="Comment"
                onChange={(e) => setComment(e.target.value)}
                className="outline-none my-4 resize-none text-lg border border-blue-500 rounded-lg px-4 py-2 focus:border focus:border-blue-600"
              />
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg my-3"
                onClick={submitHandler}
              >
                Add Review
              </button>
            </div>
          ) : (
            <Alert
              type={"warning"}
              className="w-[50%]"
              showIcon
              message={`Please SignIn to add a review`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScreen;
