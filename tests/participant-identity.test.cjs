'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),Core=require('../assets/core.js');
(async()=>{
let next=2,mode='normal',bFails=true,calls=[],accepted=false;
const win={MHD_CONFIG:{appsScriptUrl:'https://script.google.com/macros/s/EXAMPLE/exec'},Core:{...Core,newParticipantId:()=> 'M'+String(next++).padStart(4,'0')}};
const context=vm.createContext({window:win,URL,AbortController,setTimeout,clearTimeout,Error,TypeError,fetch:async(_url,opt)=>{const req=JSON.parse(opt.body);calls.push(req);const pid=req.row[0];let result={ok:true,sheet:req.sheet};if(req.sheet==='surveyA'){
 if(mode==='exhaust'||pid==='M0001')result.duplicate=true;
 else if(pid==='M0002')result={ok:false,error:{code:'PID_CONFLICT',message:'conflict'}};
 else {result.duplicate=accepted;accepted=true}
 }else if(bFails){bFails=false;throw new TypeError('network')}
 return {ok:true,json:async()=>result}}});
vm.runInContext(fs.readFileSync('assets/apps-script-client.js','utf8'),context);
const p={surveyA:{pid:'M0001'},sessionsB:[{pid:'M0001'}]};
await assert.rejects(win.MHD_GAS.submit(p,{autoId:true}),e=>e.code==='NETWORK_OR_CORS'&&e.confirmed.join(',')==='surveyA');assert.equal(p.surveyA.pid,'M0003');assert.equal(p.sessionsB[0].pid,'M0003');assert.deepEqual(calls.map(x=>[x.sheet,x.row[0]]),[['surveyA','M0001'],['surveyA','M0002'],['surveyA','M0003'],['sessionsB','M0003']]);
const ack=await win.MHD_GAS.submit(p,{autoId:true});assert.equal(ack.ok,true);assert.equal(p.surveyA.pid,'M0003');assert.deepEqual(calls.slice(-2).map(x=>[x.sheet,x.row[0]]),[['surveyA','M0003'],['sessionsB','M0003']]);
mode='exhaust';calls=[];const q={surveyA:{pid:'M9999'},sessionsB:[{pid:'M9999'}]};await assert.rejects(win.MHD_GAS.submit(q,{autoId:true}));assert.equal(calls.length,10);assert(calls.every(x=>x.sheet==='surveyA'));
for(let i=0;i<100;i++)assert.match(Core.newParticipantId(),/^M\d{4}$/);
console.log('PASS: automatic internal identifiers, identical-A collision, PID conflict, shared A/B relinking, stable partial retry and bounded exhaustion.');
})().catch(e=>{console.error(e);process.exitCode=1});
