import { ref } from "vue";
import { useSupabaseClient } from "#imports";

export const useFetchBoardNotes = (boardId) => {
  const supabase = useSupabaseClient();
  const notes = ref([]);
  const notesPending = ref(false);

  // Fetch all notes for the board
  const fetchNotes = async () => {
    notesPending.value = true;
    try {
      const { data, error } = await supabase
        .from("board_notes")
        .select("*")
        .eq("board_id", boardId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error fetching notes:", err);
      return [];
    } finally {
      notesPending.value = false;
    }
  };

  // Add a new note to the board
  const addNote = async (newNote) => {
    try {
      const { error } = await supabase
        .from("board_notes")
        .insert([{ ...newNote }]);

      if (error) throw error;
      await refreshNotes(); // Refresh the notes after adding
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  // Update an existing note
  const updateNote = async (updatedNote) => {
    try {
      const { error } = await supabase
        .from("board_notes")
        .update({ ...updatedNote })
        .eq("id", boardId);

      if (error) throw error;
      await refreshNotes(); // Refresh the notes after updating
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  // Delete a note
  const deleteNote = async (note) => {
    try {
      const { error } = await supabase
        .from("board_notes")
        .delete()
        .eq("id", note.id);

      if (error) throw error;
      await refreshNotes(); // Refresh the notes after deleting
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  // Refresh the notes list
  const refreshNotes = async () => {
    notes.value = await fetchNotes();
  };

  return {
    notes,
    notesPending,
    refreshNotes,
    addNote,
    updateNote,
    deleteNote,
  };
};
