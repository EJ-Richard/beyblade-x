(function(){
'use strict';
const M=window.BBX_META, ITEMS=window.BBX_ITEMS||[];
const R=M.rate.jpy_to_twd;
const SER={BX:{name:'BX 基本系列（Basic Line）',jp:'ベーシックライン',c:'var(--bx)',d:'最初的 BEYBLADE X 系統：上蓋（Blade）＋固鎖（Ratchet）＋軸心（Bit）三件式。'},
 UX:{name:'UX 獨特系列（Unique Line）',jp:'ユニークライン',c:'var(--ux)',d:'2024 年起推出，加入特殊構造的上蓋、固鎖與軸心，如一體式軸心、高度 70 固鎖等。'},
 CX:{name:'CX 客製系列（Custom Line）',jp:'カスタムライン',c:'var(--cx)',d:'2025 年起推出，上蓋可再拆成鎖片（Lock Chip）、主刃、輔助刃等多層零件自由組合。'}};
const TYPES=['攻擊','防禦','耐久','平衡'];
const KINDS=['入門組','雙入門組','補充包','選色補充包','隨機包','套組'];
const st={tab:'products',q:'',series:new Set(),type:new Set(),kind:new Set(),acc:new Set(),misc:new Set(),groupBy:'series',sortBy:'release'};
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nt=n=>'NT$'+Math.round(n).toLocaleString('en-US');
const yen=n=>'¥'+n.toLocaleString('en-US');
$('#cntAll').textContent=M.counts.total;$('#cntProd').textContent=M.counts.products;$('#cntAcc').textContent=M.counts.accessories;
$('#lines').innerHTML=Object.entries(SER).map(([k,s])=>{const n=ITEMS.filter(i=>i.series===k).length;return `<div class="line" data-ser="${k}"><span class="n">${n} 項</span><h3>${s.name}</h3><div class="bar" role="img" aria-label="${k} 佔全部 ${Math.round(n/ITEMS.length*100)}%"><span style="width:${(n/ITEMS.length*100).toFixed(1)}%"></span></div><p>${s.jp}｜${s.d}</p></div>`}).join('');
$('#legend').innerHTML='<span>系列配色：</span>'+Object.keys(SER).map(k=>`<span class="sw" data-ser="${k}"><i></i>${k} ${SER[k].name.split('（')[0].split(' ')[1]}</span>`).join('');
$('#footMeta').innerHTML=`資料來源：<a href="${M.source}" target="_blank" rel="noopener">Takara Tomy BEYBLADE X 官方製品情報</a>及各零售商頁面｜價格與連結檢查日：${M.checked_date}｜匯率：1 JPY = ${R} TWD（${esc(M.rate.source)}，${esc(M.rate.as_of)}）｜建置：${esc(M.built)}`;
function pool(){return ITEMS.filter(i=>st.tab==='accessories'?i.accessory:!i.accessory)}
function chipRow(el,label,vals,set,countFn,ser){
  el.innerHTML=`<span class="lab">${label}</span>`+vals.map(v=>`<span class="chip${set.has(v[0])?' on':''}" data-v="${esc(v[0])}"${ser?` data-ser="${esc(v[0])}"`:''}>${esc(v[1])}<span class="c">${countFn(v[0])}</span></span>`).join('');
  el.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const v=c.dataset.v;set.has(v)?set.delete(v):set.add(v);render()});
}
function matches(i,skip){
  if(skip!=='series'&&st.series.size&&!st.series.has(i.series))return false;
  if(skip!=='type'&&st.type.size&&!st.type.has(i.type||'無'))return false;
  if(skip!=='kind'&&st.kind.size&&!st.kind.has(i.kind))return false;
  if(skip!=='acc'&&st.acc.size&&!st.acc.has(i.acc_sub))return false;
  if(skip!=='misc'){
    if(st.misc.has('tw')&&!i.links.some(l=>l.region==='TW'&&!l.search))return false;
    if(st.misc.has('nolim')&&i.limited)return false;
    if(st.misc.has('lim')&&!i.limited)return false;
  }
  if(st.q){const h=(i.code+' '+i.name_jp+' '+i.name_zh+' '+i.name_en+' '+i.kind+' '+(i.type||'')+' '+(i.acc_sub||'')+' '+(i.jan||'')).toLowerCase();
    if(!st.q.toLowerCase().split(/\s+/).every(w=>h.includes(w)))return false}
  return true;
}
function controls(){
  const P=pool();
  const cnt=(k,f)=>v=>P.filter(i=>matches(i,k)&&f(i,v)).length;
  chipRow($('#fSeries'),'系列',[['BX','BX 基本'],['UX','UX 獨特'],['CX','CX 客製']],st.series,cnt('series',(i,v)=>i.series===v),true);
  if(st.tab==='products'){
    $('#fType').hidden=false;$('#fKind').hidden=false;$('#fAcc').hidden=true;
    chipRow($('#fType'),'戰鬥類型',TYPES.map(t=>[t,t+'型']).concat([['無','未分類型（套組等）']]),st.type,cnt('type',(i,v)=>(i.type||'無')===v));
    chipRow($('#fKind'),'商品種類',KINDS.map(k=>[k,k]),st.kind,cnt('kind',(i,v)=>i.kind===v));
  }else{
    $('#fType').hidden=true;$('#fKind').hidden=true;$('#fAcc').hidden=false;
    const subs=[...new Set(ITEMS.filter(i=>i.accessory).map(i=>i.acc_sub))];
    chipRow($('#fAcc'),'配件類別',subs.map(s=>[s,s]),st.acc,cnt('acc',(i,v)=>i.acc_sub===v));
  }
  chipRow($('#fMisc'),'其他',[['tw','有台灣商品頁'],['nolim','排除限定品'],['lim','只看限定品']],st.misc,v=>P.filter(i=>matches(i,'misc')&&(v==='tw'?i.links.some(l=>l.region==='TW'&&!l.search):v==='lim'?i.limited:!i.limited)).length);
}
function linkLi(l){
  const pr=l.price!=null?(l.currency==='JPY'?yen(l.price)+' ≈ '+nt(l.price*R):nt(l.price)):'<span class="na">暫無資料</span>';
  const meta=[l.title,l.ver?('版本：'+l.ver):'',l.stock?('庫存：'+l.stock):'','檢查 '+l.checked+(l.http&&l.http!=='200'?`（HTTP ${l.http==='000'?'逾時':l.http}）`:'')].filter(Boolean).join('｜');
  return `<li><a href="${esc(l.url)}" target="_blank" rel="noopener nofollow"><span><span class="st">${esc(l.store)}</span>${l.search?'<span class="srch">搜尋頁</span>':''}<span class="meta">${esc(meta)}</span></span><span class="pr">${pr}</span></a></li>`;
}
function card(i){
  const s=SER[i.series];
  const tw=i.links.filter(l=>l.region==='TW'), jp=i.links.filter(l=>l.region==='JP');
  let diff='';
  if(i.tw_min!=null&&i.jp_twd){const d=i.tw_min-i.jp_twd;const pct=Math.round(d/i.jp_twd*100);
    diff=d<0?`<div class="diff cheaper-tw">台灣最低價比日本定價換算便宜 ${nt(-d)}（${-pct}%）</div>`:`<div class="diff cheaper-jp">台灣最低價比日本定價換算貴 ${nt(d)}（+${pct}%）</div>`}
  const title=i.name_zh?esc(i.name_zh):esc(i.name_jp);
  return `<article class="card" data-ser="${i.series}">
  <div class="img">${i.image?`<img loading="lazy" src="${esc(i.image)}" alt="${esc(i.code+' '+i.name_jp)}" referrerpolicy="no-referrer">`:'<span class="noimg">無官方圖片</span>'}
   <span class="ser">${i.series}</span>${i.limited?`<span class="lim">${esc(i.limited_note||'限定品')}</span>`:''}</div>
  <div class="body">
   <div><span class="code">${esc(i.code)}</span> <span class="badge">${esc(i.accessory?(i.acc_sub||'配件'):i.kind)}</span></div>
   <div class="nm">${title}</div>
   <div class="jp">${esc(i.name_jp)}${i.name_en?' ・ '+esc(i.name_en):''}</div>
   <div class="tags">${i.type?`<span class="badge t-${i.type}">${i.type}型${i.left_spin?'（左迴旋）':''}</span>`:''}<span class="badge">官方分類：${esc(i.kind_jp)}</span><span class="badge">發售：${esc(i.release)}</span>${i.jan?`<span class="badge">JAN ${i.jan}</span>`:''}</div>
   <div class="price">
    <div class="row"><span>日本官方定價（含稅）</span><b>${i.price_jpy?yen(i.price_jpy)+' ≈ '+nt(i.jp_twd):'暫無資料'}</b></div>
    <div class="row"><span>台灣商品頁最低價</span><b>${i.tw_min!=null?nt(i.tw_min)+(i.tw_min_oos?'（缺貨）':''):'<span class="na">暫無資料</span>'}</b></div>
    ${diff}<div class="diff na">價格檢查日 ${M.checked_date}・匯率 ${R}</div>
   </div>
   <div class="links"><h4>🇹🇼 台灣通路</h4><ul>${tw.length?tw.map(linkLi).join(''):'<li class="na">暫無資料</li>'}</ul>
   <h4>🇯🇵 日本通路</h4><ul>${jp.length?jp.map(linkLi).join(''):'<li class="na">暫無資料</li>'}</ul></div>
   ${i.desc_jp?`<details class="desc"><summary>官方商品說明（日文原文）</summary><p>${esc(i.desc_jp)}</p></details>`:''}
   <a class="offl" href="${esc(i.official_url)}" target="_blank" rel="noopener">→ Takara Tomy 官方商品頁</a>
  </div></article>`;
}
function render(){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===st.tab));
  const about=st.tab==='about';
  $('#about').hidden=!about;$('#list').hidden=about;$('#controls').hidden=about;
  if(about){renderAbout();return}
  controls();
  let L=pool().filter(i=>matches(i));
  const so={release:(a,b)=>a.order-b.order,code:(a,b)=>a.code.localeCompare(b.code)||a.order-b.order,price:(a,b)=>a.price_jpy-b.price_jpy}[st.sortBy];
  L.sort(so);
  $('#resultInfo').textContent=`顯示 ${L.length} / ${pool().length} 項`+(st.tab==='accessories'?'配件':'陀螺商品');
  const gb=st.tab==='accessories'&&st.groupBy==='type'?'series':st.groupBy;
  const order={series:['BX','UX','CX'],type:TYPES.concat(['無']),kind:KINDS.concat(['配件'])}[gb];
  const key=i=>gb==='series'?i.series:gb==='type'?(i.type||'無'):i.kind;
  const label=k=>gb==='series'?SER[k].name:gb==='type'?(k==='無'?'未分類型（套組、雙入門組、隨機包等）':k+'型'):k;
  const html=order.map(k=>{const g=L.filter(i=>key(i)===k);if(!g.length)return'';
    return `<section class="group"${gb==='series'?` data-ser="${k}"`:''}><h2>${esc(label(k))} <span class="badge">${g.length} 項</span></h2><div class="grid">${g.map(card).join('')}</div></section>`}).join('');
  $('#list').innerHTML=html||'<div class="empty">沒有符合條件的商品</div>';
}
function renderAbout(){
  const c=ITEMS.length, tw=ITEMS.filter(i=>i.links.some(l=>l.region==='TW'&&!l.search)).length;
  $('#about').innerHTML=`
  <h2>官方系列（Line）</h2>
  <p>依 Takara Tomy 官方製品情報頁的篩選按鈕，BEYBLADE X 目前只有三條官方系列：<b>BX ベーシックライン（Basic Line）</b>、<b>UX ユニークライン（Unique Line）</b>、<b>CX カスタムライン（Custom Line）</b>。官方清單中<b>沒有「ZX」系列</b>（"ZX" 很可能是 "CX" 的語音辨識誤差）。</p>
  <table><tr><th>系列</th><th>本站收錄</th><th>其中配件</th></tr>${['BX','UX','CX'].map(k=>`<tr data-ser="${k}"><td>${SER[k].name}</td><td>${ITEMS.filter(i=>i.series===k).length}</td><td>${ITEMS.filter(i=>i.series===k&&i.accessory).length}</td></tr>`).join('')}</table>
  <h2>分類方式</h2>
  <ul><li><b>戰鬥類型</b>：依官方清單標示的攻擊／防禦／耐久／平衡。官方未標示類型的商品（多為套組、雙入門組、隨機包）歸為「未分類型」。</li>
  <li><b>商品種類</b>：スターター＝入門組、ダブルスターター＝雙入門組、ブースター＝補充包（台灣常稱強化組）、カラーチョイスブースター＝選色補充包、ランダムブースター＝隨機包（台灣稱隨機強化組）、セット＝套組。</li>
  <li><b>配件目錄</b>：官方分類「ツール」全部品項，以及官方列於套組中的「ビットセット」（軸心零件組）。</li>
  <li>型號 BX-00／UX-00／CX-00 為官方的限定品、活動品或特別商品編號，同一編號下有多項不同商品。</li></ul>
  <h2>價格與匯率</h2>
  <p>日本價格＝官方製品情報頁的建議售價（含稅）。換算匯率：<b>1 JPY = ${R} TWD</b>（${esc(M.rate.source)}，掛牌時間 ${esc(M.rate.as_of)}，<a href="${esc(M.rate.source_url)}" target="_blank" rel="noopener">來源</a>）。實際刷卡、代購費與國際運費未計入。</p>
  <p>台灣價格取自各通路商品頁於 ${M.checked_date} 的售價。momo、PChome 上多為第三方賣家，價格可能是台版、日版或未標示版本，請看連結上的「版本」說明；本站已排除美版（孩之寶）、韓版、泰版、組合加購、疑似仿品與價格明顯異常的商品頁。目前有台灣商品頁的品項：${tw} / ${c}。</p>
  <h2>連結說明</h2>
  <ul><li>所有連結均於 ${M.checked_date} 以 curl 檢查，回應 404 者已移除。標示「HTTP 逾時／403／503」者是零售商阻擋自動檢查，不代表頁面不存在。</li>
  <li>標示「搜尋頁」的是零售商搜尋結果，只在找不到單品頁時提供。</li>
  <li>Takara Tomy Mall 的 BEYBLADE X 單品頁多已在販售期結束後下架（檢查時 404），因此大多連到官方商城的 BEYBLADE X 分類頁；目前仍可開啟的單品頁才直接連結。Takara Tomy Mall 只出貨到日本國內，熱門商品採抽選販售。</li>
  <li>台灣代理為麗嬰國際（Funbox）。台灣官方賽事可能只承認代理版，購買前請確認。</li></ul>
  <h2>資料來源</h2>
  <ul><li><a href="${esc(M.source)}" target="_blank" rel="noopener">Takara Tomy BEYBLADE X 製品情報</a>（商品清單、型號、類型、定價、發售日、圖片）</li>
  <li>中文名稱：參考台灣玩家社群常用譯名（Go Shoot 商品圖鑑）與台灣通路商品名，僅供參考，非官方翻譯。</li>
  <li>台灣通路：Funbox 麗嬰官方購物網、玩具反斗城台灣、momo購物網、PChome 24h購物、蝦皮購物（搜尋）。日本通路：Takara Tomy Mall、Amazon.co.jp（搜尋）、ヨドバシ.com（搜尋）。</li></ul>
  ${M.dropped.length?`<p class="small">本次建置移除 ${M.dropped.length} 個 404 連結。</p>`:''}`;
}
if(['products','accessories','about'].includes(location.hash.slice(1)))st.tab=location.hash.slice(1);
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{st.tab=t.dataset.tab;history.replaceState(null,'','#'+st.tab);st.acc.clear();st.type.clear();st.kind.clear();render();window.scrollTo({top:document.querySelector('.tabs').offsetTop-60,behavior:'smooth'})});
let tm;$('#q').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{st.q=e.target.value.trim();render()},150)};
$('#groupBy').onchange=e=>{st.groupBy=e.target.value;render()};
$('#sortBy').onchange=e=>{st.sortBy=e.target.value;render()};
render();
})();
