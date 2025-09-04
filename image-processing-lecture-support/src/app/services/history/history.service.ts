import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: string[] = [];
  private historyLimit: number = 25;
  private storageKey: string = 'history';

  constructor() { }

  addToHistory(action: string) {
    if(this.history.includes(action)) 
      this.history = this.history.filter(item => item !== action);
    
    this.history.push(action);
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.history));
  }

  getHistoryReversed() {
    return this.getHistory().slice().reverse();
  }

  getHistory() {
    const history = localStorage.getItem(this.storageKey);
    if (history) {
      this.history = JSON.parse(history);
    }
    return this.history;
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem(this.storageKey);
  }
}
