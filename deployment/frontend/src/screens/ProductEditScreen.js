import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { listProductDetails, updateProduct } from "../actions/productActions";
import FormContainer from "../components/FormContainer";
import { PRODUCT_UPDATE_RESET } from "../constants/productConstants";

const ProductEditScreen = (match) => {
  const { id } = useParams();
  const productId = id;
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const history = useNavigate();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const productUpdate = useSelector((state) => state.productUpdate);
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = productUpdate;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      history("/admin/productlist");
    } else {
      if (!product.name || product._id !== productId) {
        dispatch(listProductDetails(productId));
      } else {
        setName(product.name);
        setPrice(product.price);
        setImage(product.image);
        setBrand(product.brand);
        setCategory(product.category);
        setCountInStock(product.countInStock);
        setDescription(product.description);
      }
    }
  }, [dispatch, history, productId, product, successUpdate]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post("/api/upload", formData, config);

      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(
      updateProduct({
        _id: productId,
        name,
        price,
        image,
        brand,
        category,
        description,
        countInStock,
      })
    );
  };
  return (
    <div className="mt-[60px] px-24">
      <Link to="/admin/productlist" className="btn btn=light my-3">
        <button className="border border-blue-500 rounded-md px-4 py-2 mb-4">
          Go Back
        </button>
      </Link>
      <h1>Edit Product</h1>
      {loadingUpdate && <Loader />}
      {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div>
          <form action="" className="flex flex-col items-center">
            <div className="flex flex-col">
              <label className="font-semibold" htmlFor="">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 outline-none border w-[400px] border-blue-500 rounded-md px-4 py-2"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label className="font-semibold" htmlFor="">
                Price
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 outline-none border w-[400px] border-blue-500 rounded-md px-4 py-2"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label className="font-semibold" htmlFor="">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="mt-1 outline-none border w-[400px] border-blue-500 rounded-md px-4 py-2"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label className="font-semibold" htmlFor="">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 outline-none border w-[400px] border-blue-500 rounded-md px-4 py-2"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label className="font-semibold" htmlFor="">
                Description
              </label>
              <textarea
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 outline-none border w-[400px] h-[150px] border-blue-500 rounded-md px-4 py-2"
              />
            </div>
            <div className="flex flex-col mt-3">
              <label className="font-semibold" htmlFor="">
                Count InStock
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCountInStock(e.target.value)}
                className="mt-1 outline-none border w-[400px] border-blue-500 rounded-md px-4 py-2"
              />
            </div>
            <button
              onClick={submitHandler}
              className="text-white px-4 py-2 bg-blue-500 rounded-md"
            >
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductEditScreen;
