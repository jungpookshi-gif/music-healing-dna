import assert from 'node:assert/strict';
import worker from '../apps-script/proxy/worker.mjs';
const env={ALLOWED_ORIGIN:'https://researcher.github.io',GAS_EXEC_URL:'https://script.google.com/macros/s/EXAMPLE/exec'},headers={Origin:env.ALLOWED_ORIGIN};let seen;const previous=globalThis.fetch;
try{globalThis.fetch=async(url,options)=>{seen={url,options};return Response.json({ok:true,service:'Music Healing DNA Apps Script'})};
let res=await worker.fetch(new Request('https://proxy.example/',{method:'OPTIONS',headers}),env);assert.equal(res.status,204);assert.equal(res.headers.get('Access-Control-Allow-Origin'),env.ALLOWED_ORIGIN);
res=await worker.fetch(new Request('https://proxy.example/',{headers:{Origin:'https://evil.invalid'}}),env);assert.equal(res.status,403);assert.equal(seen,undefined);
res=await worker.fetch(new Request('https://proxy.example/?url=https://evil.invalid',{method:'POST',headers:{...headers,'Content-Type':'text/plain'},body:JSON.stringify({action:'health'})}),env);assert.equal(res.status,200);assert.equal(seen.url,env.GAS_EXEC_URL);assert.equal(seen.options.redirect,'follow');assert.equal(seen.options.headers['Content-Type'],'text/plain;charset=UTF-8');assert.equal(res.headers.get('Access-Control-Allow-Origin'),env.ALLOWED_ORIGIN);
res=await worker.fetch(new Request('https://proxy.example/',{method:'POST',headers,body:'not json'}),env);assert.equal(res.status,400);
res=await worker.fetch(new Request('https://proxy.example/',{headers}),{...env,GAS_EXEC_URL:'https://evil.invalid/exec'});assert.equal(res.status,503);
console.log('PASS: optional proxy exact-origin CORS, preflight, fixed upstream, redirects and invalid-input handling. Not a deployed Worker test.');
}finally{globalThis.fetch=previous}
