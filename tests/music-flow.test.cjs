const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require('path').resolve(__dirname,'..')+'/';
async function check(condition,index){
 const els=new Map(),get=id=>{if(!els.has(id))els.set(id,{value:'',hidden:false,disabled:false,textContent:'',innerHTML:'',addEventListener(){},focus(){},querySelector(){return null}});return els.get(id)};
 let audio,started=0,paused=0;
 const c={URL,URLSearchParams,TextEncoder,location:{search:'?lang=vi',href:'https://example.org/music-healing-dna/b/',hash:''},document:{documentElement:{},getElementById:get,querySelector(){return {value:'5'}}},setInterval(){return 1},clearInterval(){},setTimeout,Date,console,Audio:function(src){audio=this;this.src=src;this.play=async()=>{started++};this.pause=()=>paused++;this.load=()=>{};this.removeAttribute=()=>{}},navigator:{},btoa:()=>'',window:{addEventListener(){},scrollTo(){}}};
 vm.createContext(c);for(const f of ['config.js','assets/schema.js','assets/i18n.js','assets/core.js']){vm.runInContext(fs.readFileSync(root+f,'utf8'),c);for(const k of ['SCHEMA','I18N'])if(c.window[k])c[k]=c.window[k]}
 c.Core=c.window.Core;
 vm.runInContext(fs.readFileSync(root+'assets/app.js','utf8'),c);
 vm.runInContext(`st.condition=${JSON.stringify(condition)};st.pid='M1234'`,c);get('before-next').onclick();
 assert.equal(get('preset-fields').hidden,false);assert.equal((get('preset-track').innerHTML.match(/Kevin MacLeod/g)||[]).length,2);
 await get('main-start').onclick();assert.equal(started,0);assert(get('listen-error').textContent);
 get('preset-track').value=String(index);get('preset-track').onchange();await get('main-start').onclick();assert.equal(started,1);assert(audio.src.includes('incompetech.com'));assert.equal(audio.loop,true);assert.equal(get('preset-track').disabled,true);
 const state=vm.runInContext('JSON.parse(JSON.stringify(st))',c);assert(state.track.includes('Kevin MacLeod'));assert(state.track_url.includes('isrc='));assert.equal(state.is_simulated,0);
 if(condition==='relax'&&index===1)assert.equal(state.bpm,'');
 vm.runInContext('finish(false)',c);assert.equal(paused,1);console.log('PASS',condition,index,state.track,state.bpm);
}
(async()=>{for(const c of ['relax','energy'])for(const i of [0,1])await check(c,i)})().catch(e=>{console.error(e);process.exit(1)});
