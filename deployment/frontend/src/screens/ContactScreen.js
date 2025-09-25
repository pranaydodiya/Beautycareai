import React from "react";

const ContactScreen = () => {
  return (
    <div className="mt-[80px] lg:px-24 md:px-12 px-6">
      <h1 className="text-3xl font-bold">Contact MetizCare</h1>
      <p className="text-gray-600 mt-2">We’d love to hear from you. Send us a message and we’ll respond within 24 hours.</p>

      <div className="grid md:grid-cols-2 grid-cols-1 gap-8 mt-8">
        <form className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input className="w-full border rounded-md px-3 py-2 outline-none" placeholder="Your name" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded-md px-3 py-2 outline-none" placeholder="you@example.com" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea rows={5} className="w-full border rounded-md px-3 py-2 outline-none resize-none" placeholder="How can we help?" />
          </div>
          <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md">Send Message</button>
        </form>

        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg">Support</h3>
            <p className="text-gray-600">support@metizcare.com</p>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg">Phone</h3>
            <p className="text-gray-600">+91 98765 43210</p>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg">Address</h3>
            <p className="text-gray-600">MetizCare HQ, Bengaluru, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactScreen;


