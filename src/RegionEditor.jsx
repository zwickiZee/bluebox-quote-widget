import { useState, useEffect } from "react";

const initialRegions = {
  Boise: {
    zipCodes: ["83701", "83702", "83703"],
    prices: { "16' BlueBox": 209, "12' BlueBox": 179, "8' BlueBox": 149 },
    availability: { "16' BlueBox": true, "12' BlueBox": true, "8' BlueBox": true },
    fees: { delivery: 99, pickup: 89, move: 129 },
  },
  Salem: {
    zipCodes: ["97301", "97302", "97303"],
    prices: { "16' BlueBox": 219, "12' BlueBox": 189, "8' BlueBox": 159 },
    availability: { "16' BlueBox": true, "12' BlueBox": true, "8' BlueBox": true },
    fees: { delivery: 99, pickup: 89, move: 129 },
  },
};

export default function RegionEditor() {
    const [regions, setRegions] = useState({});
  const [selected, setSelected] = useState("Boise");
  const [newRegionName, setNewRegionName] = useState("");
  const [activeTab, setActiveTab] = useState("regions");

  const updateRegion = (field, value) => {
    setRegions(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    fetch("https://frightening-print-production.up.railway.app/regions")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched region data:", data);
        setRegions(data); // this is all you need now
      })
      .catch((err) => {
        console.error("❌ Failed to load region data:", err);
      });
  }, []);
  

  const [promos, setPromos] = useState([]);
const [newPromo, setNewPromo] = useState({ code: "", type: "percent", amount: 0, active: true });

useEffect(() => {
  fetch("https://frightening-print-production.up.railway.app/promos")
    .then(res => res.json())
    .then(data => {
      console.log("✅ Fetched promos:", data);
      // If backend returns an array, just set it
      setPromos(data);
    })
    .catch(err => {
      console.error("❌ Failed to load promos:", err);
    });
}, []);

  const updateNested = (key, nestedKey, value) => {
    setRegions(prev => ({
      ...prev,
      [selected]: {
        ...prev[selected],
        [key]: {
          ...prev[selected][key],
          [nestedKey]: value,
        }
      }
    }));
  };

  const addRegion = () => {
    if (!newRegionName.trim()) return;
    if (regions[newRegionName]) return alert("Region already exists.");
    const newData = {
      ...regions,
      [newRegionName]: {
        zipCodes: [],
        prices: { "16' BlueBox": 0, "12' BlueBox": 0, "8' BlueBox": 0 },
        availability: { "16' BlueBox": true, "12' BlueBox": true, "8' BlueBox": true },
        fees: { delivery: 0, pickup: 0, move: 0 },
      }
    };
    setRegions(newData);
    setSelected(newRegionName);
    setNewRegionName("");
  };

  const deleteRegion = (name) => {
    if (!window.confirm(`Delete region ${name}?`)) return;
    setRegions(prev => {
      const newRegions = { ...prev };
      delete newRegions[name];
      return newRegions;
    });
    const remaining = Object.keys(regions).filter(r => r !== name);
    setSelected(remaining[0] || "");
  };

  if (Object.keys(regions).length === 0) {
    return <div className="p-6 text-gray-600">Loading region data...</div>;
  }
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setActiveTab("regions")}
        className={`px-4 py-2 rounded ${activeTab === "regions" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        Edit Regions
      </button>
      <button
        onClick={() => setActiveTab("promos")}
        className={`px-4 py-2 rounded ${activeTab === "promos" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        Edit Promo Codes
      </button>
      <button
        onClick={() => setActiveTab("leads")}
        className={`px-4 py-2 rounded ${activeTab === "leads" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
      >
        View Leads
      </button>
    </div>
    {activeTab === "regions" && (
        <><div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">BlueBox Region Manager</h1>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {Object.keys(regions).map(name => (
                <button
                  key={name}
                  className={`px-4 py-2 rounded-full border ${selected === name ? "bg-blue-600 text-white" : "bg-white border-gray-300"}`}
                  onClick={() => setSelected(name)}
                >
                  {name}
                </button>
              ))}
              <input
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                placeholder="New Region"
                className="p-2 border rounded" />
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={addRegion}>Add</button>
            </div>

            {selected && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Editing: {selected}</h2>
                  <button className="text-red-600 text-sm" onClick={() => deleteRegion(selected)}>Delete Region</button>
                </div>

                <div>
                  <label className="block font-medium mb-1">Zip Codes (comma-separated)</label>
                  <input
                    className="w-full border p-2 rounded"
                    value={regions[selected].zipCodes.join(", ")}
                    onChange={(e) => updateRegion("zipCodes", e.target.value.split(",").map(z => z.trim()))} />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Pricing & Fees Comparison</h3>
                  <div className="overflow-auto">
                    <table className="min-w-full table-auto border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">Region</th>
                          <th className="p-2 border">16' BlueBox</th>
                          <th className="p-2 border">12' BlueBox</th>
                          <th className="p-2 border">8' BlueBox</th>
                          <th className="p-2 border">Delivery Fee</th>
                          <th className="p-2 border">Pickup Fee</th>
                          <th className="p-2 border">Move Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border font-medium">{selected}</td>
                          {["16' BlueBox", "12' BlueBox", "8' BlueBox"].map(size => (
                            <td className="p-2 border" key={size}>
                              <div className="flex items-center gap-2">
                                <input type="number" className="w-20 p-1 border rounded" value={regions[selected].prices[size]} onChange={e => updateNested("prices", size, parseInt(e.target.value))} />
                                <label className="text-xs">
                                  <input
                                    type="checkbox"
                                    className="mr-1"
                                    checked={regions[selected].availability[size]}
                                    onChange={e => updateNested("availability", size, e.target.checked)} />
                                  Available
                                </label>
                              </div>
                            </td>
                          ))}
                          <td className="p-2 border">
                            <input type="number" className="w-20 p-1 border rounded" value={regions[selected].fees.delivery} onChange={e => updateNested("fees", "delivery", parseInt(e.target.value))} />
                          </td>
                          <td className="p-2 border">
                            <input type="number" className="w-20 p-1 border rounded" value={regions[selected].fees.pickup} onChange={e => updateNested("fees", "pickup", parseInt(e.target.value))} />
                          </td>
                          <td className="p-2 border">
                            <input type="number" className="w-20 p-1 border rounded" value={regions[selected].fees.move} onChange={e => updateNested("fees", "move", parseInt(e.target.value))} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div><div className="bg-white p-6 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">All Region Data</h2>
              <table className="min-w-full table-auto border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Region</th>
                    <th className="p-2 border">Zip Codes</th>
                    <th className="p-2 border">16'</th>
                    <th className="p-2 border">12'</th>
                    <th className="p-2 border">8'</th>
                    <th className="p-2 border">Delivery</th>
                    <th className="p-2 border">Pickup</th>
                    <th className="p-2 border">Move</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(regions).map(([region, data]) => (
                    <tr key={region}>
                      <td className="p-2 border font-medium">{region}</td>
                      <td className="p-2 border">{data.zipCodes.join(", ")}</td>
                      <td className="p-2 border">{data.availability["16' BlueBox"] ? "$" + data.prices["16' BlueBox"] : "N/A"}</td>
                      <td className="p-2 border">{data.availability["12' BlueBox"] ? "$" + data.prices["12' BlueBox"] : "N/A"}</td>
                      <td className="p-2 border">{data.availability["8' BlueBox"] ? "$" + data.prices["8' BlueBox"] : "N/A"}</td>
                      <td className="p-2 border">${data.fees.delivery}</td>
                      <td className="p-2 border">${data.fees.pickup}</td>
                      <td className="p-2 border">${data.fees.move}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></>

        )}

        {activeTab === "promos" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Promo Code Manager</h2>

          <div className="flex gap-4 mb-4 flex-wrap items-center">
            <input
              value={newPromo.code}
              onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
              placeholder="Promo Code"
              className="p-2 border rounded" />
            <select
              value={newPromo.type}
              onChange={e => setNewPromo({ ...newPromo, type: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="percent">% Off</option>
              <option value="flat">$ Off</option>
            </select>
            <input
              type="number"
              value={newPromo.amount}
              onChange={e => setNewPromo({ ...newPromo, amount: parseFloat(e.target.value) })}
              className="p-2 border rounded w-28"
              placeholder="Amount" />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newPromo.active}
                onChange={e => setNewPromo({ ...newPromo, active: e.target.checked })} />
              Active
            </label>
            <button
              onClick={() => {
                if (!newPromo.code || !newPromo.amount) return alert("Missing fields");
                setPromos(prev => [...prev, newPromo]);
                setNewPromo({ code: "", type: "percent", amount: 0, active: true });
              } }
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Promo
            </button>
          </div>

          {promos.length > 0 && (
            <table className="min-w-full table-auto border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Code</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Active</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo, index) => (
                  <tr key={promo.code}>
                    <td className="p-2 border">{promo.code}</td>
                    <td className="p-2 border">{promo.type}</td>
                    <td className="p-2 border">{promo.amount}</td>
                    <td className="p-2 border">{promo.active ? "✅" : "❌"}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => setPromos(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        )}
                <div className="flex justify-end">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              Promise.all([
                fetch("https://frightening-print-production.up.railway.app/regions", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(regions),
                }),
                fetch("https://frightening-print-production.up.railway.app/promos", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(promos),
                }),
              ])
                .then(() => alert("✅ Changes saved!"))
                .catch(err => alert("❌ Failed to save: " + err.message));
            } }
          >
            Save Changes
          </button>
        </div>
      </div>
      
  );
}
