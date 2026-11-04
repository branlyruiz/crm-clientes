import { z } from 'zod';
export const STATES = ['Pendiente', 'En Edición', 'Por entregar', 'Confirmado', 'Aplazado', 'Terminado', 'Cancelado'] as const;
// Dropdown values from SEGUIMIENTO CLIENTES!D7:E7, checked on 2026-11-04.
export const CATEGORIES = ['Fotografía','Video','Fotografía y Video','Cobertura Completa'] as const;
export const SERVICES = ['Boda','15 años','Evento','Pre Sesion','Embarazo','Revelacion','Corporativo','Producto','Sponsor','Promocional','Documental','Reel','UGC','Político','Retratos','Sesion Estudio','Sesion Exterior','Campo','Otro','Bautizo'] as const;
export const choicesWithCurrent = (options:readonly string[],current:string) => current && !options.includes(current) ? [current,...options] : [...options];
const isoDate = z.string().refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, 'Fecha inválida');
const amount = z.number().int().min(0).max(100000000000);
export const clientSchema = z.object({
  id: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().trim().min(1, 'Escribe el nombre del cliente').max(120),
  type: z.enum(['Particular','Empresa']), category: z.string().trim().max(80), service: z.string().trim().min(1,'Escribe el servicio').max(120),
  date: isoDate, time: z.string().refine(v=>!v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),'Hora inválida'),
  place: z.string().trim().max(200), state: z.enum(STATES), total: amount, initialPaid: amount,
  phone: z.string().trim().max(30), email: z.union([z.literal(''), z.string().email('Correo inválido').max(160)]),
  nextContact: isoDate, notes: z.string().max(5000), archived: z.boolean(),
  payments: z.array(z.object({id:z.string().min(1).max(100), amount:amount.positive(), date:isoDate.refine(Boolean,'Indica la fecha'), note:z.string().max(300)})).max(500),
  history: z.array(z.object({id:z.string().max(100),at:z.string().max(40),text:z.string().max(1000)})).max(1000),
}).superRefine((v,ctx)=>{ if(v.initialPaid+v.payments.reduce((s,p)=>s+p.amount,0)>v.total) ctx.addIssue({code:'custom',path:['initialPaid'],message:'Los abonos no pueden superar el valor total'}); });
export type Client = z.infer<typeof clientSchema>;
export type RecordClient = Client & { revision:number; updatedAt:string };
export const paid = (c:Client) => c.initialPaid+c.payments.reduce((s,p)=>s+p.amount,0);
export const balance = (c:Client) => c.total-paid(c);
export const todayCO = () => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const daysUntil = (date:string,today=todayCO()) => date ? Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000) : null;
export const money = (n:number) => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
export const normalize = (s:string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const dateLabel = (d:string) => d ? new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z')) : 'Fecha por definir';
export const stateTone = (s:string) => ({'Pendiente':'amber','En Edición':'purple','Por entregar':'blue','Confirmado':'green','Aplazado':'gray','Terminado':'gray','Cancelado':'red'}[s]||'gray');
export function sortClients(rows:RecordClient[], sort:string, descending=false) {
  const nullable = (a:string,b:string) => !a ? (!b?0:1) : !b ? -1 : (a.localeCompare(b)*(descending?-1:1));
  return [...rows].sort((a,b)=>{
    let result=0;
    if(sort==='auto') result=STATES.indexOf(a.state)-STATES.indexOf(b.state) || nullable(a.nextContact||a.date,b.nextContact||b.date);
    else if(sort==='date') result=nullable(a.date,b.date) || nullable(a.time,b.time);
    else if(sort==='contact') result=nullable(a.nextContact,b.nextContact);
    else if(sort==='place') result=nullable(a.place,b.place);
    else if(sort==='balance') result=(balance(a)-balance(b))*(descending?-1:1);
    else if(sort==='total') result=(a.total-b.total)*(descending?-1:1);
    else if(sort==='updated') result=a.updatedAt.localeCompare(b.updatedAt)*(descending?-1:1);
    else result=a.name.localeCompare(b.name,'es')*(descending?-1:1);
    return result || a.name.localeCompare(b.name,'es') || a.id.localeCompare(b.id);
  });
}
export function summary(rows:Client[], today=todayCO()) {
  const visible=rows.filter(c=>!c.archived), active=visible.filter(c=>c.state!=='Cancelado');
  return {total:active.reduce((s,c)=>s+c.total,0),paid:active.reduce((s,c)=>s+paid(c),0),balance:active.reduce((s,c)=>s+balance(c),0),upcoming:rows.filter(c=>isUpcoming(c,today)).length,followups:active.filter(c=>c.nextContact&&c.nextContact<=today).length};
}
export const isUpcoming = (c:Client,today=todayCO()) => !c.archived && !!c.date && c.date>=today && !['Cancelado','Terminado'].includes(c.state);
// Upcoming events first; past events remain accessible, followed by undated records.
export function sortByEventProximity(rows:RecordClient[],today=todayCO()) {
 const rank=(c:Client)=>!c.date?2:c.date>=today?0:1;
 return [...rows].sort((a,b)=>rank(a)-rank(b) || (a.date.localeCompare(b.date)*(rank(a)===1?-1:1)) || (!a.time?(!b.time?0:1):!b.time?-1:a.time.localeCompare(b.time)) || a.name.localeCompare(b.name,'es') || a.id.localeCompare(b.id));
}
export function shiftMonth(month:string,offset:number){const [y,m]=month.split('-').map(Number);return new Date(Date.UTC(y,m-1+offset,1)).toISOString().slice(0,7);}
export function monthDays(month:string){
 const [y,m]=month.split('-').map(Number),start=new Date(Date.UTC(y,m-1,1)),offset=(start.getUTCDay()+6)%7;
 const length=new Date(Date.UTC(y,m,0)).getUTCDate(),cells=Math.ceil((offset+length)/7)*7;
 return Array.from({length:cells},(_,i)=>new Date(Date.UTC(y,m-1,1-offset+i)).toISOString().slice(0,10));
}
export function registerPayment(c:RecordClient,input:{amount:number;date:string;note:string}):RecordClient{
 if(!Number.isSafeInteger(input.amount)||input.amount<=0||input.amount>balance(c))throw Error('El abono debe ser mayor a cero y no superar el saldo.');
 const next={...c,payments:[...c.payments,{id:crypto.randomUUID(),...input}],history:[...c.history,{id:crypto.randomUUID(),at:new Date().toISOString(),text:'Abono registrado: '+money(input.amount)}]};
 const valid=clientSchema.safeParse(next);if(!valid.success)throw Error(valid.error.issues[0].message);
 return next;
}
export function changeClientState(c:RecordClient,state:Client['state']):RecordClient{
 if(c.state===state)return c;
 const next={...c,state,history:[...c.history,{id:crypto.randomUUID(),at:new Date().toISOString(),text:'Estado: '+c.state+' → '+state}]};
 const valid=clientSchema.safeParse(next);if(!valid.success)throw Error(valid.error.issues[0].message);
 return next;
}
export function emptyClient():RecordClient {return {id:crypto.randomUUID(),name:'',type:'Particular',category:'Fotografía',service:'',date:'',time:'',place:'',state:'Pendiente',total:0,initialPaid:0,phone:'',email:'',nextContact:'',notes:'',archived:false,payments:[],history:[],revision:0,updatedAt:new Date().toISOString()};}
