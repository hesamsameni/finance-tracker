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

  return { createBoard, addBoardMember, addCategoriesToBoard };
}
