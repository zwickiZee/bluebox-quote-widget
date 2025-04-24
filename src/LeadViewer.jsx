import React, { useEffect, useState } from "react";

export default function LeadViewer() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch("https://frightening-print-production.up.railway.app/api/leads")
      .then(res => res.json())
      .then(setLeads)
      .catch(err => console.error("❌ Failed to load leads:", err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-[#124CA0]">Saved Leads</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm border border-gray-300">
          <thead className="bg-[#124CA0] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Zip</th>
              <th className="px-4 py-2 text-left">Region</th>
              <th className="px-4 py-2 text-left">Promo</th>
              <th className="px-4 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t">
                <td className="px-4 py-2">{lead.name}</td>
                <td className="px-4 py-2">{lead.email}</td>
                <td className="px-4 py-2">{lead.phone}</td>
                <td className="px-4 py-2">{lead.zip}</td>
                <td className="px-4 py-2">{lead.region}</td>
                <td className="px-4 py-2">{lead.promo_code}</td>
                <td className="px-4 py-2">{new Date(lead.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
