import {readFile,writeFile,mkdir,rename,chmod} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createRequire} from 'node:module';
import {demoData} from './demo-data.mjs';
const require=createRequire(import.meta.url),Core=require('../assets/core.js');
const aCols=Core.A_COLS,bCols=Core.B_COLS;
export class StoreError extends Error{constructor(message,status=400){super(message);this.status=status}}
const pick=(r,cols)=>Object.fromEntries(cols.map(k=>[k,r[k]??'']));
const flag=r=>[0,1].includes(r?.is_simulated);
export function validatePayload(payload,demo){
  if(!payload||typeof payload!=='object'||!payload.surveyA||!Array.isArray(payload.sessionsB)||payload.sessionsB.length<1||payload.sessionsB.length>4)throw new StoreError('Invalid payload');
  const input=payload.surveyA;if(!flag(input)||aCols.some(k=>input[k]!=null&&!['number','string'].includes(typeof input[k])))throw new StoreError('Invalid A row');
  const aResult=Core.validateA({...input,consent:true}); // Consent was gated by participant form; not a new stored question.
  if(aResult.errors.length)throw new StoreError('Invalid A fields');
  const surveyA=aResult.row;
  const sessionsB=payload.sessionsB.map(r=>{
    if(!r||!flag(r)||bCols.some(k=>r[k]!=null&&!['number','string'].includes(typeof r[k]))||r.pid!==surveyA.pid||Core.validateB(r).length)throw new StoreError('Invalid B fields');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Number.isFinite(Date.parse(r.date+'T00:00:00.000Z'))||new Date(r.date+'T00:00:00.000Z').toISOString().slice(0,10)!==r.date)throw new StoreError('Invalid date');
    if(!Number.isInteger(r.duration_sec)||r.duration_sec>600||String(r.note||'').length>500||(!['',1,2,3,4].includes(r.session_order??'')))throw new StoreError('Invalid B metadata');
    const b=Core.buildB(r);b.session_order=r.session_order??'';try{b.track_url=Core.cleanURL(b.track_url)}catch{throw new StoreError('Invalid track URL')}
    return pick(b,bCols);
  });
  if(demo&&[surveyA,...sessionsB].some(r=>r.is_simulated!==1))throw new StoreError('Demo accepts simulated data only',403);
  if(sessionsB.some(r=>r.is_simulated!==surveyA.is_simulated))throw new StoreError('Simulation flags must agree');
  return {surveyA,sessionsB};
}
export function createStore({file,demo=true}){
  let queue=Promise.resolve();
  async function load(){let data;try{data=JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e;data=demo?demoData():{surveyA:[],sessionsB:[]}}
    if(!Array.isArray(data.surveyA)||!Array.isArray(data.sessionsB)||data.surveyA.length>10000||data.sessionsB.length>40000)throw new Error('Invalid private data file');
    // Validate private-file records too; never return raw extra fields.
    const seen=new Set(),surveyA=data.surveyA.map(r=>{if(!flag(r))throw new Error('Missing simulation flag');const a=Core.validateA({...r,consent:true});if(a.errors.length||seen.has(a.row.pid))throw new Error('Invalid or duplicate A row');seen.add(a.row.pid);return a.row});
    const byPid=new Map(surveyA.map(r=>[r.pid,r]));const sessionsB=data.sessionsB.map(r=>{const a=byPid.get(r.pid);if(!a)throw new Error('B has no matching A');return validatePayload({surveyA:a,sessionsB:[r]},demo).sessionsB[0]});
    if(demo&&surveyA.some(r=>r.is_simulated!==1))throw new Error('Real data forbidden in demo');
    return {surveyA,sessionsB};
  }
  async function insert(payload){const record=validatePayload(payload,demo);const data=await load(),existing=data.surveyA.find(r=>r.pid===record.surveyA.pid);
    if(existing&&JSON.stringify(existing)!==JSON.stringify(record.surveyA))throw new StoreError('Participant code already has a different A response',409);
    const known=new Set(data.sessionsB.map(row=>JSON.stringify(row)));const additions=record.sessionsB.filter(row=>{const key=JSON.stringify(row);if(known.has(key))return false;known.add(key);return true});
    const prior=data.sessionsB.filter(r=>r.pid===record.surveyA.pid);if(prior.length+additions.length>4)throw new StoreError('Maximum four sessions per participant',409);
    if(data.surveyA.length+(existing?0:1)>10000||data.sessionsB.length+additions.length>40000)throw new StoreError('Dataset capacity reached',409);
    if(!existing)data.surveyA.push(record.surveyA);data.sessionsB.push(...additions);
    if(additions.length||!existing){await mkdir(dirname(file),{recursive:true,mode:0o700});const temp=file+'.tmp';await writeFile(temp,JSON.stringify(data),{encoding:'utf8',mode:0o600});await chmod(temp,0o600);await rename(temp,file)}
    return {ok:true,addedA:existing?0:1,addedB:additions.length};
  }
  return {load,submit(payload){const result=queue.then(()=>insert(payload));queue=result.catch(()=>{});return result}};
}
