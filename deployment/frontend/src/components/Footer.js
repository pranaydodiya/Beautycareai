import React from "react";
import { BsInstagram, BsTwitter, BsFacebook, BsYoutube } from "react-icons/bs";
import { BiCopyright } from "react-icons/bi";
import { useLocation, useParams } from "react-router-dom";

const Footer = () => {
  const { pathname } = useLocation();
  return (
    <footer className="bg-[#0f172a] text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 grid-cols-1 gap-8">
        <div>
          <h3 className="text-2xl font-bold">MetizCare</h3>
          <p className="text-sm text-gray-300 mt-3">
            Premium beauty and personal care products curated for you.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li>Home</li>
            <li>Shop</li>
            <li>Products</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Follow Us</h4>
          <div className="flex mt-2">
            <BsInstagram className="mr-4 text-2xl" />
            <BsTwitter className="mr-4 text-2xl" />
            <BsFacebook className="mr-4 text-2xl" />
            <BsYoutube className="mr-4 text-2xl" />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="text-center text-gray-300 text-sm py-4">
          © {new Date().getFullYear()} MetizCare. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
