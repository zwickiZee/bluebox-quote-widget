import React from "react";

export default function PaymentForm({
  cardInfo,
  handleCardChange,
  paymentError,
  totalDueNow = 0,
  summaryText = "",
}) {
  const formatCardNumber = (val) =>
    val.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val) =>
    val.replace(/\D/g, "").replace(/(\d{2})(\d{1,2})/, "$1/$2").substring(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Reserve your BlueBox for:
        </h2>
        <div className="text-3xl font-bold text-[#124CA0]">
          ${Math.round(totalDueNow)}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          This amount is due today to secure your box.
        </p>
      </div>

      {/* Error */}
      {paymentError && (
        <p className="text-red-600 text-sm mb-2 text-center">{paymentError}</p>
      )}

      {/* Card Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          className="border p-3 rounded w-full shadow-sm"
          type="text"
          name="cardName"
          placeholder="Cardholder Name"
          value={cardInfo.cardName}
          onChange={handleCardChange}
          required
        />
        <input
          className="border p-3 rounded w-full shadow-sm"
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          value={cardInfo.cardNumber}
          onChange={(e) =>
            handleCardChange({
              target: {
                name: "cardNumber",
                value: formatCardNumber(e.target.value),
              },
            })
          }
          maxLength={19}
          inputMode="numeric"
          required
        />
        <input
          className="border p-3 rounded w-full shadow-sm"
          type="text"
          name="expiry"
          placeholder="MM/YY"
          value={cardInfo.expiry}
          onChange={(e) =>
            handleCardChange({
              target: {
                name: "expiry",
                value: formatExpiry(e.target.value),
              },
            })
          }
          maxLength={5}
          inputMode="numeric"
          required
        />
        <input
          className="border p-3 rounded w-full shadow-sm"
          type="password"
          name="cvv"
          placeholder="CVV"
          value={cardInfo.cvv}
          onChange={handleCardChange}
          maxLength={4}
          inputMode="numeric"
          required
        />
      </div>

      <input
        className="border p-3 rounded w-full mt-4 shadow-sm"
        type="text"
        name="zip"
        placeholder="Billing ZIP Code"
        value={cardInfo.zip}
        onChange={handleCardChange}
        maxLength={10}
        inputMode="numeric"
        required
      />

      {/* Consent */}
      <div className="bg-blue-50 rounded p-4 border border-blue-200 mt-4">
        <label className="flex items-start gap-2 text-sm text-blue-900">
          <input type="checkbox" required className="mt-1 accent-[#124CA0]" />
          <span>
            I authorize BlueBox to securely store and charge this card for billing purposes.
          </span>
        </label>
      </div>
    </div>
  );
}