import { storage } from "../utils/storage";

export class Balance {
  private static readonly STORAGE_KEY = "player_balance";
  private currentBalance: number;
  private lastWin: number = 0;

  constructor(initialBalance: number = 1000) {
    // Load balance from storage or use initial value
    this.currentBalance =
      storage.getNumber(Balance.STORAGE_KEY) ?? initialBalance;
  }

  /**
   * Get the current balance
   */
  public get(): number {
    return this.currentBalance;
  }

  public getLastWin(): number {
    return this.lastWin;
  }

  /**
   * Add to the current balance
   * @param amount Amount to add (can be negative to subtract)
   * @returns New balance
   */
  public add(amount: number): number {
    this.currentBalance += amount;
    this.lastWin = amount;
    this.save();
    return this.currentBalance;
  }

  /**
   * Set the balance to a specific amount
   * @param amount New balance amount
   */
  public set(amount: number): void {
    this.currentBalance = amount;
    this.save();
  }

  /**
   * Reset balance to default value (1000)
   */
  public reset(): void {
    this.set(1000);
  }

  /**
   * Save current balance to storage
   */
  private save(): void {
    storage.setNumber(Balance.STORAGE_KEY, this.currentBalance);
  }
}

// Singleton instance to be used across the game
export const balance = new Balance();
