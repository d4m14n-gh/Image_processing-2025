/** A simple generic Undo/Redo stack implementation with a limit on the number of states stored. */
export class UndoRedo<T> {
  /** The stack of states for undo operations. */
  private undoStack: T[] = [];
  /** The stack of states for redo operations. */
  private redoStack: T[] = [];
  

  /** Creates a new UndoRedo instance with an optional limit on the number of states stored. 
   * @param limit The maximum number of states to store in the undo stack (default is 50).
  */
  constructor(private limit = 50) {}

  /** Pushes a new state onto the undo stack and clears the redo stack.
   * If the undo stack exceeds the limit, the oldest state is removed.
   * @param state The new state to push onto the undo stack.
   */
  push(state: T): void {
    this.undoStack.push(state);
    if (this.undoStack.length > this.limit)
      this.undoStack.shift();
    this.redoStack = [];
  }

  /** Undoes the last state change and returns the previous state.
   * If there are no states to undo, it returns null.
   * @returns The previous state after undoing, or null if no states are available.
   */
  undo(): T | null {
    if (this.undoStack.length <= 1) return null;
    const last = this.undoStack.pop()!;
    this.redoStack.push(last);
    return this.undoStack[this.undoStack.length - 1];
  }
 
  /** Redoes the last undone state change and returns that state.
   * If there are no states to redo, it returns null.
   * @returns The state after redoing, or null if no states are available.
   */
  redo(): T | null {
    if (this.redoStack.length === 0) return null;
    const state = this.redoStack.pop()!;
    this.undoStack.push(state);
    return state;
  }
}
