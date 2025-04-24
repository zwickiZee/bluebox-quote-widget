import React from "react";

export default function ThankYouSection() {
  return (
    <div className="text-center">
      <img
        src="/images/Box%20logos%20PNG-19.png"
        alt="BlueBox logo"
        className="w-20 h-auto mx-auto mb-4"
      />
      <h2 className="text-2xl font-bold text-[#124CA0] mb-2">Thank you for reserving your BlueBox</h2>
      <p className="mb-6 text-gray-700">
        Our team will be reaching out shortly to confirm your delivery info.
      </p>
      <p className="mb-2 text-sm text-gray-600">
        Our business hours are <strong>Mon–Fri, 9am–5pm MST</strong>
      </p>

      <h2 className="text-2xl font-bold text-[#124CA0] mb-2">Have Questions?</h2>
      <div className="flex justify-center gap-4 mb-6">
        <a
          href="tel:+19717074830"
          className="bg-[#124CA0] hover:bg-[#0f3e86] text-white px-4 py-2 rounded text-sm"
        >
          📞 Call BlueBox
        </a>
        <a
          href="sms:+19717074830"
          className="bg-white border border-[#124CA0] text-[#124CA0] hover:bg-[#f0f5ff] px-4 py-2 rounded text-sm"
        >
          💬 Text BlueBox
        </a>
      </div>
    </div>
  );
}
