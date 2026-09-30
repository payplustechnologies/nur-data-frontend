import { api, money, session } from './api.js';
import { backgroundRefresh, escapeHtml, handleAdminError, initAdminShell, loading, openLegacyModal, pageCache } from './shell.js?v=20260913-7';

initAdminShell('transactions');
const $ = (selector) => document.querySelector(selector);
const state = { status:new URLSearchParams(location.search).get('status') || 'all', page:1 };
let exportPeriod = 'week';
const cache = pageCache('transactions');
let hasRendered = false;
const meta = (status) => String(status) === '1' ? ['Successful','success'] : String(status) === '2' ? ['Pending','warning'] : ['Failed','danger'];

function renderTransactions(out) {
  const pager = out.transactions || { data:[] };
  Object.entries(out.counts || {}).forEach(([key,value]) => document.querySelector(`[data-count="${key}"]`)?.replaceChildren(String(value)));
  $('#transactions-body').innerHTML = (pager.data || []).map((transaction,index) => {
    const [label,style] = meta(transaction.status);
    const number = index + 1 + ((pager.current_page || 1) - 1) * (pager.per_page || 25);
    return `<tr><td><input class="transaction-select" type="checkbox" value="${transaction.id}" aria-label="Select transaction ${escapeHtml(transaction.transid || transaction.id)}"></td><td>${number}.</td><td>${escapeHtml(transaction.username || '')}</td><td>${escapeHtml(transaction.transid || '')}</td><td>${escapeHtml(transaction.network || '')}</td><td>${escapeHtml(transaction.service || '')}</td><td>${escapeHtml(transaction.mobile || '')}</td><td>${escapeHtml(transaction.plans || '')}</td><td>${escapeHtml(transaction.type || '')}</td><td>${money(transaction.amount)}</td><td>${money(transaction.profit)}</td><td>${escapeHtml(transaction.date || '')}</td><td><span class="btn btn-${style} btn-sm">${label}</span></td><td><button class="btn btn-success btn-sm" data-view="${transaction.id}" title="View"><i class="fa fa-eye"></i></button> <button class="btn btn-warning btn-sm" data-status-update="${transaction.id}" title="Update status"><i class="fa fa-edit"></i></button> <button class="btn btn-danger btn-sm" data-delete="${transaction.id}" title="Delete"><i class="fa fa-trash"></i></button></td></tr>`;
  }).join('') || '<tr><td colspan="14" class="text-center py-4"><b>No Transaction Made Yet</b></td></tr>';
  $('#page-info').textContent = `Showing ${pager.from || 0} to ${pager.to || 0} of ${pager.total || 0} transactions`;
  $('#prev').disabled = !pager.prev_page_url; $('#next').disabled = !pager.next_page_url; $('#select-all-transactions').checked = false;
  updateSelection(); hasRendered = true;
}

async function loadTransactions(silent = false) {
  const params = new URLSearchParams({ status:state.status, page:state.page, per_page:25, search:$('#search').value, from:$('#from').value, to:$('#to').value });
  try { const out=await api(`/admin/transactions?${params}`);renderTransactions(out);cache.write(out); }
  catch (error) { if (!silent && !hasRendered) handleAdminError(error,'Unable to load transactions'); }
}

async function receipt(id) {
  loading('Loading transaction…');
  try {
    const transaction=(await api(`/admin/transactions/${id}`)).data,[label,style]=meta(transaction.status);Swal.close();
    const field=(name,value)=>`<div class="col-md-6"><div class="form-group"><label>${name}</label><div class="form-control legacy-readonly">${value}</div></div></div>`;
    openLegacyModal({title:'View Transaction',body:`<div class="row">${field('Username',escapeHtml(transaction.username||''))}${field('Transaction ID',escapeHtml(transaction.transid||''))}${field('Network',escapeHtml(transaction.network||''))}${field('Service',escapeHtml(transaction.service||''))}${field('Mobile Number',escapeHtml(transaction.mobile||''))}${field('Plan',escapeHtml(transaction.plans||''))}${field('Type',escapeHtml(transaction.type||''))}${field('Amount',money(transaction.amount))}${field('Profit',money(transaction.profit))}${field('Old Balance',money(transaction.oldbal))}${field('New Balance',money(transaction.newbal))}${field('Date',escapeHtml(transaction.date||''))}${field('Status',`<span class="badge badge-${style}">${label}</span>`)}${field('API Response',escapeHtml(transaction.api_response||''))}</div>`,confirmText:'Update Status',onConfirm:(_host,close)=>{close();manageStatus(id)}});
  } catch (error) { handleAdminError(error); }
}

async function manageStatus(id) {
  const choice=await Swal.fire({title:'Update transaction',input:'select',inputOptions:{success_only:'Mark successful only',success_debit:'Mark successful and debit user',failed_only:'Mark failed only',failed_refund:'Mark failed and refund user'},inputPlaceholder:'Select an action',showCancelButton:true,confirmButtonColor:'#132b86',inputValidator:(value)=>!value&&'Select an action'});if(!choice.isConfirmed)return;
  const confirmation=await Swal.fire({icon:'warning',title:'Confirm balance action',text:'Some status actions change the customer wallet balance.',showCancelButton:true,confirmButtonText:'Proceed',confirmButtonColor:'#d97706'});if(!confirmation.isConfirmed)return;
  loading('Updating transaction…');try{const out=await api(`/admin/transactions/${id}/status`,{method:'PATCH',body:JSON.stringify({action_type:choice.value})});await Swal.fire('Completed',out.message,'success');await loadTransactions()}catch(error){handleAdminError(error)}
}

async function deleteTx(id) { const confirmation=await Swal.fire({icon:'warning',title:'Delete transaction?',text:'The transaction record will be permanently removed.',showCancelButton:true,confirmButtonText:'Delete',confirmButtonColor:'#d33'});if(!confirmation.isConfirmed)return;loading('Deleting…');try{const out=await api(`/admin/transactions/${id}`,{method:'DELETE'});await Swal.fire('Deleted',out.message,'success');await loadTransactions()}catch(error){handleAdminError(error)} }
function selectedIds(){return [...document.querySelectorAll('.transaction-select:checked')].map((box)=>Number(box.value))}
function updateSelection(){const ids=selectedIds(),boxes=document.querySelectorAll('.transaction-select');$('#selected-count').textContent=ids.length;$('#bulk-delete').disabled=!ids.length;$('#select-all-transactions').checked=boxes.length>0&&ids.length===boxes.length;$('#select-all-transactions').indeterminate=ids.length>0&&ids.length<boxes.length}
async function bulkDelete(){const ids=selectedIds();if(!ids.length)return;const confirmation=await Swal.fire({icon:'warning',title:'Delete selected transactions?',text:`You are about to permanently delete ${ids.length} transaction${ids.length===1?'':'s'}.`,showCancelButton:true,confirmButtonText:'Delete Selected',confirmButtonColor:'#d33'});if(!confirmation.isConfirmed)return;loading('Deleting transactions…');try{const out=await api('/admin/transactions/bulk-delete',{method:'DELETE',body:JSON.stringify({ids})});await Swal.fire({icon:'success',title:out.title||'Deleted',text:out.message,confirmButtonColor:'#132b86'});await loadTransactions()}catch(error){handleAdminError(error)}}

function localDate(value) {
  const year=value.getFullYear(),month=String(value.getMonth()+1).padStart(2,'0'),day=String(value.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

function reportRange() {
  const today=new Date();
  if(exportPeriod==='custom') return {from:$('#export-from').value,to:$('#export-to').value,label:'Custom date range'};
  if(exportPeriod==='month') return {from:localDate(new Date(today.getFullYear(),today.getMonth(),1)),to:localDate(today),label:'This month'};
  const start=new Date(today);const weekday=start.getDay()||7;start.setDate(start.getDate()-weekday+1);
  return {from:localDate(start),to:localDate(today),label:'This week'};
}

function printableDate(value) {
  if(!value)return '—';
  const parsed=new Date(String(value).replace(' ','T'));
  return Number.isNaN(parsed.getTime())?String(value):parsed.toLocaleString('en-NG',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function pdfMoney(value) {
  return `NGN ${Number(value||0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}

function rgbFromHex(value) {
  const match=String(value||'').trim().match(/^#?([\da-f]{6})$/i);if(!match)return [19,43,134];
  return [parseInt(match[1].slice(0,2),16),parseInt(match[1].slice(2,4),16),parseInt(match[1].slice(4,6),16)];
}

async function fetchReportTransactions(range) {
  const rows=[];let page=1,lastPage=1;
  do {
    const params=new URLSearchParams({status:state.status,page,per_page:100,search:$('#search').value,from:range.from,to:range.to});
    const out=await api(`/admin/transactions?${params}`);const pager=out.transactions||{};
    rows.push(...(pager.data||[]));lastPage=Number(pager.last_page||1);page++;
  } while(page<=lastPage);
  return rows;
}

function buildTransactionPdf(rows,range) {
  const jsPDF=window.jspdf?.jsPDF;if(!jsPDF)throw new Error('The PDF generator could not be loaded. Check your connection and try again.');
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
  if(typeof doc.autoTable!=='function')throw new Error('The PDF table generator could not be loaded.');
  const brand=(document.querySelector('.legacy-logo span')?.textContent||'MBR DATA').trim();
  const admin=session().admin||{};const adminName=admin.name||admin.username||'Administrator';
  const brandRgb=rgbFromHex(getComputedStyle(document.documentElement).getPropertyValue('--brand'));
  const statusLabel=state.status==='all'?'All statuses':meta(state.status)[0];
  const totals=rows.reduce((out,row)=>{out.amount+=Number(row.amount||0);out.profit+=Number(row.profit||0);out[String(row.status)]=(out[String(row.status)]||0)+1;return out},{amount:0,profit:0,'0':0,'1':0,'2':0});

  doc.setFillColor(...brandRgb);doc.rect(0,0,297,36,'F');
  doc.setFillColor(255,255,255);doc.roundedRect(14,9,18,18,4,4,'F');doc.setTextColor(...brandRgb);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(brand.charAt(0).toUpperCase(),23,20.5,{align:'center'});
  doc.setTextColor(255,255,255);doc.setFontSize(17);doc.text(`${brand} Transaction Report`,38,16);doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(220,228,255);doc.text(`${range.label}  |  ${range.from} to ${range.to}  |  ${statusLabel}`,38,23);
  doc.text(`Generated ${new Date().toLocaleString('en-NG')} by ${adminName}`,283,18,{align:'right'});

  const summaries=[['TRANSACTIONS',String(rows.length)],['SUCCESSFUL',String(totals['1'])],['TOTAL VALUE',pdfMoney(totals.amount)],['TOTAL PROFIT',pdfMoney(totals.profit)]];
  summaries.forEach(([label,value],index)=>{const x=14+(index*68);doc.setFillColor(247,249,253);doc.setDrawColor(229,233,241);doc.roundedRect(x,43,62,20,3,3,'FD');doc.setTextColor(124,135,153);doc.setFontSize(7);doc.setFont('helvetica','bold');doc.text(label,x+5,50);doc.setTextColor(27,37,54);doc.setFontSize(11);doc.text(value,x+5,58);});

  const body=rows.map((row,index)=>[index+1,printableDate(row.date),String(row.transid||row.id||''),String(row.username||''),String(row.service||''),String(row.network||''),String(row.mobile||''),pdfMoney(row.amount),pdfMoney(row.profit),meta(row.status)[0]]);
  doc.autoTable({startY:69,head:[['#','Date','Transaction ID','Username','Service','Network','Beneficiary','Amount','Profit','Status']],body,theme:'grid',styles:{font:'helvetica',fontSize:7,cellPadding:2.2,textColor:[42,51,66],lineColor:[226,231,239],lineWidth:.15,overflow:'linebreak'},headStyles:{fillColor:brandRgb,textColor:[255,255,255],fontStyle:'bold',halign:'left'},alternateRowStyles:{fillColor:[248,250,253]},columnStyles:{0:{cellWidth:9,halign:'center'},1:{cellWidth:31},2:{cellWidth:34},3:{cellWidth:27},4:{cellWidth:25},5:{cellWidth:20},6:{cellWidth:29},7:{cellWidth:28,halign:'right'},8:{cellWidth:24,halign:'right'},9:{cellWidth:21,halign:'center',fontStyle:'bold'}},didParseCell(data){if(data.section==='body'&&data.column.index===9){const label=String(data.cell.raw);data.cell.styles.textColor=label==='Successful'?[22,145,81]:label==='Pending'?[194,120,3]:[210,52,52];}},didDrawPage(data){const page=doc.internal.getNumberOfPages();doc.setDrawColor(225,230,238);doc.line(14,199,283,199);doc.setFontSize(7);doc.setTextColor(135,145,160);doc.text('Confidential administrative report · A Product of PayPlus Technologies',14,204);doc.text(`Page ${page}`,283,204,{align:'right'});}});
  if(!rows.length){doc.setFontSize(12);doc.setTextColor(125,135,150);doc.text('No transactions were found for this reporting period.',148.5,92,{align:'center'});}
  const safeBrand=brand.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');doc.save(`${safeBrand||'transactions'}-${range.from}-to-${range.to}.pdf`);
}

async function exportTransactions() {
  const range=reportRange();
  if(!range.from||!range.to){await Swal.fire({icon:'warning',title:'Select a date range',text:'Choose both the start and end dates before exporting.',confirmButtonColor:'#132b86'});return;}
  if(range.from>range.to){await Swal.fire({icon:'warning',title:'Invalid date range',text:'The start date cannot be after the end date.',confirmButtonColor:'#132b86'});return;}
  const confirmation=await Swal.fire({icon:'question',title:'Download transaction report?',html:`Generate a PDF for <b>${escapeHtml(range.from)}</b> to <b>${escapeHtml(range.to)}</b>?`,showCancelButton:true,confirmButtonText:'Generate PDF',confirmButtonColor:'#132b86'});if(!confirmation.isConfirmed)return;
  loading('Preparing transaction report…');
  try{const rows=await fetchReportTransactions(range);buildTransactionPdf(rows,range);Swal.close();await Swal.fire({icon:'success',title:'Report downloaded',text:`${rows.length} transaction${rows.length===1?'':'s'} included in the PDF.`,confirmButtonColor:'#132b86'});}catch(error){handleAdminError(error,'Unable to generate report');}
}

document.querySelectorAll('[data-status]').forEach((button)=>button.onclick=()=>{document.querySelectorAll('[data-status]').forEach((item)=>item.className='btn btn-light btn-sm');button.className=`btn btn-${button.dataset.status==='all'?'secondary':button.dataset.status==='1'?'success':button.dataset.status==='2'?'warning':'danger'} btn-sm active`;state.status=button.dataset.status;state.page=1;loadTransactions()});
$('#filter-transactions').onclick=()=>loadTransactions();$('#reset-transactions').onclick=()=>{$('#search').value='';$('#from').value='';$('#to').value='';loadTransactions()};$('#prev').onclick=()=>{state.page--;loadTransactions()};$('#next').onclick=()=>{state.page++;loadTransactions()};$('#select-all-transactions').onchange=(event)=>{document.querySelectorAll('.transaction-select').forEach((box)=>box.checked=event.target.checked);updateSelection()};$('#bulk-delete').onclick=bulkDelete;$('#transactions-body').onchange=(event)=>{if(event.target.matches('.transaction-select'))updateSelection()};
$('#transactions-body').onclick=(event)=>{const view=event.target.closest('[data-view]'),status=event.target.closest('[data-status-update]'),remove=event.target.closest('[data-delete]');if(view)receipt(view.dataset.view);if(status)manageStatus(status.dataset.statusUpdate);if(remove)deleteTx(remove.dataset.delete)};
document.querySelectorAll('[data-export-period]').forEach((button)=>button.onclick=()=>{exportPeriod=button.dataset.exportPeriod;document.querySelectorAll('[data-export-period]').forEach((item)=>item.classList.toggle('active',item===button));$('#export-custom-dates').hidden=exportPeriod!=='custom';});
const today=new Date();$('#export-to').value=localDate(today);$('#export-from').value=localDate(new Date(today.getFullYear(),today.getMonth(),1));$('#export-transactions').onclick=exportTransactions;

const saved=cache.read();if(saved)renderTransactions(saved);loadTransactions(Boolean(saved));backgroundRefresh(()=>loadTransactions(true),30000);
