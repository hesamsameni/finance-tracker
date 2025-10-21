import type { Ref } from "vue";

export const useAppToast = () => {
  const toast = useToast();

  return {
    toastSuccess: ({
      title,
      description,
    }: {
      title: string;
      description?: string;
    }) => {
      toast.add({
        title,
        description: description ?? undefined,
        icon: "i-heroicons-check-circle",
        color: "green",
      });
    },
    toastError: ({
      title,
      description,
    }: {
      title: string;
      description?: string;
    }) => {
      toast.add({
        title,
        description: description ?? undefined,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    },
  };
};
