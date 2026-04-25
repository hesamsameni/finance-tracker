import {
  expenseTrackerService,
  type Board,
  type Category,
} from "~/services/expense-tracker";

type UseBoardTrackerReturn = {
  createBoard: (board: {
    title: string;
    currency?: string;
    invite_token?: string;
    auto_carry_over?: boolean;
  }) => Promise<string | undefined>;
  updateBoard: (
    boardId: string,
    updates: Partial<Board>,
  ) => Promise<string | undefined>;
  deleteBoard: (boardId: string) => Promise<void>;
  updateFavoriteBoard: (boardId: string, isFavorite: boolean) => Promise<void>;
  addBoardMember: (
    boardId: string,
    nickname: string,
    role?: string,
  ) => Promise<void>;
  addCategoriesToBoard: (categories: Category[]) => Promise<void>;
  deleteBoardCategories: (boardId: string) => Promise<void>;
};

export const useBoardTracker = (): UseBoardTrackerReturn => {
  /* Delegate to service */
  const createBoard = expenseTrackerService.createBoard;
  const updateBoard = expenseTrackerService.updateBoard;
  const deleteBoard = expenseTrackerService.deleteBoard;
  const updateFavoriteBoard = expenseTrackerService.updateFavoriteBoard;
  const addBoardMember = expenseTrackerService.addBoardMember;
  const addCategoriesToBoard = expenseTrackerService.addCategoriesToBoard;
  const deleteBoardCategories = expenseTrackerService.deleteBoardCategories;

  return {
    createBoard,
    updateBoard,
    deleteBoard,
    updateFavoriteBoard,
    addBoardMember,
    addCategoriesToBoard,
    deleteBoardCategories,
  };
};
