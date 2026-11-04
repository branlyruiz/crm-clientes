import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyClient,sortByEventProximity,monthDays,shiftMonth,isUpcoming,summary,registerPayment,balance} from '../src/crm.ts';
import {createClientStore} from '../src/storage.ts';
const c=(id,over={})=>({...emptyClient(),id,name:id,service:'Evento',...over});
test('home prioritizes next events by date and time across states, ignoring contact dates',()=>{
 const rows=[c('later',{date:'2026-11-12',state:'Pendiente',nextContact:'2026-11-01'}),c('today-late',{date:'2026-11-04',time:'18:00',state:'En Edición'}),c('today-early',{date:'2026-11-04',time:'09:00',state:'Confirmado'}),c('today-no-time',{date:'2026-11-04'})];
 assert.deepEqual(sortByEventProximity(rows,'2026-11-04').map(r=>r.id),['today-early','today-late','today-no-time','later']);
 assert.equal(rows[0].id,'later');
});
test('past events and undated clients remain accessible after upcoming events',()=>{
 const rows=[c('undated'),c('old',{date:'2025-01-01'}),c('recent',{date:'2026-11-03'}),c('next',{date:'2026-11-07'})];
 assert.deepEqual(sortByEventProximity(rows,'2026-11-04').map(r=>r.id),['next','recent','old','undated']);
});
test('calendar starts on Monday and includes all days in leap February and year boundaries',()=>{
 const days=monthDays('2024-02');assert.equal(new Date(days[0]+'T12:00Z').getUTCDay(),1);
 assert.equal(days.filter(d=>d.startsWith('2024-02')).length,29);assert.equal(days.length%7,0);assert.equal(new Set(days).size,days.length);
 assert.equal(shiftMonth('2026-12',1),'2027-01');assert.equal(shiftMonth('2026-01',-1),'2025-12');
 assert.equal(monthDays('2026-11')[0],'2026-10-26');assert.equal(monthDays('2026-11').at(-1),'2026-12-06');
});
test('agenda totals and upcoming list share the same eligibility',()=>{
 const rows=[c('today',{date:'2026-11-04'}),c('editing',{date:'2026-11-05',state:'En Edición'}),c('cancelled',{date:'2026-11-05',state:'Cancelado'}),c('archived',{date:'2026-11-05',archived:true}),c('done',{date:'2026-11-05',state:'Terminado'}),c('past',{date:'2026-11-03'})];
 assert.deepEqual(rows.filter(r=>isUpcoming(r,'2026-11-04')).map(r=>r.id),['today','editing']);
 assert.equal(summary(rows,'2026-11-04').upcoming,2);
});
test('direct payment persists amount and history together and complete payment clears the balance',()=>{
 const values=new Map(),store=createClientStore({getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)});
 const saved=store.save(c('pay',{total:300000,initialPaid:50000}));
 const partial=store.save(registerPayment(saved,{amount:100000,date:'2026-11-04',note:'Transferencia'}));
 assert.equal(balance(partial),150000);assert.equal(partial.payments.length,1);assert.equal(partial.history.length,1);assert.equal(saved.payments.length,0);
 const full=store.save(registerPayment(partial,{amount:150000,date:'2026-11-04',note:''}));
 assert.equal(balance(full),0);assert.equal(balance(store.list()[0]),0);assert.equal(full.archived,false);
});
test('invalid direct payments and concurrent stale payments cannot change stored balance',()=>{
 const values=new Map(),store=createClientStore({getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)});
 const saved=store.save(c('pay',{total:100000}));
 for(const amount of [0,-1,.5,NaN,100001])assert.throws(()=>registerPayment(saved,{amount,date:'2026-11-04',note:''}));
 assert.throws(()=>registerPayment(saved,{amount:50000,date:'2026-02-31',note:''}));
 store.save(registerPayment(saved,{amount:50000,date:'2026-11-04',note:''}));
 assert.throws(()=>store.save(registerPayment(saved,{amount:10000,date:'2026-11-04',note:''})),/otra pestaña/);
 assert.equal(balance(store.list()[0]),50000);assert.equal(store.list()[0].payments.length,1);
});
