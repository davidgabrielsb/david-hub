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
put('david-hub-tasks', { tasks: [{ id: 'task', title: 'Tarefa de teste', projectId: 'project', area: 'work', priority: 'normal', status: 'todo', createdAt: '2026-10-20' }] });

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
