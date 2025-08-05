import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderById } from "../../redux/slice/adminOrderSlice";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { orderDetails, loadingDetails, errorDetails } = useSelector(state => state.adminOrders);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

if (loadingDetails) return <p>Loading order details...</p>;
if (errorDetails) return <p>Error: {errorDetails}</p>;
if (!orderDetails) return <p>No order details found</p>;


  const order = orderDetails;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 py-6 my-8 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Order #{order._id}</h2>
      <div className="mb-4">
        <div><span className="font-semibold">Customer:</span> {order.user?.name}</div>
        <div><span className="font-semibold">Mobile:</span> {order.user?.phone || "-"}</div>
        <div><span className="font-semibold">Email:</span> {order.user?.email || "-"}</div>
        <div><span className="font-semibold">Address:</span> {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</div>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Status:</span> {order.status}
      </div>
      <h3 className="text-xl font-semibold mb-2">Ordered Items</h3>
      <table className="min-w-full table-auto text-sm mb-4 border border-gray-200">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Name</th>
            <th className="border-b p-2 text-left">Size</th>
            <th className="border-b p-2 text-left">Color</th>
            <th className="border-b p-2 text-left">Quantity</th>
            <th className="border-b p-2 text-left">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.orderItems.map((item, idx) => (
            <tr key={idx}>
              <td className="border-b max-w-xs truncate p-2">{item.name}</td>
              <td className="border-b max-w-xs truncate p-2">{item.size || "-"}</td>
              <td className="border-b max-w-xs truncate p-2">{item.color || "-"}</td>
              <td className="border-b max-w-xs truncate p-2">{item.quantity}</td>
              <td className="border-b max-w-xs truncate p-2">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <span className="font-semibold">Total Price:</span> {order.totalPrice.toFixed(2)}
      </div>
    </div>
  );
};

export default AdminOrderDetails;
