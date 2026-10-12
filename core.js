/* ===== Datos y motor D'Hondt ===== */
const PARTIES = {
  PP:{n:'PP',bloc:'der'}, VOX:{n:'Vox',bloc:'der'}, UPN:{n:'UPN',bloc:'der'},
  PSOE:{n:'PSOE',bloc:'izq'}, SUMAR:{n:'Sumar',bloc:'izq'}, PODEMOS:{n:'Podemos',bloc:'izq'},
  ERC:{n:'ERC',bloc:'otros'}, JUNTS:{n:'Junts',bloc:'otros'}, BILDU:{n:'EH Bildu',bloc:'otros'},
  PNV:{n:'PNV',bloc:'otros'}, BNG:{n:'BNG',bloc:'otros'}, CC:{n:'CCa',bloc:'otros'},
  NCBC:{n:'NC-BC',bloc:'otros'}, EXISTE:{n:'Existe',bloc:'otros'}, CPM:{n:'CpM',bloc:'otros'}
};
const BLOC_LABEL = {der:'derecha', izq:'izquierda', otros:'otros'};

/* Resultados reales 23J 2023, % sobre votos válidos (Wikipedia/Interior). s23 = escaños 2023, s26 = RD 806/2026 */
const PROV = [
 {id:'acoruna',n:'A Coruña',c:'Galicia',s23:8,s26:8,v:{PP:43.1,PSOE:28.2,VOX:5.1,SUMAR:12.2,BNG:10.0}},
 {id:'alava',n:'Álava',c:'País Vasco',s23:4,s26:4,v:{PP:17.9,PSOE:27.7,VOX:3.9,SUMAR:12.7,BILDU:19.5,PNV:16.6}},
 {id:'albacete',n:'Albacete',c:'Castilla-La Mancha',s23:4,s26:4,v:{PP:39.9,PSOE:34.5,VOX:16.6,SUMAR:7.2}},
 {id:'alicante',n:'Alicante',c:'C. Valenciana',s23:12,s26:12,v:{PP:36.7,PSOE:32.0,VOX:16.3,SUMAR:12.9}},
 {id:'almeria',n:'Almería',c:'Andalucía',s23:6,s26:6,v:{PP:41.0,PSOE:29.0,VOX:21.4,SUMAR:6.6}},
 {id:'asturias',n:'Asturias',c:'Asturias',s23:7,s26:7,v:{PP:35.6,PSOE:34.3,VOX:12.5,SUMAR:14.8}},
 {id:'avila',n:'Ávila',c:'Castilla y León',s23:3,s26:3,v:{PP:43.3,PSOE:27.4,VOX:15.4,SUMAR:5.1}},
 {id:'badajoz',n:'Badajoz',c:'Extremadura',s23:5,s26:5,v:{PP:37.8,PSOE:39.2,VOX:13.7,SUMAR:6.8}},
 {id:'baleares',n:'Baleares',c:'Baleares',s23:8,s26:8,v:{PP:35.6,PSOE:30.2,VOX:15.2,SUMAR:16.6}},
 {id:'barcelona',n:'Barcelona',c:'Cataluña',s23:32,s26:32,v:{PP:13.8,PSOE:35.7,VOX:7.6,SUMAR:15.2,ERC:12.3,JUNTS:9.7}},
 {id:'bizkaia',n:'Vizcaya',c:'País Vasco',s23:8,s26:8,v:{PP:11.5,PSOE:25.8,VOX:2.6,SUMAR:10.9,BILDU:20.7,PNV:27.0}},
 {id:'burgos',n:'Burgos',c:'Castilla y León',s23:4,s26:4,v:{PP:40.6,PSOE:34.4,VOX:12.8,SUMAR:8.6}},
 {id:'caceres',n:'Cáceres',c:'Extremadura',s23:4,s26:4,v:{PP:38.1,PSOE:38.9,VOX:13.6,SUMAR:6.9}},
 {id:'cadiz',n:'Cádiz',c:'Andalucía',s23:9,s26:8,v:{PP:34.8,PSOE:33.2,VOX:15.2,SUMAR:12.9}},
 {id:'cantabria',n:'Cantabria',c:'Cantabria',s23:5,s26:5,v:{PP:42.1,PSOE:33.3,VOX:14.1,SUMAR:8.5}},
 {id:'castellon',n:'Castellón',c:'C. Valenciana',s23:5,s26:5,v:{PP:35.2,PSOE:32.6,VOX:15.9,SUMAR:14.3}},
 {id:'ceuta',n:'Ceuta',c:'Ceuta',s23:1,s26:1,v:{PP:38.8,PSOE:34.0,VOX:23.3,SUMAR:2.5}},
 {id:'ciudadreal',n:'Ciudad Real',c:'Castilla-La Mancha',s23:5,s26:5,v:{PP:40.5,PSOE:35.4,VOX:16.3,SUMAR:6.2}},
 {id:'cordoba',n:'Córdoba',c:'Andalucía',s23:6,s26:6,v:{PP:37.9,PSOE:32.1,VOX:13.9,SUMAR:13.7}},
 {id:'cuenca',n:'Cuenca',c:'Castilla-La Mancha',s23:3,s26:3,v:{PP:39.8,PSOE:37.4,VOX:15.6,SUMAR:5.6}},
 {id:'gipuzkoa',n:'Guipúzcoa',c:'País Vasco',s23:6,s26:6,v:{PP:8.7,PSOE:23.3,VOX:2.1,SUMAR:10.6,BILDU:31.2,PNV:22.6}},
 {id:'girona',n:'Girona',c:'Cataluña',s23:6,s26:6,v:{PP:9.7,PSOE:28.9,VOX:7.0,SUMAR:10.9,ERC:14.7,JUNTS:19.6}},
 {id:'granada',n:'Granada',c:'Andalucía',s23:7,s26:7,v:{PP:37.0,PSOE:33.0,VOX:16.1,SUMAR:11.6}},
 {id:'guadalajara',n:'Guadalajara',c:'Castilla-La Mancha',s23:3,s26:3,v:{PP:36.3,PSOE:33.0,VOX:19.3,SUMAR:9.2}},
 {id:'huelva',n:'Huelva',c:'Andalucía',s23:5,s26:5,v:{PP:36.4,PSOE:36.0,VOX:14.6,SUMAR:10.4}},
 {id:'huesca',n:'Huesca',c:'Aragón',s23:3,s26:3,v:{PP:38.2,PSOE:33.6,VOX:12.6,SUMAR:11.5}},
 {id:'jaen',n:'Jaén',c:'Andalucía',s23:5,s26:5,v:{PP:37.3,PSOE:36.3,VOX:14.8,SUMAR:8.0}},
 {id:'larioja',n:'La Rioja',c:'La Rioja',s23:4,s26:4,v:{PP:45.6,PSOE:35.7,VOX:9.8,SUMAR:6.6}},
 {id:'laspalmas',n:'Las Palmas',c:'Canarias',s23:8,s26:8,v:{PP:25.9,PSOE:33.2,VOX:14.6,SUMAR:10.3,NCBC:8.1,CC:6.3}},
 {id:'leon',n:'León',c:'Castilla y León',s23:4,s26:4,v:{PP:36.9,PSOE:33.6,VOX:12.9,SUMAR:6.7}},
 {id:'lleida',n:'Lleida',c:'Cataluña',s23:4,s26:4,v:{PP:12.8,PSOE:29.5,VOX:6.8,SUMAR:7.9,ERC:18.6,JUNTS:18.0}},
 {id:'lugo',n:'Lugo',c:'Galicia',s23:4,s26:4,v:{PP:50.2,PSOE:30.3,VOX:4.4,SUMAR:5.2,BNG:8.7}},
 {id:'madrid',n:'Madrid',c:'Madrid',s23:37,s26:38,v:{PP:40.5,PSOE:27.8,VOX:14.0,SUMAR:15.5}},
 {id:'malaga',n:'Málaga',c:'Andalucía',s23:11,s26:11,v:{PP:38.3,PSOE:30.3,VOX:16.5,SUMAR:12.3}},
 {id:'melilla',n:'Melilla',c:'Melilla',s23:1,s26:1,v:{PP:49.2,PSOE:25.4,VOX:15.9,SUMAR:3.0,CPM:4.8}},
 {id:'murcia',n:'Murcia',c:'Murcia',s23:10,s26:10,v:{PP:41.2,PSOE:25.3,VOX:21.8,SUMAR:9.6}},
 {id:'navarra',n:'Navarra',c:'Navarra',s23:5,s26:5,v:{PP:16.7,PSOE:27.4,VOX:5.7,SUMAR:12.8,BILDU:17.2,UPN:15.3}},
 {id:'ourense',n:'Ourense',c:'Galicia',s23:4,s26:4,v:{PP:50.0,PSOE:30.1,VOX:4.9,SUMAR:5.5,BNG:8.2}},
 {id:'palencia',n:'Palencia',c:'Castilla y León',s23:3,s26:3,v:{PP:42.0,PSOE:34.7,VOX:12.9,SUMAR:6.1}},
 {id:'pontevedra',n:'Pontevedra',c:'Galicia',s23:7,s26:7,v:{PP:39.6,PSOE:31.4,VOX:4.7,SUMAR:13.2,BNG:9.4}},
 {id:'salamanca',n:'Salamanca',c:'Castilla y León',s23:4,s26:4,v:{PP:47.0,PSOE:30.4,VOX:14.7,SUMAR:5.5}},
 {id:'tenerife',n:'Santa Cruz de Tenerife',c:'Canarias',s23:7,s26:7,nodataVox:true,v:{PP:35.4,PSOE:33.5,VOX:0,SUMAR:10.8,CC:16.7}},
 {id:'segovia',n:'Segovia',c:'Castilla y León',s23:3,s26:3,v:{PP:45.0,PSOE:30.6,VOX:14.1,SUMAR:8.1}},
 {id:'sevilla',n:'Sevilla',c:'Andalucía',s23:12,s26:12,v:{PP:33.4,PSOE:36.6,VOX:13.3,SUMAR:14.0}},
 {id:'soria',n:'Soria',c:'Castilla y León',s23:2,s26:2,v:{PP:37.2,PSOE:29.5,VOX:9.8,SUMAR:3.4}},
 {id:'tarragona',n:'Tarragona',c:'Cataluña',s23:6,s26:6,v:{PP:13.9,PSOE:32.9,VOX:10.3,SUMAR:11.3,ERC:15.1,JUNTS:11.1}},
 {id:'teruel',n:'Teruel',c:'Aragón',s23:3,s26:3,v:{PP:35.1,PSOE:29.2,VOX:13.1,SUMAR:5.4,EXISTE:15.0}},
 {id:'toledo',n:'Toledo',c:'Castilla-La Mancha',s23:6,s26:6,v:{PP:37.8,PSOE:32.6,VOX:19.6,SUMAR:8.2}},
 {id:'valencia',n:'Valencia',c:'C. Valenciana',s23:16,s26:16,v:{PP:33.6,PSOE:32.1,VOX:15.2,SUMAR:16.9}},
 {id:'valladolid',n:'Valladolid',c:'Castilla y León',s23:5,s26:5,v:{PP:40.8,PSOE:32.8,VOX:15.2,SUMAR:8.9}},
 {id:'zamora',n:'Zamora',c:'Castilla y León',s23:3,s26:3,v:{PP:44.8,PSOE:32.5,VOX:13.2,SUMAR:5.6}},
 {id:'zaragoza',n:'Zaragoza',c:'Aragón',s23:7,s26:7,v:{PP:36.0,PSOE:30.8,VOX:15.3,SUMAR:13.5}}
];

const NAT23 = {PP:33.06, PSOE:31.68, VOX:12.38, SUMAR:12.33};

/* Reparto D'Hondt con barrera del 3 % de votos válidos */
function allocate(shares, seats, thr){
  thr = thr==null ? 3 : thr;
  const rows = [];
  for (const p in shares){
    const s = shares[p];
    if (!(s>0) || s < thr) continue;
    for (let d=1; d<=seats; d++) rows.push({p, div:d, q:s/d, share:s});
  }
  rows.sort((a,b)=> b.q-a.q || b.share-a.share);
  const out = {};
  rows.forEach((r,i)=>{ r.won = i<seats; if(r.won) out[r.p]=(out[r.p]||0)+1; });
  return {seats:out, rows, cutWon: rows[seats-1]?rows[seats-1].q:0, cutLost: rows[seats]?rows[seats].q:0};
}

/* Proyección: escala cada partido por su variación nacional respecto al 23J */
function project(prov, nat){
  const v = Object.assign({}, prov.v);
  if (!nat) return v;
  v.PP = prov.v.PP * nat.PP / NAT23.PP;
  v.PSOE = prov.v.PSOE * nat.PSOE / NAT23.PSOE;
  v.VOX = prov.v.VOX * nat.VOX / NAT23.VOX;
  const s = prov.v.SUMAR;
  v.SUMAR = s * nat.SUMAR / NAT23.SUMAR;
  v.PODEMOS = s * nat.PODEMOS / NAT23.SUMAR;
  for (const k in v) v[k] = Math.round(v[k]*100)/100;
  return v;
}

/* Análisis centrado en Vox: escaños, colchón, y puntos que faltan para el siguiente */
function analyze(shares, seats){
  const base = allocate(shares, seats);
  const k = base.seats.VOX||0;
  const v = shares.VOX||0;
  const res = {base, voxSeats:k, voxShare:v, need:null, cushion:null, loser:null, status:null};
  if (!(v>0)) { res.status='nodata'; return res; }
  for (let d=0.05; d<=40; d+=0.05){
    const t = Object.assign({}, shares, {VOX:v+d});
    const a = allocate(t, seats);
    if ((a.seats.VOX||0) > k){
      res.need = Math.round(d*100)/100;
      for (const p in base.seats){ if ((a.seats[p]||0) < base.seats[p]) { res.loser = p; break; } }
      for (const p in a.seats){ if (p!=='VOX' && (a.seats[p]||0) < (base.seats[p]||0)) { res.loser = p; break; } }
      break;
    }
  }
  if (k>0){
    for (let c=0.05; c<=v; c+=0.05){
      const t = Object.assign({}, shares, {VOX:v-c});
      const a = allocate(t, seats);
      if ((a.seats.VOX||0) < k){ res.cushion = Math.round(c*100)/100; break; }
    }
    if (res.cushion==null) res.cushion = v;
    res.status = res.cushion < 1 ? 'riesgo' : 'seguro';
  } else {
    res.status = res.need!=null && res.need<=2.5 ? 'cerca' : (res.need!=null && res.need<=6 ? 'alcanzable' : 'lejos');
  }
  return res;
}

function nationalSeats(provs, nat, which){
  const tot = {};
  provs.forEach(p=>{
    const sh = nat ? project(p, nat) : p.v;
    const a = allocate(sh, which==='s23'?p.s23:p.s26);
    for (const k in a.seats) tot[k]=(tot[k]||0)+a.seats[k];
  });
  return tot;
}
if (typeof module!=='undefined') module.exports = {PARTIES,PROV,NAT23,allocate,project,analyze,nationalSeats};
