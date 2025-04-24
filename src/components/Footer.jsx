import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#124CA0] text-white py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        © {new Date().getFullYear()} BlueBox Storage. All rights reserved.
      </div>
    </footer>
  );
}