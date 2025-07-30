import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminProductPage = () => {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sku, setSku] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [collections, setCollections] = useState("");
  const [rating, setRating] = useState(0);
  const [gender, setGender] = useState("");

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) {
      toast.error("Please select image files.");
      return;
    }

    setUploading(true);
    const uploadedImages = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        uploadedImages.push({ url: data.imageUrl, altText: `${name} image` });
      }

      setImages((prev) => [...prev, ...uploadedImages]);
      toast.success("All images uploaded!");
    } catch (error) {
      toast.error("Some image(s) failed to upload");
      console.error("Image upload error:", error.response?.data || error.message);
    }

    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("userToken");

    if (
      !name ||
      !description ||
      !price ||
      !countInStock ||
      !sku ||
      !category ||
      !sizes ||
      !colors ||
      !collections ||
      images.length === 0 ||
      rating === null
    ) {
      toast.error("Please fill in all required product fields, including images.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        {
          name,
          brand,
          price: Number(price),
          category,
          countInStock: Number(countInStock),
          description,
          sku,
          sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
          colors: colors.split(",").map((c) => c.trim()).filter(Boolean),
          collections,
          images,
          rating: Number(rating),
          gender: gender || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Product added successfully!");
      setName("");
      setBrand("");
      setPrice("");
      setCategory("");
      setCountInStock("");
      setDescription("");
      setImages([]);
      setSku("");
      setSizes("");
      setColors("");
      setCollections("");
      setRating(0);
      setGender("");
    } catch (error) {
      toast.error("Failed to add product");
      console.error("Error adding product:", error.response?.data || error.message);
      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((err) => {
          toast.error(err.message);
        });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-[#efefef]">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic product inputs */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-4">
          <label htmlFor="brand" className="block text-gray-700 font-semibold mb-2">Brand</label>
          <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" />
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
            Product Price <span className="text-red-500">*</span>
          </label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-4">
          <label htmlFor="countInStock" className="block text-gray-700 font-semibold mb-2">
            Count In Stock <span className="text-red-500">*</span>
          </label>
          <input type="number" id="countInStock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" rows={4} required />
        </div>

        <div className="mb-4">
          <label htmlFor="sku" className="block text-gray-700 font-semibold mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <input type="text" id="sku" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-4">
          <label htmlFor="sizes" className="block text-gray-700 font-semibold mb-2">
            Sizes <span className="text-red-500">*</span>
          </label>
          <input type="text" id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" placeholder="e.g., S, M, L, XL" required />
        </div>

        <div className="mb-4">
          <label htmlFor="colors" className="block text-gray-700 font-semibold mb-2">
            Colors <span className="text-red-500">*</span>
          </label>
          <input type="text" id="colors" value={colors} onChange={(e) => setColors(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" placeholder="e.g., Red, Blue, Black" required />
        </div>

        <div className="mb-4">
          <label htmlFor="collections" className="block text-gray-700 font-semibold mb-2">
            Collections <span className="text-red-500">*</span>
          </label>
          <input type="text" id="collections" value={collections} onChange={(e) => setCollections(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-700 font-semibold mb-2">
            Rating (0-5) <span className="text-red-500">*</span>
          </label>
          <input type="number" id="rating" value={rating} onChange={(e) => setRating(e.target.value)} step="0.1" min="0" max="5" className="w-full border border-gray-300 rounded-md p-3" required />
        </div>

        <div className="mb-6">
          <label htmlFor="gender" className="block text-gray-700 font-semibold mb-2">Gender</label>
          <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-300 rounded-md p-3">
            <option value="">Select Gender</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        {/* Multiple Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Product Images <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <p className="mt-2 text-blue-600">Uploading image(s)...</p>}
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {images.map((img, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img src={img.url} alt={img.altText} className="w-20 h-20 object-cover rounded-md" />
                  <p className="text-xs text-gray-600 mt-1">{img.url.substring(0, 30)}...</p>
                </div>
              ))}
            </div>
          )}
          {!images.length && !uploading && (
            <p className="mt-2 text-red-500">Please upload at least one image.</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading || images.length === 0}
        >
          {uploading ? "Uploading Image..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductPage;
