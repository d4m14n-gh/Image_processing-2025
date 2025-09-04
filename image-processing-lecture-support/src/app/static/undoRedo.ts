export class UndoRedo<T> {
  private undoStack: T[] = [];
  private redoStack: T[] = [];

  constructor(private limit = 50) {}

  push(state: T) {
    this.undoStack.push(state);
    if (this.undoStack.length > this.limit)
      this.undoStack.shift();
    this.redoStack = [];
  }

  undo(): T | null {
    if (this.undoStack.length <= 1) return null;
    const last = this.undoStack.pop()!;
    this.redoStack.push(last);
    return this.undoStack[this.undoStack.length - 1];
  }
 
  redo(): T | null {
    if (this.redoStack.length === 0) return null;
    const state = this.redoStack.pop()!;
    this.undoStack.push(state);
    return state;
  }
}
