import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

function PaymentForm({ amountDue = 0, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://frightening-print-production.up.railway.app/create-setup-intent", {
        method: "POST",
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        alert("❌ Error saving card: " + result.error.message);
      } else {
        alert("✅ Card saved successfully!");
        onSuccess?.(result.setupIntent.payment_method);
      }
    } catch (err) {
      alert("Something went wrong saving your card.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6 p-3 border rounded">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a202c",
                fontFamily: "inherit",
                "::placeholder": {
                  color: "#a0aec0",
                },
              },
              invalid: {
                color: "#e53e3e",
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#F57E20] text-white px-4 py-3 rounded text-lg"
      >
        {loading ? "Saving..." : `Pay $${amountDue} to Reserve`}
      </button>
    </form>
  );
}

export default PaymentForm;