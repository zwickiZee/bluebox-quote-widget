import React from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  getDetails,
} from "use-places-autocomplete";

export default function AddressAutocomplete({ label, form, updateForm, onAddressSelect }) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);

      // Extract address components
      const components = results[0].address_components;
      const get = (type) =>
        components.find((c) => c.types.includes(type))?.long_name || "";

      const streetNumber = get("street_number");
      const route = get("route");
      const fullStreet = `${streetNumber} ${route}`.trim();

      const addressData = {
        fullAddress: description,
        street: fullStreet,
        city: get("locality"),
        state: get("administrative_area_level_1"),
        postalCode: get("postal_code"),
        country: get("country"),
        lat,
        lng,
      };

      if (onAddressSelect) onAddressSelect(addressData);
    } catch (error) {
      console.error("Error parsing address:", error);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <h2 className="text-xl font-bold text-[#124CA0] mb-2">{label}</h2>
      )}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Enter full address"
        className="w-full px-3 py-2 border border-gray-300 rounded"
      />
      {status === "OK" && (
        <ul className="bg-white border mt-1 rounded shadow max-h-64 overflow-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(description)}
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}