import React, { useEffect } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { listUsers, deleteUser } from "../actions/userActions";
import { Table } from "antd";
import { TiTick } from "react-icons/ti";
import { AiOutlineClose } from "react-icons/ai";
import { BiEdit } from "react-icons/bi";
import { MdDelete } from "react-icons/md";

const UserListScreen = () => {
  const dispatch = useDispatch();
  const userList = useSelector((state) => state.userList);
  const { loading, error, users } = userList;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userDelete = useSelector((state) => state.userDelete);
  const { success: successDelete } = userDelete;

  const history = useNavigate();

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listUsers());
    } else {
      history("/login");
    }
    console.log(userInfo);
  }, [dispatch, history, successDelete, userInfo]);

  const deleteHandler = (id) => {
    if (window.confirm("Are you sure, you want to delete?")) {
      dispatch(deleteUser(id));
    }
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
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Admin",
      dataIndex: "isAdmin",
      key: "isAdmin",
      render: (admin) =>
        admin ? (
          <TiTick className="text-green-600 text-2xl" />
        ) : (
          <AiOutlineClose className="text-red-600 text-2xl" />
        ),
    },
    {
      title: "Options",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <div className="flex items-center">
          <Link to={`/admin/user/${id}/edit`}>
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
      <h1 className="mt-4 mb-4">Users</h1>
      <Table dataSource={users} columns={columns} />;
    </div>
  );
};

export default UserListScreen;
