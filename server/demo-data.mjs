// Synthetic fixtures only. Never used as observed research responses.
export function demoData(){
  const surveyA=[],sessionsB=[],genres=['pop','ballad','classical_piano','lofi_ambient','rock_metal','hiphop_rnb','traditional','other'];
  for(let i=0;i<48;i++){
    const pid='M'+String(i+1).padStart(4,'0'),age=[19,22,26,31,38,42,47,54][i%8]+Math.floor(i/8)%3;
    surveyA.push({pid,age,gender:['female','male','na'][i%3],culture:['vn','kr','other'][i%3],status:'student',listen_min:20+(i*13)%140,stress_genre:genres[(i*3+Math.floor(i/8))%8],purpose:'destress',genre_like:5+i%6,stress_week:3+i%7,is_simulated:1});
    for(let j=0;j<2;j++){
      const condition=['self','relax','energy','silence'][(i+j)%4],before=3+(i+j)%7,change=({self:2,relax:3,energy:1,silence:0})[condition]+((i*7+j*3)%5-2),after=Math.max(0,Math.min(10,before-change));
      sessionsB.push({pid,condition,date:'2026-11-13',genre:condition==='silence'?'':condition==='relax'?'lofi_ambient':condition==='energy'?'pop':genres[i%8],before,after,delta:before-after,bpm:condition==='relax'?60+(i*3)%25:condition==='energy'?105+(i*7)%50:'',like:condition==='silence'?'':5+(i+j)%6,setting:'quiet_room',track:condition==='silence'?'':'DEMO · '+condition,track_url:'',note:'DỮ LIỆU GIẢ LẬP — không phải người tham gia thật',duration_sec:600,session_order:'',is_simulated:1});
    }
  }
  return {surveyA,sessionsB};
}
