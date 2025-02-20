export const useFetchBoards = () => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const boards = ref([]);
  const user = useSupabaseUser();

  const fetchBoards = async () => {
    pending.value = true;
    try {
      // Fetch board IDs where the current user is an owner or member
      const { data: boardMembersData, error: boardMembersError } =
        await supabase
          .from("board_members")
          .select("board_id")
          .eq("user_id", user.value.id)
          .in("role", ["owner", "member"]);

      if (boardMembersError) throw boardMembersError;
      if (!boardMembersData.length) return [];

      const boardIds = boardMembersData.map((member) => member.board_id);

      // Fetch boards based on the retrieved board IDs
      const { data, error } = await supabase
        .from("boards")
        .select(
          "id, title, currency, invite_token, auto_carry_over, is_favorite, categories(id, label, icon, color)"
        )
        .eq("is_visible", true)
        .in("id", boardIds)
        .order("is_favorite", { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching boards:", err);
      return [];
    } finally {
      pending.value = false;
    }
  };

  const refresh = async () => {
    boards.value = await fetchBoards();
  };

  return {
    boards,
    refresh,
    pending,
  };
};
