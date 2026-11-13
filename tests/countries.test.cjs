'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),Core=require('../assets/core.js');
(async()=>{
const window={Core,MHD_CONFIG:{appsScriptUrl:'https://script.google.com/macros/s/EXAMPLE/exec'}};const calls=[];
const ctx=vm.createContext({window,URL,AbortController,setTimeout,clearTimeout,fetch:async(_url,o)=>{const req=JSON.parse(o.body);calls.push(req);if(req.sheet==='surveyA')assert(['vn','kr','other','na'].includes(req.row[req.columns.indexOf('culture')]));return {ok:true,json:async()=>({ok:true,sheet:req.sheet})}}});
vm.runInContext(fs.readFileSync('assets/schema.js','utf8'),ctx);vm.runInContext(fs.readFileSync('assets/apps-script-client.js','utf8'),ctx);
for(const country of ['mn','mm','np']){
 const option=window.SCHEMA.options.culture.find(x=>x[0]===country);assert.equal(option.length,5);assert(option.slice(1).every(Boolean));
 const v={pid:'M9997',age:25,gender:'na',culture:country,status:'',listen_min:'',stress_genre:'pop',purpose:'',genre_like:8,stress_week:5,consent:true};const a=Core.validateA(v);assert.equal(a.errors.length,0);
 const note=Core.packResponseDetails('Test name','feedback',['culture:'+country,'rest_skipped']);const b={pid:a.row.pid,note,is_simulated:0};await window.MHD_GAS.submit({surveyA:a.row,sessionsB:[b]});const rawA=Object.fromEntries(calls.at(-2).columns.map((k,i)=>[k,calls.at(-2).row[i]]));assert.equal(rawA.culture,'other');assert.equal(a.row.culture,country);const storedNote=calls.at(-1).row[Core.B_COLS.indexOf('note')];assert.equal(Core.unpackResponseDetails(storedNote).participant_culture,country);assert.equal(Core.unpackResponseDetails(storedNote).session_notes,'rest_skipped');
 const restored=Core.restoreCultures({surveyA:[rawA],sessionsB:[{...b,note:storedNote}]});assert.equal(restored.surveyA[0].culture,country);assert.equal(rawA.culture,'other');
}
const legacy={surveyA:[{pid:'M1111',culture:'other'},{pid:'M2222',culture:'vn'}],sessionsB:[{pid:'M1111',note:'old note'},{pid:'M2222',note:Core.packResponseDetails('','',['culture:mn'])}]};assert.deepEqual(Core.restoreCultures(legacy).surveyA,legacy.surveyA);
console.log('PASS: three countries in four languages, frontend validation, legacy Apps Script writes, preserved country metadata and admin/CSV restoration; legacy records unchanged.');
})().catch(e=>{console.error(e);process.exitCode=1});
