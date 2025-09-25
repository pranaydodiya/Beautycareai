import React, { useEffect } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { listOrders } from "../actions/orderActions";
import { Table } from "antd";
import { formatINR } from "../utils/currency";
import { TiTick } from "react-icons/ti";
import { AiOutlineClose } from "react-icons/ai";
const OrderListScreen = () => {
  const dispatch = useDispatch();
  const orderList = useSelector((state) => state.orderList);
  const { loading, error, orders } = orderList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const history = useNavigate();

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listOrders());
    } else {
      history("/login");
    }
  }, [dispatch, history, userInfo]);

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (user) => <p>{user?.name}</p>,
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => <p className="font-semibold">{formatINR(price)}</p>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <p className="font-semibold">{date.substring(0, 10)}</p>
      ),
    },
    {
      title: "Delivered",
      dataIndex: "isDelivered",
      key: "isDelivered",
      render: (delivered) =>
        delivered ? (
          <TiTick className="text-green-600 text-2xl" />
        ) : (
          <AiOutlineClose className="text-red-600 text-2xl" />
        ),
    },
    {
      title: "Paid",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (paid) =>
        paid ? (
          <TiTick className="text-green-600 text-2xl" />
        ) : (
          <AiOutlineClose className="text-red-600 text-2xl" />
        ),
    },
    {
      title: "Details",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <Link to={`/order/${id}`}>
          <button className="bg-blue-500 text-white px-3 py-[3px] rounded-md">
            Details
          </button>
        </Link>
      ),
    },
  ];
  return (
    <div className="mt-[60px] px-24">
      <h1>Orders</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table dataSource={orders} columns={columns} />
      )}
    </div>
  );
};

export default OrderListScreen;
