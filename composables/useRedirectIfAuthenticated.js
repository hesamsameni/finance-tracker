export const useRedirectIfAuthenticated = (defaultUrl = "/") => {
  const user = useSupabaseUser();
  const route = useRoute();
  const router = useRouter();
  watch(
    user,
    (user) => {
      if (user) {
        const redirectUrl = route.query.redirect || defaultUrl;
        const inviteToken = route.query.inviteToken;

        const finalUrl = token
          ? `/join?token=${encodeURIComponent(inviteToken)}`
          : redirectUrl;

        router.push(finalUrl);
      }
    },
    { immediate: true }
  );

  return { user };
};
