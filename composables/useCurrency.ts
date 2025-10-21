import { computed, isRef } from "vue";

export const useCurrency = (amount: any, currencyParam: any = "EUR") => {
  const formattedCurrency = computed(() => {
    // If currencyParam is a ref, use its value; otherwise, use it directly
    const curr = isRef(currencyParam) ? currencyParam.value : currencyParam;
    const val = isRef(amount) ? amount.value : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: curr,
    }).format(val);
  });

  return {
    formattedCurrency,
  };
};
