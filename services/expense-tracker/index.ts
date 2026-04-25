import { useSupabaseClient, useSupabaseUser } from "#imports";

export type Expense = {
  id?: string;
  board_id: string;
  title: string;
  amount: number;
  category: string;
  paid_by: string;
  purchase_date: string;
  created_at?: string;
};

export type BoardMember = {
  id?: string;
  board_id: string;
  user_id: string;
  user_nickname: string;
  role: string;
  color?: string;
};

export type Category = {
  id?: string;
  board_id: string;
  label: string;
  icon: string;
  color: string;
};

export type Board = {
  id?: string;
  title: string;
  currency?: string;
  invite_token?: string;
  auto_carry_over?: boolean;
  is_favorite?: boolean;
  is_visible?: boolean;
};

const ensureAuth = (user: any) => {
  if (!user?.value?.id) throw new Error("Not authenticated");
};

export const expenseTrackerService = {
  // Expense operations
  async getExpensesByDateRange(boardId: string, fromDate: Date, toDate: Date) {
    const client = useSupabaseClient() as any;
    const { data, error } = await client
      .from("board_expenses")
      .select("*")
      .eq("board_id", boardId)
      .gte("purchase_date", fromDate.toISOString())
      .lte("purchase_date", toDate.toISOString())
      .order("purchase_date", { ascending: false });

    if (error) throw error;
    return (data as Expense[]) || [];
  },

  async getAllExpenses(boardId: string) {
    const client = useSupabaseClient() as any;
    const { data, error } = await client
      .from("board_expenses")
      .select("*")
      .eq("board_id", boardId)
      .order("purchase_date", { ascending: false });

    if (error) throw error;
    return (data as Expense[]) || [];
  },

  async addExpense(expense: Partial<Expense>) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { data, error } = await client
      .from("board_expenses")
      .insert(expense)
      .select();

    if (error) throw error;
    return (data && data[0]) || null;
  },

  async updateExpense(id: string, updates: Partial<Expense>) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { data, error } = await client
      .from("board_expenses")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return (data && data[0]) || null;
  },

  async deleteExpense(id: string) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { error } = await client.from("board_expenses").delete().eq("id", id);

    if (error) throw error;
  },

  // Board member operations
  async getBoardMembers(boardId: string) {
    const client = useSupabaseClient() as any;
    const { data, error } = await client
      .from("board_members")
      .select("*")
      .eq("board_id", boardId);

    if (error) throw error;
    return data ? [...new Set(data as BoardMember[])] : []; // Remove duplicates
  },

  async addBoardMember(
    boardId: string,
    nickname: string,
    role: string = "owner",
  ) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { error } = await client.from("board_members").insert({
      board_id: boardId,
      role,
      user_nickname: nickname,
    });

    if (error) throw error;
  },

  // Board operations
  async createBoard(board: {
    title: string;
    currency?: string;
    invite_token?: string;
  }) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { data, error } = await client.from("boards").upsert(board).select();

    if (error) throw error;
    return data?.[0]?.id as string | undefined;
  },

  async updateBoard(boardId: string, updates: Partial<Board>) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { data, error } = await client
      .from("boards")
      .update(updates)
      .eq("id", boardId)
      .select();

    if (error) throw error;
    return data?.[0]?.id as string | undefined;
  },

  async deleteBoard(boardId: string) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { error } = await client
      .from("boards")
      .update({ is_visible: false })
      .eq("id", boardId);

    if (error) throw error;

    // Also delete categories
    const { error: categoriesDeleteError } = await client
      .from("categories")
      .delete()
      .eq("board_id", boardId);

    if (categoriesDeleteError) throw categoriesDeleteError;
  },

  async updateFavoriteBoard(boardId: string, isFavorite: boolean) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { error } = await client
      .from("boards")
      .update({ is_favorite: isFavorite })
      .eq("id", boardId);

    if (error) throw error;
  },

  // Category operations
  async getBoardCategories(boardId: string) {
    const client = useSupabaseClient() as any;
    const { data, error } = await client
      .from("categories")
      .select("*")
      .eq("board_id", boardId);

    if (error) throw error;
    return (data as Category[]) || [];
  },

  async addCategoriesToBoard(categories: Category[]) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { error } = await client.from("categories").upsert(categories);

    if (error) throw error;
  },

  async deleteBoardCategories(boardId: string) {
    const client = useSupabaseClient() as any;
    const user = useSupabaseUser();
    ensureAuth(user);

    const { error } = await client
      .from("categories")
      .delete()
      .eq("board_id", boardId);

    if (error) throw error;
  },

  // Utility functions
  getUserExpenseTotal(expenses: Expense[], userId: string): number {
    return expenses
      .filter((expense) => expense.paid_by === userId)
      .reduce((total, expense) => total + (expense.amount || 0), 0);
  },

  getExpensesByUser(
    expenses: Expense[],
    boardMembers: BoardMember[],
  ): Record<string, Expense[]> {
    return boardMembers.reduce(
      (acc: Record<string, Expense[]>, user: BoardMember) => {
        acc[user.user_id] = expenses.filter(
          (expense) => expense.paid_by === user.user_id,
        );
        return acc;
      },
      {},
    );
  },

  getCategoryTotals(expenses: Expense[]): Record<string, number> {
    const categoryMap: Record<string, number> = {};
    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
    });
    return categoryMap;
  },
};

export default expenseTrackerService;
