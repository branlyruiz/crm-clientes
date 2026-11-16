import {useEffect,useLayoutEffect,useState} from 'react';

export const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.reduce==='true';
export type Appearance='system'|'light'|'dark';
export function usePreferences(){
 const read=(key:string)=>{try{return localStorage.getItem(key);}catch{return null;}};
 const [appearance,setAppearance]=useState<Appearance>(()=>{const v=read('br-clientes-appearance');return v==='dark'||v==='light'?v:'system';});
 const [reduce,setReduce]=useState(()=>read('br-clientes-reduce-motion')==='true');
 useLayoutEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)');const apply=()=>{const dark=appearance==='dark'||appearance==='system'&&media.matches;document.documentElement.dataset.theme=dark?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#141e19':'#f5f6f2');};apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[appearance]);
 useLayoutEffect(()=>{document.documentElement.dataset.reduce=String(reduce);if(reduce)document.getAnimations().forEach(a=>a.cancel());},[reduce]);
 return {appearance,reduce,chooseAppearance:(value:Appearance)=>{setAppearance(value);try{localStorage.setItem('br-clientes-appearance',value);}catch{}},chooseReduce:(value:boolean)=>{setReduce(value);try{localStorage.setItem('br-clientes-reduce-motion',String(value));}catch{}}};
}
export function animateView(root:HTMLElement,direction:number){
 if(reducedMotion())return ()=>{};
 const rows=[...root.querySelectorAll<HTMLElement>('.client-panel,.receivable-row')].filter(el=>{const r=el.getBoundingClientRect();return r.height>0&&r.bottom>0&&r.top<innerHeight;});
 // Cards OR the empty screen move, never both nested surfaces.
 const targets=rows.length?rows:[root];
 const animations=targets.map((el,i)=>el.animate([{opacity:.5,transform:`translateX(${direction*12}px)`},{opacity:1,transform:'translateX(0)'}],{duration:260,easing:'ease-out',delay:Math.min(i*24,120),fill:'backwards'}));
 const cancel=()=>animations.forEach(a=>a.cancel());
 const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',cancel);
 return ()=>{cancel();media.removeEventListener('change',cancel);};
}
export function useUnsaved(dirty:boolean){
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
}
