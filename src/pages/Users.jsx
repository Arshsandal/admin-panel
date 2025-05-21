import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Spin,
  message,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://backend-5ofy.onrender.com/api/auth/getUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (values) => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        username: values.username,
        dob: values.dob.toISOString(),
        role: values.role,
      };

      if (isEditMode && selectedUser) {
        await axios.put(
          `https://backend-5ofy.onrender.com/api/auth/updateUser/${selectedUser._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("User updated successfully");
      } else {
        await axios.post(
          "https://backend-5ofy.onrender.com/api/auth/addUser",
          {
            ...payload,
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("User added successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      setIsEditMode(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error(error?.response?.data?.message || "Failed to save user");
    }
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setIsModalVisible(true);

    form.setFieldsValue({
      ...user,
      dob: dayjs(user.dob),
      remember: user.remember || false,
    });
  };

  const confirmDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://backend-5ofy.onrender.com/api/auth/deleteUser/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("User deleted successfully");
      setIsDeleteModalVisible(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      message.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Profile Picture",
      dataIndex: "profilePic",
      key: "profilePic",
       render: (text) => (
    <img
      src={text || "https://via.placeholder.com/40?text=👤"}
      alt="Profile"
      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
    />
  ),
    },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => openEditModal(record)}>Edit</Button>
          <Button type="link" danger onClick={() => confirmDeleteUser(record)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Users</h2>
        <Button
          type="primary"
          onClick={() => {
            setIsEditMode(false);
            setSelectedUser(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={users} columns={columns} rowKey="_id" />
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={isEditMode ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setIsEditMode(false);
          setSelectedUser(null);
        }}
        onOk={() => form.submit()}
        okText={isEditMode ? "Update User" : "Add User"}
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Date of Birth"
            rules={[{ required: true, message: "Please select the date of birth" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input the email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input disabled={isEditMode} />
          </Form.Item>

          {!isEditMode && (
            <>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please input the password!" },
                  { min: 3, message: "Password must be at least 3 characters" },
                ]}
                hasFeedback
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember Me</Checkbox>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        okText="Yes, Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete <strong>{selectedUser?.username}</strong>?</p>
      </Modal>
    </div>
  );
};

export default Users;
