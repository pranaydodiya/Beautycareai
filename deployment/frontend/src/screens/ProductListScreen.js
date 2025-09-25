import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import Paginate from "../components/Paginate";
import {
  listProducts,
  deleteProduct,
  createProduct,
} from "../actions/productActions";
import { PRODUCT_CREATE_RESET } from "../constants/productConstants";
import { BiEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { Table } from "antd";
import { formatINR } from "../utils/currency";

const ProductListScreen = () => {
  const pageNumber = useParams() || 1;

  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  const productDelete = useSelector((state) => state.productDelete);
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: succcessDelete,
  } = productDelete;

  const productCreate = useSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: succcessCreate,
    product: createdProduct,
  } = productCreate;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const history = useNavigate();

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET });

    if (!userInfo.isAdmin) {
      history("/login");
    }

    if (succcessCreate) {
      history(`/admin/product/${createdProduct._id}/edit`);
    } else {
      dispatch(listProducts("", pageNumber));
    }
  }, [
    dispatch,
    history,
    userInfo,
    succcessDelete,
    succcessCreate,
    createdProduct,
    pageNumber,
  ]);

  const deleteHandler = (id) => {
    if (window.confirm("Are you sure")) {
      dispatch(deleteProduct(id));
    }
  };

  const createProductHandler = () => {
    dispatch(createProduct());
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => <p className="font-semibold">{formatINR(price)}</p>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Options",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <div className="flex items-center">
          <Link to={`/admin/product/${id}/edit`}>
            <BiEdit className="text-blue-600 text-2xl mr-3 cursor-pointer" />
          </Link>
          <MdDelete
            className="text-red-600 text-2xl cursor-pointer"
            onClick={() => deleteHandler(id)}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="mt-[60px] px-24">
      <div className="flex justify-between mb-3">
        <h2>Products</h2>
        <button
          className="border-blue-500 border px-4 py-2 hover:bg-blue-500 hover:text-white"
          onClick={createProductHandler}
        >
          Create Product
        </button>
      </div>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant="danger">{errorDelete}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant="danger">{errorCreate}</Message>}

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table dataSource={products} columns={columns} />;
        </>
      )}
    </div>
  );
};

export default ProductListScreen;
