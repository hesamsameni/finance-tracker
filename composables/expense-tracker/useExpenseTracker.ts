import { ref, computed, watch } from "vue";
import { expenseTrackerService, type Expense, type BoardMember, type Category } from "~/services/expense-tracker";

type UseExpenseTrackerReturn = {
  // State
  expenses: Ref<Expense[]>;
  boardMembers: Ref<BoardMember[]>;
  categories: Ref<Category[]>;
  pending: Ref<boolean>;
  
  // Expense operations
  refreshExpenses: (boardId: string, fromDate?: Date, toDate?: Date) => Promise<void>;
  getAllExpenses: (boardId: string) => Promise<Expense[]>;
  addExpense: (expense: Partial<Expense>) => Promise<Expense | null>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense | null>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Board member operations
  getBoardMembers: (boardId: string) => Promise<void>;
  addBoardMember: (boardId: string, nickname: string, role?: string) => Promise<void>;
  
  // Category operations
  getBoardCategories: (boardId: string) => Promise<void>;
  addCategoriesToBoard: (categories: Category[]) => Promise<void>;
  deleteBoardCategories: (boardId: string) => Promise<void>;
  
  // Computed values
  getUserExpenses: (userId: string) => number;
  expensesByUser: ComputedRef<Record<string, Expense[]>>;
  categoriesForChart: ComputedRef<Record<string, number>>;
};

export const useExpenseTracker = (dateRange?: Ref<{ from: Date; to: Date }>): UseExpenseTrackerReturn => {
  // State
  const expenses = ref<Expense[]>([]);
  const boardMembers = ref<BoardMember[]>([]);
  const categories = ref<Category[]>([]);
  const pending = ref(false);

  // Watch for date range changes
  if (dateRange) {
    watch(dateRange, async () => {
      // This will be handled by the calling component
    });
  }

  // Expense operations
  const refreshExpenses = async (boardId: string, fromDate?: Date, toDate?: Date) => {
    pending.value = true;
    try {
      if (fromDate && toDate) {
        expenses.value = await expenseTrackerService.getExpensesByDateRange(boardId, fromDate, toDate);
      } else {
        expenses.value = await expenseTrackerService.getAllExpenses(boardId);
      }
    } finally {
      pending.value = false;
    }
  };

  const getAllExpenses = async (boardId: string) => {
    return await expenseTrackerService.getAllExpenses(boardId);
  };

  const addExpense = async (expense: Partial<Expense>) => {
    return await expenseTrackerService.addExpense(expense);
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    return await expenseTrackerService.updateExpense(id, updates);
  };

  const deleteExpense = async (id: string) => {
    await expenseTrackerService.deleteExpense(id);
  };

  // Board member operations
  const getBoardMembers = async (boardId: string) => {
    pending.value = true;
    try {
      boardMembers.value = await expenseTrackerService.getBoardMembers(boardId);
    } finally {
      pending.value = false;
    }
  };

  const addBoardMember = async (boardId: string, nickname: string, role: string = "owner") => {
    await expenseTrackerService.addBoardMember(boardId, nickname, role);
  };

  // Category operations
  const getBoardCategories = async (boardId: string) => {
    try {
      categories.value = await expenseTrackerService.getBoardCategories(boardId);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategoriesToBoard = async (categoriesToAdd: Category[]) => {
    await expenseTrackerService.addCategoriesToBoard(categoriesToAdd);
  };

  const deleteBoardCategories = async (boardId: string) => {
    await expenseTrackerService.deleteBoardCategories(boardId);
  };

  // Computed values
  const getUserExpenses = (userId: string): number => {
    return expenseTrackerService.getUserExpenseTotal(expenses.value, userId);
  };

  const expensesByUser = computed(() => {
    return expenseTrackerService.getExpensesByUser(expenses.value, boardMembers.value);
  });

  const categoriesForChart = computed(() => {
    return expenseTrackerService.getCategoryTotals(expenses.value);
  });

  return {
    // State
    expenses,
    boardMembers,
    categories,
    pending,
    
    // Expense operations
    refreshExpenses,
    getAllExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    
    // Board member operations
    getBoardMembers,
    addBoardMember,
    
    // Category operations
    getBoardCategories,
    addCategoriesToBoard,
    deleteBoardCategories,
    
    // Computed values
    getUserExpenses,
    expensesByUser,
    categoriesForChart,
  };
};
