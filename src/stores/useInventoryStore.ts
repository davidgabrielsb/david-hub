import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { InventoryItem } from "../features/inventory/types";

interface InventoryStore {
  inventory: InventoryItem[];

  addItem: (item: InventoryItem) => void;

  removeItem: (id: string) => void;

  updateQuantity: (
    id: string,
    quantity: number,
  ) => void;

  updateMinimumStock: (id: string, minimumStock: number) => void;
  updateItem: (id: string, values: Partial<Omit<InventoryItem, "id">>) => void;

  increaseQuantity: (id: string) => void;

  decreaseQuantity: (id: string) => void;
}

export const useInventoryStore =
  create<InventoryStore>()(persist((set) => ({
    inventory: [
      {
        id: "inventory-1",
        product: "Disjuntor 32A",
        brand: "Schneider",
        quantity: 12,
      },
      {
        id: "inventory-2",
        product: "DPS Classe II",
        brand: "WEG",
        quantity: 6,
      },
    ],

    addItem: (item) =>
      set((state) => ({
        inventory: [
          ...state.inventory,
          item,
        ],
      })),

    removeItem: (id) =>
      set((state) => ({
        inventory:
          state.inventory.filter(
            (item) => item.id !== id,
          ),
      })),

    /*
     * Usado quando digitamos a quantidade manualmente.
     *
     * Exemplo:
     * 12 → 150
     */
    updateQuantity: (
      id,
      quantity,
    ) => {
      if (!Number.isFinite(quantity)) {
        return;
      }

      const safeQuantity =
        Math.max(
          0,
          Math.floor(quantity),
        );

      set((state) => ({
        inventory:
          state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: safeQuantity,
                }
              : item,
          ),
      }));
    },

    updateMinimumStock: (id, minimumStock) => {
      if (!Number.isInteger(minimumStock) || minimumStock < 0) return;

      set((state) => ({
        inventory: state.inventory.map((item) =>
          item.id === id ? { ...item, minimumStock } : item,
        ),
      }));
    },
    updateItem: (id, values) => set((state) => ({ inventory: state.inventory.map((item) => item.id === id ? { ...item, ...values } : item) })),

    /*
     * Botão +
     */
    increaseQuantity: (id) =>
      set((state) => ({
        inventory:
          state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity:
                    item.quantity + 1,
                }
              : item,
          ),
      })),

    /*
     * Botão -
     *
     * Nunca permite estoque negativo.
     */
    decreaseQuantity: (id) =>
      set((state) => ({
        inventory:
          state.inventory.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity:
                    Math.max(
                      0,
                      item.quantity - 1,
                    ),
                }
              : item,
          ),
      })),
  }), { name: "david-hub-inventory", version: 1 }));
