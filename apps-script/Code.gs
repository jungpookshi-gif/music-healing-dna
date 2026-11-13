/* Music Healing DNA. No password or spreadsheet ID belongs in this source.
 * Set SPREADSHEET_ID, ADMIN_PASSWORD and DEMO_MODE in Script Properties.
 * Add Schema.gs to the same Apps Script project, then run setupSheets().
 */
var MHD_LIMITS = {surveyA:10000,sessionsB:40000};
var MHD_SESSION_SECONDS = 1800;
function mhdError_(code,message){var e=new Error(message);e.publicCode=code;return e;}
function mhdJson_(body){return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);}
function mhdConfig_(){
  var p=PropertiesService.getScriptProperties(),id=p.getProperty('SPREADSHEET_ID'),password=p.getProperty('ADMIN_PASSWORD');
  if(!id||!password)throw mhdError_('NOT_CONFIGURED','Set SPREADSHEET_ID and ADMIN_PASSWORD in Script Properties.');
  var demo=p.getProperty('DEMO_MODE')!=='false';
  if(!demo&&password.length<12)throw mhdError_('WEAK_PASSWORD','Non-demo mode requires a password of at least 12 characters.');
  return {id:id,password:password,demo:demo,properties:p};
}
function mhdColumns_(name){if(name==='surveyA')return MHD_CORE.A_COLS;if(name==='sessionsB')return MHD_CORE.B_COLS;throw mhdError_('INVALID_SHEET','Only surveyA and sessionsB are allowed.');}
function mhdLock_(fn){var lock=LockService.getScriptLock();if(!lock.tryLock(5000))throw mhdError_('BUSY','Backend is busy; storage is not confirmed.');try{return fn();}finally{lock.releaseLock();}}
function mhdEqual_(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function mhdDigest_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');}
function mhdPasswordEqual_(a,b){var x=mhdDigest_(a),y=mhdDigest_(b),different=0;for(var i=0;i<x.length;i++)different|=x.charCodeAt(i)^y.charCodeAt(i);return different===0;}
function mhdCheckPassword_(password,cfg){
  if(typeof password!=='string'||password.length>256)throw mhdError_('UNAUTHORIZED','Wrong password or expired session.');
  return mhdLock_(function(){
    var now=Date.now(),state;try{state=JSON.parse(cfg.properties.getProperty('ADMIN_FAILURES')||'null');}catch(e){state=null;}
    if(!state||typeof state.until!=='number'||state.until<=now)state={count:0,until:now+15*60*1000};
    if(state.count>=5)throw mhdError_('RATE_LIMITED','Too many failed attempts. Wait until the 15-minute window ends.');
    if(!mhdPasswordEqual_(password,cfg.password)){state.count++;cfg.properties.setProperty('ADMIN_FAILURES',JSON.stringify(state));throw mhdError_('UNAUTHORIZED','Wrong password or expired session.');}
    cfg.properties.deleteProperty('ADMIN_FAILURES');return true;
  });
}
function mhdIssueSession_(cfg){
  var token=(Utilities.getUuid()+Utilities.getUuid()).replace(/-/g,''),expiresAt=Date.now()+MHD_SESSION_SECONDS*1000;
  CacheService.getScriptCache().put('mhd-session-'+mhdDigest_(token),JSON.stringify({expiresAt:expiresAt,passwordHash:mhdDigest_(cfg.password)}),MHD_SESSION_SECONDS);
  return {token:token,expiresAt:expiresAt};
}
function mhdCheckSession_(token,cfg){
  if(typeof token!=='string'||!/^[a-f0-9]{64}$/i.test(token))throw mhdError_('UNAUTHORIZED','Wrong password or expired session.');
  var key='mhd-session-'+mhdDigest_(token),raw=CacheService.getScriptCache().get(key),record;
  try{record=JSON.parse(raw||'null');}catch(e){record=null;}
  if(!record||record.expiresAt<=Date.now()||record.passwordHash!==mhdDigest_(cfg.password)){CacheService.getScriptCache().remove(key);throw mhdError_('UNAUTHORIZED','Wrong password or expired session.');}
  return record;
}
function mhdGetSheet_(ss,name){
  var columns=mhdColumns_(name),tab=ss.getSheetByName(name);
  if(!tab||tab.getLastRow()<1)throw mhdError_('MISSING_TAB','Run setupSheets() first.');
  var header=tab.getRange(1,1,1,columns.length).getValues()[0];
  if(tab.getLastColumn()!==columns.length||!mhdEqual_(header,columns))throw mhdError_('HEADER_MISMATCH','Sheet headers do not match the approved schema.');
  if(tab.getLastRow()-1>MHD_LIMITS[name])throw mhdError_('DATA_LIMIT','Dataset exceeds this demo application limit.');
  return tab;
}
function setupSheets(){
  var cfg=mhdConfig_();return mhdLock_(function(){var ss=SpreadsheetApp.openById(cfg.id);
    ['surveyA','sessionsB'].forEach(function(name){var columns=mhdColumns_(name),tab=ss.getSheetByName(name)||ss.insertSheet(name);
      if(tab.getLastRow()===0){tab.getRange(1,1,1,columns.length).setValues([columns]);tab.setFrozenRows(1);tab.getRange(1,1,1,columns.length).setFontWeight('bold');}
      mhdGetSheet_(ss,name);
    });
    SpreadsheetApp.flush();return {ok:true};
  });
}
function mhdNormalize_(sheet,columns,row,cfg){
  var allowed=mhdColumns_(sheet);
  if(!Array.isArray(columns)||!mhdEqual_(columns,allowed)||!Array.isArray(row)||row.length!==allowed.length)throw mhdError_('INVALID_COLUMNS','columns and row must exactly match the tab schema.');
  var record={};row.forEach(function(value,i){
    if(value===null)value='';
    if(!['string','number'].includes(typeof value)||(typeof value==='number'&&!Number.isFinite(value)))throw mhdError_('INVALID_CELL','Cells must be strings or finite numbers.');
    if(typeof value==='string'&&(/^[\s\u0000-\u001f\u007f\u200b-\u200d\ufeff]*[=+\-@]/.test(value)))throw mhdError_('FORMULA_BLOCKED','Formula-like text is forbidden in '+allowed[i]+'.');
    if(typeof value==='string'&&value.length>500)throw mhdError_('INVALID_CELL','Cell text is too long.');
    record[allowed[i]]=value;
  });
  if(![0,1].includes(record.is_simulated))throw mhdError_('INVALID_FLAG','is_simulated must be number 0 or 1.');
  if(cfg.demo&&record.is_simulated!==1)throw mhdError_('DEMO_ONLY','Demo mode accepts simulated data only.');
  if(sheet==='surveyA'){
    var a=MHD_CORE.validateA(Object.assign({},record,{consent:true}));if(a.errors.length)throw mhdError_('INVALID_ROW','Invalid A fields: '+a.errors.join(', '));return allowed.map(function(k){return a.row[k];});
  }
  if(MHD_CORE.validateB(record).length)throw mhdError_('INVALID_ROW','Invalid B fields.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(record.date)||!Number.isFinite(Date.parse(record.date+'T00:00:00.000Z'))||new Date(record.date+'T00:00:00.000Z').toISOString().slice(0,10)!==record.date)throw mhdError_('INVALID_ROW','Invalid date.');
  if(!Number.isInteger(record.duration_sec)||record.duration_sec<0||record.duration_sec>600||!['',1,2,3,4].includes(record.session_order))throw mhdError_('INVALID_ROW','Invalid session duration/order.');
  var b=MHD_CORE.buildB(record);b.session_order=record.session_order;
  try{b.track_url=MHD_CORE.cleanURL(b.track_url);}catch(e){throw mhdError_('INVALID_ROW','Invalid track URL.');}
  return allowed.map(function(k){return b[k];});
}
function mhdRows_(tab,columns,ss){
  var n=tab.getLastRow()-1;if(!n)return [];
  return tab.getRange(2,1,n,columns.length).getValues().map(function(row){return row.map(function(v,i){if(v instanceof Date){if(columns[i]!=='date')throw mhdError_('INVALID_STORED_ROW','Unexpected date cell.');return Utilities.formatDate(v,ss.getSpreadsheetTimeZone(),'yyyy-MM-dd');}return v;});});
}
function mhdAppend_(body,cfg){
  var name=body.sheet,cols=mhdColumns_(name),row=mhdNormalize_(name,body.columns,body.row,cfg);
  return mhdLock_(function(){var ss=SpreadsheetApp.openById(cfg.id),tab=mhdGetSheet_(ss,name),rows=mhdRows_(tab,cols,ss),pid=row[0];
    if(rows.some(function(old){return mhdEqual_(old,row);}))return {ok:true,sheet:name,duplicate:true};
    if(rows.length>=MHD_LIMITS[name])throw mhdError_('DATA_LIMIT','Application row limit reached.');
    if(name==='surveyA'&&rows.some(function(r){return r[0]===pid;}))throw mhdError_('PID_CONFLICT','This participant code already has a different A response.');
    if(name==='sessionsB'){
      var aTab=mhdGetSheet_(ss,'surveyA'),aRows=mhdRows_(aTab,MHD_CORE.A_COLS,ss),a=aRows.find(function(r){return r[0]===pid;});
      if(!a)throw mhdError_('MISSING_A','Submit surveyA first.');
      if(a[MHD_CORE.A_COLS.indexOf('is_simulated')]!==row[cols.indexOf('is_simulated')])throw mhdError_('INVALID_FLAG','A and B simulation flags must agree.');
      if(rows.filter(function(r){return r[0]===pid;}).length>=4)throw mhdError_('SESSION_LIMIT','Maximum four B sessions for this code.');
    }
    // Keep the date as literal YYYY-MM-DD text. Numeric negative delta remains a number.
    if(name==='sessionsB')tab.getRange(tab.getLastRow()+1,cols.indexOf('date')+1).setNumberFormat('@');
    var range=tab.getRange(tab.getLastRow()+1,1,1,cols.length);range.setValues([row]);SpreadsheetApp.flush();
    return {ok:true,sheet:name,duplicate:false};
  });
}
function mhdRead_(cfg){return mhdLock_(function(){var ss=SpreadsheetApp.openById(cfg.id),out={ok:true,demo:cfg.demo};
  ['surveyA','sessionsB'].forEach(function(name){var cols=mhdColumns_(name),tab=mhdGetSheet_(ss,name);out[name]=mhdRows_(tab,cols,ss).map(function(row){var normalized=mhdNormalize_(name,cols,row,cfg);return Object.fromEntries(cols.map(function(k,i){return [k,normalized[i]];}));});});return out;
});}
function doGet(){return mhdJson_({ok:true,service:'Music Healing DNA Apps Script',version:1});} // No data or passwords in GET.
function doPost(e){try{
  if(!e||!e.postData||typeof e.postData.contents!=='string'||e.postData.contents.length>32768)throw mhdError_('INVALID_BODY','JSON body missing or too large.');
  var body;try{body=JSON.parse(e.postData.contents);}catch(err){throw mhdError_('INVALID_JSON','Body is not valid JSON.');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw mhdError_('INVALID_BODY','Expected a JSON object.');
  if(body.action==='health')return doGet();
  var cfg=mhdConfig_();
  if(body.action==='read'){
    var session;
    if(Object.prototype.hasOwnProperty.call(body,'password')){mhdCheckPassword_(body.password,cfg);session=mhdIssueSession_(cfg);}else{session=mhdCheckSession_(body.token,cfg);}
    var data=mhdRead_(cfg);if(body.password!==undefined){data.token=session.token;data.expiresAt=session.expiresAt;}return mhdJson_(data);
  }
  if(body.action==='logout'){mhdCheckSession_(body.token,cfg);CacheService.getScriptCache().remove('mhd-session-'+mhdDigest_(body.token));return mhdJson_({ok:true});}
  if(body.action!==undefined&&body.action!=='append')throw mhdError_('INVALID_ACTION','Unsupported action.');
  return mhdJson_(mhdAppend_(body,cfg));
}catch(error){return mhdJson_({ok:false,error:{code:error.publicCode||'BACKEND_ERROR',message:error.publicCode?error.message:'Backend error. Check deployment settings and Apps Script Executions privately.'}});}}
