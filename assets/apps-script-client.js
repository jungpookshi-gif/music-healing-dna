(function(root){'use strict';
function configured(){return Boolean(root.MHD_CONFIG?.appsScriptUrl)}
function endpoint(){const raw=root.MHD_CONFIG?.appsScriptUrl;if(!raw)throw Error('Chưa cấu hình appsScriptUrl.');const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('appsScriptUrl phải là HTTPS, không có mật khẩu/query/hash.');if(url.hostname==='script.google.com'&&!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname))throw Error('Hãy dùng URL triển khai kết thúc bằng /exec, không dùng /dev.');return url.href}
async function request(payload,{signal,method='POST'}={}){
 const controller=new AbortController(),abort=()=>controller.abort();if(signal){if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true})}const timeout=setTimeout(abort,30000);
 try{const res=await fetch(endpoint(),{method,mode:'cors',credentials:'omit',redirect:'follow',referrerPolicy:'no-referrer',headers:method==='POST'?{'Content-Type':'text/plain;charset=UTF-8'}:{},body:method==='POST'?JSON.stringify(payload):undefined,signal:controller.signal});if(!res.ok)throw Object.assign(Error('Backend HTTP '+res.status),{code:'HTTP_ERROR'});let data;try{data=await res.json()}catch{throw Object.assign(Error('Phản hồi không phải JSON. Kiểm tra /exec và quyền Web app.'),{code:'BAD_RESPONSE'})}if(data?.ok!==true){const error=Error(data?.error?.message||'Backend từ chối yêu cầu.');error.code=data?.error?.code||'BACKEND_ERROR';throw error}return data;
 }catch(error){if(error.name==='AbortError')throw Object.assign(Error('Hết thời gian chờ hoặc yêu cầu đã bị hủy; chưa xác nhận lưu dữ liệu.'),{code:'TIMEOUT'});if(error instanceof TypeError)throw Object.assign(Error('Không đọc được phản hồi: có thể do CORS, mạng, URL hoặc quyền triển khai. Hãy dùng trang kiểm tra kết nối.'),{code:'NETWORK_OR_CORS'});throw error}finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort)}
}
const acknowledgedA=new WeakSet();
async function submit(payload,{autoId=false}={}){const confirmed=[];try{
 let ack,accepted=false;
 for(let attempt=0;attempt<10;attempt++){
  const item={sheet:'surveyA',columns:root.Core.A_COLS,row:root.Core.A_COLS.map(k=>k==='culture'&&['mn','mm','np'].includes(payload.surveyA.culture)?'other':payload.surveyA[k]??'')};
  try{ack=await request(item);if(ack.sheet!=='surveyA')throw Error('Backend không xác nhận đúng tab.');if(!autoId||!ack.duplicate||acknowledgedA.has(payload)){accepted=true;acknowledgedA.add(payload);break}}
  catch(error){if(!autoId||error.code!=='PID_CONFLICT'||acknowledgedA.has(payload))throw error}
  let next;do{next=root.Core.newParticipantId()}while(next===payload.surveyA.pid);payload.surveyA.pid=next;for(const row of payload.sessionsB)row.pid=next;
 }
 if(!accepted)throw Error('Không thể tạo hồ sơ khảo sát. Vui lòng giữ trang mở và liên hệ nhóm nghiên cứu.');
 confirmed.push('surveyA');
 for(const b of payload.sessionsB){const item={sheet:'sessionsB',columns:root.Core.B_COLS,row:root.Core.B_COLS.map(k=>b[k]??'')};const response=await request(item);if(response.sheet!==item.sheet)throw Error('Backend không xác nhận đúng tab.');confirmed.push(item.sheet)}
 return {ok:true,confirmed};
}catch(error){error.confirmed=confirmed;throw error}}

root.MHD_GAS={configured,request,submit,login:(password,signal)=>request({action:'read',password},{signal}),read:(token,signal)=>request({action:'read',token},{signal}),logout:token=>request({action:'logout',token}),health:method=>request({action:'health'},{method})};
})(window);
