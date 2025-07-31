import React from "react";
import { TbBrandMeta } from "react-icons/tb";
import { IoLogoInstagram } from "react-icons/io";
import { FiPhoneCall } from "react-icons/fi";

import { FaWhatsapp } from "react-icons/fa";

import { RiTwitterXLine } from "react-icons/ri";

const Topbar = () => {
  return (
    <div className="bg-black text-gray-200 rubik">
      <div className="container mx-auto flex justify-between items-center py-3">
        <div className="hidden md:flex items-center space-x-4 ml-5">
          <a
            href="https://www.facebook.com/share/16evPnzdNs/?mibextid=wwXIfr"
            target="blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600"
          >
            <TbBrandMeta className="h-5 w-5" />
          </a>
          <a
                        href="https://www.instagram.com/kixorcorner?igsh=MXdoMnd0N21hM2E2eg%3D%3D&utm_source=qr "
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
        <div className="text-sm text-center flex-grow">
          <span>WE SHIP PAN INDIA- FAST AND RELIABLE DELIVERY!</span>
        </div>
        <div className="text-sm hidden md:block mr-5">
         <a href="tel:7976597238" className="hover:text-gray-600">
                     <FiPhoneCall className="inline-block mr-2" />
                     7976597238
                   </a>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
