import http from 'node:http';
import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {createStore,StoreError} from './store.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
// Backend-only demo default. Override ADMIN_PASSWORD in the server environment.
export function settings(env=process.env){const demo=env.DEMO_MODE!=='false',password=env.ADMIN_PASSWORD||'1234';if(!demo&&(password==='1234'||password.length<12))throw new Error('Non-demo mode requires ADMIN_PASSWORD of at least 12 characters, different from the demo password.');return {demo,password,origin:env.ALLOWED_ORIGIN||'',file:env.DATA_FILE||path.join(ROOT,'server/data/responses.json'),ttl:30*60*1000,serveStatic:env.SERVE_STATIC==='1',prefix:env.STATIC_PREFIX||'',host:env.HOST||'127.0.0.1',port:Number(env.PORT||8787)}}
export function createApp(options){const config={...settings({}),...options},store=createStore(config),salt=randomBytes(16),hash=scryptSync(config.password,salt,32),sessions=new Map();delete config.password;let failures=[],submissionTimes=[];
  const safeEqual=(a,b)=>a.length===b.length&&timingSafeEqual(a,b),hashToken=t=>createHash('sha256').update(t).digest('hex');
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  const json=(res,status,body,extra={})=>{res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(body))};
  async function body(req){if(!String(req.headers['content-type']||'').startsWith('application/json'))throw new StoreError('JSON required',415);let parts=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>32768)throw new StoreError('Body too large',413);parts.push(chunk)}try{return JSON.parse(Buffer.concat(parts).toString('utf8'))}catch{throw new StoreError('Invalid JSON')}}
  function authorized(req){const header=req.headers.authorization||'';if(!/^Bearer [A-Za-z0-9_-]{43}$/.test(header))return false;const key=hashToken(header.slice(7)),expiry=sessions.get(key);if(!expiry||expiry<=Date.now()){sessions.delete(key);return false}return key}
  async function staticFile(req,res,url){if(!config.serveStatic)return false;let relative;try{relative=decodeURIComponent(url.pathname)}catch{return false}if(config.prefix){if(!relative.startsWith(config.prefix+'/')&&relative!==config.prefix)return false;relative=relative.slice(config.prefix.length)}if(!relative||relative==='/')relative='/index.html';if(relative.endsWith('/'))relative+='index.html';if(relative==='/admin'){res.writeHead(308,{...headers,Location:url.pathname+'/'});res.end();return true;}
    const allowed=['/index.html','/config.js','/a/index.html','/b/index.html','/admin/index.html'];if(!allowed.includes(relative)&&!/^\/assets\/[a-zA-Z0-9_/-]+\.(css|js|mp3|wav|ogg|m4a)$/.test(relative))return false;
    const file=path.resolve(ROOT,'.'+relative);if(!file.startsWith(ROOT)||relative.includes('..'))return false;
    try{if(!(await stat(file)).isFile())return false;let data=await readFile(file);if(relative==='/config.js')data=Buffer.from(data.toString().replace("adminApi: ''","adminApi: '/api/'"));const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.m4a':'audio/mp4'}[path.extname(file)];res.writeHead(200,{...headers,'Content-Type':mime,'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https:; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});res.end(data);return true}catch{return false}}
  const server=http.createServer(async(req,res)=>{let url;try{url=new URL(req.url,'http://localhost')}catch{json(res,400,{error:'Invalid URL'});return}
    if(!url.pathname.startsWith('/api/')){if(req.method==='GET'&&await staticFile(req,res,url))return;json(res,404,{error:'Not found'});return}
    // Only the configured frontend or this same origin may call the API. No IP collection.
    const origin=req.headers.origin,allowedOrigin=config.origin||((req.socket.encrypted?'https':'http')+'://'+req.headers.host);
    if(origin&&origin!==allowedOrigin){json(res,403,{error:'Origin rejected'});return}if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin')}
    if(req.method==='OPTIONS'){res.writeHead(204,{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'300'});res.end();return}
    try{const now=Date.now();for(const [key,expiry] of sessions)if(expiry<=now)sessions.delete(key);
      if(url.pathname==='/api/login'&&req.method==='POST'){
        failures=failures.filter(t=>now-t<60000);if(failures.length>=5){json(res,429,{error:'Try again later'},{'Retry-After':'60'});return}
        const input=await body(req);if(typeof input.password!=='string'||input.password.length>256)throw new StoreError('Invalid login');
        if(!safeEqual(scryptSync(input.password,salt,32),hash)){failures.push(now);json(res,401,{error:'Unauthorized'});return}
        if(sessions.size>=1000){json(res,429,{error:'Session capacity reached'});return}const token=randomBytes(32).toString('base64url'),expiresAt=now+config.ttl;sessions.set(hashToken(token),expiresAt);json(res,200,{token,expiresAt});return;
      }
      if(url.pathname==='/api/submit'&&req.method==='POST'){
        submissionTimes=submissionTimes.filter(t=>now-t<60000);if(submissionTimes.length>=30){json(res,429,{error:'Try again later'});return}submissionTimes.push(now);json(res,200,await store.submit(await body(req)));return;
      }
      if(!authorized(req)){json(res,401,{error:'Unauthorized'});return}
      if(url.pathname==='/api/results'&&req.method==='GET'){json(res,200,{...await store.load(),demo:config.demo});return}
      if(url.pathname==='/api/logout'&&req.method==='POST'){sessions.delete(authorized(req));json(res,200,{ok:true});return}
      json(res,404,{error:'Not found'});
    }catch(error){if(error instanceof StoreError)json(res,error.status,{error:error.message});else json(res,500,{error:'Backend data error'})}
  });server.requestTimeout=15000;server.headersTimeout=10000;return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const config=settings();const server=createApp(config);server.listen(config.port,config.host,()=>console.log(`Music Healing backend listening at http://${config.host}:${server.address().port}${config.prefix}/admin/ (${config.demo?'synthetic demo':'configured dataset'})`));}
