export const useFetchBoards = () => {
  const supabase = useSupabaseClient();
  const pending = ref(false);
  const boards = ref([]);
  const user = useSupabaseUser();
  const fetchBoards = async () => {
    pending.value = true; // Start loading

    try {
      // Step 1: Fetch the board IDs where the current user is the owner
      const { data: boardMembersData, error: boardMembersError } =
        await supabase
          .from("board_members")
          .select("board_id")
          .eq("user_id", user.value.id)
          .filter("role", "in", '("owner","member")');
      if (boardMembersError) {
        console.error("Error fetching board members:", boardMembersError);
        return [];
      }

      const boardIds = boardMembersData.map((member) => member.board_id);

      // Step 2: Fetch the boards based on the board IDs
      const { data, error } = await supabase
        .from("boards")
        .select("id, title, currency, invite_token")
        .eq("is_visible", true) // Adjust fields as needed
        .in("id", boardIds); // Fetch boards only where the id is in the list of boardIds

      if (error) {
        console.error("Error fetching boards:", error);
        return [];
      }
      return data;
    } catch (err) {
      console.error("Unexpected error:", err);
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
