import { useFinanceStore } from '../src/stores/useFinanceStore.ts';
import { useTaskStore } from '../src/stores/useTaskStore.ts';
import { useRecordStore } from '../src/stores/useRecordStore.ts';
import { useInventoryStore } from '../src/stores/useInventoryStore.ts';
import { useHabitStore } from '../src/stores/useHabitStore.ts';
import { useRoutineStore } from '../src/stores/useRoutineStore.ts';
import { useEventStore } from '../src/stores/useEventStore.ts';
import { useInboxStore } from '../src/stores/useInboxStore.ts';

const assert = (ok: unknown, message: string) => { if (!ok) throw new Error(message); console.log('PASS', message); };

const finance = useFinanceStore.getState();
const accountA = { id:'test-a', name:'Teste A', kind:'Conta', balance:1000, role:'available' as const };
const accountB = { id:'test-b', name:'Teste B', kind:'Investimento', balance:0, role:'investment' as const };
finance.addAccount(accountA); finance.addAccount(accountB);
finance.addEntry({id:'salary-test',title:'Salário teste',amount:2000,date:'2026-09-01',type:'income',category:'Salário',toAccountId:'test-a'});
assert(useFinanceStore.getState().entries.some(e=>e.id==='salary-test'),'adiciona entrada financeira');
finance.removeEntry('salary-test');
assert(!useFinanceStore.getState().entries.some(e=>e.id==='salary-test'),'exclui salário/entrada financeira');
finance.addEntry({id:'transfer-test',title:'Guardar',amount:300,date:'2026-09-02',type:'transfer',category:'Transferência',method:'transfer',fromAccountId:'test-a',toAccountId:'test-b'});
assert(useFinanceStore.getState().entries.some(e=>e.id==='transfer-test'),'adiciona transferência');
finance.removeEntry('transfer-test'); finance.removeAccount('test-a'); finance.removeAccount('test-b');
assert(!useFinanceStore.getState().accounts.some(a=>a.id==='test-a'),'exclui conta financeira');

const tasks = useTaskStore.getState();
tasks.addTask({id:'task-test',title:'Teste',area:'work',priority:'normal',status:'todo',createdAt:new Date().toISOString()});
tasks.setTaskStatus('task-test','doing'); assert(useTaskStore.getState().tasks.find(t=>t.id==='task-test')?.status==='doing','altera status de tarefa');
tasks.toggleTask('task-test'); assert(useTaskStore.getState().tasks.find(t=>t.id==='task-test')?.status==='completed','conclui tarefa');
tasks.toggleTask('task-test'); assert(useTaskStore.getState().tasks.find(t=>t.id==='task-test')?.status==='doing','reabre no status anterior'); tasks.removeTask('task-test');

const records=useRecordStore.getState(); records.addRecord({id:'project-test',area:'work',category:'Obra',title:'Projeto teste',details:'',completed:false,createdAt:new Date().toISOString()}); records.updateRecord('project-test',{title:'Projeto editado'}); assert(useRecordStore.getState().records.find(r=>r.id==='project-test')?.title==='Projeto editado','edita projeto'); records.removeRecord('project-test');
const inv=useInventoryStore.getState(); inv.addItem({id:'inv-test',product:'Teste',brand:'Marca',quantity:2,minimumStock:1}); inv.decreaseQuantity('inv-test'); assert(useInventoryStore.getState().inventory.find(i=>i.id==='inv-test')?.quantity===1,'ajusta estoque'); inv.updateMinimumStock('inv-test',2); assert(useInventoryStore.getState().inventory.find(i=>i.id==='inv-test')?.minimumStock===2,'atualiza estoque mínimo'); inv.removeItem('inv-test');
const habits=useHabitStore.getState(); habits.addHabit({id:'habit-test',title:'Teste',frequency:'Diário',history:[]}); habits.toggleDate('habit-test','2026-09-21'); assert(useHabitStore.getState().habits.find(h=>h.id==='habit-test')?.history.includes('2026-09-21'),'marca hábito'); habits.removeHabit('habit-test');
const routines=useRoutineStore.getState(); routines.addRoutine({id:'routine-test',title:'Teste',moment:'Manhã',active:true,steps:[],completions:{}}); routines.addStep('routine-test',{id:'step-test',text:'Etapa'}); routines.toggleStep('routine-test','step-test','2026-09-21'); assert(useRoutineStore.getState().routines.find(r=>r.id==='routine-test')?.completions['2026-09-21'].includes('step-test'),'marca etapa da rotina'); routines.removeRoutine('routine-test');
const events=useEventStore.getState(); events.addEvent({id:'event-test',title:'Teste',date:'2026-09-21',area:'personal'}); events.updateEvent('event-test',{title:'Editado'}); assert(useEventStore.getState().events.find(e=>e.id==='event-test')?.title==='Editado','edita compromisso'); events.removeEvent('event-test');
const inbox=useInboxStore.getState(); inbox.addItem('Teste inbox'); const item=useInboxStore.getState().items.at(-1); assert(item?.text==='Teste inbox','captura caixa de entrada'); if(item) inbox.removeItem(item.id);
console.log('ALL STORE TESTS PASSED');
