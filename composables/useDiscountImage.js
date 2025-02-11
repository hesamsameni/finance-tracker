export const useDiscountImage = (discountImage) => {
  const supabase = useSupabaseClient();

  const getPublicUrl = () => {
    if (!discountImage) return null;

    const { data } = supabase.storage
      .from("discounts")
      .getPublicUrl(discountImage);

    return data.publicUrl;
  };

  const url = ref(getPublicUrl());

  return { url };
};
