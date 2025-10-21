export const useRedirectIfAuthenticated = (defaultUrl = "/") => {
  const user = useSupabaseUser();
  const route = useRoute();
  const router = useRouter();
  watch(
    user,
    (userVal: any) => {
      if (userVal) {
        const redirectUrl = route.query.redirect || defaultUrl;
        const inviteToken = route.query.inviteToken;

        const finalUrl = inviteToken
          ? `/join?inviteToken=${encodeURIComponent(
              (inviteToken as string) || ""
            )}`
          : (redirectUrl as string);

        router.push(finalUrl);
      }
    },
    { immediate: true }
  );

  return { user };
};
