const assert=require('node:assert/strict');const C=require('../assets/core.js');
const v={pid:'M0123',age:'18',gender:'na',culture:'na',status:'',listen_min:'',stress_genre:'pop',purpose:'',genre_like:'0',stress_week:'10',consent:true};
assert.deepEqual(C.validateA(v).errors,[]);assert.equal(C.validateA(v).row.listen_min,'');assert.equal(C.validateA({...v,listen_min:'0'}).row.listen_min,0);
for(const pid of ['P001','M123','M12345','M12A4','M 1234'])assert(C.validateA({...v,pid}).errors.includes('A01'));
for(const age of ['17','18.5','', 'NaN'])assert(C.validateA({...v,age}).errors.includes('A02'));
assert.deepEqual(C.validateA({...v,age:'121'}).errors,[]); // Word specifies 18+, no 120 cap.
for(const listen_min of ['-1','1441','2.5'])assert(C.validateA({...v,listen_min}).errors.includes('A06'));
assert(C.validateA({...v,genre_like:''}).errors.includes('A09'));assert(C.validateA({...v,stress_week:11}).errors.includes('A10'));assert(C.validateA({...v,consent:false}).errors.includes('consent'));
assert.equal(C.cleanURL('https://example.com/song?id=7&utm_source=x&si=y'),'https://example.com/song?id=7');
for(const u of ['javascript:alert(1)','https://user:pass@example.com','https://example.com/'+ 'x'.repeat(300)])assert.throws(()=>C.cleanURL(u));
const b={pid:'M0123',condition:'silence',date:'2026-11-13',before:7,after:3,setting:'home',genre:'pop',like:9,bpm:100,track:'test',track_url:'https://example.com',note:'',duration_sec:600,is_simulated:0};
assert.deepEqual(C.validateB(b),[]);const row=C.buildB(b);assert.equal(row.delta,4);for(const k of ['genre','like','bpm','track','track_url'])assert.equal(row[k],'');assert.equal(row.session_order,'');assert.deepEqual(Object.keys(row),C.B_COLS);
assert(C.validateB({...b,condition:'self',like:''}).includes('like'));assert.equal(C.buildB({...b,is_simulated:1}).is_simulated,1);assert.equal(C.buildB({...b,before:2,after:5}).delta,-3);
console.log('PASS: schema boundaries, optional blank vs zero, PID, consent, URL sanitization, silence fields, delta, simulation.');
