// Optional Cloudflare Worker: no credentials embedded; no public open proxy.
// Set GAS_EXEC_URL and ALLOWED_ORIGIN in the Worker environment.
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin'),allowed=env.ALLOWED_ORIGIN;
  const base={'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...base,...(origin===allowed&&allowed?{'Access-Control-Allow-Origin':allowed,'Vary':'Origin'}:{})}});
  if(!allowed||!env.GAS_EXEC_URL)return reply({ok:false,error:{code:'NOT_CONFIGURED',message:'Proxy environment is not configured.'}},503);
  if(origin!==allowed)return reply({ok:false,error:{code:'ORIGIN_REJECTED',message:'Origin rejected.'}},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...base,'Access-Control-Allow-Origin':allowed,'Vary':'Origin','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'300'}});
  if(!['GET','POST'].includes(request.method))return reply({ok:false,error:{code:'METHOD_NOT_ALLOWED',message:'GET or POST only.'}},405);
  let target;try{target=new URL(env.GAS_EXEC_URL);if(target.protocol!=='https:'||target.hostname!=='script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(target.pathname)||target.username||target.password||target.search||target.hash)throw Error()}catch{return reply({ok:false,error:{code:'NOT_CONFIGURED',message:'Invalid upstream URL.'}},503)}
  try{let body;if(request.method==='POST'){body=await request.text();if(new TextEncoder().encode(body).length>32768)return reply({ok:false,error:{code:'BODY_TOO_LARGE',message:'Request too large.'}},413);try{JSON.parse(body)}catch{return reply({ok:false,error:{code:'INVALID_JSON',message:'Expected JSON.'}},400)}}
   const result=await fetch(target.href,{method:request.method,redirect:'follow',headers:request.method==='POST'?{'Content-Type':'text/plain;charset=UTF-8'}:{},body,signal:AbortSignal.timeout(30000)});
   if(!result.ok)throw Error('upstream');const data=await result.json();if(typeof data?.ok!=='boolean')throw Error('upstream');return reply(data);
  }catch{return reply({ok:false,error:{code:'UPSTREAM_UNCONFIRMED',message:'Cannot confirm Apps Script response. A write may already have occurred; do not retry blindly.'}},502)}
 }
};
