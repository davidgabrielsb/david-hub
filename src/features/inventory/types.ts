export interface InventoryItem {
  id: string;

  product: string;

  brand: string;

  quantity: number;

  minimumStock?: number;

  idealStock?: number;

  unit?: string;

  location?: string;

  supplier?: string;
}