let featureSession=null;
const $=s=>document.querySelector(s), colours=['#E69F00','#56B4E9','#009E73','#F0E442','#0072B2','#D55E00','#CC79A7'], colourNames=['Orange','Sky blue','Bluish green','Yellow','Blue','Vermilion','Reddish purple'],key='feature-flow-v1';let features=[],selectedColour=0,editing=null,current=null,view='grid',storageOK=true;
try{features=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(features))features=[]}catch{features=[];storageOK=false}
features.forEach(f=>f.contacts.forEach(c=>{if(!['customer','lead'].includes(c.type))c.type='customer'}));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const id=()=>crypto.randomUUID();
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',2600)}
function save(){if(featureSession){render();return}try{localStorage.setItem(key,JSON.stringify(features))}catch{storageOK=false;toast('Browser storage unavailable. Changes last only this session.')}render()}
let contactDisplay='all';
function visibleContacts(f){return f.contacts.filter(c=>contactDisplay==='all'||(c.type||'customer')===contactDisplay)}
$('#display').onchange=()=>{contactDisplay=$('#display').value;render();if($('#detail').open)openDetail(current)};
function related(f){return features.filter(x=>x.id!==f.id&&(f.links.includes(x.id)||x.links.includes(f.id)))}
function render(){$('#demo').textContent=features.some(f=>f.sampleKey!==undefined)?'Clear sample workspace ↗':'Explore a sample workspace ↗';const q=$('#search').value.toLowerCase(),shown=features.filter(f=>(f.name+' '+f.description).toLowerCase().includes(q));$('#count').textContent=features.length;$('#summary').textContent=`${features.reduce((n,f)=>n+visibleContacts(f).length,0)} contacts · ${features.reduce((n,f)=>n+related(f).length,0)/2} connections`;$('#grid').hidden=view!=='grid';$('#grid').style.display=view==='grid'?'grid':'none';$('#map').hidden=view!=='map';$('#mapSearchBar').hidden=view!=='map';$('#gridView').classList.toggle('active',view==='grid');$('#mapView').classList.toggle('active',view==='map');$('#grid').innerHTML=shown.length?shown.map((f,i)=>`<button class="card" style="--color:${colours[f.colour]};--tile-ink:${f.colour===4?'#ffffff':'#101820'}" data-open="${f.id}"><span class="number">FEATURE / ${String(i+1).padStart(2,'0')}</span><span class="arrow">↗</span><h3>${esc(f.name)}</h3><p>${esc(f.description||'A new possibility, ready to explore.')}</p><div class="card-bottom"><span>♙ ${visibleContacts(f).length} ${visibleContacts(f).length===1?'contact':'contacts'}</span><span>⌁ ${related(f).length} related</span></div></button>`).join(''):`<div class="empty"><div class="symbol">✳</div><h3>${q?'No features found':'Start with a spark.'}</h3><p>${q?'Try a different search.':'Add your first feature and give your customer conversations a place to grow.'}</p>${q?'':'<button class="primary" data-new>＋ New Feature</button>'}</div>`;renderMap(shown);if(!storageOK)$('footer>span').textContent='Session only · browser storage unavailable'}
function renderMap(shown){if(!shown.length){$('#map').innerHTML='<div class="empty"><h3>Your connections start here.</h3><p>Add features, then link related ideas to see your map.</p></div>';return}const n=shown.length,w=900,h=Math.max(430,Math.ceil(n/6)*200),points=shown.map((f,i)=>({f,x:n===1?w/2:w/2+Math.cos(i*2*Math.PI/n-Math.PI/2)*w*.34,y:n===1?h/2:h/2+Math.sin(i*2*Math.PI/n-Math.PI/2)*h*.34}));let lines='';points.forEach((a,i)=>points.slice(i+1).forEach(b=>{if(related(a.f).some(f=>f.id===b.f.id))lines+=`<line data-from="${a.f.id}" data-to="${b.f.id}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#6d9e90" stroke-width="2"/>`}));$('#map').innerHTML=`<div class="map-wrap"><svg viewBox="0 0 ${w} ${h}" style="height:${h}px" role="img" aria-label="Related features connection map">${lines}${points.map(({f,x,y})=>`<g style="color:${f.colour===4?'#ffffff':'#101820'}" data-open="${f.id}" tabindex="0" role="button" aria-label="Open ${esc(f.name)}"><rect x="${x-90}" y="${y-32}" width="180" height="64" rx="12" fill="${colours[f.colour]}"/><text x="${x}" y="${y-2}" text-anchor="middle">${mapReadableName(f.name,x)}</text><text x="${x}" y="${y+24}" text-anchor="middle" style="font-size:10px;font-weight:400">${visibleContacts(f).length} contacts · ${related(f).length} related</text></g>`).join('')}</svg></div><p style="color:var(--muted);font-size:11px">Select a feature to explore its contacts and connections. Search filters the map.</p>`}
function palette(){$('#palette').innerHTML=colours.map((c,i)=>`<button type="button" class="swatch ${i===selectedColour?'selected':''}" style="background:${c};color:${i===4?'#ffffff':'#101820'}" data-colour="${i}" aria-label="${colourNames[i]}" aria-pressed="${i===selectedColour}" title="${colourNames[i]}">${i+1}</button>`).join('')}
function openEditor(f=null){editing=f?.id||null;selectedColour=f?.colour||0;$('#name').value=f?.name||'';$('#description').value=f?.description||'';$('#editorTitle').textContent=f?'Edit feature':'New feature';palette();$('#editor').showModal();$('#name').focus()}
function openDetail(fid){const f=features.find(f=>f.id===fid);if(!f)return;current=fid;$('#detail').innerHTML=`<div class="dialog-top"><span class="eyebrow" style="color:${colours[f.colour]}">FEATURE DETAILS</span><button class="close" data-close="detail" aria-label="Close">×</button></div><div class="detail-head"><h2>${esc(f.name)}</h2><button data-edit>Edit ↗</button></div><div class="feature-colour-picker"><span class="feature-colour-label">Tile colour</span><div class="palette" role="group" aria-label="Tile colour">${colours.map((colour,i)=>`<button type="button" class="swatch ${f.colour===i?'selected':''}" style="background:${colour};color:${i===4?'#ffffff':'#101820'}" data-feature-colour="${i}" aria-label="${colourNames[i]}" aria-pressed="${f.colour===i}" title="${colourNames[i]}">${i+1}</button>`).join('')}</div></div><p class="detail-desc">${esc(f.description||'Add context to make this feature your own.')}</p><h3 class="subheading">Add a contact</h3><form id="contactForm"><div class="contact-fields"><label>Company / account<input name="company" placeholder="Acme Inc." maxlength="100"></label><label>Contact name<input name="person" placeholder="Alex Morgan" maxlength="100"></label><label>Email<input name="email" type="email" placeholder="alex@example.com" maxlength="200"></label><label>Phone<input name="phone" type="tel" placeholder="+1 555 0100" maxlength="60"></label></div><div class="contact-add-row"><label class="contact-type-label">Contact type<select name="type"><option value="customer">Customer</option><option value="lead">Lead</option></select></label><button class="plain" type="submit">＋ Add contact</button></div><p id="contactError" role="alert" style="color:#efb5ac;font-size:12px"></p></form><details id="featureContactList" class="feature-contact-list"><summary>Existing contacts <span class="optional">${visibleContacts(f).length} contacts</span></summary><label class="contact-search-label">Search contacts<input id="featureContactSearch" type="search" placeholder="Name, company, email or phone…" autocomplete="off"></label><div id="featureContactRows">${visibleContacts(f).map(c=>`<div class="contact"><div><strong>${esc(c.company||c.name||c.email||c.phone)}</strong><span class="contact-type ${c.type==='lead'?'lead':'customer'}">${c.type==='lead'?'Lead':'Customer'}</span>${c.type==='lead'?`<button type="button" class="convert-contact" data-convert-contact="${c.id}">Convert lead to customer</button>`:''}<small>${esc([c.company?c.name:'',c.email,c.phone].filter(Boolean).join(' · '))}</small></div><div class="contact-actions"><button data-edit-contact="${c.id}">Edit contact</button><button data-remove-contact="${c.id}" aria-label="Remove from feature">Remove from feature</button></div></div>`).join('')||`<p class="detail-desc">${f.contacts.length?'No '+(contactDisplay==='lead'?'lead':'customer')+' contacts for this feature.':'Who would love this feature? Keep customer and lead details here.'}</p>`}</div><p id="contactSearchEmpty" class="detail-desc" role="status" hidden>No matching contacts.</p></details><h3 class="subheading">Related features</h3><p class="detail-desc">Connect ideas that complement each other. Links work both ways.</p>${features.filter(x=>x.id!==fid).map(x=>`<label class="link-option"><input type="checkbox" data-link="${x.id}" ${related(f).some(r=>r.id===x.id)?'checked':''}><span style="color:${colours[x.colour]}">●</span> ${esc(x.name)}</label>`).join('')||'<p class="detail-desc">Create another feature to make your first connection.</p>'}<div class="dialog-actions" style="justify-content:space-between"><button class="danger" data-delete>Delete feature</button><button class="plain" data-close="detail">Save Changes</button></div>`;if(!$('#detail').open)$('#detail').showModal()}
$('#new').onclick=()=>openEditor();$('#search').oninput=render;$('#gridView').onclick=()=>{view='grid';render()};$('#mapView').onclick=()=>{$('#mapContactSearch').value='';view='map';render()};
$('#featureForm').onsubmit=e=>{e.preventDefault();const name=$('#name').value.trim();if(!name){$('#name').setCustomValidity('Please enter a feature name.');$('#name').reportValidity();return}const f=features.find(x=>x.id===editing);if(f)Object.assign(f,{name,description:$('#description').value.trim(),colour:selectedColour});else features.push({id:id(),name,description:$('#description').value.trim(),colour:selectedColour,contacts:[],links:[]});save();$('#editor').close();if(featureSession)openDetail(current);toast(f?'Feature updated':'A new possibility added')};$('#name').oninput=()=>$('#name').setCustomValidity('');
document.addEventListener('click',e=>{const t=e.target.closest('button,[data-open]');if(!t)return;if(t.dataset.close){$('#'+t.dataset.close).close();return}if(t.hasAttribute('data-new'))openEditor();if(t.dataset.open)openDetail(t.dataset.open);if(t.dataset.colour!==undefined){selectedColour=Number(t.dataset.colour);palette()}if(t.hasAttribute('data-edit')){openEditor(features.find(f=>f.id===current))}if(t.dataset.removeContact){rememberRemoval();const f=features.find(f=>f.id===current);f.contacts=f.contacts.filter(c=>c.id!==t.dataset.removeContact);save();openDetail(current);offerUndo('Contact removed from feature')}if(t.hasAttribute('data-delete')&&confirm('Delete this feature and its contacts?')){rememberRemoval();features=features.filter(f=>f.id!==current);features.forEach(f=>f.links=f.links.filter(x=>x!==current));save();$('#detail').close();offerUndo('Feature deleted')}});
document.addEventListener('keydown',e=>{if(e.target.matches('g[data-open]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openDetail(e.target.dataset.open)}});
$('#detail').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.target),c={id:id(),type:d.get('type')==='lead'?'lead':'customer',company:d.get('company').trim(),name:d.get('person').trim(),email:d.get('email').trim(),phone:d.get('phone').trim()};if(!c.company&&!c.name&&!c.email&&!c.phone){$('#contactError').textContent='Add a company, name or at least one contact detail.';return}const targetFeature=features.find(f=>f.id===current);const existingContact=targetFeature.contacts.find(saved=>sameContact(saved,c));if(existingContact){$('#contactError').textContent='This contact is already associated with this feature.';return}targetFeature.contacts.push(c);save();openDetail(current);toast(contactDisplay!=='all'&&contactDisplay!==c.type?'Contact added · hidden by the current Display filter':'Contact added')});
$('#detail').addEventListener('change',e=>{const other=e.target.dataset.link;if(!other)return;const a=features.find(f=>f.id===current),b=features.find(f=>f.id===other);a.links=a.links.filter(x=>x!==other);b.links=b.links.filter(x=>x!==current);if(e.target.checked){a.links.push(other);b.links.push(current)}save()});
const sampleFeatures=[{"name": "Advanced Reporting", "description": "Custom reports made in collaboration with support team", "colour": 0, "links": [1, 2]}, {"name": "Automated Reports", "description": "Reports scheduled to go out to designated recipients at regular intervals", "colour": 1, "links": [0, 2]}, {"name": "Custom Dashboard", "description": "Custom graphs for dashboard", "colour": 2, "links": [0, 1]}, {"name": "Mobile App", "description": "Mobile app functionality", "colour": 6, "links": [4]}, {"name": "Notifications & Alerts", "description": "In-app notification center, email digests, and real-time triggers.", "colour": 0, "links": [3, 5]}, {"name": "Workflow Automation", "description": "Custom rules, trigger-action builders, and automated routing.", "colour": 0, "links": [4]}, {"name": "SSO & Single Sign On", "description": "Single Sign-On (Okta, Azure AD, Google) and Multi-Factor Authentication (MFA).", "colour": 3, "links": [7, 8]}, {"name": "Role-Based Access Control (RBAC)", "description": "Admin, Member, Viewer, and granular custom permissions.", "colour": 4, "links": [6, 8]}, {"name": "Audit Logs & Security", "description": "Activity logging, data retention policies, and exportable security trails.", "colour": 4, "links": [6, 7]}, {"name": "Pre-built Connectors:", "description": "Turnkey integrations (e.g., Salesforce, HubSpot, Slack, Microsoft Teams).", "colour": 3, "links": [10, 11]}, {"name": "REST & GraphQL APIs", "description": "Public API endpoints, API key management, and developer documentation.", "colour": 3, "links": [9, 11]}, {"name": "Webhooks", "description": "Event-driven data streaming to external tools.", "colour": 0, "links": [9, 10]}];
const samplePeople=[
 ['Avery Chen','Northstar Labs'],['Jordan Patel','Juniper Studio'],['Morgan Reed','Cedar Works'],['Riley Brooks','Orbit Analytics'],['Casey Nguyen','Maple Systems'],['Taylor Rivera','Summit Digital'],['Jamie Wilson','Harbor Collective'],['Alex Bennett','Meadow Software'],['Quinn Foster','Pinecone Media'],['Sam Ellis','Brightpath Solutions']
];
function sampleContactIncluded(featureIndex,personIndex){return ((personIndex*7+featureIndex*3)%13)<(5+featureIndex%3)}
function makeSampleContacts(featureIndex){return samplePeople.map(([name,company],i)=>({id:id(),name,company,email:name.toLowerCase().replace(' ','.')+'@example.com',phone:'+1 202-555-'+String(100+i).padStart(4,'0'),type:i%2===0?'customer':'lead',sampleContact:true})).filter((c,i)=>sampleContactIncluded(featureIndex,i))}
// Populate existing sample tiles once, preserving contacts the user added.
let sampleContactsUpdated=false;
features.filter(f=>f.sampleKey!==undefined).forEach(f=>{if(!f.sampleContactsVersion){f.contacts.push(...makeSampleContacts(f.sampleKey));f.sampleContactsVersion=2;sampleContactsUpdated=true}});
features.filter(f=>f.sampleKey!==undefined&&f.sampleContactsVersion<2).forEach(f=>{f.contacts.filter(c=>c.sampleContact).forEach(c=>{const i=samplePeople.findIndex(([name])=>name===c.name);if(i>=0){c.phone='+1 202-555-'+String(100+i).padStart(4,'0');c.type=i%2===0?'customer':'lead'}});f.sampleContactsVersion=2;sampleContactsUpdated=true});
features.filter(f=>f.sampleKey!==undefined&&f.sampleDistributionVersion!==1).forEach(f=>{
 f.contacts=f.contacts.filter(c=>{const person=samplePeople.findIndex(([name,company])=>name===c.name&&company===c.company);return !c.sampleContact||person<0||sampleContactIncluded(f.sampleKey,person)});
 f.sampleDistributionVersion=1;sampleContactsUpdated=true;
});
if(sampleContactsUpdated){try{localStorage.setItem(key,JSON.stringify(features))}catch{storageOK=false}}
$('#demo').onclick=()=>{
 if(features.some(f=>f.sampleKey!==undefined)){
  const removed=new Set(features.filter(f=>f.sampleKey!==undefined).map(f=>f.id));
  features=features.filter(f=>!removed.has(f.id));features.forEach(f=>f.links=f.links.filter(id=>!removed.has(id)));
  $('#search').value='';save();toast('Sample workspace cleared');return;
 }
 const existing=new Map(features.filter(f=>f.sampleKey!==undefined).map(f=>[f.sampleKey,f]));
 const ids=sampleFeatures.map((_,i)=>existing.get(i)?.id||id());
 let added=0;
 sampleFeatures.forEach((f,i)=>{if(existing.has(i))return;features.push({id:ids[i],name:f.name,description:f.description,colour:f.colour,contacts:makeSampleContacts(i),links:f.links.map(j=>ids[j]),sampleKey:i,sampleContactsVersion:2,sampleDistributionVersion:1});added++});
 $('#search').value='';save();toast(added?'Sample workspace added':'Sample features are already in your workspace');
};
// Start the author's captured example workspace blank once; keep a recovery copy.
const capturedExampleIds=["d8a0562d-4f1a-4d95-ac99-39b2edb503c0", "5ec1a906-510e-4dec-9e7b-929e2200a6e2", "156736b6-bf7d-4c9a-be09-ce5af73ae695", "63e1bbdc-0290-453d-9796-c3d4bc2c3446", "2461cd0f-5876-4937-bd41-eb0e752b3caa", "786b0b65-bb58-42fc-8d68-d1a24e8074de", "6ee96995-5351-4a27-a268-7658a95e5dbc", "df644dda-70d7-42f2-a5c4-bb1b14b09ccf", "babb5335-2161-4cf1-97d9-12cdd109eb97", "fd6a4e41-4ad5-434b-bd11-266b8807bd57", "60e0d6b6-0efe-4858-930e-4793b251e183", "a7f1436f-db6e-47bb-8d7a-406311e43d8d"];
if(features.length===capturedExampleIds.length&&features.every(f=>capturedExampleIds.includes(f.id)&&f.contacts.length===0)){
 try{localStorage.setItem('feature-flow-original-sample-backup',JSON.stringify(features));features=[];save()}catch{render()}
}else render();

// Show a floating tile and preview its position as the grid rearranges.
let sorting=null,ignoreTileClick=false;
$('#grid').addEventListener('pointerdown',e=>{
 const tile=e.target.closest('.card');if(!tile||e.button!==0)return;
 const rect=tile.getBoundingClientRect();
 sorting={id:tile.dataset.open,tile,startX:e.clientX,startY:e.clientY,pointer:e.pointerId,active:false,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,rect,ghost:null};
});
function animateGrid(change){
 const tiles=[...$('#grid').querySelectorAll('.card')],before=new Map(tiles.map(t=>[t,t.getBoundingClientRect()]));
 change();
 tiles.forEach(t=>{const a=before.get(t),b=t.getBoundingClientRect(),dx=a.left-b.left,dy=a.top-b.top;if(dx||dy){t.getAnimations().forEach(a=>a.cancel());t.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:180,easing:'ease-out'})}});
}
document.addEventListener('pointermove',e=>{
 if(!sorting||sorting.pointer!==e.pointerId)return;
 const s=sorting;
 if(!s.active){
  if(Math.hypot(e.clientX-s.startX,e.clientY-s.startY)<9)return;
  s.active=true;s.ghost=s.tile.cloneNode(true);s.ghost.removeAttribute('data-open');s.ghost.setAttribute('aria-hidden','true');s.ghost.tabIndex=-1;s.ghost.classList.add('drag-ghost');
  Object.assign(s.ghost.style,{width:s.rect.width+'px',height:s.rect.height+'px'});document.body.append(s.ghost);
  s.tile.classList.add('drag-placeholder');document.body.classList.add('sorting');s.tile.setPointerCapture(e.pointerId);
 }
 e.preventDefault();
 s.ghost.style.left=(e.clientX-s.offsetX)+'px';s.ghost.style.top=(e.clientY-s.offsetY)+'px';
 if(s.lastMove&&performance.now()-s.lastMove<200)return;
 const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('#grid .card');
 if(!hit||hit===s.tile)return;
 const tiles=[...$('#grid').querySelectorAll('.card')],from=tiles.indexOf(s.tile),to=tiles.indexOf(hit);
 // Commit a preview only inside the destination's central area to prevent edge jitter.
 const r=hit.getBoundingClientRect();if(e.clientX<r.left+12||e.clientX>r.right-12||e.clientY<r.top+12||e.clientY>r.bottom-12)return;
 s.lastMove=performance.now();
 animateGrid(()=>{if(from<to)hit.after(s.tile);else hit.before(s.tile)});
},{passive:false});
function endSorting(e){
 if(!sorting||sorting.pointer!==e.pointerId)return;const s=sorting;sorting=null;
 document.body.classList.remove('sorting');s.ghost?.remove();s.tile.classList.remove('drag-placeholder');
 if(!s.active)return;ignoreTileClick=true;setTimeout(()=>ignoreTileClick=false,100);
 if(e.type!=='pointercancel'){
  const ids=[...$('#grid').querySelectorAll('.card')].map(t=>t.dataset.open),visible=new Set(ids),ordered=ids.map(id=>features.find(f=>f.id===id));let index=0;
  features=features.map(f=>visible.has(f.id)?ordered[index++]:f);save();toast('Feature order saved');
 }else render();
}
document.addEventListener('pointerup',endSorting);document.addEventListener('pointercancel',endSorting);
$('#grid').addEventListener('click',e=>{if(ignoreTileClick){e.preventDefault();e.stopImmediatePropagation()}},true);
// Keyboard alternative: focus a tile and use Alt + an arrow key to move it.
$('#grid').addEventListener('keydown',e=>{if(!e.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;const tile=e.target.closest('.card');if(!tile)return;e.preventDefault();const visible=[...$('#grid').querySelectorAll('.card')],index=visible.indexOf(tile),cols=getComputedStyle($('#grid')).gridTemplateColumns.split(' ').length,step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.key],other=visible[index+step];if(!other)return;const from=features.findIndex(f=>f.id===tile.dataset.open),to=features.findIndex(f=>f.id===other.dataset.open);const [moved]=features.splice(from,1);features.splice(to,0,moved);save();$('#grid').querySelector(`[data-open="${moved.id}"]`).focus();toast('Feature order saved')});

// Dismiss feature details only when a click starts and ends outside its bounds.
let detailBackdropPress=false;
function outsideDetail(e){const r=$('#detail').getBoundingClientRect();return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom}
$('#detail').addEventListener('pointerdown',e=>{detailBackdropPress=e.target===$('#detail')&&outsideDetail(e)});
$('#detail').addEventListener('click',e=>{if(detailBackdropPress&&e.target===$('#detail')&&outsideDetail(e))$('#detail').close();detailBackdropPress=false});
$('#detail').addEventListener('close',()=>{detailBackdropPress=false});

const customSelection=new Set();let customType='all',customExportRows=[];
function openCustomView(){
 customExportRows=[];customSelection.clear();
 const dialog=$('#customView');
 dialog.innerHTML=`<div class="dialog-top"><span class="eyebrow">YOUR CONTACTS, YOUR WAY</span><button class="close" data-close="customView" aria-label="Close custom view">×</button></div><h2>Custom View</h2><form id="customViewForm"><div class="custom-search-fields"><label>Search Contact<input name="searchContact" id="customContactSearch" list="customContactSuggestions" placeholder="Name, email or phone…" autocomplete="off"></label><label>Search Company<input name="searchCompany" id="customCompanySearch" list="customCompanySuggestions" placeholder="Company name…" autocomplete="off"></label></div><datalist id="customContactSuggestions"></datalist><datalist id="customCompanySuggestions"></datalist><p class="detail-desc">Search a contact or company to find all associated features, or select features below. If you do both, results use the selected features.</p><fieldset class="feature-options"><legend>Select features</legend><div class="custom-selection-actions"><button type="button" class="plain" data-select-features>Select all</button><button type="button" class="plain" data-clear-features>Clear all</button></div>${features.length?features.map(f=>`<label class="link-option"><input type="checkbox" name="features" value="${f.id}" ${customSelection.has(f.id)?'checked':''}><span style="color:${colours[f.colour]}">●</span>${esc(f.name)}</label>`).join(''):'<p class="detail-desc">Create a feature or explore the sample workspace to get started.</p>'}</fieldset><label class="contact-type-label">Contact type<select name="contactType"><option value="all" ${customType==='all'?'selected':''}>Customers &amp; Leads</option><option value="customer" ${customType==='customer'?'selected':''}>Customers</option><option value="lead" ${customType==='lead'?'selected':''}>Leads</option></select></label><p id="customError" class="custom-error" role="alert"></p><div class="dialog-actions"><button class="primary" type="submit" ${features.length?'':'disabled'}>Create Custom View</button></div></form><section id="customResults" aria-live="polite"></section>`;
 setupCustomSearch();if(!dialog.open)dialog.showModal();
}
$('#exportList').onclick=openCustomView;
$('#customView').addEventListener('submit',e=>{
 if(e.target.id!=='customViewForm')return;e.preventDefault();const data=new FormData(e.target);let selected=data.getAll('features');const contactQuery=String(data.get('searchContact')||'').trim().toLowerCase(),companyQuery=String(data.get('searchCompany')||'').trim().toLowerCase();const selectedContact=customSearchContacts.find(c=>customContactLabel(c).toLowerCase()===contactQuery);const matchesSearch=c=>(!companyQuery||(c.company||'').toLowerCase().includes(companyQuery))&&(!contactQuery||(selectedContact?sameContact(selectedContact,c):[c.name,c.email,c.phone].some(v=>String(v||'').toLowerCase().includes(contactQuery))));if(!selected.length&&(contactQuery||companyQuery))selected=features.filter(f=>f.contacts.some(matchesSearch)).map(f=>f.id);
 if(!selected.length){$('#customError').textContent=contactQuery||companyQuery?'No associated features found. Try another contact or company.':'Select at least one feature, or search for a contact or company.';return}
 $('#customError').textContent='';customSelection.clear();selected.forEach(id=>customSelection.add(id));customType=data.get('contactType');
 const rows=new Map();
 features.filter(f=>customSelection.has(f.id)).forEach(f=>f.contacts.filter(c=>matchesSearch(c)&&(customType==='all'||(c.type||'customer')===customType)).forEach(c=>{
  // Reuse workspace-wide contact matching rather than comparing every detail.
  let row=[...rows.values()].find(r=>r.members.some(m=>sameContact(m,c)));
  if(!row){row={contact:{...c},members:[],features:[]};rows.set(rows.size,row)}
  row.members.push(c);
  if(!row.features.includes(f.name))row.features.push(f.name);
  // Customer takes precedence when legacy copies have different contact types.
  if(c.type==='customer')row.contact.type='customer';
  ['name','company','email','phone'].forEach(field=>{if(!row.contact[field]&&c[field])row.contact[field]=c[field]});
 }));
 customExportRows=[...rows.values()].map(({contact:c,features:names})=>({company:c.company||'',name:c.name||'',email:c.email||'',phone:c.phone||'',type:c.type||'customer',features:names.join('; ')}));
 $('#customResults').innerHTML=`<div class="custom-result-heading"><h3>Your contact list</h3><button type="button" class="close" id="closeCustomResults" aria-label="Close contact list">×</button><button type="button" class="primary csv-export-button" id="exportCustomCSV" ${rows.size?'':'disabled'}>Export to CSV</button><span>${rows.size} ${rows.size===1?'contact':'contacts'} · ${selected.length} ${selected.length===1?'feature':'features'}</span></div><p class="detail-desc">${customType==='all'?'Customers & Leads':customType==='customer'?'Customers':'Leads'} across the matching features.</p>${rows.size?`<div class="custom-table-wrap"><table class="custom-table"><thead><tr><th>Contact</th><th>Type</th><th>Contact details</th><th>Features</th></tr></thead><tbody>${[...rows.values()].map(({contact:c,features:names})=>`<tr><td><strong>${esc(c.name||c.company||'Unnamed contact')}</strong>${c.name&&c.company?`<small>${esc(c.company)}</small>`:''}</td><td><span class="contact-type ${c.type==='lead'?'lead':'customer'}">${c.type==='lead'?'Lead':'Customer'}</span></td><td>${c.email?`<div>${esc(c.email)}</div>`:''}${c.phone?`<div>${esc(c.phone)}</div>`:''}${!c.email&&!c.phone?'—':''}</td><td>${names.map(n=>`<span class="feature-tag">${esc(n)}</span>`).join('')}</td></tr>`).join('')}</tbody></table></div>`:'<p class="custom-empty">No matching contacts. Try another contact type or select different features.</p>'}`;
 $('#customResults').scrollIntoView({behavior:'smooth',block:'start'});
});
let customBackdropPress=false;
$('#customView').addEventListener('pointerdown',e=>{const r=$('#customView').getBoundingClientRect();customBackdropPress=e.target===$('#customView')&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)});
$('#customView').addEventListener('click',e=>{const r=$('#customView').getBoundingClientRect();if(customBackdropPress&&e.target===$('#customView')&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))$('#customView').close();customBackdropPress=false});

// Conversion follows contact identity across the entire feature workspace.
function sameContact(a,b){
 const norm=v=>String(v||'').trim().toLowerCase();
 if(a.id===b.id)return true;
 const ae=norm(a.email),be=norm(b.email);
 if(ae&&be)return ae===be;
 const an=norm(a.name),bn=norm(b.name),ac=norm(a.company),bc=norm(b.company);
 if(an&&bn&&ac&&bc)return an===bn&&ac===bc;
 const phone=v=>String(v||'').replace(/\D/g,'');
 return !!(an&&an===bn&&phone(a.phone)&&phone(a.phone)===phone(b.phone));
}
$('#detail').addEventListener('click',e=>{
 const button=e.target.closest('[data-convert-contact]');if(!button)return;
 const source=features.find(f=>f.id===current)?.contacts.find(c=>c.id===button.dataset.convertContact);if(!source)return;
 let updated=0;features.forEach(f=>f.contacts.forEach(c=>{if(sameContact(source,c)&&c.type!=='customer'){c.type='customer';updated++}}));
 save();openDetail(current);$('#customResults')?.replaceChildren();
 toast(`Converted to customer across ${updated} ${updated===1?'feature':'features'}${contactDisplay==='lead'?' · hidden by Leads filter':''}`);
});

// Reuse saved contacts through editable suggestions, without guessing at fuzzy matches.
let contactSuggestionRows=[];
function refreshContactSuggestions(){
 const form=$('#contactForm');if(!form)return;
 const rows=[];features.forEach(f=>f.contacts.forEach(c=>{if(!rows.some(r=>sameContact(r,c)))rows.push({...c})}));contactSuggestionRows=rows;
 const company=form.elements.company.value.trim().toLowerCase();
 const candidates=company?rows.filter(c=>(c.company||'').toLowerCase().includes(company)):rows;
 $('#savedContactNames').innerHTML=candidates.filter(c=>c.name).map(c=>`<option value="${esc([c.name,c.company,c.email].filter(Boolean).join(' — '))}"></option>`).join('');
 $('#savedCompanies').innerHTML=[...new Set(rows.map(c=>c.company).filter(Boolean))].map(c=>`<option value="${esc(c)}"></option>`).join('');
}
function setupContactSuggestions(){
 const form=$('#contactForm');if(!form)return;
 form.elements.company.setAttribute('list','savedCompanies');form.elements.person.setAttribute('list','savedContactNames');
 form.elements.company.autocomplete='off';form.elements.person.autocomplete='off';
 form.insertAdjacentHTML('beforeend','<datalist id="savedContactNames"></datalist><datalist id="savedCompanies"></datalist><p class="contact-suggestion-help" id="contactSuggestionHelp" role="status">Choose a saved contact suggestion to fill their details. You can edit any field.</p>');refreshContactSuggestions();
}
const originalOpenDetail=openDetail;
openDetail=function(fid){
 if(!featureSession)featureSession={snapshot:JSON.stringify(features)};
 const preserve=$('#detail').open&&current===fid,expanded=preserve&&$('#featureContactList')?.open,query=preserve?$('#featureContactSearch')?.value||'':'',scroll=$('#detail').scrollTop;
 originalOpenDetail(fid);setupContactSuggestions();$('#detail .dialog-top').insertAdjacentHTML('afterend','<p class="draft-hint">Changes stay in draft until you select Save Changes.</p>');
 if(preserve){$('#featureContactList').open=expanded;$('#featureContactSearch').value=query;$('#featureContactSearch').dispatchEvent(new Event('input',{bubbles:true}));$('#detail').scrollTop=scroll}
};
$('#detail').addEventListener('input',e=>{
 const form=$('#contactForm');if(!form||!['company','person'].includes(e.target.name))return;
 const value=e.target.value.trim().toLowerCase();let matches=[];
 if(e.target.name==='person'){
  matches=contactSuggestionRows.filter(c=>[c.name,c.company,c.email].filter(Boolean).join(' — ').toLowerCase()===value);
  if(!matches.length)matches=contactSuggestionRows.filter(c=>(c.name||'').toLowerCase()===value&&(!form.elements.company.value.trim()||(c.company||'').toLowerCase()===form.elements.company.value.trim().toLowerCase()));
 }else matches=contactSuggestionRows.filter(c=>(c.company||'').toLowerCase()===value);
 if(matches.length===1){
  const c=matches[0];form.elements.company.value=c.company||'';form.elements.person.value=c.name||'';form.elements.email.value=c.email||'';form.elements.phone.value=c.phone||'';form.elements.type.value=c.type||'customer';
  $('#contactSuggestionHelp').textContent='Saved contact filled in. All fields can be changed before adding.';
 }else if(matches.length>1)$('#contactSuggestionHelp').textContent='This company or name has multiple contacts. Choose the right person from the contact name suggestions.';
 refreshContactSuggestions();
});

$('#detail').addEventListener('input',e=>{
 if(e.target.id!=='featureContactSearch')return;
 const query=e.target.value.trim().toLowerCase();let matches=0;
 $('#featureContactRows').querySelectorAll('.contact').forEach(row=>{const match=row.textContent.toLowerCase().includes(query);row.hidden=!match;if(match)matches++});
 $('#contactSearchEmpty').hidden=!query||matches>0;
 const initialEmpty=$('#featureContactRows > .detail-desc');if(initialEmpty)initialEmpty.hidden=!!query;
});

let customSearchContacts=[];
function customContactLabel(c){return [c.name||c.email||c.phone,c.company,c.email&&c.name?c.email:''].filter(Boolean).join(' — ')}
function setupCustomSearch(){
 customSearchContacts=[];features.forEach(f=>f.contacts.forEach(c=>{if(!customSearchContacts.some(r=>sameContact(r,c)))customSearchContacts.push({...c})}));
 $('#customContactSuggestions').innerHTML=customSearchContacts.map(c=>`<option value="${esc(customContactLabel(c))}"></option>`).join('');
 $('#customCompanySuggestions').innerHTML=[...new Set(customSearchContacts.map(c=>c.company).filter(Boolean))].map(company=>`<option value="${esc(company)}"></option>`).join('');
}
$('#customView').addEventListener('input',e=>{
 if(e.target.id==='customContactSearch'){
  const query=e.target.value.trim().toLowerCase(),match=customSearchContacts.find(c=>customContactLabel(c).toLowerCase()===query);
  if(match)$('#customCompanySearch').value=match.company||'';
 }
 if(['customContactSearch','customCompanySearch'].includes(e.target.id))$('#customResults').replaceChildren();
});

let removalSnapshot=null;
function rememberRemoval(){removalSnapshot=JSON.stringify(features)}
function offerUndo(message){
 const before=JSON.parse(removalSnapshot||'[]'),missingFeatures=before.filter(f=>!features.some(now=>now.id===f.id)),missingContacts=before.flatMap(f=>f.contacts.filter(c=>features.some(now=>now.id===f.id)&&!features.find(now=>now.id===f.id).contacts.some(now=>now.id===c.id)).map(c=>({featureId:f.id,contact:c})));
 const host=$('#detail').open?$('#detail'):document.body;
 $('#undoNotice')?.remove();const notice=document.createElement('div');notice.id='undoNotice';notice.className='undo-notice';notice.setAttribute('role','status');notice.innerHTML=`<span>${message}</span><button type="button" id="undoRemoval">Undo</button>`;host.append(notice);
 notice.querySelector('button').onclick=()=>{if(!removalSnapshot)return;missingFeatures.forEach(f=>{if(!features.some(now=>now.id===f.id)){features.splice(Math.min(before.findIndex(old=>old.id===f.id),features.length),0,f);before.filter(old=>old.links.includes(f.id)).forEach(old=>{const now=features.find(x=>x.id===old.id);if(now&&!now.links.includes(f.id))now.links.push(f.id)})}});missingContacts.forEach(({featureId,contact})=>{const f=features.find(x=>x.id===featureId);if(f&&!f.contacts.some(c=>c.id===contact.id))f.contacts.push(contact)});removalSnapshot=null;save();if($('#detail').open)openDetail(current);notice.remove();toast('Removal undone')};
}
let editingContactSource=null;
$('#detail').addEventListener('click',e=>{
 const button=e.target.closest('[data-edit-contact]');if(!button)return;
 const c=features.find(f=>f.id===current)?.contacts.find(c=>c.id===button.dataset.editContact);if(!c)return;editingContactSource={...c};
 $('#contactEditor').innerHTML=`<form id="editContactForm"><div class="dialog-top"><span class="eyebrow">UPDATE CONTACT EVERYWHERE</span><button type="button" class="close" data-close="contactEditor" aria-label="Close contact editor">×</button></div><h2>Edit contact</h2><p class="detail-desc">Changes apply to this contact across all features.</p>${[['name','Contact name'],['company','Company'],['email','Email'],['phone','Phone']].map(([key,label])=>`<label>${label}<input name="${key}" type="${key==='email'?'email':key==='phone'?'tel':'text'}" value="${esc(c[key])}" maxlength="200"></label>`).join('')}<label class="contact-type-label">Contact type<select name="type"><option value="customer" ${c.type==='customer'?'selected':''}>Customer</option><option value="lead" ${c.type==='lead'?'selected':''}>Lead</option></select></label><p id="editContactError" role="alert"></p><div class="dialog-actions"><button class="primary">Save contact</button></div></form>`;$('#contactEditor').showModal();
});
$('#contactEditor').addEventListener('submit',e=>{
 e.preventDefault();const d=new FormData(e.target),updates=Object.fromEntries(['name','company','email','phone','type'].map(key=>[key,String(d.get(key)||'').trim()]));
 if(!updates.name&&!updates.company&&!updates.email&&!updates.phone){$('#editContactError').textContent='Enter a name, company or contact detail.';return}
 const matches=features.flatMap(f=>f.contacts).filter(c=>sameContact(editingContactSource,c));
 if(features.some(f=>f.contacts.some(c=>matches.includes(c))&&f.contacts.some(c=>!matches.includes(c)&&sameContact(c,updates)))){$('#editContactError').textContent='These details match another contact on a feature. Use distinct details to avoid a duplicate.';return}
 matches.forEach(c=>Object.assign(c,updates,{sampleContact:false}));save();$('#contactEditor').close();openDetail(current);toast('Contact updated across all features');
});

function highlightMapFeature(featureId){
 if($('#mapContactSearch').value.trim()){applyMapContactSearch();return}
 const active=features.find(f=>f.id===featureId),connected=new Set(active?[active.id,...related(active).map(f=>f.id)]:[]);
 $('#map').classList.toggle('has-map-focus',!!active);
 $('#map').querySelectorAll('g[data-open]').forEach(node=>{node.classList.toggle('map-connected',connected.has(node.dataset.open));node.classList.toggle('map-active',node.dataset.open===featureId)});
 $('#map').querySelectorAll('line[data-from]').forEach(line=>line.classList.toggle('map-link-active',!!active&&(line.dataset.from===featureId||line.dataset.to===featureId)));
}
$('#map').addEventListener('pointerover',e=>{const node=e.target.closest('g[data-open]');if(node)highlightMapFeature(node.dataset.open)});
$('#map').addEventListener('pointerleave',()=>highlightMapFeature(null));
$('#map').addEventListener('focusin',e=>{const node=e.target.closest('g[data-open]');if(node)highlightMapFeature(node.dataset.open)});
$('#map').addEventListener('focusout',()=>highlightMapFeature(null));

function applyMapContactSearch(){
 const query=$('#mapContactSearch').value.trim().toLowerCase();
 const chosen=mapSearchOptions.find(option=>option.label.toLowerCase()===query);
 const matches=new Set(features.filter(f=>visibleContacts(f).some(c=>chosen?(chosen.kind==='company'?(c.company||'').trim().toLowerCase()===chosen.company.toLowerCase():sameContact(chosen.contact,c)):[c.name,c.company].some(value=>String(value||'').toLowerCase().includes(query)))).map(f=>f.id));
 $('#map').classList.toggle('has-map-focus',!!query);
 $('#map').querySelectorAll('g[data-open]').forEach(node=>{node.classList.toggle('map-connected',!!query&&matches.has(node.dataset.open));node.classList.toggle('map-active',!!query&&matches.has(node.dataset.open))});
 $('#map').querySelectorAll('line[data-from]').forEach(line=>line.classList.toggle('map-link-active',!!query&&matches.has(line.dataset.from)&&matches.has(line.dataset.to)));
 const shown=[...$('#map').querySelectorAll('g[data-open]')].filter(node=>matches.has(node.dataset.open)).length;
 $('#mapSearchStatus').textContent=query?`${chosen?'Selected '+(chosen.kind==='company'?chosen.company:chosen.contact.name||chosen.contact.email)+' · ':''}${shown} matching ${shown===1?'feature':'features'}`:'';
}
$('#mapContactSearch').addEventListener('input',applyMapContactSearch);
const originalRenderMap=renderMap;
renderMap=function(shown){originalRenderMap(shown);refreshMapSearchOptions();applyMapContactSearch()};

let mapSearchOptions=[];
function refreshMapSearchOptions(){
 const contacts=[];features.forEach(f=>visibleContacts(f).forEach(c=>{if(!contacts.some(saved=>sameContact(saved,c)))contacts.push(c)}));
 mapSearchOptions=[...[...new Set(contacts.map(c=>c.company).filter(Boolean))].map(company=>({kind:'company',company,label:'Company: '+company})),...contacts.filter(c=>c.name||c.email).map(contact=>({kind:'contact',contact,label:'Contact: '+[contact.name,contact.company,contact.email].filter(Boolean).join(' — ')}))];
 $('#mapContactSuggestions').innerHTML=mapSearchOptions.map(option=>`<option value="${esc(option.label)}"></option>`).join('');
}
refreshMapSearchOptions();

// A feature window owns one draft; only Done or Save changes persists it.
const detailNativeClose=$('#detail').close.bind($('#detail'));
function finishFeatureSession(commit){
 const session=featureSession;featureSession=null;
 if(session&&!commit)features=JSON.parse(session.snapshot);
 removalSnapshot=null;$('#undoNotice')?.remove();
 if(commit)save();else render();
 detailNativeClose();$('#unsavedFeature').close();
 toast(commit?'Changes saved':'Changes discarded');
}
function requestFeatureClose(){
 if(!featureSession){detailNativeClose();return}
 if(JSON.stringify(features)===featureSession.snapshot){featureSession=null;detailNativeClose();return}
 if(!$('#unsavedFeature').open)$('#unsavedFeature').showModal();
}
$('#detail').close=requestFeatureClose;
$('#detail').addEventListener('cancel',e=>{e.preventDefault();requestFeatureClose()});
document.addEventListener('click',e=>{
 const done=e.target.closest('#detail [data-close="detail"]');
 if(done&&done.textContent.trim()==='Save Changes'){e.preventDefault();e.stopImmediatePropagation();finishFeatureSession(true)}
},true);
$('#unsavedFeature').addEventListener('click',e=>{
 if(e.target.closest('[data-save-session]'))finishFeatureSession(true);
 if(e.target.closest('[data-discard-session]'))finishFeatureSession(false);
 if(e.target.closest('[data-keep-session]'))$('#unsavedFeature').close();
});

window.addEventListener('beforeunload',e=>{if(featureSession&&JSON.stringify(features)!==featureSession.snapshot){e.preventDefault();e.returnValue=''}});

$('#customView').addEventListener('click',e=>{
 const select=e.target.closest('[data-select-features]'),clear=e.target.closest('[data-clear-features]');
 if(!select&&!clear)return;
 $('#customView').querySelectorAll('input[name="features"]').forEach(input=>{input.checked=!!select});
 $('#customResults').replaceChildren();$('#customError').textContent='';
});

// Workspace directory manages people independently of their feature associations.
let pendingContactImport=[];
let directoryMode='contacts',directoryRows=[],directoryAction=null,directoryUndo=null;
function directoryContacts(){const rows=[];features.forEach(f=>f.contacts.forEach(c=>{let row=rows.find(r=>r.members.some(m=>sameContact(m,c)));if(!row){row={contact:c,members:[],featureIds:new Set()};rows.push(row)}row.members.push(c);row.featureIds.add(f.id)}));return rows}
function openDirectory(){
 pendingContactImport=[];
 $('#directory').innerHTML=`<div class="dialog-top"><span class="eyebrow">WORKSPACE DIRECTORY</span><button class="close" data-close="directory" aria-label="Close directory">×</button></div><h2>Contacts & Companies</h2><div class="views"><button type="button" data-directory-tab="contacts" class="${directoryMode==='contacts'?'active':''}">Contacts</button><button type="button" data-directory-tab="companies" class="${directoryMode==='companies'?'active':''}">Companies</button></div><label>Search directory<input id="directorySearch" type="search" placeholder="Name, company, email or phone…"></label><p class="detail-desc">Remove from feature keeps the person in other features. Delete here removes them across this workspace.</p><details class="directory-add-section"><summary>Add contact / company</summary><form id="directoryAddForm"><p class="detail-desc">Enter a company, a person, or both, then choose associated features. A company can be saved without a named contact.</p><div class="contact-fields"><label>Company<input name="company" maxlength="100" placeholder="Acme Inc."></label><label>Contact name<input name="name" maxlength="100" placeholder="Alex Morgan"></label><label>Email<input name="email" type="email" maxlength="200" placeholder="alex@example.com"></label><label>Phone<input name="phone" type="tel" maxlength="60" placeholder="+1 555 0100"></label></div><div class="directory-import-row"><label class="contact-type-label">Contact type<select name="type"><option value="customer">Customer</option><option value="lead">Lead</option></select></label><div class="directory-import-controls"><button type="button" class="plain" id="importContactList">Import List</button><button type="button" class="instructions-link" id="importListInstructions">instructions</button><input id="importContactFile" type="file" accept=".csv,text/csv" hidden></div></div><p id="importListStatus" class="detail-desc" role="status"></p><fieldset class="feature-options"><legend>Assign features</legend>${features.map(f=>`<label class="link-option"><input type="checkbox" name="assignedFeatures" value="${f.id}"><span style="color:${colours[f.colour]}">●</span>${esc(f.name)}</label>`).join('')}</fieldset><p id="directoryAddError" class="custom-error" role="alert"></p><div class="dialog-actions"><button type="reset" class="plain">Clear form</button><button class="primary" type="submit">Save contact / company</button></div></form></details><div id="directoryNotice" role="status"></div><div id="directoryRows"></div>`;
 renderDirectory();if(!$('#directory').open)$('#directory').showModal();
}
function renderDirectory(){
 const query=$('#directorySearch').value.trim().toLowerCase();directoryRows=directoryContacts();
 if(directoryMode==='contacts'){
  $('#directoryRows').innerHTML=directoryRows.map((row,i)=>{const c=row.contact;if(![c.name,c.company,c.email,c.phone].some(v=>String(v||'').toLowerCase().includes(query)))return '';return `<article class="directory-row"><div><strong>${esc(c.name||c.email||c.company||c.phone)}</strong><small>${esc([c.company,c.email,c.phone].filter(Boolean).join(' · '))}</small><small>${row.featureIds.size} associated features</small><div class="directory-feature-tiles">${[...row.featureIds].map(id=>{const f=features.find(f=>f.id===id);return f?`<span class="directory-feature-tile" style="background:${colours[f.colour]};color:${f.colour===4?'#ffffff':'#101820'}">${esc(f.name)}</span>`:''}).join('')}</div></div><div class="directory-actions">${c.company?`<button class="plain" data-directory-unlink="${i}">Remove company affiliation</button>`:''}<button class="danger" data-directory-contact="${i}">Delete contact</button></div></article>`}).join('');
 }else{
  const names=[...new Set(features.flatMap(f=>f.contacts.map(c=>c.company?.trim()).filter(Boolean)).map(n=>n.toLowerCase()))];
  $('#directoryRows').innerHTML=names.filter(n=>n.includes(query)).map(n=>{const contacts=directoryRows.filter(r=>r.members.some(c=>(c.company||'').trim().toLowerCase()===n)),ids=new Set();features.forEach(f=>{if(f.contacts.some(c=>(c.company||'').trim().toLowerCase()===n))ids.add(f.id)});const name=contacts.flatMap(r=>r.members).find(c=>(c.company||'').trim().toLowerCase()===n).company;return `<article class="directory-row"><div><strong>${esc(name)}</strong><small>${contacts.length} contacts · ${ids.size} associated features</small></div><button class="danger" data-directory-company="${esc(n)}">Delete company</button></article>`}).join('');
 }
 if(!$('#directoryRows').innerHTML)$('#directoryRows').innerHTML='<p class="detail-desc">No matching records.</p>';
}
$('#openDirectory').onclick=openDirectory;
$('#directory').addEventListener('input',e=>{if(e.target.id==='directorySearch')renderDirectory()});
$('#directory').addEventListener('click',e=>{
 const tab=e.target.closest('[data-directory-tab]');if(tab){directoryMode=tab.dataset.directoryTab;openDirectory();return}
 const contact=e.target.closest('[data-directory-contact]'),company=e.target.closest('[data-directory-company]'),unlink=e.target.closest('[data-directory-unlink]');if(!contact&&!company&&!unlink)return;
 let title,description;
 if(company){const name=company.dataset.directoryCompany,matching=directoryRows.filter(r=>r.members.some(c=>(c.company||'').trim().toLowerCase()===name)),all=features.flatMap(f=>f.contacts),affected=all.filter(c=>matching.some(r=>r.members.some(m=>sameContact(m,c)))),ids=new Set(affected.map(c=>c.id)),count=features.filter(f=>f.contacts.some(c=>ids.has(c.id))).length;directoryAction={kind:'delete',ids};title='Delete company?';description=`Delete ${name} and its ${matching.length} contacts from all ${count} associated features? These people will also be removed from any other feature where they appear.`;
 }else{const row=directoryRows[Number((contact||unlink).dataset[contact?'directoryContact':'directoryUnlink'])],ids=new Set(features.flatMap(f=>f.contacts).filter(c=>row.members.some(m=>sameContact(m,c))).map(c=>c.id));directoryAction={kind:unlink?'unlink':'delete',ids};title=unlink?'Remove company affiliation?':'Delete contact?';description=unlink?`Remove the company affiliation for ${row.contact.name||row.contact.email} across ${row.featureIds.size} features? The contact and feature associations will remain.`:`Delete ${row.contact.name||row.contact.email||row.contact.company} from all ${row.featureIds.size} associated features?`;}
 $('#directoryConfirm').innerHTML=`<h2>${title}</h2><p class="detail-desc">${esc(description)}</p><p class="detail-desc">You can undo this action while the directory stays open.</p><div class="dialog-actions"><button class="plain" data-close="directoryConfirm">Cancel</button><button class="primary" id="confirmDirectoryAction">${directoryAction.kind==='unlink'?'Remove affiliation':'Delete'}</button></div>`;$('#directoryConfirm').showModal();
});
$('#directoryConfirm').addEventListener('click',e=>{
 if(e.target.id!=='confirmDirectoryAction')return;
 const action=directoryAction,removed=[];features.forEach(f=>{f.contacts.forEach((c,index)=>{if(action.ids.has(c.id))removed.push({featureId:f.id,index,contact:{...c}})});if(action.kind==='delete')f.contacts=f.contacts.filter(c=>!action.ids.has(c.id));else f.contacts.forEach(c=>{if(action.ids.has(c.id))c.company=''})});
 directoryUndo={kind:action.kind,removed};save();$('#directoryConfirm').close();renderDirectory();$('#directoryNotice').innerHTML='<div class="undo-notice"><span>Workspace updated.</span><button id="undoDirectoryAction" type="button">Undo</button></div>';
});
$('#directory').addEventListener('click',e=>{
 if(e.target.id!=='undoDirectoryAction'||!directoryUndo)return;
 const undo=directoryUndo;undo.removed.forEach(({featureId,index,contact})=>{const f=features.find(f=>f.id===featureId);if(!f)return;if(undo.kind==='delete'){if(!f.contacts.some(c=>c.id===contact.id))f.contacts.splice(Math.min(index,f.contacts.length),0,contact)}else{const c=f.contacts.find(c=>c.id===contact.id);if(c)c.company=contact.company}});directoryUndo=null;save();renderDirectory();$('#directoryNotice').textContent='Action undone.';
});
$('#directory').addEventListener('close',()=>{directoryUndo=null});

$('#detail').addEventListener('click',e=>{
 const button=e.target.closest('[data-feature-colour]');if(!button)return;
 const f=features.find(f=>f.id===current);if(!f)return;
 f.colour=Number(button.dataset.featureColour);save();
 $('#detail').querySelectorAll('[data-feature-colour]').forEach(swatch=>{const selected=Number(swatch.dataset.featureColour)===f.colour;swatch.classList.toggle('selected',selected);swatch.setAttribute('aria-pressed',String(selected))});
 $('#detail .dialog-top .eyebrow').style.color=colours[f.colour];
});


// Resolve expanded-node collisions in vector coordinates, then fit the full layout.
function spreadMapNodes(){
 const svg=$('#map svg');if(!svg)return;
 const nodes=[...svg.querySelectorAll('g[data-open]')].map(el=>{const r=el.querySelector('rect'),x=Number(r.getAttribute('x'))+90,y=Number(r.getAttribute('y'))+32,scale=el.classList.contains('map-active')?1.65:el.classList.contains('map-connected')?1.4:1;return {el,x,y,ox:x,oy:y,w:180*scale+24,h:64*scale+24,scale}});
 const active=$('#map').classList.contains('has-map-focus');
 {
  for(let iteration=0;iteration<120;iteration++){
   let collisions=0;
   for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
    const a=nodes[i],b=nodes[j],dx=b.x-a.x,dy=b.y-a.y,px=(a.w+b.w)/2-Math.abs(dx),py=(a.h+b.h)/2-Math.abs(dy);
    if(px<=0||py<=0)continue;collisions++;
    if(px<py){const shift=(px+.5)/2*(dx>=0?1:-1);a.x-=shift;b.x+=shift}else{const shift=(py+.5)/2*(dy>=0?1:-1);a.y-=shift;b.y+=shift}
   }
   if(!collisions)break;
  }
 }
 nodes.forEach(n=>{n.el.style.transform=`translate(${n.x-n.ox}px,${n.y-n.oy}px) scale(${n.scale})`});
 const byId=new Map(nodes.map(n=>[n.el.dataset.open,n]));
 svg.querySelectorAll('line[data-from]').forEach(line=>{const a=byId.get(line.dataset.from),b=byId.get(line.dataset.to);if(a&&b){line.setAttribute('x1',a.x);line.setAttribute('y1',a.y);line.setAttribute('x2',b.x);line.setAttribute('y2',b.y)}});
 if(nodes.length){
  const focused=active?nodes.filter(n=>n.el.classList.contains('map-connected')):nodes;
  const frame=focused.length?focused:nodes,pad=active?36:18;
  const left=Math.min(...frame.map(n=>n.x-n.w/2))-pad,top=Math.min(...frame.map(n=>n.y-n.h/2))-pad,right=Math.max(...frame.map(n=>n.x+n.w/2))+pad,bottom=Math.max(...frame.map(n=>n.y+n.h/2))+pad;
  svg.setAttribute('viewBox',`${left} ${top} ${right-left} ${bottom-top}`);

 }

}
const highlightMapBeforeSpread=highlightMapFeature;
highlightMapFeature=function(id){highlightMapBeforeSpread(id);spreadMapNodes()};
const searchMapBeforeSpread=applyMapContactSearch;
applyMapContactSearch=function(){searchMapBeforeSpread();spreadMapNodes()};
$('#mapContactSearch').addEventListener('input',spreadMapNodes);

function mapReadableName(name,x){const words=name.split(' '),lines=[''];words.forEach(word=>{const last=lines.length-1;if((lines[last]+' '+word).trim().length>21&&lines[last])lines.push(word);else lines[last]=(lines[last]+' '+word).trim()});return lines.map((line,i)=>`<tspan x="${x}" dy="${i===0?(lines.length>1?-7:0):16}" style="font-size:14px">${esc(line)}</tspan>`).join('')}

$('#directory').addEventListener('submit',e=>{
 if(e.target.id!=='directoryAddForm')return;e.preventDefault();const d=new FormData(e.target),assigned=d.getAll('assignedFeatures');
 const record={id:id(),company:String(d.get('company')||'').trim(),name:String(d.get('name')||'').trim(),email:String(d.get('email')||'').trim(),phone:String(d.get('phone')||'').trim(),type:d.get('type')==='lead'?'lead':'customer'};
 if(!pendingContactImport.length&&!record.company&&!record.name&&!record.email&&!record.phone){$('#directoryAddError').textContent='Enter a company, contact name or contact detail.';return}
 if(!assigned.length&&(!pendingContactImport.length||pendingContactImport.some(c=>!c.importFeatureIds?.length))){$('#directoryAddError').textContent='Select features below for contacts without features in the CSV.';return}
 if(pendingContactImport.some(c=>(c.importFeatureIds||[]).some(id=>!features.some(f=>f.id===id)))){$('#directoryAddError').textContent='An imported feature no longer exists. Import the file again.';return}
 let added=0;const imported=!!pendingContactImport.length,records=imported?pendingContactImport:[record];
 records.forEach(entry=>features.filter(f=>(entry.importFeatureIds?.length?entry.importFeatureIds:assigned).includes(f.id)).forEach(f=>{
  const existing=f.contacts.find(c=>sameContact(c,entry)||(!entry.name&&!entry.email&&!entry.phone&&!c.name&&!c.email&&!c.phone&&(c.company||'').toLowerCase()===entry.company.toLowerCase()));
  if(!existing){const {importFeatureIds,features:csvFeatureNames,...contact}=entry;f.contacts.push(contact);added++}
 }));
 if(!added){$('#directoryAddError').textContent='This contact or company is already assigned to all selected features.';return}
 save();pendingContactImport=[];e.target.reset();$('#importListStatus').textContent='';$('#directoryAddForm button[type=submit]').textContent='Save contact / company';$('#directoryAddError').textContent='';$('#directorySearch').value='';renderDirectory();$('#directoryNotice').textContent=`Saved ${added} contact–feature ${added===1?'association':'associations'}${imported?' from the imported list':''}.`;toast('Contact / company saved');
});

$('#directory').addEventListener('click',e=>{
 if(e.target.id==='importContactList')$('#importContactFile').click();
 if(e.target.id==='importListInstructions'){
  $('#importInstructions').innerHTML=`<div class="dialog-top"><span class="eyebrow">CSV IMPORT GUIDE</span><button type="button" class="close" data-close="importInstructions" aria-label="Close import instructions">×</button></div><h2>Import a contact list</h2><p class="detail-desc">Save your spreadsheet as a CSV file with these column headers in its first row. Column order does not matter.</p><div class="custom-table-wrap"><table class="custom-table"><thead><tr><th>Column</th><th>What to enter</th></tr></thead><tbody><tr><td>company</td><td>Company / account name</td></tr><tr><td>name</td><td>Contact’s full name</td></tr><tr><td>email</td><td>Email address</td></tr><tr><td>phone</td><td>Phone number (keep as text)</td></tr><tr><td>features</td><td>Optional. Existing feature names separated by semicolons, e.g. Advanced Reporting; Mobile App. Matching ignores case and extra spaces. Unknown or ambiguous names must be corrected before importing.</td></tr><tr><td>type</td><td>customer or lead. Blank uses the Contact type selected in the form.</td></tr></tbody></table></div><p class="detail-desc">Each row needs at least a company, name, email or phone. Unused columns may be blank or omitted. Use UTF-8 CSV, comma separators, and double quotes around values containing commas. Import up to 5,000 rows in a file under 2 MB.</p><p class="detail-desc">Each row’s features column sets its feature assignments. If that column is blank or omitted, the row uses the features checked below the form. Those checkboxes do not add extra features to rows that already specify them. Check the preview, then Save imported contacts. Matching contacts already on a feature are skipped. No data is saved until you click Save.</p><pre class="csv-example">company,name,email,phone,type,features
Example Company,Alex Morgan,alex@example.com,+1 202-555-0100,lead,Advanced Reporting; Mobile App</pre>`;$('#importInstructions').showModal();
 }
});
function parseContactCSV(text){
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++}else if(!quoted&&value.trim())throw Error('Unexpected quote in CSV. Put quotes around the whole field.');else quoted=!quoted}
 else if(c===','&&!quoted){row.push(value);value=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);if(row.some(v=>v.trim()))rows.push(row);row=[];value=''}else value+=c}
 if(quoted)throw Error('A quoted field is missing its closing quote.');row.push(value);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
$('#directory').addEventListener('change',async e=>{
 if(e.target.id!=='importContactFile')return;const file=e.target.files[0];if(!file)return;
 try{
  if(file.size>2*1024*1024)throw Error('Please use a CSV smaller than 2 MB.');
  const rows=parseContactCSV((await file.text()).replace(/^\uFEFF/,''));if(rows.length<2)throw Error('Include a header row and at least one contact.');
  const headers=rows.shift().map(h=>h.trim().toLowerCase()),allowed=['company','name','email','phone','type','features'];
  if(headers.some(h=>!allowed.includes(h))||new Set(headers).size!==headers.length)throw Error('Use unique column headers: company, name, email, phone, type, features.');
  if(!headers.some(h=>['company','name','email','phone'].includes(h)))throw Error('Include at least one contact detail column.');if(rows.length>5000)throw Error('Import at most 5,000 contacts at once.');
  const records=rows.map((row,index)=>{if(row.length!==headers.length)throw Error(`Row ${index+2}: column count does not match the header.`);const record={id:id(),company:'',name:'',email:'',phone:'',type:$('#directoryAddForm select[name="type"]').value};headers.forEach((h,i)=>{record[h]=row[i].replace(/^'(?=[\s]*[=+@-]|[\t\r\n])/,'').trim()});record.type=(record.type||$('#directoryAddForm select[name="type"]').value).toLowerCase();if(!['customer','lead'].includes(record.type))throw Error(`Row ${index+2}: type must be customer or lead.`);if(!record.company&&!record.name&&!record.email&&!record.phone)throw Error(`Row ${index+2}: add at least one contact detail.`);if(record.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email))throw Error(`Row ${index+2}: check the email address.`);record.importFeatureIds=resolveImportFeatures(record.features||'',features,index+2);return record});
  pendingContactImport=records;$('#directoryAddError').textContent='';$('#importListStatus').innerHTML=`<strong>${records.length} contacts ready to import.</strong> Review assignments below. Select fallback features for rows without assignments, then save. <button type="button" class="instructions-link" id="cancelContactImport">Cancel import</button><div class="import-preview">${records.slice(0,5).map(c=>`<div>${esc(c.name||c.company||c.email||c.phone)} · ${esc(c.company)} · ${esc(c.type)} · Features: ${c.importFeatureIds?.length?c.importFeatureIds.map(id=>esc(features.find(f=>f.id===id)?.name||'Missing feature')).join('; '):'Use checked features below'}</div>`).join('')}${records.length>5?`<div>…and ${records.length-5} more</div>`:''}</div>`;$('#directoryAddForm button[type=submit]').textContent='Save imported contacts';
 }catch(error){pendingContactImport=[];$('#importListStatus').textContent='';$('#directoryAddForm button[type=submit]').textContent='Save contact / company';$('#directoryAddError').textContent=error.message}finally{e.target.value=''}
});
$('#directory').addEventListener('click',e=>{if(e.target.id==='cancelContactImport'){pendingContactImport=[];$('#importListStatus').textContent='';$('#directoryAddForm button[type=submit]').textContent='Save contact / company'}});
$('#directory').addEventListener('reset',()=>{pendingContactImport=[];$('#importListStatus').textContent='';$('#directoryAddError').textContent='';$('#directoryAddForm button[type=submit]').textContent='Save contact / company'});

function resolveImportFeatures(value,available,row){
 const normalize=s=>s.trim().replace(/\s+/g,' ').toLowerCase(),ids=[];
 for(const name of value.split(';').map(s=>s.trim()).filter(Boolean)){
  const matches=available.filter(f=>normalize(f.name)===normalize(name));
  if(matches.length!==1)throw Error(`Row ${row}: ${matches.length?'ambiguous':'unknown'} feature "${name}". Use the exact name of an existing, uniquely named feature.`);
  if(!ids.includes(matches[0].id))ids.push(matches[0].id);
 }
 return ids;
}

function csvSafeValue(value){
 let text=String(value??'');
 // Keep spreadsheet programs from interpreting user data as formulas.
 if(/^[\s]*[=+@-]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;
 return '"'+text.replace(/"/g,'""')+'"';
}
$('#customView').addEventListener('click',e=>{
 if(e.target.id!=='exportCustomCSV'||!customExportRows.length)return;
 const columns=['company','name','email','phone','type','features'];
 const csv='\uFEFF'+[columns.map(csvSafeValue).join(','),...customExportRows.map(row=>columns.map(key=>csvSafeValue(row[key])).join(','))].join('\r\n')+'\r\n';
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const link=document.createElement('a');link.href=url;link.download='feature-flow-custom-view-'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Custom view exported');
});

$('#customView').addEventListener('click',e=>{if(e.target.closest('#closeCustomResults')){customExportRows=[];$('#customResults').replaceChildren();$('#customViewForm').scrollIntoView({behavior:'smooth',block:'start'});$('#customContactSearch').focus({preventScroll:true})}});

// Backups contain workspace records only, never credentials or browser settings.
let pendingWorkspaceRestore=null;
$('#openBackup').onclick=()=>{$('#workspaceBackupError').textContent='';$('#workspaceRestorePreview').replaceChildren();pendingWorkspaceRestore=null;$('#workspaceBackup').showModal()};
$('#downloadWorkspace').onclick=()=>{
 const document={format:'feature-flow-workspace',version:1,exportedAt:new Date().toISOString(),features};
 const url=URL.createObjectURL(new Blob([JSON.stringify(document,null,2)],{type:'application/json'})),link=window.document.createElement('a');link.href=url;link.download='feature-flow-backup-'+new Date().toISOString().slice(0,10)+'.json';window.document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Workspace backup downloaded');
};
function validateWorkspaceBackup(data){
 if(!data||data.format!=='feature-flow-workspace'||data.version!==1||!Array.isArray(data.features))throw Error('Choose a supported Feature Flow workspace backup.');
 if(data.features.length>1000)throw Error('This backup has more than 1,000 features.');
 const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id),ids=new Set();let total=0;
 const text=(value,max=10000)=>{if(typeof value!=='string'||value.length>max)throw Error('The backup contains invalid text fields.');return value};
 const output=data.features.map(f=>{
  if(!f||!validId(f.id)||ids.has(f.id)||!Number.isInteger(f.colour)||f.colour<0||f.colour>6||!Array.isArray(f.contacts)||!Array.isArray(f.links))throw Error('The backup contains an invalid feature.');ids.add(f.id);
  const contactIds=new Set(),contacts=f.contacts.map(c=>{
   if(!c||!validId(c.id)||contactIds.has(c.id)||!['customer','lead'].includes(c.type))throw Error('The backup contains an invalid contact.');contactIds.add(c.id);if(++total>50000)throw Error('This backup has more than 50,000 contact associations.');
   return {id:c.id,name:text(c.name),company:text(c.company),email:text(c.email),phone:text(c.phone),type:c.type,...(c.sampleContact?{sampleContact:true}:{})};
  });
  const result={id:f.id,name:text(f.name),description:text(f.description),colour:f.colour,contacts,links:[...new Set(f.links)]};
  if(Number.isInteger(f.sampleKey)&&f.sampleKey>=0&&f.sampleKey<12)Object.assign(result,{sampleKey:f.sampleKey,sampleContactsVersion:2,sampleDistributionVersion:1});return result;
 });
 output.forEach(f=>{if(f.links.some(id=>!validId(id)||!ids.has(id)||id===f.id))throw Error('The backup contains a missing or invalid related feature.');if(!f.name.trim())throw Error('Every feature needs a name.')});return output;
}
$('#chooseWorkspaceBackup').onclick=()=>$('#workspaceBackupFile').click();
$('#workspaceBackupFile').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;pendingWorkspaceRestore=null;$('#workspaceRestorePreview').replaceChildren();$('#workspaceBackupError').textContent='';
 try{if(file.size>10*1024*1024)throw Error('Choose a backup smaller than 10 MB.');pendingWorkspaceRestore=validateWorkspaceBackup(JSON.parse(await file.text()));const contacts=pendingWorkspaceRestore.reduce((n,f)=>n+f.contacts.length,0);$('#workspaceRestorePreview').innerHTML=`<p>Ready to restore <strong>${pendingWorkspaceRestore.length} features</strong> and <strong>${contacts} contact associations</strong>.</p><p>This will replace your current ${features.length} features.</p><button class="primary" id="confirmWorkspaceRestore" type="button">Replace workspace & restore</button>`}catch(error){$('#workspaceBackupError').textContent=error instanceof SyntaxError?'This file is not valid JSON.':error.message}finally{e.target.value=''}
});
$('#workspaceBackup').addEventListener('click',e=>{
 if(e.target.id!=='confirmWorkspaceRestore'||!pendingWorkspaceRestore)return;
 try{localStorage.setItem(key,JSON.stringify(pendingWorkspaceRestore))}catch{$('#workspaceBackupError').textContent='The browser could not save this workspace. Your current workspace was kept.';return}
 features=pendingWorkspaceRestore;pendingWorkspaceRestore=null;storageOK=true;customSelection.clear();customExportRows=[];$('#search').value='';$('#mapContactSearch').value='';render();$('#workspaceBackup').close();toast('Workspace restored');
});
