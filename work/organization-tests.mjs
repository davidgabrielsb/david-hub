import assert from 'node:assert/strict';
import { organizeItems, mergeVisibleOrder, moveItem } from '../src/utils/listOrganization.ts';

const items = [{ id: 'z', title: 'Zulu' }, { id: 'a', title: 'Árvore' }, { id: 'b', title: 'banana' }];
const ids = (values) => values.map((item) => item.id);
assert.deepEqual(ids(organizeItems(items, (item) => item.title, { mode: 'az', ids: [] })), ['a', 'b', 'z']);
assert.deepEqual(ids(organizeItems(items, (item) => item.title, { mode: 'za', ids: [] })), ['z', 'b', 'a']);
assert.deepEqual(ids(items), ['z', 'a', 'b'], 'sorting never mutates source data');
assert.deepEqual(moveItem(['a', 'b', 'c'], 'c', 'a'), ['c', 'a', 'b'], 'last item can move to the top');
assert.deepEqual(moveItem(['a', 'b', 'c'], 'a', 'b', true), ['b', 'a', 'c'], 'move down respects target position');
assert.deepEqual(moveItem(['a', 'b'], 'foreign', 'a'), ['a', 'b'], 'foreign drops cannot remove items');
assert.deepEqual(mergeVisibleOrder(['a', 'hidden', 'b', 'c'], ['c', 'a', 'b']), ['c', 'hidden', 'a', 'b'], 'filtered items retain their slots');
assert.deepEqual(ids(organizeItems([...items, { id: 'new', title: 'Novo' }], (item) => item.title, { mode: 'manual', ids: ['b', 'a', 'z'] })), ['b', 'a', 'z', 'new']);
assert.deepEqual(ids(organizeItems(items.filter((item) => item.id !== 'a'), (item) => item.title, { mode: 'manual', ids: ['a', 'b', 'z'] })), ['b', 'z'], 'deleted ids do not create phantom items');
console.log('PASS alphabetical order, accents, manual movement, filters, new and deleted items');

// Use a private, in-memory storage. Never access the user's real data.
const data = new Map();
globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
globalThis.window = { localStorage, addEventListener() {} };
globalThis.document = { documentElement: { dataset: {}, style: {} } };

const { useInboxStore } = await import('../src/stores/useInboxStore.ts');
useInboxStore.getState().addItem('Original');
const original = useInboxStore.getState().items[0];
useInboxStore.getState().updateItem(original.id, '  Editada\nSegunda linha  ');
assert.deepEqual(useInboxStore.getState().items[0], { ...original, text: 'Editada\nSegunda linha' });
useInboxStore.getState().updateItem(original.id, ' ');
assert.equal(useInboxStore.getState().items[0].text, 'Editada\nSegunda linha');
await useInboxStore.persist.rehydrate();
assert.equal(useInboxStore.getState().items[0].text, 'Editada\nSegunda linha');
const { useFinanceStore } = await import('../src/stores/useFinanceStore.ts');
useFinanceStore.getState().editAccount('cash', { name: 'Carteira pessoal', balance: 123.45, purpose: 'Dia a dia' });
assert.equal(useFinanceStore.getState().accounts.find((account) => account.id === 'cash').name, 'Carteira pessoal');
assert.equal(useFinanceStore.getState().accounts.find((account) => account.id === 'cash').balance, 123.45);
const { useListOrganizationStore } = await import('../src/stores/useListOrganizationStore.ts');
useListOrganizationStore.getState().save('inbox:items', { mode: 'manual', ids: ['b', 'a'] });
await useListOrganizationStore.persist.rehydrate();
assert.deepEqual(useListOrganizationStore.getState().lists['inbox:items'], { mode: 'manual', ids: ['b', 'a'] });
console.log('PASS inbox editing preserves id/date, rejects blank text, persists edits; account editing; saved manual order');
