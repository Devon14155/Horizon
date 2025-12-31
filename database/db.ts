import Dexie, { type Table } from 'dexie';
import { ResearchSession } from '../types';

// Using a direct instance avoids TypeScript issues with extending the Dexie class
// where base methods like 'version' might not be recognized on the subclass type.
const dbInstance = new Dexie('HorizonDB');

dbInstance.version(1).stores({
  sessions: 'id, title, createdAt, updatedAt, isArchived'
});

export type HorizonDatabase = Dexie & {
  sessions: Table<ResearchSession>;
};

export const db = dbInstance as HorizonDatabase;