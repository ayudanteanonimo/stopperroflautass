/* stopperroflautas.es — interfaz. Sin cookies, sin localStorage, sin peticiones externas. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var fmt=function(n,d){return Number(n).toFixed(d==null?1:d).replace('.',',')};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};

/* ---- Calendario electoral ---- */
var ELECTION='2026-11-29'; /* BOE 6-oct-2026: campaña 13-27 nov, reflexión 28 nov, votación 29 nov */
function phase(now){
  var e=new Date(ELECTION+'T00:00:00+01:00').getTime(), d=86400000, t=(now||new Date()).getTime();
  if(t>=e+d) return 'closed';
  if(t>=e-d) return 'reflexion';
  if(t>=e-5*d) return 'veda';
  return 'full';
}
function applyPhase(now){
  var p=phase(now), box=$('#phase'), txt=$('#phase-txt');
  var msg={veda:'Periodo de veda de sondeos (art. 69.7 LOREG): esta web no publica encuestas y solo ofrece cálculo con datos oficiales de 2023.',
    reflexion:'Jornada de reflexión: la web está en modo informativo y no contiene llamamientos al voto.',
    closed:'Proceso electoral cerrado: la web se mantiene como archivo informativo.'}[p];
  if(msg){box.classList.add('on');txt.textContent=msg}
  if(p==='reflexion'||p==='closed') document.body.classList.add('noaction');
  if(p!=='full'){ /* desde el inicio de la veda: sin hipótesis ni simulador */
    delete SCEN.V5; delete SCEN.V8;
    var sim=$('#s-sim'); if(sim) sim.remove();
    $$('a[href="#s-sim"]').forEach(function(a){a.remove()});
  }
}

/* ---- Escenarios ---- */
var SCEN={
  C:{n:'23J 2023 oficial',nat:null},
  V5:{n:'Vox +5 pts',nat:{PP:30.06,PSOE:29.68,VOX:17.38,SUMAR:12.33,PODEMOS:0}},
  V8:{n:'Vox +8 pts',nat:{PP:28.06,PSOE:28.68,VOX:20.38,SUMAR:12.33,PODEMOS:0}}
};
var state={prov:'jaen',scen:'C',sim:{PP:33.06,PSOE:31.68,VOX:12.38,SUMAR:12.33,PODEMOS:0}};

var STATUS={
  seguro:['Escaño seguro','🟢'],riesgo:['Escaño en riesgo','🟠'],cerca:['Muy cerca del escaño','🔴'],
  alcanzable:['Alcanzable','🟠'],lejos:['Lejos','⚪'],nodata:['Sin dato','⚪']
};
function pname(p){return (PARTIES[p]||{n:p}).n}
function bloc(p){return (PARTIES[p]||{bloc:'otros'}).bloc}
/* Colores de marca habituales: PP azul, Vox verde, PSOE rojo, Sumar rosa, Podemos morado */
var COL={PP:['#1d7fd6','#fff'],VOX:['#63be21','#000'],UPN:['#3a5f9e','#fff'],PSOE:['#e5303a','#fff'],SUMAR:['#e6007e','#fff'],PODEMOS:['#7a3fa0','#fff']};
function col(p){return COL[p]||['#8b95a1','#000']}
function chip(p){var c=col(p);return '<span class="chip" style="background:'+c[0]+';color:'+c[1]+'">'+esc(pname(p))+'</span>'}
function shares(prov){var s=SCEN[state.scen];return project(prov,s.nat)}

function verdict(prov,a){
  var st=a.status,t=STATUS[st],h='',b='';
  if(st==='nodata'){h='Sin dato de Vox en esta circunscripción';b='No hay dato fiable de Vox en 2023 (no se presentó o no consta). No calculamos distancia.'}
  else if(a.voxSeats>0){
    h=a.voxSeats+(a.voxSeats===1?' escaño':' escaños')+' · '+t[0];
    b='Con '+fmt(a.voxShare)+' % de los votos, Vox tiene un colchón de <b>'+fmt(a.cushion)+' puntos</b> antes de perder un escaño.';
    if(a.need!=null) b+=' Para un escaño más haría falta <b>+'+fmt(a.need)+' puntos</b>'+(a.loser?' (en el reparto, ese escaño saldría de '+esc(pname(a.loser))+')':'')+'.';
  } else {
    h='0 escaños · '+t[0];
    b=a.need!=null?'Con '+fmt(a.voxShare)+' % le faltarían <b>+'+fmt(a.need)+' puntos</b> para su primer escaño'+(a.loser?' (en el reparto, ese escaño saldría de '+esc(pname(a.loser))+')':'')+'.':'No alcanza escaño en ningún escenario razonable.';
  }
  return '<div class="verdict '+st+'"><h3>'+t[1]+' '+h+'</h3><p style="margin:0">'+b+'</p></div>';
}
function splitBar(seats){
  var tot=0,k,parts={der:0,izq:0,otros:0};
  for(k in seats){parts[bloc(k)]+=seats[k];tot+=seats[k]}
  var order=Object.keys(seats).sort(function(a,b){var o={der:0,izq:1,otros:2};return o[bloc(a)]-o[bloc(b)]||seats[b]-seats[a]});
  return '<div class="bar" role="img" aria-label="Reparto de escaños por partido">'+order.map(function(p){return '<i title="'+esc(pname(p))+': '+seats[p]+'" style="width:'+(seats[p]/tot*100)+'%;background:'+col(p)[0]+'"></i>'}).join('')+'</div>'+
  '<div class="legend"><span>Derecha: '+parts.der+'</span><span>Izquierda: '+parts.izq+'</span><span>Otros: '+parts.otros+'</span></div>';
}
function ladder(a,seats){
  var rows=a.base.rows.slice(0,seats+4),h='<div class="tw"><table><thead><tr><th>#</th><th>Candidatura</th><th>% votos</th><th>Divisor</th><th>Cociente</th><th>Escaño</th></tr></thead><tbody>';
  rows.forEach(function(r,i){
    h+='<tr class="'+(r.won?'won':'')+(i===seats-1?' cut':'')+'"><td class="num">'+(i+1)+'</td><td>'+chip(r.p)+'</td><td class="num">'+fmt(r.share,2)+'</td><td class="num">÷'+r.div+'</td><td class="num">'+fmt(r.q,2)+'</td><td>'+(r.won?'✔':'—')+'</td></tr>';
  });
  return h+'</tbody></table></div><p class="mut" style="font-size:.85rem;margin-top:.6rem">La línea roja separa el último escaño repartido del primero que queda fuera.</p>';
}
function renderDetail(){
  var prov=PROV.filter(function(p){return p.id===state.prov})[0], sh=shares(prov), a=analyze(sh,prov.s26);
  $('#detail').innerHTML='<div class="grid g2"><div>'+verdict(prov,a)+
    '<div class="stat"><div><b>'+prov.s26+'</b><small>escaños en juego</small></div><div><b>'+fmt(a.voxShare)+'%</b><small>Vox (hipótesis)</small></div><div><b>'+a.voxSeats+'</b><small>escaños Vox</small></div></div>'+
    '<h3>'+esc(prov.n)+' · '+esc(prov.c)+'</h3>'+splitBar(a.base.seats)+'</div><div>'+ladder(a,prov.s26)+'</div></div>';
}

/* ---- Selector, escenarios, provincias ---- */
function renderControls(){
  $('#prov').innerHTML=PROV.map(function(p){return '<option value="'+p.id+'">'+esc(p.n)+' ('+p.s26+')</option>'}).join('');
  $('#prov').value=state.prov;
  $('#prov').onchange=function(){state.prov=this.value;renderDetail()};
  var sc=$('#scen');
  sc.innerHTML=Object.keys(SCEN).map(function(k){return '<button type="button" data-k="'+k+'" aria-pressed="'+(k===state.scen)+'">'+SCEN[k].n+'</button>'}).join('');
  sc.onclick=function(e){var b=e.target.closest('button');if(!b)return;state.scen=b.dataset.k;
    $$('button',sc).forEach(function(x){x.setAttribute('aria-pressed',x===b)});renderDetail();renderProvs()};
}
var pf='all';
function renderProvs(){
  var f=$('#pfilter');
  if(!f.children.length){
    f.innerHTML=[['all','Todas'],['cerca','Muy cerca'],['alcanzable','Alcanzables'],['seguro','Seguras'],['riesgo','En riesgo']].map(function(x){return '<button type="button" data-k="'+x[0]+'" aria-pressed="'+(x[0]===pf)+'">'+x[1]+'</button>'}).join('');
    f.onclick=function(e){var b=e.target.closest('button');if(!b)return;pf=b.dataset.k;$$('button',f).forEach(function(x){x.setAttribute('aria-pressed',x===b)});renderProvs()};
  }
  var h='';
  PROV.forEach(function(p){
    var a=analyze(shares(p),p.s26); if(pf!=='all'&&a.status!==pf)return;
    var sub=a.status==='nodata'?'sin dato':(a.voxSeats>0?a.voxSeats+' esc. · colchón '+fmt(a.cushion):'+'+fmt(a.need)+' pts');
    h+='<button type="button" class="pbtn '+a.status+'" data-id="'+p.id+'">'+esc(p.n)+'<small>'+sub+'</small></button>';
  });
  $('#pgrid').innerHTML=h||'<p class="mut">Ninguna provincia en este filtro.</p>';
}
$('#pgrid').addEventListener('click',function(e){var b=e.target.closest('.pbtn');if(!b)return;state.prov=b.dataset.id;$('#prov').value=state.prov;renderDetail();$('#s-calc').scrollIntoView({behavior:'smooth'})});

/* ---- Simulador ---- */
var SL=[['VOX','Vox',5,30],['PP','PP',15,45],['PSOE','PSOE',15,45],['SUMAR','Sumar',0,20],['PODEMOS','Podemos',0,10]];
function renderSim(){
  var box=$('#sliders');
  if(!box.children.length){
    box.innerHTML=SL.map(function(s){return '<div class="sl"><span>'+s[1]+'</span><input type="range" min="'+s[2]+'" max="'+s[3]+'" step="0.1" id="r-'+s[0]+'" aria-label="% nacional '+s[1]+'"><b class="num" id="v-'+s[0]+'"></b></div>'}).join('');
    SL.forEach(function(s){$('#r-'+s[0]).oninput=function(){state.sim[s[0]]=parseFloat(this.value);paintSim()}});
    var pre=$('#simpre');
    pre.innerHTML='<button type="button" data-k="C">23J oficial</button><button type="button" data-k="V5">Vox +5</button><button type="button" data-k="V8">Vox +8</button>';
    pre.onclick=function(e){var b=e.target.closest('button');if(!b)return;var n=SCEN[b.dataset.k].nat||{PP:33.06,PSOE:31.68,VOX:12.38,SUMAR:12.33,PODEMOS:0};state.sim=Object.assign({},n);paintSim()};
  }
  paintSim();
}
function paintSim(){
  SL.forEach(function(s){$('#r-'+s[0]).value=state.sim[s[0]];$('#v-'+s[0]).textContent=fmt(state.sim[s[0]])+'%'});
  var t=nationalSeats(PROV,state.sim,'s26'),tot=0,k;for(k in t)tot+=t[k];
  var order=Object.keys(t).sort(function(a,b){return t[b]-t[a]});
  var h='<div class="seats">'+order.map(function(p){return '<div style="border-left:5px solid '+col(p)[0]+'"><b>'+t[p]+'</b>'+esc(pname(p))+'</div>'}).join('')+'</div>';
  var der=(t.PP||0)+(t.VOX||0)+(t.UPN||0);
  h=splitBar(t)+h+'<p class="mut" style="margin-top:1rem;font-size:.9rem">Mayoría absoluta: 176. PP + Vox + UPN en esta hipótesis: <b>'+der+'</b>. Total repartido: '+tot+'.</p>';
  $('#simout').innerHTML=h;
}

/* ---- Navegación por diapositivas ---- */
function nav(){
  var slides=$$('.slide'),dots=$('#dots'),cnt=$('#counter');
  dots.innerHTML=slides.map(function(s,i){return '<a href="#'+s.id+'" title="'+esc(s.dataset.t||'')+'"></a>'}).join('');
  var da=$$('a',dots);
  function on(i){da.forEach(function(d,j){d.classList.toggle('on',i===j)});cnt.textContent=(i+1)+' / '+slides.length}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)on(slides.indexOf(e.target))})},{threshold:.5});
    slides.forEach(function(s){io.observe(s)});
  }
  on(0);
  document.addEventListener('keydown',function(e){
    if(/INPUT|SELECT|TEXTAREA/.test((e.target||{}).tagName||''))return;
    var cur=Math.max(0,da.findIndex(function(d){return d.classList.contains('on')}));
    if(e.key==='ArrowDown'||e.key==='PageDown'){if(cur<slides.length-1){e.preventDefault();slides[cur+1].scrollIntoView({behavior:'smooth'})}}
    if(e.key==='ArrowUp'||e.key==='PageUp'){if(cur>0){e.preventDefault();slides[cur-1].scrollIntoView({behavior:'smooth'})}}
  });
}

/* ---- Compartir (sin rastreo) ---- */
function copyText(t){
  if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
  return new Promise(function(res,rej){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')?res():rej()}catch(x){rej(x)}document.body.removeChild(a)});
}
function share(){
  var url='https://stopperroflautas.es/',msg=$('#share-msg');
  if(navigator.share){navigator.share({title:'StopPerroflautas.es',text:'Calculadora D\'Hondt por provincia',url:url}).catch(function(){})}
  else copyText(url).then(function(){msg.textContent='Enlace copiado.'},function(){msg.textContent='Copia este enlace: '+url});
}

function init(now){
  $('#yr').textContent=now.getFullYear();
  applyPhase(now);renderControls();renderDetail();renderProvs();if($('#s-sim'))renderSim();nav();
  $('#share').onclick=share;
}
/* Hora de referencia: la mayor entre el reloj del dispositivo y la cabecera Date del propio servidor
   (así un reloj atrasado o manipulado no desactiva el modo electoral). Máx. 1,5 s de espera. */
function getNow(){
  var local=new Date();
  return new Promise(function(res){
    var done=false;function fin(d){if(done)return;done=true;res(d&&d>local?d:local)}
    setTimeout(function(){fin(null)},1500);
    try{fetch(location.href.split('#')[0],{method:'HEAD',cache:'no-store'}).then(function(r){var h=r.headers.get('date');fin(h?new Date(h):null)}).catch(function(){fin(null)})}catch(e){fin(null)}
  });
}
function start(){getNow().then(init)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
