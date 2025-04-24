import React from "react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-4">
      <div className="max-w-md mx-auto flex flex-col items-center text-center">
        {/* Logo */}
        <a href="https://www.storebluebox.com">
          <img
            src="/images/logo.png"
            alt="BlueBox Logo"
            className="h-10 mb-2"
          />
        </a>

        {/* Title */}
        <h1 className="text-xl font-bold text-[#124CA0]">Reserve Online</h1>

        {/* Back Link */}
        <a
          href="https://www.storebluebox.com"
          className="text-sm text-[#124CA0] mt-2 underline"
        >
          ← Back to StoreBlueBox.com
        </a>
      </div>
    </header>
  );
}
