import React, { useState } from "react";
import { IoLogoInstagram } from "react-icons/io";
import { TbBrandMeta } from "react-icons/tb";
import { FiPhoneCall } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from 'sonner';
import "react-toastify/dist/ReactToastify.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/subscribe`,
        { email }
      );

      if (res.status === 201) {
        toast.success("Successfully subscribed!", { autoClose: 3000 });
        setEmail(""); // Clear input after success
      }
    } catch (err) {
      console.error(err);
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="border-t py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 lg:px-24">
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Newsletter</h3>
          <p className="text-gray-500 mb-4">
            Be the first to hear about new products, exclusive events, and
            online offers.
          </p>
          <p className="font-medium text-sm text-gray-600 mb-6">
            Sign up & get 10% off on your first order.
          </p>
          {/* newsletter form */}
          <form className="flex" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 w-full text-sm border-t border-l border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Shop links */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Shop</h3>
          <ul className="space-y-2 text-gray-600">
            <li>
              <Link to="/collections/all" className="hover:text-gray-500 transition-colors">
                TSHIRTS
              </Link>
            </li>
            <li>
              <Link to="/collections/all" className="hover:text-gray-500 transition-colors">
                POLOS
              </Link>
            </li>
            <li>
              <Link to="/collections/all" className="hover:text-gray-500 transition-colors">
                SHIRTS
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-lg text-gray-800 mb-4">Follow Us</h3>
          <div className="flex items-center space-x-4 mb-6">
            <a
              href="https://www.facebook.com/share/16evPnzdNs/?mibextid=wwXIfr"
              target="blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              <TbBrandMeta className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/kixorcorner?igsh=MXdoMnd0N21hM2E2eg%3D%3D&utm_source=qr"
              target="blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              <IoLogoInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://wa.me/917976597238?text=Hi%20there"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              <FaWhatsapp className="h-5 w-5" />
            </a>
          </div>
          <p className="text-gray-600">Call us</p>
          <a href="tel:7976597238" className="hover:text-gray-600">
            <FiPhoneCall className="inline-block mr-2" />
            7976597238
          </a>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="container mx-auto mt-12 px-4 border-t border-gray-200 pt-6 text-center text-sm text-gray-600 font-light">
        <p className="text-[13px] tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium">Kixor</span>. All rights reserved.
          <span className="mx-2">|</span>
          <a
            href="#"
            className="hover:text-gray-800 transition-colors"
          >
            Privacy Policy
          </a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-gray-800 transition-colors">
            Terms of Service
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
