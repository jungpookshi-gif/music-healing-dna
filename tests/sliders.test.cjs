'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
for(const lang of ['vi','ko','en','zh']){
 const els=new Map(),get=id=>{if(!els.has(id))els.set(id,{value:id.endsWith('-slider')?'5':'',textContent:'',innerHTML:'',events:{},attrs:{},hidden:false,style:{setProperty(k,v){this[k]=v}},addEventListener(k,fn){this.events[k]=fn},setAttribute(k,v){this.attrs[k]=v},focus(){},querySelector(){return {focus(){}}}});return els.get(id)};
 const values={age:'25',gender:'na',culture:'vn',status:'',listen_min:'',stress_genre:'pop',purpose:'',genre_like:'8',stress_week:'9'};
 const win={crypto:require('crypto').webcrypto,addEventListener(){},scrollTo(){}};
 const ctx=vm.createContext({window:win,URL,URLSearchParams,location:{href:'https://example.com/a/',search:'?lang='+lang,hash:''},document:{documentElement:{},getElementById:get,querySelector:()=>({value:'pop'})},FormData:function(){return Object.entries(values)},Date,setInterval(){},clearInterval(){},setTimeout,clearTimeout,console});
 for(const file of ['config.js','assets/schema.js','assets/i18n.js','assets/core.js']){vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);for(const k of ['SCHEMA','I18N','Core'])if(win[k])ctx[k]=win[k]}
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8'),ctx);
 assert.equal((get('app').innerHTML.match(/type="range"/g)||[]).length,5);assert.equal((get('app').innerHTML.match(/step="1" value="5"/g)||[]).length,5);
 for(const field of ['genre_like','stress_week','before','after','like']){
  assert.equal(vm.runInContext(`val('${field}')`,ctx),'');
  const slider=get(field+'-slider');slider.value='0';slider.events.input();assert.equal(vm.runInContext(`val('${field}')`,ctx),'0');assert.equal(get(field+'-display').textContent,'0');assert.equal(slider.style['--fill'],'0%');
  slider.value='10';slider.events.change();assert.equal(get(field+'-answer').value,'10');assert.equal(slider.style['--fill'],'100%');
  slider.value='5';slider.events.click();assert.equal(get(field+'-answer').value,'5');
  const number=get(field+'-number');for(const value of ['11','-1','2.5','']){number.value=value;number.events.input();assert.equal(get(field+'-answer').value,'');}
  number.value='0';number.events.input();assert.equal(get(field+'-answer').value,'0');
 }
 // Values present in FormData must never turn untouched slider defaults into answers.
 for(const f of ['genre_like','stress_week'])get(f+'-answer').value='';get('participant_name').value='Test';get('consent').checked=true;vm.runInContext('surveyIndex=surveyKeys.length-1',ctx);get('a-form').events.submit({preventDefault(){}});assert.equal(vm.runInContext('current',ctx),'survey');assert(get('a-error').textContent.includes('A09'));assert(get('a-error').textContent.includes('A10'));
 for(const f of ['genre_like','stress_week']){get(f+'-number').value='0';get(f+'-number').events.input()}
 vm.runInContext('surveyIndex=surveyKeys.length-1',ctx);get('a-form').events.submit({preventDefault(){}});assert.equal(vm.runInContext('aRow.genre_like',ctx),0);assert.equal(vm.runInContext('aRow.stress_week',ctx),0);assert.equal(vm.runInContext('current',ctx),'prep');
 console.log('PASS: five discrete sliders, blank vs 0, endpoints, direct entry, invalid values, explicit midpoint choice and survey payload',lang);
}
