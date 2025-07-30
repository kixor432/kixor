import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import ProductGrid from "./ProductGrid";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductDetails,
  fetchSimilarProducts,
} from "../../redux/slice/productsSlice";
import { addToCart } from "../../redux/slice/cartSlice";
import { setBuyNowProduct } from "../../redux/slice/buyNowSlice";

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedProduct, loading, error, similarProducts } = useSelector(
    (state) => state.products
  );
  const { user, guestId } = useSelector((state) => state.auth);

  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const productFetchId = productId || id;

  useEffect(() => {
    if (productFetchId) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts({ id: productFetchId }));
    }
  }, [dispatch, productFetchId]);

  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    }
  }, [selectedProduct]);

  const handleQuantityChange = (action) => {
    if (action === "plus" && quantity < selectedProduct.countInStock) {
      setQuantity((prev) => prev + 1);
    }
    if (action === "minus" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart.");
      return;
    }

    if (selectedProduct.countInStock < quantity) {
      toast.error("Not enough stock available.");
      return;
    }

    setIsButtonDisabled(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        guestId,
        userId: user?._id,
      })
    )
      .then(() => {
        toast.success("Product added to cart!");
      })
      .finally(() => {
        setIsButtonDisabled(false);
      });
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color.");
      return;
    }

    if (selectedProduct.countInStock < quantity) {
      toast.error("Not enough stock available.");
      return;
    }

    dispatch(
      setBuyNowProduct({
        productId: selectedProduct._id,
        name: selectedProduct.name,
        image: selectedProduct.images[0].url,
        price: selectedProduct.price,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    );

    navigate("/checkout");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="md:p-6">
      {selectedProduct && (
        <div className="max-w-6xl mx-auto bg-[#efefef] p-6 md:p-8 rounded-lg">
          <div className="flex flex-col md:flex-row">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col space-y-4 mr-6">
              {selectedProduct.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                    mainImage === image.url ? "border-black" : "border-gray-300"
                  }`}
                  onClick={() => setMainImage(image.url)}
                />
              ))}
            </div>

            {/* Main Image */}
            <div className="md:w-1/2">
              <div className="mb-4">
                <img
                  src={mainImage}
                  alt="Main product"
                  className="w-full h-auto object-cover rounded-lg"
                />
              </div>

              {/* Mobile thumbnails */}
              <div className="md:hidden flex overscroll-x-scroll space-x-4 mb-4">
                {selectedProduct.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.altText || `Thumbnail ${index}`}
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                      mainImage === image.url
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                    onClick={() => setMainImage(image.url)}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 md:ml-10 mb-2">
              <h1 className="text-2xl md:text-3xl  mb-4">
                {selectedProduct.name}
              </h1>

              <div className="flex items-center gap-4 mb-2">
                <p className=" text-gray-500 line-through">
                  Rs.{(selectedProduct.price * 1.1).toFixed(0)}
                </p>
                <p className="text-xl  text-gray-900">
                  Rs.{selectedProduct.price}
                </p>
                <span className="text-black text-sm font-medium bg-gray-200 px-2 py-0.5 rounded">
                  10% OFF
                </span>
              </div>

              {/* <p className="text-xl text-gray-800 mb-1">
                Rs.{selectedProduct.price}
              </p> */}

              <p className="text-gray-600 mb-4">
                {selectedProduct.description}
              </p>

              {/* Color */}
              <div className="mb-4">
                <p className="text-gray-700">Color:</p>
                <div className="flex gap-2 mt-2">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === color
                          ? "border-2 border-black"
                          : "border-gray-300"
                      }`}
                      style={{
                        backgroundColor: color.toLowerCase(),
                        filter: "brightness(0.5)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-4">
                <p className="text-gray-700">Size:</p>
                <div className="flex gap-2 mt-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      onClick={() => setSelectedSize(size)}
                      key={size}
                      className={`px-4 py-2 rounded border ${
                        selectedSize === size ? "bg-black text-white" : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {/* Few items left message */}
              {selectedProduct.countInStock <= 5 &&
                selectedProduct.countInStock > 0 && (
                  <p className="text-sm text-red-600 mb-2 font-medium">
                    Few items left!
                  </p>
                )}
              {selectedProduct.countInStock == 0 && (
                <p className="text-sm text-red-600 mb-2 font-medium">
                  Out of stock
                </p>
              )}
              {/* Quantity */}
              <div className="mb-6">
                <p className="text-gray-700">Quantity:</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={() => handleQuantityChange("minus")}
                    className="px-2 py-1 bg-gray-300 rounded text-lg"
                  >
                    -
                  </button>
                  <span className="text-lg">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange("plus")}
                    className="px-2 py-1 bg-gray-300 rounded text-lg"
                    disabled={quantity >= selectedProduct.countInStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <button
                onClick={handleAddToCart}
                disabled={
                  isButtonDisabled || selectedProduct.countInStock === 0
                }
                className={`bg-black text-white hover:text-gray-200 scale-110 py-2 px-6 hover:cursor-pointer rounded w-full mb-4 ${
                  isButtonDisabled || selectedProduct.countInStock === 0
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-gray-900"
                }`}
              >
                {isButtonDisabled ? "Adding..." : "ADD TO CART"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={selectedProduct.countInStock === 0}
                className="bg-[#efefef] text-black scale-110 py-2 px-6 hover:cursor-pointer border border-black rounded hover:text-gray-700 w-full mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                BUY NOW
              </button>

              {/* Characteristics */}
              <div className="mt-10 text-gray-700">
                <h3 className="text-xl font-bold mb-4">Characteristics:</h3>
                <table className="w-full text-left text-sm text-gray-600">
                  <tbody>
                    <tr>
                      <td className="py-1">Brand</td>
                      <td className="py-1">{selectedProduct.brand}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Material</td>
                      <td className="py-1">{selectedProduct.material}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Similar Products */}
          <div className="mt-20">
            <h2 className="text-2xl text-center font-medium mb-4">
              You may also like
            </h2>
            <ProductGrid
              products={similarProducts}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
