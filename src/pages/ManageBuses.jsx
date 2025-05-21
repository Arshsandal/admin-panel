import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Tag, Input, Spin, message } from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const ManageBuses = () => {
  const [busData, setBusData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch TfL API
  const fetchBusData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://api.tfl.gov.uk/Line/24,73,159/Arrivals?sort=timeToStation");
      const data = await response.json();

      // Group by bus number (vehicleId) and map to display format
      const uniqueVehicles = {};
      data.forEach((item) => {
        if (!uniqueVehicles[item.vehicleId]) {
          uniqueVehicles[item.vehicleId] = {
            key: item.vehicleId,
            busNumber: item.vehicleId,
            route: item.lineName,
            type: item.modeName === "bus" ? "Standard" : item.modeName, // adjust if needed
            status: item.expectedArrival ? "Active" : "Inactive",
          };
        }
      });

      const buses = Object.values(uniqueVehicles);
      setBusData(buses);
    } catch (error) {
      message.error("Failed to fetch bus data.");
      console.error("API Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBusData();
  }, []);

  const columns = [
    {
      title: "Bus Number",
      dataIndex: "busNumber",
      key: "busNumber",
    },
    {
      title: "Route",
      dataIndex: "route",
      key: "route",
    },
    {
      title: "Bus Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} size="small" type="primary">
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} size="small" danger>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8">Manage Buses</h1>

      <Card className="rounded-xl shadow-md border-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Input
            placeholder="Search by bus number or route"
            prefix={<SearchOutlined />}
            className="w-full md:w-80"
            allowClear
            size="large"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="px-6 py-2 my-[12px]"
          >
            Add New Bus
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={busData}
            pagination={{ pageSize: 5 }}
            className="rounded-lg overflow-hidden"
          />
        )}
      </Card>
    </div>
  );
};

export default ManageBuses;
