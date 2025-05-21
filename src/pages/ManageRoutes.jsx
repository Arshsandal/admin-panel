import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Tag,
  message,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";

const ManageRoutes = () => {
  const [arrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchArrivals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api.tfl.gov.uk/Line/24,73,159/Arrivals?sort=timeToStation"
      );
      setArrivals(response.data);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch bus arrival data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
  }, []);

  const filteredArrivals = arrivals.filter((item) =>
    (item.lineName + item.stationName + item.destinationName)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Line",
      dataIndex: "lineName",
      key: "lineName",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Station",
      dataIndex: "stationName",
      key: "stationName",
    },
    {
      title: "Destination",
      dataIndex: "destinationName",
      key: "destinationName",
    },
    {
      title: "Platform",
      dataIndex: "platformName",
      key: "platformName",
    },
    {
      title: "Arrival In",
      dataIndex: "timeToStation",
      key: "timeToStation",
      render: (seconds) => `${Math.round(seconds / 60)} min`,
    },
  ];

  return (
    <div className="p-10 min-h-screen bg-gradient-to-tr from-white to-blue-50">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8 tracking-tight">
        Live Bus Arrivals (TfL)
      </h1>

      <Card className="rounded-xl shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-[12px]">
          <Input
            placeholder="Search by line, station or destination"
            prefix={<SearchOutlined />}
            className="w-full md:w-80"
            allowClear
            size="large"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<ReloadOutlined />}
            size="large"
            onClick={fetchArrivals}
            className="px-6 py-2 my-[12px]"
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredArrivals.map((item) => ({
              ...item,
              key: item.id,
            }))}
            pagination={{ pageSize: 10 }}
            className="rounded-lg overflow-hidden"
          />
        )}
      </Card>
    </div>
  );
};

export default ManageRoutes;
