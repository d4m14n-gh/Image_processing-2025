import { Injectable } from '@angular/core';

/** Service to manage applied expression history. */
@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  /** List of applied expressions. */
  private history: string[] = [];
  /** Maximum number of history entries to keep. */
  private historyLimit: number = 25;
  /** Key for storing the history in local storage. */
  private storageKey: string = 'history';


  /** Adds an action to the history, ensuring no duplicates and respecting the history limit.
   * @param action The action (expression) to add to the history.
   */
  addToHistory(action: string): void {
    if(this.history.includes(action)) 
      this.history = this.history.filter(item => item !== action);
    
    this.history.push(action);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.history));
  }

  /** Retrieves the history in reverse order (most recent first).
   * @returns The reversed history array.
   */
  getHistoryReversed(): string[] {
    return this.getHistory().slice().reverse();
  }

  /** Retrieves the history.
   * @returns The history array.
   */
  getHistory(): string[] {
    const history = localStorage.getItem(this.storageKey);
    if (history) {
      this.history = JSON.parse(history);
    }
    return this.history;
  }

  /** Clears the history both in memory and in local storage. */
  clearHistory(): void {
    this.history = [];
    localStorage.removeItem(this.storageKey);
  }
}
