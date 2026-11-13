import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createApp,settings} from '../server/server.mjs';
import {demoData} from '../server/demo-data.mjs';
const dir=await mkdtemp(path.join(tmpdir(),'mhd-test-')),file=path.join(dir,'private.json');
const server=createApp({file,demo:true,serveStatic:true,prefix:'/music-healing-dna'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const req=(route,options={})=>fetch(base+route,options),post=(data,extra={})=>({method:'POST',headers:{'Content-Type':'application/json',...extra},body:JSON.stringify(data)});
try{
 assert.throws(()=>settings({DEMO_MODE:'false'}));assert.throws(()=>settings({DEMO_MODE:'false',ADMIN_PASSWORD:'short'}));
 let r=await req('/api/results');assert.equal(r.status,401);assert.ok((await r.text()).includes('Unauthorized'));
 r=await req('/api/login',post({password:'wrong'}));assert.equal(r.status,401);
 r=await req('/api/login',post({password:'1234'},{Origin:'https://untrusted.invalid'}));assert.equal(r.status,403);
 r=await req('/api/login',post({password:'1234'}));assert.equal(r.status,200);const auth=await r.json();assert.ok(auth.token);assert.ok(auth.expiresAt>Date.now());assert.equal(r.headers.get('cache-control'),'no-store');const headers={Authorization:'Bearer '+auth.token};
 r=await req('/api/results',{headers});const data=await r.json();assert.equal(data.surveyA.length,48);assert.equal(data.sessionsB.length,96);assert.ok([...data.surveyA,...data.sessionsB].every(x=>x.is_simulated===1));
 r=await req('/music-healing-dna/admin',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),'/music-healing-dna/admin/');r=await req('/music-healing-dna/admin/');const html=await r.text();assert.equal(r.status,200);assert.ok(!html.includes('1234'));assert.ok(html.includes('Dữ liệu tự báo cáo'));r=await req('/music-healing-dna/assets/admin.js');const js=await r.text();assert.ok(!js.includes('1234'));assert.ok(!/localStorage|sessionStorage/.test(js));
 for(const route of ['/server/server.mjs','/music-healing-dna/server/demo-data.mjs','/music-healing-dna/server/data/responses.json'])assert.equal((await req(route)).status,404);
 const fixture=demoData(),payload={surveyA:{...fixture.surveyA[0],pid:'M9000'},sessionsB:[{...fixture.sessionsB[0],pid:'M9000',delta:999}]};
 r=await req('/api/submit',post({...payload,surveyA:{...payload.surveyA,is_simulated:0}}));assert.equal(r.status,403);
 r=await req('/api/submit',post({...payload,sessionsB:[{...payload.sessionsB[0],date:'2026-99-01'}]}));assert.equal(r.status,400);
 r=await req('/api/submit',post(payload));assert.equal(r.status,200);assert.deepEqual(await r.json(),{ok:true,addedA:1,addedB:1});r=await req('/api/submit',post(payload));assert.deepEqual(await r.json(),{ok:true,addedA:0,addedB:0});
 const stored=JSON.parse(await readFile(file,'utf8')),b=stored.sessionsB.at(-1);assert.equal(b.delta,b.before-b.after);assert.notEqual(b.delta,999);assert.equal(stored.surveyA.length,49);
 r=await req('/api/submit',post({...payload,surveyA:{...payload.surveyA,age:34}}));assert.equal(r.status,409);
 r=await req('/api/logout',{method:'POST',headers});assert.equal(r.status,200);r=await req('/api/results',{headers});assert.equal(r.status,401);
 for(let i=0;i<4;i++)assert.equal((await req('/api/login',post({password:'wrong'}))).status,401);assert.equal((await req('/api/login',post({password:'1234'}))).status,429);
 console.log('PASS: backend password gate, session logout, CORS, private files, demo-only policy, persistence, deduplication, computed delta, invalid input and rate limit.');
}finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true})}
const exp=createApp({file,demo:true,ttl:1});await new Promise(r=>exp.listen(0,'127.0.0.1',r));try{const base2='http://127.0.0.1:'+exp.address().port;const auth=await(await fetch(base2+'/api/login',post({password:'1234'}))).json();assert.equal((await fetch(base2+'/api/results',{headers:{Authorization:'Bearer '+auth.token}})).status,401);console.log('PASS: expired session denied.')}finally{await new Promise(r=>exp.close(r))}
