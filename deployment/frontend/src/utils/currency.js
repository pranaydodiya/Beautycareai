export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0";
  }
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount));
  } catch (e) {
    return `₹${Number(amount).toFixed(2)}`;
  }
};


