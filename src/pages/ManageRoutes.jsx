// import React from "react";
// import {
//   Card,
//   Table,
//   Button,
//   Space,
//   Input,
//   Tag,
// } from "antd";
// import {
//   EditOutlined,
//   DeleteOutlined,
//   PlusOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";

// const ManageRoutes = () => {
//   const routeData = [
//     {
//       key: "1",
//       routeNumber: "38A",
//       origin: "ISBT Sector 17",
//       destination: "PGI",
//       status: "Active",
//     },
//     {
//       key: "2",
//       routeNumber: "22B",
//       origin: "ISBT Sector 43",
//       destination: "Mohali Phase 11",
//       status: "Inactive",
//     },
//   ];

//   const columns = [
//     {
//       title: "Route Number",
//       dataIndex: "routeNumber",
//       key: "routeNumber",
//     },
//     {
//       title: "Origin",
//       dataIndex: "origin",
//       key: "origin",
//     },
//     {
//       title: "Destination",
//       dataIndex: "destination",
//       key: "destination",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => (
//         <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
//       ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <Space size="middle">
//           <Button
//             icon={<EditOutlined />}
//             size="small"
//             type="primary"
//             className="px-4 py-1 text-sm"
//           >
//             Edit
//           </Button>
//           <Button
//             icon={<DeleteOutlined />}
//             size="small"
//             danger
//             className="px-4 py-1 text-sm"
//           >
//             Delete
//           </Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-10 min-h-screen bg-gradient-to-tr from-white to-blue-50">
//       <h1 className="text-3xl font-bold text-indigo-800 mb-8 tracking-tight">
//         Manage Routes
//       </h1>

//       <Card className="rounded-xl shadow-md border border-gray-200">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-[12px]">
//           <Input
//             placeholder="Search by route number or destination"
//             prefix={<SearchOutlined />}
//             className="w-full md:w-80"
//             allowClear
//             size="large"
//           />
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             size="large"
//             className="px-6 py-2 my-[12px]"
//           >
//             Add New Route
//           </Button>
//         </div>

//         <Table
//           columns={columns}
//           dataSource={routeData}
//           pagination={{ pageSize: 5 }}
//           className="rounded-lg overflow-hidden"
//         />
//       </Card>
//     </div>
//   );
// };

// export default ManageRoutes;



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
