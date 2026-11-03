import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyClient,clientSchema,sortClients,summary,balance,daysUntil} from '../src/crm.ts';
const c=(over={})=>({...emptyClient(),name:'Ana',service:'Boda',...over});
test('COP balances include initial and new payments; rejects overpayments',()=>{
  const a=c({total:800000,initialPaid:300000,payments:[{id:'p1',amount:200000,date:'2026-11-03',note:''}]});
  assert.equal(balance(a),300000);assert.equal(clientSchema.safeParse(a).success,true);
  assert.equal(clientSchema.safeParse({...a,total:100000}).success,false);
});
test('automatic hierarchy and dates; dates without value remain last in either direction',()=>{
  const a=c({id:'a',state:'Confirmado',date:'2026-11-07'}),b=c({id:'b',state:'Pendiente',date:''}),d=c({id:'d',state:'En Edición',date:'2026-10-29'});
  assert.deepEqual(sortClients([a,b,d],'auto').map(c=>c.id),['b','d','a']);
  assert.deepEqual(sortClients([a,b,d],'date',true).map(c=>c.id),['a','d','b']);
});
test('cancelled and archived records do not inflate active balance or agenda',()=>{
 const s=summary([c({total:1000,initialPaid:400,date:'2026-11-07',state:'Confirmado'}),c({total:2000,state:'Cancelado'}),c({total:3000,archived:true})],'2026-11-03');
 assert.equal(s.balance,600);assert.equal(s.total,1000);assert.equal(s.upcoming,1);
});
test('countdown crosses month and year correctly',()=>{assert.equal(daysUntil('2027-01-01','2026-12-31'),1);assert.equal(daysUntil('2026-11-01','2026-11-03'),-2);assert.equal(daysUntil(''),null);});
test('invalid amounts, dates and HTML are handled as data',()=>{
 assert.equal(clientSchema.safeParse(c({total:-1})).success,false);
 assert.equal(clientSchema.safeParse(c({date:'2026-02-31'})).success,false);
 assert.equal(clientSchema.parse(c({name:'<script>alert(1)</script>'})).name,'<script>alert(1)</script>');
});
