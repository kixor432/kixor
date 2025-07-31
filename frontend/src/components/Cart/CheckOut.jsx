import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createCheckout } from "../../redux/slice/checkoutSlice";
import { clearBuyNowProduct } from "../../redux/slice/buyNowSlice";
import api from "../../axios";

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    cart: reduxCart,
    loading: cartLoading,
    error: cartError,
  } = useSelector((state) => state.cart);
  const {
    user,
    loading: authLoading,
    error: authError,
  } = useSelector((state) => state.auth);
  const { product: buyNowProduct } = useSelector((state) => state.buyNow);
  const { loading: checkoutLoading, error: checkoutError } = useSelector(
    (state) => state.checkout
  ); // Assuming checkoutSlice has these

  const [checkoutId, setCheckoutId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("Razorpay");
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [addressErrors, setAddressErrors] = useState({});

  const cart = buyNowProduct
    ? {
        products: [buyNowProduct],
        totalPrice: buyNowProduct.price * buyNowProduct.quantity,
      }
    : reduxCart;

  useEffect(() => {
    if (
      !cartLoading &&
      (!cart || !cart.products || cart.products.length === 0)
    ) {
      navigate("/");
    }
  }, [cart, navigate, cartLoading]);

  const validateShippingAddress = () => {
    const errors = {};
    if (!shippingAddress.firstName.trim())
      errors.firstName = "First name is required.";
    if (!shippingAddress.lastName.trim())
      errors.lastName = "Last name is required.";
    if (!shippingAddress.address.trim())
      errors.address = "Address is required.";
    if (!shippingAddress.city.trim()) errors.city = "City is required.";
    if (!shippingAddress.postalCode.trim())
      errors.postalCode = "Postal code is required.";
    if (!shippingAddress.country.trim())
      errors.country = "Country is required.";
    if (!shippingAddress.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10,15}$/.test(shippingAddress.phone.trim())) {
      errors.phone = "Invalid phone number format.";
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!user) {
      alert("Please log in to continue with your purchase.");
      setIsProcessing(false);
      navigate("/login?redirect=/checkout");
      return;
    }

    if (!cart || cart.products.length === 0) {
      alert("Your cart is empty. Please add items before checking out.");
      setIsProcessing(false);
      navigate("/");
      return;
    }

    if (!validateShippingAddress()) {
      alert("Please correct the errors in your shipping address details.");
      setIsProcessing(false);
      return;
    }

    try {
      const createCheckoutResult = await dispatch(
        createCheckout({
          checkoutItems: cart.products,
          shippingAddress,
          paymentMethod: selectedPaymentMethod,
          totalPrice: cart.totalPrice,
        })
      );

      if (createCheckoutResult.meta.rejectedWithValue) {
        alert(`Checkout creation failed: ${createCheckoutResult.payload}`);
        setIsProcessing(false);
        return;
      }
      if (createCheckoutResult.error) {
        alert(
          `Checkout creation failed: ${
            createCheckoutResult.error.message || "Unknown error"
          }`
        );
        setIsProcessing(false);
        return;
      }

      const newCheckoutId = createCheckoutResult.payload._id;
      setCheckoutId(newCheckoutId);

      if (selectedPaymentMethod === "COD") {
        await handleFinalizeCheckout(newCheckoutId);
        setIsProcessing(false);
        return;
      }

      const { data: razorpayOrderData } = await api.post(
        `/api/checkout/${newCheckoutId}/create-razorpay-order`,
        {}
      );

      if (typeof window.Razorpay === "undefined") {
        alert(
          "Payment gateway script not loaded. Please ensure you have an active internet connection or try again later."
        );
        setIsProcessing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: "KIXOR",
        description: "Checkout Payment for KIXOR Order",
        order_id: razorpayOrderData.id,
        handler: async function (response) {
          await handlePaymentSuccess(
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
            },
            response.razorpay_signature,
            newCheckoutId
          );
          setIsProcessing(false);
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment popup closed.");
            setProcessing(false); // 🔥 IMPORTANT!
          },
        },
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        theme: { color: "#000" },
      };

      const rzp = new window.Razorpay(options);
      try {
        rzp.open();
      } catch (error) {
        console.error("Razorpay failed to open:", error);
        alert("Something went wrong. Please try again.");
        setIsProcessing(false);
      }

      rzp.on("payment.failed", (response) => {
        console.error("Razorpay Payment Failed:", response.error);
        alert(
          `Payment failed: ${
            response.error?.description || "An error occurred during payment."
          }`
        );
        setIsProcessing(false);
      });
    } catch (err) {
      console.error("Checkout process error:", err);
      let errorMessage =
        "Something went wrong during checkout. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = `Error: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      alert(errorMessage);
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (details, razorpay_signature, id) => {
    if (!id) {
      console.error("Missing checkout ID for payment success callback.");
      alert("An internal error occurred. Please contact support.");
      return;
    }

    try {
      await api.put(`/api/checkout/${id}/pay`, {
        paymentStatus: "paid",
        paymentDetails: details,
        razorpay_signature,
      });
      await handleFinalizeCheckout(id);
    } catch (error) {
      console.error("Payment Confirmation Error:", error);
      let errorMessage = "Payment confirmation failed. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = `Failed to confirm payment: ${error.response.data.message}`;
      }
      alert(errorMessage);
    }
  };

  const handleFinalizeCheckout = async (id) => {
    if (!id) {
      console.error("Missing checkout ID for finalizing order.");
      alert(
        "An internal error occurred during order finalization. Please contact support."
      );
      return;
    }
    try {
      await api.post(`/api/checkout/${id}/finalize`, {});
      dispatch(clearBuyNowProduct());
      navigate("/order-confirmation");
    } catch (error) {
      console.error("Finalize checkout error:", error);
      let errorMessage =
        "There was an issue finalizing your order. Please contact support.";
      if (error.response?.data?.message) {
        errorMessage = `Order finalization failed: ${error.response.data.message}`;
      }
      alert(errorMessage);
    }
  };

  const overallLoading =
    cartLoading || authLoading || checkoutLoading || isProcessing;
  const overallError = cartError || authError || checkoutError;

  if (cartLoading || authLoading) {
    return (
      <p className="text-center py-10 text-xl">Loading checkout details...</p>
    );
  }

  if (overallError) {
    return (
      <p className="text-center py-10 text-xl text-red-600">
        Error: {overallError}
      </p>
    );
  }

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <p className="text-center py-10 text-xl">
        Your cart is empty. Please add items to proceed to checkout.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      <div className="bg-[#efefef] rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6 font-medium">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4 font-medium">Contact Details</h3>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-semibold mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user ? user.email : ""}
              className="w-full p-2 border border-gray-300 rounded bg-gray-200 cursor-not-allowed"
              disabled
            />
          </div>
          {/* Address fields */}
          {/* Same as before... */}
          <h3 className="text-lg mb-4 font-medium">Delivery Address</h3>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-gray-700 text-sm font-semibold mb-1"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    firstName: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {addressErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-gray-700 text-sm font-semibold mb-1"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    lastName: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {addressErrors.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-gray-700 text-sm font-semibold mb-1"
            >
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  address: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {addressErrors.address && (
              <p className="text-red-500 text-xs mt-1">
                {addressErrors.address}
              </p>
            )}
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-gray-700 text-sm font-semibold mb-1"
              >
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {addressErrors.city}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="postalCode"
                className="block text-gray-700 text-sm font-semibold mb-1"
              >
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    postalCode: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {addressErrors.postalCode && (
                <p className="text-red-500 text-xs mt-1">
                  {addressErrors.postalCode}
                </p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-gray-700 text-sm font-semibold mb-1"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="country"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  country: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {addressErrors.country && (
              <p className="text-red-500 text-xs mt-1">
                {addressErrors.country}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 text-sm font-semibold mb-1"
            >
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress({
                  ...shippingAddress,
                  phone: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {addressErrors.phone && (
              <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>
            )}
          </div>
          {/* Add Payment Method Selection */}
          <h3 className="text-lg mb-4 font-medium">Payment Method</h3>
          <div className="mb-6">
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                name="paymentMethod"
                value="Razorpay"
                checked={selectedPaymentMethod === "Razorpay"}
                onChange={() => setSelectedPaymentMethod("Razorpay")}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">
                Online Payment (Razorpay)
              </span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={selectedPaymentMethod === "COD"}
                onChange={() => setSelectedPaymentMethod("COD")}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-gray-700">Cash on Delivery (COD)</span>
            </label>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              disabled={cartLoading || authLoading}
            >Continue to Payment
            </button>
          </div>
        </form>
      </div>

      {/* Order Summary remains unchanged */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-2xl uppercase mb-6 font-medium">Order Summary</h3>
        <div className="border-t border-b border-gray-300 py-4 mb-4">
          {cart.products.map((product, index) => (
            <div
              key={product._id || index}
              className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center">
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-24 h-28 object-cover rounded-md mr-4 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Quantity: {product.quantity}
                  </p>
                  <p className="text-gray-600 text-sm">Size: {product.size}</p>
                  <p className="text-gray-600 text-sm">
                    Color: {product.color}
                  </p>
                </div>
              </div>
              <p className="text-xl font-semibold text-gray-800">
                $
                {(product.price * product.quantity)?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-3">
          <p className="text-gray-700">Subtotal</p>
          <p className="font-medium text-gray-800">
            Rs. {cart.totalPrice?.toFixed(2)}
          </p>
        </div>
        <div className="flex justify-between items-center text-lg mb-6">
          <p className="text-gray-700">Shipping</p>
          <p className="font-medium text-gray-800">Free</p>
        </div>
        <div className="flex justify-between items-center text-2xl font-bold mt-4 border-t pt-4 border-gray-300">
          <p className="text-gray-900">Total</p>
          <p className="text-gray-900">Rs. {cart.totalPrice?.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;
