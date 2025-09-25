import React, { useEffect } from "react";
import Meta from "../components/Meta";
import { useDispatch, useSelector } from "react-redux";
import Product from "../components/Product";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { listProducts } from "../actions/productActions";
import Paginate from "../components/Paginate";
import { useParams } from "react-router-dom";
import Hero from "../components/ProductCard";
import ShowCase from "../components/ShowCase";
import ProductCarousel from "../components/ProductCarousel";
import Feature from "../components/Feature";

const HomeScreen = ({ search }) => {
  const { keyword } = useParams();
  const pageNumber = useParams() || 1;

  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;
  useEffect(() => {
    dispatch(listProducts(keyword, pageNumber));
  }, [dispatch, keyword, pageNumber]);

  return (
    <div className="w-[100vw]">
      {!search ? (
        <>
          <Hero />
          <Feature />
          <ProductCarousel />
          <ShowCase />
          <h2 className="font-bold text-4xl text-center">Latest Products</h2>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-8 gap-4">
              {products.map((product, i) => {
                return <Product product={product} key={i} />;
              })}
            </div>
          )}
        </>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-8 gap-4">
          {products.map((product, i) => {
            return <Product product={product} key={i} />;
          })}
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
