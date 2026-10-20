// Isolated storage: these tests never read or write the user's Hub data.
const data = new Map();
Object.defineProperty(globalThis, "localStorage", { value: { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) }, configurable: true });
globalThis.window = { localStorage: globalThis.localStorage };
await import('./store-tests.ts');
const { useTaskStore } = await import('../src/stores/useTaskStore.ts');
const { useRoutineStore } = await import('../src/stores/useRoutineStore.ts');
const { localDate, createCalendarMonth } = await import('../src/utils/calendar.ts');
const assert = (value, message) => { if (!value) throw new Error(message); console.log('PASS', message); };
const task = { id:'edit-test', title:'Original', area:'work', priority:'normal', status:'todo', createdAt:'2026-10-20' };
useTaskStore.getState().addTask(task);
useTaskStore.getState().updateTask(task.id, {title:'Editada', area:'study', priority:'urgent', description:'Detalhes', deadline:'2026-10-21', time:'14:30'});
assert(useTaskStore.getState().tasks.find(t=>t.id===task.id)?.time==='14:30','edição completa da tarefa');
useTaskStore.getState().updateTask(task.id, {deadline:undefined, time:undefined});
assert(!useTaskStore.getState().tasks.find(t=>t.id===task.id)?.deadline,'remove prazo');
await useTaskStore.persist.rehydrate();
assert(useTaskStore.getState().tasks.some(t=>t.title==='Editada'),'persistência e restauração de tarefas');
const routine = {id:'remove-step',title:'Teste',moment:'Manhã',active:true,steps:[{id:'a',text:'A'},{id:'b',text:'B'}],completions:{'2026-10-20':['a','b']}};
useRoutineStore.getState().addRoutine(routine);
useRoutineStore.getState().removeStep(routine.id,'a');
assert(useRoutineStore.getState().routines.find(r=>r.id===routine.id).completions['2026-10-20'].join()==='b','remoção da etapa limpa progresso histórico');
assert(localDate(new Date(2026,9,20,23,30))==='2026-10-20','data respeita fuso local à noite');
assert(createCalendarMonth(2026,9).length===42,'calendário tem seis semanas');
console.log('ALL REGRESSION TESTS PASSED');
const { calculateBalance } = await import('../src/features/finance.ts');
assert(calculateBalance({id:'a',name:'A',kind:'Conta',balance:100}, [{id:'future',title:'Futuro',date:'2099-01-01',amount:500,type:'income',category:'Geral',toAccountId:'a'}])===100,'entrada futura não altera saldo atual');
assert(calculateBalance({id:'a',name:'A',kind:'Conta',balance:100}, [{id:'future',title:'Futuro',date:'2099-01-01',amount:50,type:'expense',category:'Geral',fromAccountId:'a',method:'pix'}])===100,'saída futura não altera saldo atual');
const { releaseConfig } = await import('../scripts/prepare-release.mjs');
const config = releaseConfig({repository:'example/david-hub',publicKey:'test-public-key',version:'0.2.12'});
assert(config.version==='0.2.12' && config.bundle.createUpdaterArtifacts,'publicação usa versão única e exige assinatura');
assert(config.plugins.updater.endpoints[0]==='https://github.com/example/david-hub/releases/latest/download/latest.json','canal fixo de atualizações');
for (const bad of [{repository:'',publicKey:'key',version:'0.2.1'},{repository:'example/hub',publicKey:'',version:'0.2.1'},{repository:'example/hub',publicKey:'key',version:'invalid'}]) {
  let rejected = false;
  try { releaseConfig(bad); } catch { rejected = true; }
  assert(rejected,'publicação rejeita configuração incompleta');
}
