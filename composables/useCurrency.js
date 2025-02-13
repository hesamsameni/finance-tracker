export const useCurrency = (amount, currencyParam = "EUR") => {
  const formattedCurrency = computed(() => {
    // If currencyParam is a ref, use its value; otherwise, use it directly
    const curr = isRef(currencyParam) ? currencyParam.value : currencyParam;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
    }).format(isRef(amount) ? amount.value : amount);
  });

  return {
    formattedCurrency,
  };
};
