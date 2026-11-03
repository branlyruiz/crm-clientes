import {clientSchema,type RecordClient} from './crm.ts';
export const DATA_KEY='br-clientes-records-v1';
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
function read(storage:StorageLike):RecordClient[]{
 const raw=storage.getItem(DATA_KEY);if(!raw)return [];
 let state:any;try{state=JSON.parse(raw);}catch{throw Error('No se pudo leer el respaldo local. Conserva los datos del navegador e importa un respaldo válido.');}
 if(state.version!==1||!Array.isArray(state.clients))throw Error('El formato de los datos locales no es compatible.');
 return state.clients.map((c:any)=>({...clientSchema.parse(c),revision:Number.isSafeInteger(c.revision)&&c.revision>0?c.revision:1,updatedAt:typeof c.updatedAt==='string'?c.updatedAt:new Date().toISOString()}));
}
function write(storage:StorageLike,clients:RecordClient[]){try{storage.setItem(DATA_KEY,JSON.stringify({version:1,clients}));}catch{throw Error('No se pudo guardar en este dispositivo. Libera espacio o exporta un respaldo.');}}
export function createClientStore(storage:StorageLike){return {
 list:()=>read(storage),
 save(input:RecordClient){
  const c=clientSchema.parse(input),rows=read(storage),current=rows.find(r=>r.id===c.id);
  if(current&&input.revision!==current.revision)throw Error('Este cliente cambió en otra pestaña. Actualiza antes de guardar.');
  if(!current&&input.revision>0)throw Error('El cliente no está en este dispositivo. Actualiza la lista.');
  const record={...c,revision:(current?.revision||0)+1,updatedAt:new Date().toISOString()};
  write(storage,[...rows.filter(r=>r.id!==c.id),record]);return record;
 },
 import(input:unknown){
  const values=Array.isArray(input)?input:(input as any)?.clients;
  if(!Array.isArray(values)||!values.length||values.length>2000)throw Error('El archivo debe incluir entre 1 y 2000 clientes.');
  const now=new Date().toISOString();
  const parsed=values.map(c=>({...clientSchema.parse(c),revision:1,updatedAt:typeof c.updatedAt==='string'?c.updatedAt:now}));
  const rows=read(storage),ids=new Set(rows.map(c=>c.id)),added:RecordClient[]=[];
  for(const c of parsed)if(!ids.has(c.id)){added.push(c);ids.add(c.id);}
  write(storage,[...rows,...added]);return {imported:added.length,skipped:values.length-added.length};
 }
};}
export async function localAPI(path:string,options?:RequestInit){
 const run=()=>{
  const store=createClientStore(localStorage);
  if(path==='/api/import')return store.import(JSON.parse(String(options?.body)));
  if(options?.method==='PUT')return {client:store.save(JSON.parse(String(options.body)))};
  return {clients:store.list()};
 };
 if(options?.method&&navigator.locks)return navigator.locks.request('br-clientes-write',run) as Promise<any>;
 return run() as any;
}
