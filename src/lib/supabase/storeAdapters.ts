import type { WorkspaceModule } from "./workspaceData";
import { useTaskStore } from "../../stores/useTaskStore";
import { useRecordStore } from "../../stores/useRecordStore";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { useFinanceStore } from "../../stores/useFinanceStore";
import { useHabitStore } from "../../stores/useHabitStore";
import { useRoutineStore } from "../../stores/useRoutineStore";
import { useEventStore } from "../../stores/useEventStore";
import { useInboxStore } from "../../stores/useInboxStore";

export interface StoreAdapter {
  module: WorkspaceModule;
  read: () => Record<string, unknown>;
  apply: (payload: Record<string, unknown>) => void;
  subscribe: (listener: () => void) => () => void;
}

function adapter(
  module: WorkspaceModule,
  store: { getState: () => Record<string, unknown>; setState: (state: Record<string, unknown>) => void; subscribe: (listener: () => void) => () => void },
  keys: string[],
): StoreAdapter {
  return {
    module,
    read: () => Object.fromEntries(keys.map((key) => [key, store.getState()[key]])),
    apply: (payload) => store.setState(Object.fromEntries(keys.filter((key) => key in payload).map((key) => [key, payload[key]]))),
    subscribe: (listener) => store.subscribe(listener),
  };
}

// Os casts ficam isolados aqui porque as stores também contêm funções,
// enquanto a nuvem recebe apenas os dados serializáveis de cada módulo.
const asStore = (store: unknown) => store as Parameters<typeof adapter>[1];

export const storeAdapters: StoreAdapter[] = [
  adapter("tasks", asStore(useTaskStore), ["tasks"]),
  adapter("records", asStore(useRecordStore), ["records"]),
  adapter("inventory", asStore(useInventoryStore), ["inventory"]),
  adapter("finance", asStore(useFinanceStore), ["bills", "entries", "accounts", "cards"]),
  adapter("habits", asStore(useHabitStore), ["habits"]),
  adapter("routines", asStore(useRoutineStore), ["routines"]),
  adapter("events", asStore(useEventStore), ["events"]),
  adapter("inbox", asStore(useInboxStore), ["items"]),
];
