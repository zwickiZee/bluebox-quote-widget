import React from "react";

export default function PricingSummary({
  form,
  containerOptions,
  totalBoxesSelected,
  deliveryRatePerBox,
  pickupRatePerBox,
  moveRatePerBox,
  facilityStorageFee,
  discountedTotal,
  futureMove,
  futurePickup,
  futureTotal,
  activePromo
}) {
  const hasDiscount = activePromo && activePromo.amount && activePromo.type;
  const isPercent = activePromo?.type === "percent";

  const applyDiscount = (base) => {
    if (!hasDiscount) return base;
    return isPercent
      ? Math.round(base * (1 - activePromo.amount / 100))
      : Math.round(base - activePromo.amount);
  };

  return (
    <div className="bg-gray-100 rounded p-4 mb-6">
      <h2 className="text-lg font-semibold text-[#124CA0] mb-2">Due to Reserve</h2>

      {/* Monthly Rent Per Box */}
      {Object.entries(form.quantities || {}).flatMap(([size, qty]) => {
        if (qty <= 0) return [];

        const pricePerBox = containerOptions.find(c => c.size === size)?.price || 0;

        return Array.from({ length: qty }).map((_, i) => {
          const discounted = applyDiscount(pricePerBox);
          return (
            <p key={`${size}-${i}`} className="font-proxima text-[#333]">
              {size} BlueBox Monthly Rent:{" "}
              {hasDiscount ? (
                <>
                  <span className="line-through text-gray-500">${Math.round(pricePerBox)}</span>
                  <span className="text-green-600 ml-2">${discounted}</span>
                </>
              ) : (
                <>${discounted}</>
              )}
            </p>
          );
        });
      })}

      {/* Delivery Fee Per Box */}
      {Array.from({ length: totalBoxesSelected }).map((_, i) => {
        const base = deliveryRatePerBox;
        const discounted = applyDiscount(base);
        return (
          <p key={`delivery-${i}`} className="font-proxima text-[#333]">
            Delivery Fee:{" "}
            {hasDiscount ? (
              <>
                <span className="line-through text-gray-500">${base}</span>
                <span className="text-green-600 ml-2">${discounted}</span>
              </>
            ) : (
              <>${base}</>
            )}
          </p>
        );
      })}

      {/* Facility Storage Fee */}
      {facilityStorageFee > 0 && (
        <p className="font-proxima text-[#333]">
          Facility Storage Fee: ${facilityStorageFee}
        </p>
      )}

      {/* Total Due Now */}
      <p className="text-lg text-[#124CA0] font-objektiv font-bold mt-2">
        Total Due Now: ${Math.round(discountedTotal)}
      </p>

      {activePromo && (
        <p className="text-sm text-green-600">Promo "{activePromo.code}" applied</p>
      )}

      <hr className="my-4" />

      <h2 className="text-lg font-semibold text-[#124CA0] mb-2">Future Charges</h2>

      {/* Final Pickup Charges Per Box */}
      {Array.from({ length: totalBoxesSelected }).map((_, i) => {
        const base = pickupRatePerBox;
        const discounted = applyDiscount(base);
        return (
          <p key={`pickup-${i}`} className="font-proxima text-[#333]">
            Final Pickup Charge:{" "}
            {hasDiscount ? (
              <>
                <span className="line-through text-gray-500">${base}</span>
                <span className="text-green-600 ml-2">${discounted}</span>
              </>
            ) : (
              <>${base}</>
            )}
          </p>
        );
      })}

      {/* Move Charges Per Box (If Moving/Both) */}
      {(form.useType === "Moving" || form.useType === "Both") &&
        Array.from({ length: totalBoxesSelected }).map((_, i) => {
          const base = moveRatePerBox;
          const discounted = applyDiscount(base);
          return (
            <p key={`move-${i}`} className="font-proxima text-[#333]">
              Move Charge:{" "}
              {hasDiscount ? (
                <>
                  <span className="line-through text-gray-500">${base}</span>
                  <span className="text-green-600 ml-2">${discounted}</span>
                </>
              ) : (
                <>${base}</>
              )}
            </p>
          );
        })}

      {/* Total Future Charges */}
      <p className="text-lg text-[#124CA0] font-objektiv font-bold mt-2">
        Total Future Charges: $
        {Math.round(
          Array.from({ length: totalBoxesSelected }).reduce((sum, _, i) => {
            const pickup = applyDiscount(pickupRatePerBox);
            const move = (form.useType === "Moving" || form.useType === "Both") ? applyDiscount(moveRatePerBox) : 0;
            return sum + pickup + move;
          }, 0)
        )}
      </p>
    </div>
  );
}