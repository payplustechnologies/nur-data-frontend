import { APP_CONFIG } from './config.js';
import { api, getSession, notify } from './api.js';
import { bootShell, copyText } from './shell.js';

let user=bootShell('developer-api');
const base=APP_CONFIG.API_BASE_URL.replace(/\/$/,'');
const endpoints=[
['User Details','GET','/user','Authorization token only','Fetch profile, wallet and API account details.'],['Transaction History','GET','/transactions','status, service, search, per_page optional','Fetch transaction history.'],['Airtime Purchase','POST','/topup','network, mobile_number, amount, airtime_type, Ported_number, request-id','Legacy airtime endpoint.'],['Data Purchase','POST','/data','network, mobile_number, plan, Ported_number, request-id','Legacy data endpoint.'],['Cable Verification','POST','/cable/verification','provider, smart_card_number','Also supports /cable/verify.'],['Cable Purchase','POST','/cable','provider, plan, smart_card_number, request-id','Also supports /cable/purchase.'],['Electricity Verification','POST','/electricity/verification','disco, meter_number, meter_type','Also supports /electricity/verify.'],['Electricity Purchase','POST','/electricity','disco, meter_number, meter_type, amount, customer_phone, request-id','Legacy electricity endpoint.'],['Exam PIN Purchase','POST','/exampin','exam_name, examid, quantity, request-id','Legacy exam PIN endpoint.'],['NIN Verification','POST','/nin','nin or phone, slip_type, request-id','NIN must be 11 digits.'],['BVN Verification','POST','/bvn','bvn or phone, slip_type, request-id','BVN must be 11 digits.'],['Smile Purchase','POST','/smile/purchase','identifier, product_type, account_type, plan_code or amount, request-id','Bundle or recharge purchase.'],['Alpha Topup','POST','/alpha/purchase','phone, planid, amount, request-id','Alpha topup purchase.'],['Ratel','POST','/ratel/purchase','phone, planid, amount, request-id','Ratel purchase.'],['Kirani','POST','/kirani/purchase','phone, planid, amount, minutes, request-id','Kirani purchase.'],['Transfer','POST','/transfer','bank_code, account_number, amount, description, request-id','Legacy transfer endpoint.']];
const examples=[
['Airtime Purchase','/topup',{network:'1',mobile_number:'08031234567',amount:100,airtime_type:'VTU',Ported_number:true,'request-id':'AIRTIME-20260621-0001'}],['Data Purchase','/data',{network:1,mobile_number:'08031234567',plan:'101',Ported_number:true,'request-id':'DATA-20260621-0001'}],['Cable Verification','/cable/verification',{provider:'dstv',smart_card_number:'1234567890'}],['Electricity Purchase','/electricity',{disco:'ikeja-electric',meter_number:'12345678901',meter_type:'prepaid',amount:1000,customer_phone:'08031234567','request-id':'POWER-20260621-0001'}],['Exam PIN Purchase','/exampin',{exam_name:'WAEC',examid:'1',quantity:1,'request-id':'EXAM-20260621-0001'}],['NIN Verification','/nin',{nin:'12345678901',slip_type:'regular','request-id':'NIN-20260621-0001'}]];
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function expectedResponse(service){
 const responses={
  'User Details':{success:true,user:{username:'customer',balance:'5000.00',apikey:'YOUR_API_KEY'}},
  'Transaction History':{success:true,data:[{transid:'TXN-0001',service:'DATA',amount:'500.00',status:1}]},
  'Airtime Purchase':{status:'successful',transid:'AIRTIME-0001',network:'MTN',mobile_number:'08031234567',amount:'100.00',newbal:'4902.00'},
  'Data Purchase':{status:'successful',transid:'DATA-0001',network:'MTN',plan_name:'1GB - 30 Days',mobile_number:'08031234567',newbal:'4500.00'},
  'Cable Verification':{success:true,status:'success',customer_name:'JOHN DOE',provider:'dstv',smart_card_number:'1234567890'},
  'Cable Purchase':{status:'successful',transid:'CABLE-0001',provider:'DSTV',plan:'DStv Yanga',amount:'5100.00'},
  'Electricity Verification':{success:true,status:'success',customer_name:'JOHN DOE',meter_number:'12345678901',meter_type:'prepaid'},
  'Electricity Purchase':{status:'successful',transid:'POWER-0001',meter_number:'12345678901',token:'1234-5678-9012-3456',amount:'1000.00'},
  'Exam PIN Purchase':{status:'successful',transid:'EXAM-0001',exam_name:'WAEC',pins:['123456789012'],serials:['WRN123456']},
  'NIN Verification':{status:'successful',transid:'NIN-0001',service:'NIN',slip_type:'regular',pdf_url:'https://example.com/slip.pdf'},
  'BVN Verification':{status:'successful',transid:'BVN-0001',service:'BVN',slip_type:'regular',pdf_url:'https://example.com/slip.pdf'},
  'Smile Purchase':{status:'successful',transid:'SMILE-0001',service:'SMILE_DATA',identifier:'08031234567',amount:'1000.00'},
  'Alpha Topup':{status:'successful',transid:'ALPHA-0001',phone:'08031234567',amount:'500.00'},
  'Ratel':{status:'successful',transid:'RATEL-0001',phone:'08031234567',amount:'500.00'},
  'Kirani':{status:'successful',transid:'KIRANI-0001',phone:'08031234567',minutes:'30',amount:'500.00'},
  'Transfer':{status:'successful',transid:'TRANSFER-0001',account_number:'0123456789',amount:'1000.00',message:'Transfer successful'}
 };
 return responses[service]||{status:'successful',message:'Request completed successfully'};
}
document.querySelector('#api-base').textContent=base;
document.querySelector('#endpoint-list').closest('table').querySelector('thead tr').insertAdjacentHTML('beforeend','<th>Expected Response</th>');
document.querySelector('#endpoint-list').innerHTML=endpoints.map(([service,method,path,fields,note])=>`<tr><td>${service}</td><td><span class="method-badge method-${method.toLowerCase()}">${method}</span></td><td><code>${base}${path}</code></td><td>${fields}</td><td>${note}</td><td><details class="response-preview"><summary>View JSON</summary><pre>${esc(JSON.stringify(expectedResponse(service),null,2))}</pre></details></td></tr>`).join('');
document.querySelector('#api-examples').innerHTML=examples.map(([title,path,payload])=>`<article class="panel doc-example"><div class="doc-section-head"><div><h3>${title}</h3><p class="doc-muted"><span class="method-badge method-post">POST</span> <code>${base}${path}</code></p></div><button class="icon-btn" data-example="${esc(JSON.stringify(payload))}"><i class="bi bi-copy"></i></button></div><p class="doc-muted">Request payload</p><pre class="code-sample"><code>${esc(JSON.stringify(payload,null,2))}</code></pre></article>`).join('');
let key=user.apikey||user.api_key||getSession().token||'',visible=false;const keyNode=document.querySelector('#api-key');const renderKey=()=>keyNode.textContent=visible?(key||'Not available'):(key?`${key.slice(0,7)}••••••••••••${key.slice(-4)}`:'Not available');renderKey();
document.querySelector('[data-copy-base]').onclick=()=>copyText(base,'Base URL copied.');document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyText(document.querySelector(`#${b.dataset.copy}`).textContent,'Copied.'));document.querySelector('[data-copy-key]').onclick=()=>copyText(key,'API key copied.');document.querySelector('#toggle-key').onclick=(e)=>{visible=!visible;e.currentTarget.querySelector('i').className=`bi bi-eye${visible?'-slash':''}`;renderKey()};document.querySelector('#copy-endpoints').onclick=()=>copyText(endpoints.map(([,m,p])=>`${m} ${base}${p}`).join('\n'),'Endpoint list copied.');document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>copyText(JSON.stringify(JSON.parse(b.dataset.example),null,2),'Sample copied.'));
api('/me').then(r=>{user=r.user||r;key=user.apikey||user.api_key||key;renderKey()}).catch(()=>notify('Using your locally saved API key.'));
