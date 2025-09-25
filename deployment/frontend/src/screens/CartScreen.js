import React, { useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Lottie from "lottie-react";
import cartAnimation from "../assests/cart.json";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { addToCart, removeFromCart } from "../actions/cartActions";
import { formatINR } from "../utils/currency";

const CartScreen = ({ match }) => {
  const { id } = useParams();
  const productId = id;
  const location = useLocation();
  const qty = location.search ? Number(location.search.split("=")[1]) : 1;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty));
    }
  }, [dispatch, productId, qty]);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/pay");
  };

  return (
    <div className="mt-24 md:px-24 sm:px-12 px-6">
      {cartItems?.length === 0 ? (
        <div className="h-[86vh] flex items-center flex-col justify-center ">
          <h2 className="md:text-3xl text-xl font-bold">
            Your Cart is Empty. Please add items
          </h2>
          <Lottie
            className="md:max-w-[400px] max-w-[300px]"
            animationData={cartAnimation}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
          <div className="col-span-2">
            {cartItems.map((cartItem, i) => {
              return (
                <>
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex w-[380px] items-center">
                      <img
                        className="max-w-[150px] rounded-xl"
                        src={cartItem.image}
                        alt=""
                      />
                      <h2 className="ml-5 font-medium text-lg">
                        {cartItem.name}
                      </h2>
                    </div>
                    <h2 className="font-bold text-lg">{formatINR(cartItem.price)}</h2>
                    <div className="flex items-center justify-between w-[100px] py-2 px-3 rounded-full border border-gray-700">
                      <AiOutlineMinus
                        className="cursor-pointer"
                        onClick={() => {
                          cartItem.qty > 1
                            ? dispatch(
                                addToCart(
                                  cartItem.product,
                                  Number(cartItem.qty - 1)
                                )
                              )
                            : dispatch(addToCart(cartItem.product, Number(1)));
                        }}
                      />
                      <p>{cartItem.qty}</p>
                      <AiOutlinePlus
                        className="cursor-pointer"
                        onClick={() => {
                          dispatch(
                            addToCart(
                              cartItem.product,
                              Number(cartItem.qty + 1)
                            )
                          );
                        }}
                      />
                    </div>
                    <RiDeleteBin6Line
                      onClick={() => removeFromCartHandler(cartItem.product)}
                      className="text-red-600 text-2xl cursor-pointer"
                    />
                  </div>
                  <hr className="my-4" />
                </>
              );
            })}
          </div>

          <div className="border-[2px] min-h-[300px] rounded-lg p-6">
            <h2 className="font-bold text-xl">
              CART SUBTOTAL (
              {cartItems.reduce((acc, item) => acc + item.qty, 0)}) ITEMS
            </h2>
            {cartItems.map((item, i) => {
              return (
                <div key={i} className="flex items-center justify-between my-4">
                  <h2 className="w-[200px]">{item.name}</h2>
                  <p className="text-lg font-semibold">{formatINR(item.price * item.qty)}</p>
                </div>
              );
            })}
            <hr />
            <div className="flex items-center justify-between my-2">
              <h2 className="text-xl">Grand Total</h2>
              <p className="text-lg font-semibold">{formatINR(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0))}</p>
            </div>

            <button onClick={checkoutHandler} className="bg-pink-600 hover:bg-pink-700 text-lg text-white px-4 py-2 rounded-sm w-full mt-6">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
