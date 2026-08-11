import { promises as fs } from "fs";
import path from "path";
import { mockEvents, mockResults, mockProducts } from "./mock-data";
import type { Product, RaceResult, SwimEvent } from "./types";

export interface DataStore {
  events: SwimEvent[];
  results: RaceResult[];
  products: Product[];
}

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

async function ensureStore(): Promise<DataStore> {
  const initial: DataStore = {
    events: mockEvents,
    results: mockResults,
    products: mockProducts,
  };

  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as DataStore;
  } catch {
    try {
      await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
      await fs.writeFile(STORE_PATH, JSON.stringify(initial, null, 2), "utf-8");
    } catch {
      // Read-only env (e.g. Vercel) — use seeded mock data in memory
    }
    return initial;
  }
}

async function writeStore(data: DataStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getStore(): Promise<DataStore> {
  return ensureStore();
}

export async function getEvents(): Promise<SwimEvent[]> {
  const store = await ensureStore();
  return store.events;
}

export async function getResults(): Promise<RaceResult[]> {
  const store = await ensureStore();
  return store.results;
}

export async function getProducts(): Promise<Product[]> {
  const store = await ensureStore();
  return store.products;
}

export async function saveEvents(events: SwimEvent[]): Promise<SwimEvent[]> {
  const store = await ensureStore();
  store.events = events;
  await writeStore(store);
  return events;
}

export async function saveResults(results: RaceResult[]): Promise<RaceResult[]> {
  const store = await ensureStore();
  store.results = results;
  await writeStore(store);
  return results;
}

export async function saveProducts(products: Product[]): Promise<Product[]> {
  const store = await ensureStore();
  store.products = products;
  await writeStore(store);
  return products;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
