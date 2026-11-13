// Synthesized test sounds from the supplied session-B sample. Not research tracks.
var AC=window.AudioContext||window.webkitAudioContext,actx=null,stopMusic=null;
function ensureCtx(){if(!AC)throw new Error('Audio unavailable');if(!actx)actx=new AC();if(actx.state==='suspended')actx.resume();return actx;}
function fadeStopper(master,nodes){
  return function(fade){
    var n=actx.currentTime;master.gain.cancelScheduledValues(n);master.gain.setValueAtTime(master.gain.value,n);master.gain.linearRampToValueAtTime(0.0001,n+fade);
    setTimeout(function(){nodes.forEach(function(o){try{o.stop();}catch(_){}});},fade*1000+250);
  };
}
function playRelax(ctx){
  var master=ctx.createGain(),t=ctx.currentTime,nodes=[];
  master.gain.setValueAtTime(0.0001,t);master.gain.linearRampToValueAtTime(0.22,t+5);master.connect(ctx.destination);
  [110,164.81,220,277.18,329.63,440].forEach(function(f,i){
    [-4,4].forEach(function(det){
      var o=ctx.createOscillator(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();
      o.type='sine';o.frequency.value=f;o.detune.value=det;g.gain.value=0.08;
      lfo.frequency.value=0.04+i*0.013;lg.gain.value=0.06;lfo.connect(lg);lg.connect(g.gain);
      o.connect(g);g.connect(master);o.start();lfo.start();nodes.push(o,lfo);
    });
  });
  return fadeStopper(master,nodes);
}
function renderEnergyLoop(sr){
  var bpm=126,beat=60/bpm,bars=8,len=bars*4*beat,OC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  var oc=new OC(2,Math.ceil(len*sr),sr),out=oc.createGain();out.gain.value=0.6;out.connect(oc.destination);
  var nb=oc.createBuffer(1,sr,sr),nd=nb.getChannelData(0),i;for(i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  function env(g,t,peak,dur){g.gain.setValueAtTime(peak,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);}
  function kick(t){var o=oc.createOscillator(),g=oc.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);env(g,t,0.9,0.28);o.connect(g);g.connect(out);o.start(t);o.stop(t+0.3);}
  function hat(t){var s=oc.createBufferSource(),f=oc.createBiquadFilter(),g=oc.createGain();s.buffer=nb;f.type='highpass';f.frequency.value=7000;env(g,t,0.18,0.05);s.connect(f);f.connect(g);g.connect(out);s.start(t);s.stop(t+0.06);}
  function bass(t,fr){var o=oc.createOscillator(),lp=oc.createBiquadFilter(),g=oc.createGain();o.type='sawtooth';o.frequency.value=fr;lp.type='lowpass';lp.frequency.value=420;env(g,t,0.28,0.22);o.connect(lp);lp.connect(g);g.connect(out);o.start(t);o.stop(t+0.24);}
  function pluck(t,fr){var o=oc.createOscillator(),g=oc.createGain();o.type='triangle';o.frequency.value=fr;env(g,t,0.09,0.18);o.connect(g);g.connect(out);o.start(t);o.stop(t+0.2);}
  var bassN=[55,55,65.41,49],arp=[440,523.25,659.25,783.99,880,783.99,659.25,523.25];
  for(var bar=0;bar<bars;bar++){
    var bt=bar*4*beat,b,e,s;
    for(b=0;b<4;b++)kick(bt+b*beat);
    for(e=0;e<8;e++){var t8=bt+e*beat/2;if(e%2===1)hat(t8);bass(t8,bassN[(Math.floor(e/2)+bar)%4]);}
    for(s=0;s<16;s++)pluck(bt+s*beat/4,arp[(s+bar*3)%8]*(bar%4===3?0.75:1));
  }
  return oc.startRendering();
}
function playEnergy(ctx,buf){
  var src=ctx.createBufferSource(),master=ctx.createGain(),t=ctx.currentTime;
  src.buffer=buf;src.loop=true;master.gain.setValueAtTime(0.0001,t);master.gain.linearRampToValueAtTime(0.5,t+2);
  src.connect(master);master.connect(ctx.destination);src.start();
  return fadeStopper(master,[src]);
}

window.testAudio = async function(condition){var ctx=ensureCtx(); await ctx.resume(); return condition === "relax" ? playRelax(ctx) : playEnergy(ctx, await renderEnergyLoop(ctx.sampleRate));};
