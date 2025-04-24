export default function DeliveryInfoSection({ form, updateForm, errors }) {
  return (
    <>
      <h2 className="text-xl font-bold mt-6 mb-2">Where Should We Deliver Your BlueBox?</h2>
      <input
        className="w-full mb-2 p-3 border rounded"
        placeholder="Street Address"
        value={form.street}
        onChange={(e) => updateForm("street", e.target.value)}
      />
      {errors?.street && <p className="text-sm text-red-600 mb-2">{errors.street}</p>}
      <input
        className="w-full mb-2 p-3 border rounded"
        placeholder="City"
        value={form.city}
        onChange={(e) => updateForm("city", e.target.value)}
      />
      {errors?.city && <p className="text-sm text-red-600 mb-2">{errors.city}</p>}
      <input
        className="w-full mb-2 p-3 border rounded"
        placeholder="State (e.g. OR, WA)"
        value={form.state}
        onChange={(e) => updateForm("state", e.target.value)}
      />
      {errors?.state && <p className="text-sm text-red-600 mb-2">{errors.state}</p>}
      <input
        className="w-full mb-2 p-3 border rounded"
        placeholder="ZIP Code"
        value={form.deliveryZip}
        onChange={(e) => updateForm("deliveryZip", e.target.value)}
      />
      {errors?.deliveryZip && <p className="text-sm text-red-600 mb-2">{errors.deliveryZip}</p>}
      <textarea
        className="w-full mb-2 p-3 border rounded"
        placeholder="Delivery Notes (e.g. gate codes, special instructions)"
        value={form.placementNotes}
        onChange={(e) => updateForm("placementNotes", e.target.value)}
      />
      {errors?.placementNotes && <p className="text-sm text-red-600 mb-2">{errors.placementNotes}</p>}
    </>
  );
}