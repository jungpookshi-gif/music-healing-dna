(function(root){'use strict';
const conditions=['self','relax','energy','silence'],genres=['pop','ballad','classical_piano','lofi_ambient','rock_metal','hiphop_rnb','traditional','other'];
const finite=v=>v!==''&&v!==null&&v!==undefined&&typeof v!=='boolean'&&Number.isFinite(Number(v));
const score=v=>finite(v)&&Number.isInteger(Number(v))&&Number(v)>=0&&Number(v)<=10;
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const simulated=r=>r.is_simulated===1;
function filter(data,source){const keep=r=>source==='all'||(source==='simulated'?simulated(r):r.is_simulated===0);return {surveyA:data.surveyA.filter(keep),sessionsB:data.sessionsB.filter(keep)}}
function summarize(data){const groups=conditions.map(key=>{const rows=data.sessionsB.filter(r=>r.condition===key&&score(r.before)&&score(r.after));return {key,n:rows.length,before:mean(rows.map(r=>Number(r.before))),after:mean(rows.map(r=>Number(r.after))),delta:mean(rows.map(r=>Number(r.before)-Number(r.after)))}});
const heat=Array.from({length:4},()=>genres.map(()=>0));let heatMissing=0;for(const r of data.surveyA){const age=Number(r.age),j=genres.indexOf(r.stress_genre);if(!finite(r.age)||!Number.isInteger(age)||age<18||j<0){heatMissing++;continue}heat[age<25?0:age<35?1:age<45?2:3][j]++}
const valid=data.sessionsB.filter(r=>conditions.includes(r.condition)&&score(r.before)&&score(r.after));const scatter=valid.filter(r=>finite(r.bpm)&&Number(r.bpm)>=20&&Number(r.bpm)<=300).map(r=>({...r,bpm:Number(r.bpm),delta:Number(r.before)-Number(r.after)}));
return {groups,heat,heatMissing,validN:valid.length,invalidN:data.sessionsB.length-valid.length,meanDelta:mean(valid.map(r=>Number(r.before)-Number(r.after))),scatter,scatterMissing:data.sessionsB.length-scatter.length};}
function csv(rows,columns){const cell=v=>{let s=String(v??'');if(/^[\s\u0000-\u001f]*[=+@-]/.test(s)&&typeof v!=='number')s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};return '\ufeff'+[columns,...rows.map(r=>columns.map(k=>r[k]??''))].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n'}
const api={conditions,genres,score,mean,filter,summarize,csv};if(typeof module!=='undefined')module.exports=api;else root.AdminStats=api;
})(typeof window==='undefined'?globalThis:window);
