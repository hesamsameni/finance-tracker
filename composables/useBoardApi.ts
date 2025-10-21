export function useBoardApi() {
  const supabase = useSupabaseClient() as any;

  const createBoard = async ({
    title,
    currency,
    invite_token,
  }: {
    title: string;
    currency?: string;
    invite_token?: string;
  }) => {
    const { data, error } = await supabase
      .from("boards")
      .upsert({ title, currency, invite_token })
      .select();

    if (error) throw error;
    return data?.[0]?.id as string | undefined;
  };

  const deleteBoard = async (boardId: string) => {
    const { error } = await supabase
      .from("boards")
      .update({ is_visible: false })
      .eq("id", boardId);

    if (error) {
      throw new Error(error.message);
    }
    const { error: catgoriesDeleteError } = await supabase
      .from("categories")
      .delete()
      .eq("board_id", boardId);
    if (catgoriesDeleteError) throw catgoriesDeleteError;
  };

  const updateBoard = async (boardId: string, updates: any) => {
    const { id, title, currency, invite_token, auto_carry_over } = updates;
    const { data, error } = await supabase
      .from("boards")
      .update({ id, title, currency, invite_token, auto_carry_over })
      .eq("id", boardId)
      .select();

    if (error) throw error;
    return data?.[0]?.id as string | undefined;
  };

  const deleteBoardCategories = async (boardId: string) => {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("board_id", boardId);
    if (error) throw error;
  };

  const addBoardMember = async (boardId: string, nickname: string) => {
    const { error } = await supabase.from("board_members").insert({
      board_id: boardId,
      role: "owner",
      user_nickname: nickname,
    });

    if (error) throw error;
  };

  const addCategoriesToBoard = async (categories: any[]) => {
    const { error } = await supabase.from("categories").upsert(categories);
    if (error) throw error;
  };

  const updateFavoriteBoard = async (boardId: string, isFavorite: boolean) => {
    const { error } = await supabase
      .from("boards")
      .update({ is_favorite: isFavorite })
      .eq("id", boardId);

    if (error) throw error;
  };

  return {
    createBoard,
    updateBoard,
    addBoardMember,
    addCategoriesToBoard,
    deleteBoard,
    deleteBoardCategories,
    updateFavoriteBoard,
  };
}
