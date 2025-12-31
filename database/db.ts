import Dexie, { Table } from 'dexie';
import { ResearchSession } from '../types';

class HorizonDatabase extends Dexie {
  sessions!: Table<ResearchSession>;

  constructor() {
    super('HorizonDB');
    this.version(1).stores({
      sessions: 'id, title, createdAt, updatedAt, isArchived'
    });
  }
}

export const db = new HorizonDatabase();