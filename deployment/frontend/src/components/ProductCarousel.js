import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Carousel, Image } from "react-bootstrap";
import Loader from "./Loader";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { listTopProducts } from "../actions/productActions";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const ProductCarousel = () => {
  const dispatch = useDispatch();

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    arrows: false,
    slidesToShow: 3,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2200,
    cssEase: "ease-in-out",
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, centerPadding: "20px" } },
    ],
  };
  const productTopRated = useSelector((state) => state.productTopRated);
  const { loading, error, products } = productTopRated;

  useEffect(() => {
    dispatch(listTopProducts());
  }, [dispatch]);

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant=" danger">{error}</Message>
  ) : (
    <div className="mt-12">
      <h2 className="font-bold text-4xl text-center">Top Products</h2>
      <Slider {...settings}>
        {products.map((product) => {
          return (
            <Link
              to={`/product/${product._id}`}
              className="flex cursor-pointer justify-center relative group hover:shadow-md rounded-md"
            >
              <div className="">
                <img className="max-w-[300px]" src={product.image} alt="" />
                <h2 className="font-[Urbanist] absolute bottom-[-50px] transition-all group-hover:bottom-0 hidden group-hover:block font-bold w-full text-lg text-center p-3">
                  {product.name}
                </h2>
              </div>
            </Link>
          );
        })}
      </Slider>
    </div>
  );
};

export default ProductCarousel;
