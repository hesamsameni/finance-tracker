import { ref } from "vue";

export const useDiscountImage = (discountImage: string | null | undefined) => {
  const supabase = useSupabaseClient() as any;

  const getPublicUrl = () => {
    if (!discountImage) return null;

    const { data } = supabase.storage
      .from("discounts")
      .getPublicUrl(discountImage);

    return data?.publicUrl ?? null;
  };

  const url = ref(getPublicUrl());

  return { url };
};
