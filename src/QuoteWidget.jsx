import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegionEditor from './RegionEditor';
import AddressAutocomplete from "@/components/AddressAutocomplete";
import ThankYouSection from "./components/ThankYouSection";
import StickyFooterNav from "./components/StickyFooterNav";
import PricingSummary from "./components/PricingSummary";
import PaymentForm from "./components/PaymentForm";

import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<RegionEditor />} />
        {/* your other routes */}
      </Routes>
    </Router>
  );
}

const initialContainerOptions = [
  {
    size: "Large (8x16')",
    image: "/images/large.webp",
    price: 229,
    available: true,
    popular: true,
    sqft: "1,200 - 1,400 sq. ft.",
    details: [
      "Perfect for a 1,400 sq. ft. space* or smaller",
      "Ideal for moves requiring temporary storage",
      "Fits 3–4 rooms of furniture",
      "Comparable to a 20’ truck or 10x15’ storage unit",
    ]
  },
  {
    size: "Medium (8x12')",
    image: "/images/medium.webp",
    price: 219,
    available: true,
    sqft: "800 - 1,200 sq. ft.",
    details: [
      "Good for a 2–3 bedroom apartment",
      "Fits 2–3 rooms of furniture",
      "Comparable to a 15’ truck or 10x10’ storage unit",
    ]
  },
  {
    size: "Small (8x8')",
    image: "/images/small.webp",
    price: 209,
    available: true,
    sqft: "400 - 800 sq. ft.",
    details: [
      "Perfect for a dorm, studio, or 1-bedroom",
      "Fits 1–2 rooms of furniture",
      "Comparable to a 10’ truck or 5x10’ storage unit",
    ]
  },
];

const useOptions = ["Moving", "Storage", "Both"];

export default function QuoteWidget() {
  const [showPromo, setShowPromo] = useState(false); 
  const [activePromo, setActivePromo] = useState(null); 
  const [leadId, setLeadId] = useState(null);
  const [regionData, setRegionData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const scrollAnchorRef = useRef(null);
  const [quoteId, setQuoteId] = useState(null);
  const [errors, setErrors] = useState({});
  const [step2Error, setStep2Error] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zip: "",
    containerSize: "Large (8x16')",
    quantities: {
      "Large (8x16')": 1,
      "Medium (8x12')": 0,
      "Small (8x8')": 0,
    },
    useType: "Storage",
    storageLocation: null,
    movingZip: "",
    deliveryDate: "",
    placementNotes: "",
    deliveryAddress: "",
    fullAddress: "",        // ← used for delivery
    moveFullAddress: "",
    moveAddress: "",
    wantsCall: false,
    promoCode: "",
    consentToContact: false,
    street: "",
    city: "",
    state: "",
    deliveryZip: "",  
    moveStreet: "",
    moveCity: "",
    moveState: "",
    moveZip: "",

  });

  const [cardInfo, setCardInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    zip: ''
  });

  useEffect(() => {
    const postHeight = () => {
      window.parent.postMessage({
        type: "resize",
        height: document.documentElement.scrollHeight
      }, "*");
    };
  
    postHeight(); // Initial post
    const observer = new ResizeObserver(postHeight);
    observer.observe(document.body);
  
    return () => observer.disconnect();
  }, []);

  function formatPhoneNumber(value) {
    const digits = value.replace(/\D/g, "").slice(0, 10); // remove non-digits, limit to 10
    const parts = [];
  
    if (digits.length > 0) parts.push("(" + digits.slice(0, 3));
    if (digits.length >= 4) parts.push(") " + digits.slice(3, 6));
    if (digits.length >= 7) parts.push("-" + digits.slice(6, 10));
  
    return parts.join("").replace(/\(\)/g, "");
  }
  
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  const submitStep1 = async () => {
    console.log("🔁 submitStep1 triggered");
    let newId = quoteId;
    const zipRegex = /^\d{5}$/;
    const newErrors = {};
    setIsLoading(true);
  
    // Required fields
    if (!form.name) newErrors.name = "Please enter your name.";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Please enter a valid email address.";
  
    const phoneRegex = /^(\+?1\s?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
    if (!form.phone || !phoneRegex.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }
  
    if (!zipRegex.test(form.zip)) {
      newErrors.zip = "Please enter a valid 5-digit ZIP code.";
    }
  
    if (!form.deliveryDate) newErrors.deliveryDate = "Please select a delivery date.";
    if (!form.consentToContact) {
      newErrors.consentToContact = "Please check this box to receive your quote.";
    }
  
    // Moving ZIP check
    if ((form.useType === "Moving" || form.useType === "Both") && !zipRegex.test(form.movingZip)) {
      newErrors.movingZip = "Please enter a valid 5-digit moving ZIP code.";
    }
  
    const deliveryRegion = detectRegionByZip(form.zip);
    const movingRegion = detectRegionByZip(form.movingZip);
  
    if (!deliveryRegion) {
      newErrors.zip = "We don’t currently service this zip code. Please check for typos or try another area.";
    }
  
    if ((form.useType === "Moving" || form.useType === "Both") && deliveryRegion && movingRegion && deliveryRegion !== movingRegion) {
      newErrors.movingZip = "Delivery and moving zip codes must be in the same state.";
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      setIsLoading(false); 
      return;
    }
  
    // Clear any previous errors
    setErrors({});
  
    // STEP 1: generate quote ID if not set
    if (!quoteId) {
      newId = uuidv4();
      setQuoteId(newId);
      navigate(`/?id=${newId}`, { replace: true });
    }
  
    // STEP 2: save to DB
    try {
      await fetch("https://frightening-print-production.up.railway.app/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          zip: form.zip,
          box_selection: null,
          delivery_date: form.deliveryDate,
          storage_location: form.storageLocation,
          promo_code: form.promoCode,
          pricing_summary: null,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to save quote to DB:", err);
      alert("Something went wrong saving your quote. Please try again.");
      return;
    }
  
    // STEP 3: create lead in Salesforce
    try {
      const res = await fetch("https://frightening-print-production.up.railway.app/salesforce/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          zip: form.zip,
          useType: form.useType,
          deliveryDate: form.deliveryDate,
          quoteId: newId,
          region: deliveryRegion || "Out of service area",
          promoCode: form.promoCode,
          storage_location: form.storageLocation
        }),
      });
      console.log("🔥 submitStep1 triggered");
      const data = await res.json();
      setLeadId(data.leadId);
      return true;
    } catch (err) {
      console.error("❌ Failed to create Salesforce lead:", err);
      alert("Something went wrong creating your lead. Please try again.");
      return false;
    }finally {
      setIsLoading(false);
    }
  };
  

  const submitStep2 = async () => {
    const totalQty = Object.values(form.quantities).reduce((sum, qty) => sum + qty, 0);
    setIsLoading(true);
    if (totalQty === 0) {
      setStep2Error("Please select at least one BlueBox to continue.");
      setIsLoading(false);
      return;
    }
    setStep2Error("");
  
    if (!quoteId) return nextStep(); // fallback
    try {
      // 1. Save to PostgreSQL
      await fetch("https://frightening-print-production.up.railway.app/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quoteId,
          box_selection: form.boxes,
          pricing_summary: {
            rentalTotal,
            deliveryFee,
            facilityStorageFee,
            discountedTotal,
            futurePickup,
            futureMove,
            futureTotal
          }
        })
      });
      console.log("✅ Quote updated in PostgreSQL");
  
      // 2. Update Salesforce Lead
      if (leadId) {
        await fetch(`https://frightening-print-production.up.railway.app/salesforce/lead/${leadId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            BlueBox_Size__c: form.containerSize,
            Number_of_Boxes__c: totalQty,
            Monthly_Rental_Charge__c: rentalTotal,
            Delivery__c: deliveryFee,
            Move_Charge__c: futureMove,
            EPU__c: futurePickup,
            Facility_Monthly_Rate__c: facilityStorageFee,
          }),
        });
        console.log("✅ Lead updated in Salesforce");
      }
  
      // 3. Move to next step
      nextStep();
  
    } catch (err) {
      console.error("❌ Failed to save step 2 data:", err);
      alert("Something went wrong saving your box selections. Please try again.");
    }
    setIsLoading(false);
  };

  const submitStep3 = async () => {
    console.log("Step 3 – leadId:", leadId);
    setIsLoading(true);
    if (!form.fullAddress) {
      setErrors({ message: "Please enter a valid delivery address." });
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`https://frightening-print-production.up.railway.app/salesforce/lead/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Street: form.street,
          City: form.city,
          State: form.state,
          PostalCode: form.deliveryZip,
          Country: form.country,
          Notes__c: form.placementNotes,
          Address_Summary__c: `${form.fullAddress}\n\nNotes:\n${form.placementNotes || ""}`,
          Move_Address__c: form.moveFullAddress || "", // <-- Add this line
        }),
      });
    
      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Salesforce update failed:", errorData);
        throw new Error("Salesforce update failed");
      }
    
      console.log("✅ Step 3 address + notes saved to Salesforce");
      nextStep();
    } catch (err) {
      console.error("❌ Failed to update Salesforce lead:", err);
    }
    setIsLoading(false);
  };
  const submitStep4 = async () => {
    setIsLoading(true);
    if (isSubmitting) return;
  
    if (
      !cardInfo.cardNumber ||
      !cardInfo.expiry ||
      !cardInfo.cvv ||
      !cardInfo.cardName ||
      !cardInfo.zip
    ) {
      setPaymentError("Please complete all payment fields.");
      setIsLoading(false);
      return;
    } else {
      setPaymentError("");
    }
  
    const summaryText = `
  Due to Reserve:
  ${Object.entries(form.quantities || {})
    .flatMap(([size, qty]) => {
      if (qty <= 0) return [];
  
      const pricePerBox = containerOptions.find(c => c.size === size)?.price || 0;
      const hasDiscount = activePromo && activePromo.amount && activePromo.type;
      const isPercent = activePromo?.type === "percent";
  
      const discounted = hasDiscount
        ? isPercent
          ? Math.round(pricePerBox * (1 - activePromo.amount / 100))
          : Math.round(pricePerBox - activePromo.amount)
        : pricePerBox;
  
        return Array.from({ length: qty }).map(() =>
          hasDiscount
            ? `${size} BlueBox Monthly Rent: $${discounted}`
            : `${size} BlueBox Monthly Rent: $${pricePerBox}`
        );
    })
    .join("\n")}
  ${activePromo ? `Promo "${activePromo.code}" applied\n` : ""}
  
  Delivery Fee: $${Math.round(
  activePromo
    ? deliveryFee * (1 - activePromo.amount / 100)
    : deliveryFee
)}
  ${facilityStorageFee > 0 ? `Facility Storage Fee: $${facilityStorageFee}` : ""}
  
  Total Due Now: $${Math.round(discountedTotal)}
  
  Future Charges:
  Final Pickup Charge: $${Math.round(
  activePromo ? futurePickup * (1 - activePromo.amount / 100) : futurePickup
)} 
  ${
    includeMove
      ? `Move Charge: $${Math.round(
  activePromo ? futureMove * (1 - activePromo.amount / 100) : futureMove
)} `
      : ""
  }
  
  Total Future Charges: $${Math.round(
      activePromo ? futureTotal * (1 - activePromo.amount / 100) : futureTotal
    )}
  `.trim();
  
    setIsSubmitting(true);
    try {
      const res = await fetch("https://frightening-print-production.up.railway.app/api/store-card-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          cardName: cardInfo.cardName,
          cardNumber: cardInfo.cardNumber,
          expiry: cardInfo.expiry,
          cvv: cardInfo.cvv,
          zip: cardInfo.zip
        })
      });
  
      if (!res.ok) throw new Error("Card store failed");
  
      await fetch(`https://frightening-print-production.up.railway.app/salesforce/lead/${leadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Pricing_Summary__c: summaryText })
      });
  
      console.log("✅ Step 4 complete");
      nextStep();
    } catch (err) {
      console.error("❌ Failed in Step 4:", err);
      setPaymentError("Something went wrong saving your card. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };  

  const [containerOptions, setContainerOptions] = useState(initialContainerOptions);
  const [showDetails, setShowDetails] = useState({});
  
  useEffect(() => {
    window.parent.postMessage({ scrollToTop: true }, "*");
  }, [step]);

  useEffect(() => {
    fetch("https://frightening-print-production.up.railway.app/regions")
      .then(res => res.json())
      .then(setRegionData)
      .catch(err => console.error("Failed to load region data", err));
  }, []);

  useEffect(() => {
    if (!form.promoCode) {
      updateForm("promoCode", "BLUE30"); // ✅ Apply promo if none set
      setShowPromo(true); // 👈 this line expands the field
    }
  }, []);

  useEffect(() => {
    if (!form.promoCode) {
      setActivePromo(null);
      return;
    }
  
    fetch("https://frightening-print-production.up.railway.app/promos")
      .then(res => res.json())
      .then(data => {
        const matched = data.find(p => p.code === form.promoCode);
        setActivePromo(matched || null);
      })
      .catch(err => {
        console.error("Failed to fetch promos:", err);
      });
  }, [form.promoCode]);

  useEffect(() => {
    const region = detectRegionByZip(form.zip);
    if (region && regionData[region]) {
      const regionInfo = regionData[region];
      setContainerOptions(prev =>
        prev.map(opt => ({
          ...opt,
          price: regionInfo.prices?.[opt.size] || opt.price,
          available: regionInfo.availability?.[opt.size] ?? true,
        }))
      );
    }
  }, [form.zip, regionData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quoteIdFromURL = params.get("id");
  
    if (!quoteIdFromURL) return;
  
    setQuoteId(quoteIdFromURL);
  
    const fetchQuote = async () => {
      try {
        const res = await fetch(`https://frightening-print-production.up.railway.app/api/quotes/${quoteIdFromURL}`);
        const data = await res.json();
  
        if (data.quote) {
          const quote = data.quote;
        
          setForm((prev) => ({
            ...prev,
            name: quote.name || "",
            email: quote.email || "",
            phone: quote.phone || "",
            zip: quote.zip || "",
            deliveryDate: quote.delivery_date || "",
            storageLocation: quote.storage_location || "",
            promoCode: quote.promo_code || "",
            boxes: quote.box_selection || {}, // Step 2 container data
          }));
        
          // Step 2 pricing restore (make sure you have these useStates defined)
          setRentalTotal(quote.pricing_summary?.rentalTotal || 0);
          setDeliveryFee(quote.pricing_summary?.deliveryFee || 0);
          setFacilityStorageFee(quote.pricing_summary?.facilityStorageFee || 0);
          setDiscountedTotal(quote.pricing_summary?.discountedTotal || 0);
          setFuturePickup(quote.pricing_summary?.futurePickup || 0);
          setFutureMove(quote.pricing_summary?.futureMove || 0);
          setFutureTotal(quote.pricing_summary?.futureTotal || 0);
        }
      } catch (err) {
        console.error("❌ Failed to load existing quote:", err);
      }
    };
  
    fetchQuote();
  }, []);

  function getDiscountedPrice(price) {
    if (!activePromo) return price;
    if (activePromo.type === "flat") {
      return Math.max(price - activePromo.amount, 0);
    } else if (activePromo.type === "percent") {
      return Math.max(price * (1 - activePromo.amount / 100), 0);
    }
    return price;
  }

  function detectRegionByZip(zip) {
    for (const region in regionData) {
      if (regionData[region].zipCodes.includes(zip)) {
        return region;
      }
    }
    return null;
  }

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const detectedRegion = useMemo(() => detectRegionByZip(form.zip), [form.zip, regionData]);

  const rentalTotal = containerOptions.reduce(
    (sum, option) => sum + (option.price * (form.quantities[option.size] || 0)),
    0
  );
  const deliveryRatePerBox = regionData[detectedRegion]?.fees?.delivery ?? 79;
const totalBoxesSelected = Object.values(form.quantities || {}).reduce((sum, qty) => sum + qty, 0);
const deliveryFee = totalBoxesSelected * deliveryRatePerBox;

  const facilityStorageFee = form.storageLocation === "facility" ? 49 : 0;
  const dueNowTotal = rentalTotal + deliveryFee + facilityStorageFee;
  let discount = 0;

  if (activePromo) {
    if (activePromo.type === "flat") {
      discount = activePromo.amount * totalBoxesSelected; // 💥 multiply flat promo by box count
    } else if (activePromo.type === "percent") {
      discount = (dueNowTotal * activePromo.amount) / 100;
    }
  }  
  
  const discountedTotal = Math.max(dueNowTotal - discount, 0);
  

  const pickupRatePerBox = regionData[detectedRegion]?.fees?.pickup ?? 50;
  const moveRatePerBox = regionData[detectedRegion]?.fees?.move ?? 75;
  
  const futurePickup = totalBoxesSelected * pickupRatePerBox;
  const futureMove = totalBoxesSelected * moveRatePerBox;
  const includeMove = ["Moving", "Both"].includes(form.useType);
  const futureTotal = futurePickup + (includeMove ? futureMove : 0);

  const saveCardToBackend = async (cardInfo, leadId) => {
    try {
      const response = await fetch("https://frightening-print-production.up.railway.app/api/store-card-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          cardName: cardInfo.cardName,
          cardNumber: cardInfo.cardNumber,
          expiry: cardInfo.expiry,
          cvv: cardInfo.cvv,
          zip: cardInfo.zip,
        }),
      });
  
      if (!response.ok) throw new Error("Failed to store card info");
      console.log("✅ Card info securely saved");
    } catch (err) {
      console.error("❌ Error saving card info:", err);
    }
  };
  const summaryText = `
    Due to Reserve:
    ${Object.entries(form.quantities || {})
      .flatMap(([size, qty]) => {
        if (qty <= 0) return [];
        const pricePerBox = containerOptions.find(c => c.size === size)?.price || 0;

        const discounted = activePromo
          ? activePromo.type === "percent"
            ? Math.round(pricePerBox * (1 - activePromo.amount / 100))
            : Math.round(pricePerBox - activePromo.amount)
          : Math.round(pricePerBox);

        return Array.from({ length: qty }).map(() => `${size} BlueBox Monthly Rent: $${discounted}`);
      })
      .join("\n")}
    Delivery Fee: $${Math.round(deliveryFee)} (${totalBoxesSelected} × $${deliveryRatePerBox})
    ${facilityStorageFee > 0 ? `Facility Storage Fee: $${facilityStorageFee}\n` : ""}
    Total Due Now: $${Math.round(discountedTotal)}

    Future Charges:
    Final Pickup Charge: $${Math.round(futurePickup)} (${totalBoxesSelected} × ${pickupRatePerBox})
    ${
      includeMove
        ? `Move Charge: $${Math.round(futureMove)} (${totalBoxesSelected} × ${moveRatePerBox})`
        : ""
    }
    Total Future Charges: $${futureTotal.toFixed(2)}
    `.trim();

  const steps = [
    {
      key: "step-1",
      content: (
        <div>
          <p className="text-2xl font-objektiv font-bold text-[#124CA0] mb-4">How Can We Help You?</p>
          <div className="flex gap-4 mb-4">
            {useOptions.map(option => (
              <button
              key={option}
              className={`px-6 py-3 rounded-md border w-full font-objektiv font-semibold transition duration-200 ${
                form.useType === option
                  ? "bg-[#124CA0] text-white border-[#124CA0]"
                  : "border-gray-300 text-[#124CA0] hover:bg-gray-100"
              }`}
              onClick={() => updateForm("useType", option)}
            >
              {option}
            </button>
            ))}
          </div>

          <input
              className={`w-full p-3 border rounded mb-4 font-proxima ${errors.name ? "border-red-500" : ""}`}
              placeholder="Name"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
            />
            {errors.name && <p className="text-red-600 text-sm mb-4">{errors.name}</p>}
            <input
              className={`w-full p-3 border rounded mb-4 font-proxima ${errors.email ? "border-red-500" : ""}`}
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
            />
            {errors.email && <p className="text-red-600 text-sm mb-4">{errors.email}</p>}

            <input
              className={`w-full p-3 border rounded mb-4 font-proxima ${errors.phone ? "border-red-500" : ""}`}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                updateForm("phone", formatted);
              }}
            />
            {errors.phone && <p className="text-red-600 text-sm mb-4">{errors.phone}</p>}

            <input
              className={`w-full p-3 border rounded mb-1 font-proxima ${errors.zip ? "border-red-500" : ""}`}
              placeholder="Delivery Zipcode"
              value={form.zip}
              onChange={(e) => {
                const zip = e.target.value;
                updateForm("zip", zip);
              
                // Live validation for service area
                if (zip.length >= 5) {
                  const region = detectRegionByZip(zip);
                  if (!region) {
                    setErrors(prev => ({
                      ...prev,
                      zip: "This Zipcode is out of our flat rate delivery radius. Please Call BlueBox for a quote"
                    }));
                  } else {
                    setErrors(prev => ({ ...prev, zip: "" }));
                  }
                } else {
                  setErrors(prev => ({ ...prev, zip: "" })); // Clear if they delete
                }
              }}
            />
            {errors.zip && (
              <p className="text-red-600 text-sm mb-4">{errors.zip}</p>
            )}


          {(form.useType === "Storage" || form.useType === "Both") && (
            <div className="mb-6">
            <label className="text-[#124CA0] block mb-2 text-xl">Where will you keep the BlueBox?</label>
            <div className="flex gap-4 w-full">
              {[
                { label: "My Location", value: "My Location" },
                { label: "BlueBox Facility", value: "BlueBox Facility" }
              ].map(loc => (
                <div
                  key={loc.value}
                  className={`w-1/2 p-4 rounded-xl cursor-pointer border-2 text-center transition-all duration-150 ${
                    form.storageLocation === loc.value
                      ? "bg-[#124CA0] text-white border-[#124CA0]"
                      : "bg-white text-black border-gray-300"
                  }`}
                  onClick={() => updateForm("storageLocation", loc.value)}
                >
                  <span className="font-medium">{loc.label}</span>
                </div>
              ))}
            </div>
          </div>
          )}

            {(form.useType === "Moving" || form.useType === "Both") && (
              <>
                <input
                  className={`p-3 border rounded w-full mb-1 ${errors.movingZip ? "border-red-500" : ""}`}
                  placeholder="Moving Zipcode"
                  value={form.movingZip}
                  onChange={(e) => {
                    const zip = e.target.value;
                    updateForm("movingZip", zip);

                    if (zip.length >= 5) {
                      const region = detectRegionByZip(zip);
                      const deliveryRegion = detectRegionByZip(form.zip);

                      if (!region) {
                        setErrors(prev => ({
                          ...prev,
                          movingZip: "WThis Zipcode is out of our flat rate delivery radius. Please Call BlueBox for a quote"
                        }));
                      } else if (deliveryRegion && deliveryRegion !== region) {
                        setErrors(prev => ({
                          ...prev,
                          movingZip: "We currently only service in state moves"
                        }));
                      } else {
                        setErrors(prev => ({ ...prev, movingZip: "" }));
                      }
                    } else {
                      setErrors(prev => ({ ...prev, movingZip: "" }));
                    }
                  }}
                />
                {errors.movingZip && (
                  <p className="text-red-600 text-sm mb-4">{errors.movingZip}</p>
                )}
              </>
            )}

          <div className="mb-4">
            <label htmlFor="delivery-date" className="block text-xl font-proxima text-[#124CA0] font-medium mb-1">Delivery Date</label>
            <input
              type="date"
              className={`w-full p-3 border rounded text-sm font-proxima appearance-none ${
                errors.deliveryDate ? "border-red-500" : "border-gray-300"
              }`}
              value={form.deliveryDate}
              min={new Date().toISOString().split("T")[0]} // ✅ today's date in YYYY-MM-DD format
              onChange={(e) => updateForm("deliveryDate", e.target.value)}
            />
            {errors.deliveryDate && <p className="text-red-600 text-sm mt-1">{errors.deliveryDate}</p>}
          </div>

          <div className="mb-4">
            <button
              type="button"
              className="text-[#124CA0] underline text-sm"
              onClick={() => setShowPromo(prev => !prev)}
            >
              {showPromo ? "– Promo" : "+ Promo"}
            </button>

            {showPromo && (
              <input
                className="mt-2 w-full p-3 border rounded"
                placeholder="Promo Code"
                value={form.promoCode}
                onChange={(e) => updateForm("promoCode", e.target.value.toUpperCase())}
              />
            )}
            <label className="flex items-start space-x-2 text-sm mt-2 mb-4">
            <input
              type="checkbox"
              checked={form.consentToContact}
              onChange={(e) => updateForm("consentToContact", e.target.checked)}
              required
            />
            <span>
              I agree to receive my quote and follow-up info via text or email from BlueBox.
            </span>
          </label>
          {errors.consentToContact && (
            <p className="text-red-600 text-sm mb-4">{errors.consentToContact}</p>
          )}
          </div>
        </div>
      )
    },
    {
      key: "step-2",
      content: (
        <div>
          <p className="text-2xl font-objektiv font-bold text-[#124CA0] mb-4">Choose Your BlueBox</p>
          <div className="flex flex-col gap-3">
            {containerOptions.map(option => {
              if (!option.available) return null;
              return (
              <div
                key={option.size}
                className={`border rounded-lg p-3 cursor-pointer flex items-start gap-4 ${form.containerSize === option.size ? "border-blue-700" : "border-gray-300"}`}
                onClick={() => updateForm("containerSize", option.size)}
              >
                <div className="w-24 flex-shrink-0 relative flex flex-col items-center">
                  {option.popular && (
                    <div className="absolute -top-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">Most Popular</div>
                  )}
                  <img src={option.image} alt={option.size} className="w-full h-24 object-contain mt-4" />
                  {activePromo ? (
                  <div className="text-center mt-2">
                    <div className="text-sm text-gray-400 line-through">
                      ${option.price}/month
                    </div>
                    <div className="text-sm text-green-600 font-semibold">
                      ${getDiscountedPrice(option.price).toFixed(2)}/month
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-[#676767] mt-2">
                    ${option.price}/month
                  </div>
                )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[#124CA0]">{option.size}</div>
                  <div className="text-sm text-gray-600 mb-2">Good for {option.sqft}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="bg-gray-200 text-lg w-8 h-8 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateForm("quantities", {
                          ...form.quantities,
                          [option.size]: Math.max(0, form.quantities[option.size] - 1),
                        });
                      }}
                    >−</button>
                    <span className="text-lg font-bold">{form.quantities[option.size]}</span>
                    <button
                      className="bg-gray-200 text-lg w-8 h-8 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateForm("quantities", {
                          ...form.quantities,
                          [option.size]: Math.min(5, form.quantities[option.size] + 1),
                        });
                      }}
                    >+</button>
                  </div>
                  <button
                    className="text-sm text-blue-700 underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(prev => ({
                        ...prev,
                        [option.size]: !prev[option.size]
                      }));
                    }}
                  >
                    {showDetails[option.size] ? "Hide Details" : "BlueBox Details +"}
                  </button>
                  {showDetails[option.size] && (
                    <ul className="text-sm text-left list-disc list-inside text-gray-600 mt-2">
                      {option.details.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              );
    })}
          </div>
          {step2Error && (
  <p className="text-red-600 text-sm mb-4 text-center">{step2Error}</p>
)}
        </div>
      )
    },
    {
      key: "step-3",
      content: (
        <div>
          <p className="text-2xl font-objektiv font-bold text-[#124CA0] mb-4">Pricing Summary</p>
          <PricingSummary
            form={form}
            activePromo={activePromo}
            containerOptions={containerOptions}
            deliveryRatePerBox={deliveryRatePerBox}
            pickupRatePerBox={pickupRatePerBox}
            moveRatePerBox={moveRatePerBox}
            totalBoxesSelected={totalBoxesSelected}
            discountedTotal={discountedTotal}
            facilityStorageFee={facilityStorageFee}
            futurePickup={futurePickup}
            futureMove={futureMove}
            futureTotal={futureTotal}
          />
          {errors.message && (
        <div className="text-red-600 text-sm text-center mb-2">
          {errors.message}
        </div>
      )}
          <AddressAutocomplete
            label="Delivery Address"
            form={form}
            updateForm={updateForm}
            onAddressSelect={(data) => {
              updateForm("fullAddress", data.fullAddress);
              updateForm("street", data.street);
              updateForm("city", data.city);
              updateForm("state", data.state);
              updateForm("deliveryZip", data.postalCode);
              updateForm("country", data.country);
            }}
          />
          {["Moving", "Both"].includes(form.useType) && (
          <AddressAutocomplete
            label="Move-To Address"
            form={form}
            updateForm={updateForm}
            onAddressSelect={(data) => {
              updateForm("moveFullAddress", data.fullAddress);
            }}
          />
        )}
        </div>
      )
    },
    {
      key: "step-4",
      content: (
        <div>
        <PaymentForm
        cardInfo={cardInfo}
        handleCardChange={handleCardChange}
        paymentError={paymentError}
        totalDueNow={discountedTotal}
        summaryText={summaryText}
      />
      <div className="mt-6">
        <p className="text-2xl font-objektiv font-bold text-[#124CA0] mb-4">Pricing Summary</p>
        <PricingSummary
          form={form}
          activePromo={activePromo}
          containerOptions={containerOptions}
          deliveryRatePerBox={deliveryRatePerBox}
          pickupRatePerBox={pickupRatePerBox}
          moveRatePerBox={moveRatePerBox}
          totalBoxesSelected={totalBoxesSelected}
          discountedTotal={discountedTotal}
          facilityStorageFee={facilityStorageFee}
          futurePickup={futurePickup}
          futureMove={futureMove}
          futureTotal={futureTotal}
        />
      </div>
          </div>
      )
    },
    {
  key: "step-5",
  content: (
    <div className="p-4">
      <ThankYouSection />
    </div>
  )
}
    
  ];
  const handleNext = useCallback(async () => {
    let shouldContinue = true;
  
    if (step === 1) {
      shouldContinue = await submitStep1();
    } else if (step === 2) {
      shouldContinue = await submitStep2();
    } else if (step === 3) {
      shouldContinue = await submitStep3();
    } else if (step === 4) {
      shouldContinue = await submitStep4();
    }
  
    if (shouldContinue) {
      nextStep();
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [step, submitStep1, submitStep2, submitStep3, submitStep4, scrollAnchorRef]);
  

  return (
    <div id="bluebox-quote-widget" className="p-4 max-w-3xl mx-auto font-proxima text-[#333] bg-white">
      <div ref={scrollAnchorRef} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={steps[step - 1].key}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          {steps[step - 1].content}
        </motion.div>
      </AnimatePresence>

<div className="h-[120px] sm:h-0" />
     {step < 5 && (
  <StickyFooterNav
  step={step}
  totalSteps={5}
  onBack={prevStep}
  onNext={handleNext}
  disabled={isSubmitting}
  isLoading={isLoading}
  discountedTotal={discountedTotal}
/>
)}
    </div>
  );
}