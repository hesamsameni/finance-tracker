export function useBoardApi() {
  const supabase = useSupabaseClient();

  const createBoard = async ({ title, currency, invite_token }) => {
    const { data, error } = await supabase
      .from("boards")
      .upsert({ title, currency, invite_token })
      .select();

    if (error) throw error;
    return data?.[0]?.id;
  };

  const deleteBoard = async (boardId) => {
    const { error } = await supabase
      .from("boards")
      .update({ is_visible: false })
      .eq("id", boardId);

    if (error) {
      throw new Error(error.message);
    }
    const { catgoriesDeleteError } = await supabase
      .from("categories")
      .delete()
      .eq("board_id", boardId);
    if (catgoriesDeleteError) throw error;
  };

  const updateBoard = async (boardId, updates) => {
    const { id, title, currency, invite_token, auto_carry_over } = updates;
    const { data, error } = await supabase
      .from("boards")
      .update({ id, title, currency, invite_token, auto_carry_over })
      .eq("id", boardId)
      .select();

    if (error) throw error;
    return data?.[0]?.id;
  };

  const deleteBoardCategories = async (boardId) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("board_id", boardId);
    if (error) throw error;
  };

  const addBoardMember = async (boardId, nickname) => {
    const { error } = await supabase.from("board_members").insert({
      board_id: boardId,
      role: "owner",
      user_nickname: nickname,
    });

    if (error) throw error;
  };

  const addCategoriesToBoard = async (categories) => {
    const { error } = await supabase.from("categories").upsert(categories);
    if (error) throw error;
  };

  return {
    createBoard,
    updateBoard,
    addBoardMember,
    addCategoriesToBoard,
    deleteBoard,
    deleteBoardCategories,
  };
}
