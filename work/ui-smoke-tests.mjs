import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

const data = new Map();
const put = (key, state, version = 1) => data.set(key, JSON.stringify({ state, version }));
globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
globalThis.window = { localStorage, addEventListener() {} };
globalThis.document = { documentElement: { dataset: {}, style: {} } };
put('david-hub-inbox', { items: [{ id: 'z', text: 'Zulu', createdAt: '2026-10-20' }, { id: 'a', text: 'Árvore', createdAt: '2026-10-20' }] });
put('david-hub-organization', { lists: { 'inbox:items': { mode: 'az', ids: [] } } });
put('david-hub-records', { records: [{ id: 'project', title: 'Projeto de teste', area: 'work', category: 'Obra', details: 'Duas linhas\nPreservadas', completed: false, createdAt: '2026-10-20' }] });
put('david-hub-tasks', { tasks: [{ id: 'task', title: 'Tarefa de teste', projectId: 'project', area: 'work', priority: 'normal', status: 'todo', plannedToday: true, createdAt: '2026-10-20' }] });

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error', envFile: false,
  define: { 'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""' },
});
const originalUseSyncExternalStore = React.useSyncExternalStore;
// Render the hydrated client snapshot in a Node-only smoke test.
React.useSyncExternalStore = (subscribe, getSnapshot) => originalUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
try {
  for (const name of ['Inbox', 'Tasks', 'Records', 'Habits', 'Routines', 'Calendar', 'Inventory', 'Finance', 'Sites', 'Dashboard', 'Search', 'Settings', 'Review']) {
    const module = await server.ssrLoadModule(`/src/pages/${name}Page.tsx`);
    const markup = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(module[`${name}Page`], name === 'Records' ? { area: 'work' } : {})));
    assert(markup.includes('<section'), `${name} page renders`);
    if (name === 'Inbox') {
      assert(markup.indexOf('<strong class="preserve-lines">Árvore') < markup.indexOf('<strong class="preserve-lines">Zulu'), markup);
      assert(markup.includes('Mover Zulu para cima') && markup.includes('draggable="true"'));
      assert(markup.includes('Editar'));
    }
    if (name === 'Records') assert(markup.includes('tarefas do projeto') && markup.includes('Projeto de teste'));
    console.log(`PASS render ${name}`);
  }
  const { DashboardPage } = await server.ssrLoadModule('/src/pages/DashboardPage.tsx');
  const { useTaskStore } = await server.ssrLoadModule('/src/stores/useTaskStore.ts');
  const renderDashboard = () => renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(DashboardPage)));
  assert(renderDashboard().includes('Tarefa de teste'), 'open planned task appears in Meu dia');
  useTaskStore.getState().toggleTask('task');
  const completedDashboard = renderDashboard();
  assert(!completedDashboard.includes('Tarefa de teste') && completedDashboard.includes('Nenhuma tarefa para hoje.'), 'completed task leaves Meu dia immediately');
  assert.equal(useTaskStore.getState().tasks.find((task) => task.id === 'task').status, 'completed', 'task is retained in Concluídas');
  assert(completedDashboard.includes('Meu dia • 1/1'), 'daily progress is preserved');
  useTaskStore.getState().toggleTask('task');
  assert(renderDashboard().includes('Tarefa de teste'), 'reopened task returns to Meu dia');
  console.log('PASS complete Meu dia task, retain completed record and progress, reopen task');
  const { CalendarPage } = await server.ssrLoadModule('/src/pages/CalendarPage.tsx');
  const { useEventStore } = await server.ssrLoadModule('/src/stores/useEventStore.ts');
  const { useFinanceStore } = await server.ssrLoadModule('/src/stores/useFinanceStore.ts');
  const { useInventoryStore } = await server.ssrLoadModule('/src/stores/useInventoryStore.ts');
  const { localDate } = await server.ssrLoadModule('/src/utils/calendar.ts');
  const today = localDate();
  for (const area of ['work', 'study', 'personal']) {
    useTaskStore.getState().addTask({ id: `filter-${area}`, title: `Tarefa-filtro-${area}`, area, priority: 'high', status: 'todo', deadline: today, plannedToday: true, createdAt: today });
    useEventStore.getState().addEvent({ id: `event-${area}`, title: `Evento-filtro-${area}`, area, date: today });
  }
  useFinanceStore.getState().addBill({ id: 'filter-bill', title: 'Conta-pessoal-filtro', amount: 10, dueDate: today, paid: false });
  useInventoryStore.getState().addItem({ id: 'filter-stock', product: 'Estoque-trabalho-filtro', brand: 'Teste', quantity: 0, minimumStock: 1 });
  const beforeFilter = JSON.stringify(useTaskStore.getState().tasks);
  for (const selected of ['all', 'work', 'study', 'personal']) {
    const renderFiltered = (Page) => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [selected === 'all' ? '/' : `/?area=${selected}`] }, React.createElement(Page)));
    const dashboard = renderFiltered(DashboardPage);
    const calendar = renderFiltered(CalendarPage);
    assert(dashboard.includes('Filtrar por área da vida') && calendar.includes('Filtrar por área da vida'));
    for (const area of ['work', 'study', 'personal']) {
      const expected = selected === 'all' || selected === area;
      assert.equal(dashboard.includes(`Tarefa-filtro-${area}`), expected, `Dashboard ${selected}: ${area}`);
      assert.equal(calendar.includes(`Tarefa-filtro-${area}`), expected, `Calendar tasks ${selected}: ${area}`);
      assert.equal(calendar.includes(`Evento-filtro-${area}`), expected, `Calendar events ${selected}: ${area}`);
    }
    assert.equal(dashboard.includes('Estoque-trabalho-filtro'), selected === 'all' || selected === 'work');
    assert.equal(dashboard.includes('Conta-pessoal-filtro'), selected === 'all' || selected === 'personal');
    assert.equal(calendar.includes('Conta-pessoal-filtro'), selected === 'all' || selected === 'personal');
  }
  assert.equal(JSON.stringify(useTaskStore.getState().tasks), beforeFilter, 'area filtering never changes task data');
  console.log('PASS all life-area filters on Dashboard and Calendar, task/event visibility, work stock, personal bills, no data mutation');
  const { EntityEditor } = await server.ssrLoadModule('/src/components/EntityEditor.tsx');
  const editor = renderToStaticMarkup(React.createElement(EntityEditor, { title: 'Editar projeto', initial: { title: 'Nome', details: 'Linha 1\nLinha 2', dueDate: '2026-10-21' }, fields: [{ name: 'title', label: 'Nome', required: true }, { name: 'details', label: 'Detalhes', type: 'textarea' }, { name: 'dueDate', label: 'Prazo', type: 'date' }], onSave() {}, onClose() {} }));
  assert(editor.includes('role=') || editor.includes('<dialog'));
  assert(editor.includes('Linha 1\nLinha 2') && editor.includes('type="date"') && editor.includes('Salvar alterações') && editor.includes('Cancelar'));
  const { storeAdapters } = await server.ssrLoadModule('/src/lib/supabase/storeAdapters.ts');
  const { useListOrganizationStore } = await server.ssrLoadModule('/src/stores/useListOrganizationStore.ts');
  const inbox = storeAdapters.find((adapter) => adapter.module === 'inbox');
  let notified = 0;
  const stop = inbox.subscribe(() => notified++);
  useListOrganizationStore.getState().save('inbox:items', { mode: 'manual', ids: ['z', 'a'] });
  assert.equal(notified, 1);
  assert.deepEqual(inbox.read()._organization['inbox:items'].ids, ['z', 'a']);
  inbox.apply({ _organization: { 'inbox:items': { mode: 'za', ids: [] }, 'finance:accounts': { mode: 'az', ids: [] } } });
  assert.equal(useListOrganizationStore.getState().lists['inbox:items'].mode, 'za');
  assert.equal(useListOrganizationStore.getState().lists['finance:accounts'], undefined, 'remote module cannot overwrite a different module');
  inbox.apply({ items: [] });
  assert.equal(useListOrganizationStore.getState().lists['inbox:items'].mode, 'za', 'older cloud payloads retain local order');
  stop();
  console.log('PASS full editor render, cloud sync notifications, module isolation, compatibility with older payloads');
} finally { React.useSyncExternalStore = originalUseSyncExternalStore; await server.close(); }
