import {test} from 'node:test';
import assert from 'node:assert/strict';
import {animateView,reducedMotion} from '../src/ui.ts';
function environment(reduce=false){
 const events=new Map();globalThis.matchMedia=()=>({matches:reduce,addEventListener:(n,f)=>events.set(n,f),removeEventListener:(n)=>events.delete(n)});
 globalThis.document={documentElement:{dataset:{}}};globalThis.innerHeight=800;
 const calls=[];const row=(top,height=90)=>({getBoundingClientRect:()=>({top,bottom:top+height,height}),animate:(frames,options)=>{const call={frames,options,cancelled:false};calls.push(call);return {cancel:()=>call.cancelled=true};}});
 return {calls,row,events};
}
test('list motion uses visual order, bounded stagger, and excludes offscreen rows',()=>{
 const {calls,row}=environment();const root=row(0);root.querySelectorAll=()=>[row(-100),...Array.from({length:8},(_,i)=>row(i*90)),row(850)];
 const stop=animateView(root,-1);assert.equal(calls.length,8);
 assert.deepEqual(calls.map(c=>c.options.delay),[0,24,48,72,96,120,120,120]);
 for(const c of calls){assert.equal(c.options.duration,260);assert.equal(c.options.easing,'ease-out');assert.equal(c.frames[0].opacity,.5);assert.equal(c.frames[0].transform,'translateX(-12px)');assert.equal(c.frames[1].opacity,1);}
 stop();assert.ok(calls.every(c=>c.cancelled));
});
test('empty views animate once; reduced motion never starts entrance animations',()=>{
 const {calls,row}=environment();const root=row(0);root.querySelectorAll=()=>[];animateView(root,1)();assert.equal(calls.length,1);
 document.documentElement.dataset.reduce='true';assert.ok(reducedMotion());animateView(root,1)();assert.equal(calls.length,1);
 const reduced=environment(true);const other=reduced.row(0);other.querySelectorAll=()=>[];animateView(other,1)();assert.equal(reduced.calls.length,0);
});
test('changing OS motion preference cancels pending and running navigation',()=>{
 const {calls,row,events}=environment();const root=row(0);root.querySelectorAll=()=>[row(0),row(100)];const stop=animateView(root,1);events.get('change')();assert.ok(calls.every(c=>c.cancelled));stop();assert.equal(events.size,0);
});
