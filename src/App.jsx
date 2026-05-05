import { useState, useEffect, useRef } from "react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes warn    { 0%,100%{background:rgba(243,156,18,.15)} 50%{background:rgba(243,156,18,.04)} }
  @keyframes gps     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
  @keyframes arrive  { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { margin:0; padding:0; }
`;

const LEITSTELLE_TEL = "08955164120";
const LEITSTELLE_WA  = "4989551641200";
const DISPATCH_PIN   = "1234";
const GPS_RADIUS_M   = 200;

const DRIVERS = [
  { id:1, name:"Elisabeth Bachmeier", avatar:"EB", bus:"ED DB 42", tel:"4917628200012" },
  { id:2, name:"Sebastian Deuschel",  avatar:"SD", bus:"ED DB XX", tel:"4915158530409" },
  { id:3, name:"Gerhard Geschwinder", avatar:"GG", bus:"ED DB 94", tel:"4915163429782" },
];

const ALL_STOPS = [
  { id:1, name:"München Ostbahnhof Friedenstraße", short:"Ostbahnhof",     lat:48.1276, lng:11.6077 },
  { id:2, name:"München Ampfingstraße",            short:"Ampfingstr.",    lat:48.1285, lng:11.6180 },
  { id:3, name:"München Berg am Laim",             short:"Berg am Laim",   lat:48.1272, lng:11.6390 },
  { id:4, name:"München Graf-Lehndorff-Straße",    short:"Graf-Lehndorff", lat:48.1310, lng:11.6620 },
  { id:5, name:"Feldkirchen",                      short:"Feldkirchen",    lat:48.1315, lng:11.7270 },
  { id:6, name:"Heimstetten Süd",                  short:"Heimstetten",    lat:48.1362, lng:11.7510 },
  { id:7, name:"Grub Nord",                        short:"Grub",           lat:48.1410, lng:11.7710 },
  { id:8, name:"Poing Nord",                       short:"Poing",          lat:48.1720, lng:11.8100 },
  { id:9, name:"Markt Schwaben",                   short:"Markt Schwaben", lat:48.1930, lng:11.8680 },
];

const INIT_TOUREN = [
  { id:"T-GG-1", fahrer:"Gerhard Geschwinder", bus:"ED DB 94", dienst:"0472407", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:1,dep:"05:16",note:"Startpunkt"},{stopId:2,dep:"05:19",note:""},{stopId:3,dep:"05:22",note:""},{stopId:4,dep:"05:34",note:""},{stopId:5,dep:"05:45",note:"⚠️ 01.05–03.05: Umleitung Maifest"},{stopId:6,dep:"05:51",note:""},{stopId:7,dep:"05:55",note:""},{stopId:8,dep:"05:59",note:""},{stopId:9,dep:"06:10",note:"Endpunkt"}]},
  { id:"T-GG-2", fahrer:"Gerhard Geschwinder", bus:"ED DB 94", dienst:"0472407", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:9,dep:"06:14",note:"Rückfahrt"},{stopId:8,dep:"06:25",note:""},{stopId:7,dep:"06:29",note:""},{stopId:6,dep:"06:33",note:""},{stopId:5,dep:"06:39",note:"⚠️ 01.05–03.05: Umleitung Maifest"},{stopId:4,dep:"06:50",note:""},{stopId:3,dep:"07:02",note:"Endpunkt"}]},
  { id:"T-GG-3", fahrer:"Gerhard Geschwinder", bus:"ED DB 94", dienst:"0472407", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:3,dep:"07:18",note:""},{stopId:4,dep:"07:30",note:""},{stopId:5,dep:"07:41",note:""},{stopId:6,dep:"07:47",note:""},{stopId:7,dep:"07:51",note:""},{stopId:8,dep:"07:55",note:""},{stopId:9,dep:"08:06",note:""}]},
  { id:"T-GG-4", fahrer:"Gerhard Geschwinder", bus:"ED DB 94", dienst:"0472407", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:9,dep:"08:14",note:""},{stopId:8,dep:"08:25",note:""},{stopId:7,dep:"08:29",note:""},{stopId:6,dep:"08:33",note:""},{stopId:5,dep:"08:39",note:""},{stopId:4,dep:"08:50",note:""},{stopId:3,dep:"09:02",note:"Endpunkt"}]},
  { id:"T-SD-1", fahrer:"Sebastian Deuschel", bus:"ED DB XX", dienst:"0472408", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:3,dep:"14:58",note:"Startpunkt"},{stopId:4,dep:"15:10",note:""},{stopId:5,dep:"15:21",note:""},{stopId:6,dep:"15:27",note:""},{stopId:7,dep:"15:31",note:""},{stopId:8,dep:"15:35",note:""},{stopId:9,dep:"15:46",note:"⚠️ 07.05: Umleitung Baustelle"}]},
  { id:"T-SD-2", fahrer:"Sebastian Deuschel", bus:"ED DB XX", dienst:"0472408", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:9,dep:"15:54",note:""},{stopId:8,dep:"16:05",note:""},{stopId:7,dep:"16:09",note:""},{stopId:6,dep:"16:13",note:""},{stopId:5,dep:"16:19",note:""},{stopId:4,dep:"16:30",note:""},{stopId:3,dep:"16:42",note:"Endpunkt"}]},
  { id:"T-SD-3", fahrer:"Sebastian Deuschel", bus:"ED DB XX", dienst:"0472408", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:3,dep:"17:58",note:""},{stopId:4,dep:"18:10",note:""},{stopId:5,dep:"18:21",note:""},{stopId:6,dep:"18:27",note:""},{stopId:7,dep:"18:31",note:""},{stopId:8,dep:"18:35",note:""},{stopId:9,dep:"18:46",note:""}]},
  { id:"T-SD-4", fahrer:"Sebastian Deuschel", bus:"ED DB XX", dienst:"0472408", datum:"02.05.2026", linie:"S2",
    stops:[{stopId:9,dep:"18:54",note:""},{stopId:8,dep:"19:05",note:""},{stopId:7,dep:"19:09",note:""},{stopId:6,dep:"19:13",note:""},{stopId:5,dep:"19:19",note:""},{stopId:4,dep:"19:30",note:""},{stopId:3,dep:"19:42",note:"Endpunkt"}]},
];

const INIT_ALERTS = [
  { id:1, type:"warn", title:"⚠️ Maifest Feldkirchen", text:"01.05–03.05. bis 20:00 Uhr: Haltestelle Feldkirchen Bahnhof NICHT erreichbar. 'Münchner Straße' (beidseitig) benutzen.", validFrom:"01.05", validTo:"03.05" },
  { id:2, type:"warn", title:"⚠️ Maifest Erding — NUR 01.05. Abend", text:"Nur 01.05. abends: Sperrung Erding–Altenerding. Alternative: 'H.Tassilo-Realschule' Münchner Str.", validFrom:"01.05", validTo:"01.05" },
  { id:3, type:"warn", title:"⚠️ Baustelle Markt Schwaben — NUR 07.05.", text:"07.05. 08:30–16:30 Uhr: Herzog-Ludwig-Straße gesperrt. Umleitung über Finsingstr. → Am Roßacker → Münsterstr. → Am Ellberg.", validFrom:"07.05", validTo:"07.05" },
  { id:4, type:"info", title:"🅿️ Pausenplatz", text:"Zamilastraße, Berg am Laim. Gelenkbusse DB42 + DB94 übernachten dort.", validFrom:"01.05", validTo:"14.06" },
  { id:5, type:"info", title:"🔍 BEG-Qualitätsprüfung", text:"Unangemeldete Prüfungen durch BEG und S-Bahn München. Beschilderung und Ansagen sind Pflicht!", validFrom:"01.05", validTo:"14.06" },
];

const POENALE = [
  { rule:"Fahrt ausgefallen",              amount:250, sev:"high" },
  { rule:"Fahrzeug technisch defekt",      amount:250, sev:"high" },
  { rule:"Lenk-/Ruhezeiten verletzt",      amount:250, sev:"high" },
  { rule:"Falscher Bustyp",                amount:150, sev:"medium" },
  { rule:"Falsche/fehlende Beschilderung", amount:100, sev:"medium" },
  { rule:"DB SEM App nicht benutzt",       amount:100, sev:"medium" },
  { rule:"Verspätete/verfrühte Abfahrt",   amount:100, sev:"medium" },
  { rule:"Zwischenhalt nicht bedient",     amount:100, sev:"medium" },
  { rule:"Störung nicht gemeldet",         amount:100, sev:"medium" },
  { rule:"Haltestelle nicht angesagt",     amount:50,  sev:"low" },
];

const CHECKLIST = [
  "Beschilderung vorne: 'Ersatzverkehr' + Linie + Ziel",
  "Beschilderung seitlich rechts: 'EV' + Fahrtziel + Logo",
  "Fahrzeug sauber — Innenraum, Scheiben, Einstieg",
  "Gepflegte Kleidung — keine Sportkleidung",
  "5 Minuten vor Abfahrt am Fahrzeug",
  "Haltestellenansagen korrekt — jeden Halt ankündigen",
  "Begrüßung und Verabschiedung obligatorisch",
  "Rauchverbot im Bus — auch in Pause",
  "Rollstühle und Kinderwagen haben Vorrang",
  "Störungen sofort an Leitstelle 089 55164 120 melden",
];

const distM = (a1,o1,a2,o2) => { const R=6371000,dA=(a2-a1)*Math.PI/180,dO=(o2-o1)*Math.PI/180,a=Math.sin(dA/2)**2+Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2; return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); };
const getStop  = id => ALL_STOPS.find(s=>s.id===id)||{name:"",short:"",lat:0,lng:0};
const openMaps = s  => window.open(`https://www.google.com/maps/search/${encodeURIComponent(s.name+", München")}`,"_blank");
const callLS   = () => window.open(`tel:${LEITSTELLE_TEL}`,"_blank");
const waLS     = () => window.open(`https://wa.me/${LEITSTELLE_WA}`,"_blank");
const waDriver = tel => window.open(`https://wa.me/${tel}`,"_blank");

const Btn = ({ch,onClick,style={},v="primary"}) => {
  const vs={primary:{background:"#E8C84A",color:"#0B0F1A",fontSize:20,padding:"18px 22px",borderRadius:16},secondary:{background:"rgba(255,255,255,.07)",color:"#fff",fontSize:16,padding:"14px 20px",borderRadius:14,border:"1px solid rgba(255,255,255,.15)"},green:{background:"#2ECC71",color:"#0B0F1A",fontSize:18,padding:"18px 22px",borderRadius:16},ghost:{background:"transparent",color:"#C0CAD8",fontSize:14,padding:"10px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.15)"}}[v]||{};
  return <button onClick={onClick} style={{border:"none",fontFamily:"'Nunito',sans-serif",fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .15s",...vs,...style}}>{ch}</button>;
};

function Login({onD,onDis}) {
  const [m,setM]=useState(null),[s,setS]=useState(""),[p,setP]=useState(""),[e,setE]=useState("");
  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <style>{FONTS}</style>
      <div style={{textAlign:"center",marginBottom:48,animation:"fadeUp .5s ease"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:"#E8C84A",letterSpacing:6,lineHeight:1}}>SEV CONNECT</div>
        <div style={{fontSize:14,color:"#E74C3C",letterSpacing:2,marginTop:8,fontWeight:800,textTransform:"uppercase"}}>S2 · Berg am Laim ↔ Markt Schwaben</div>
        <div style={{fontSize:12,color:"#555",marginTop:6}}>01.05. – 14.06.2026 · Piloteinsatz · RVO / DB</div>
      </div>
      {!m?(
        <div style={{width:"100%",maxWidth:440,display:"flex",flexDirection:"column",gap:16}}>
          <Btn ch="👨‍✈️ Ich bin Fahrer" onClick={()=>setM("d")} v="primary" style={{width:"100%",fontSize:24,padding:"28px",borderRadius:22}}/>
          <Btn ch="🖥️ Ich bin Disponent" onClick={()=>setM("dis")} v="secondary" style={{width:"100%",fontSize:20,padding:"22px",borderRadius:22}}/>
        </div>
      ):m==="d"?(
        <div style={{width:"100%",maxWidth:440}}>
          <div style={{fontSize:13,color:"#888",textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>Fahrer wählen</div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
            {DRIVERS.map(d=>(
              <button key={d.id} onClick={()=>setS(d.name)} style={{background:s===d.name?"rgba(232,200,74,.15)":"rgba(255,255,255,.04)",border:s===d.name?"2px solid #E8C84A":"2px solid transparent",borderRadius:18,padding:"18px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:18,transition:"all .15s"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"#6E1E6E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#E8C84A",flexShrink:0}}>{d.avatar}</div>
                <div style={{flex:1,textAlign:"left"}}>
                  <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{d.name}</div>
                  <div style={{fontSize:13,color:"#C0CAD8",marginTop:2}}>Bus: {d.bus}</div>
                </div>
                {s===d.name&&<span style={{color:"#E8C84A",fontSize:24}}>✓</span>}
              </button>
            ))}
          </div>
          {e&&<div style={{color:"#E74C3C",fontSize:14,marginBottom:12,textAlign:"center"}}>{e}</div>}
          <div style={{display:"flex",gap:12}}>
            <Btn ch="← Zurück" onClick={()=>setM(null)} v="ghost" style={{flex:1}}/>
            <Btn ch="Anmelden →" onClick={()=>{if(!s){setE("Bitte wählen");return;}onD(DRIVERS.find(d=>d.name===s));}} v="green" style={{flex:2,fontSize:20}}/>
          </div>
        </div>
      ):(
        <div style={{width:"100%",maxWidth:440}}>
          <div style={{fontSize:13,color:"#888",textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>Disponent-PIN</div>
          <input type="password" maxLength={4} value={p} onChange={ev=>{setP(ev.target.value);setE("");}} onKeyDown={ev=>ev.key==="Enter"&&(p===DISPATCH_PIN?onDis():setE("Falscher PIN"))} placeholder="● ● ● ●"
            style={{width:"100%",background:"rgba(255,255,255,.07)",border:"2px solid rgba(255,255,255,.15)",borderRadius:18,padding:"24px",fontSize:40,textAlign:"center",color:"#E8C84A",fontFamily:"monospace",letterSpacing:20,outline:"none",marginBottom:10}}/>
          <div style={{fontSize:12,color:"#444",textAlign:"center",marginBottom:24}}>PIN: 1234</div>
          {e&&<div style={{color:"#E74C3C",fontSize:14,marginBottom:12,textAlign:"center"}}>{e}</div>}
          <div style={{display:"flex",gap:12}}>
            <Btn ch="← Zurück" onClick={()=>setM(null)} v="ghost" style={{flex:1}}/>
            <Btn ch="Anmelden →" onClick={()=>p===DISPATCH_PIN?onDis():setE("Falscher PIN")} v="secondary" style={{flex:2,fontSize:18}}/>
          </div>
        </div>
      )}
    </div>
  );
}

function FahrerApp({driver,touren,onLogout}) {
  const mine=touren.filter(t=>t.fahrer===driver.name);
  const [ti,setTi]=useState(0),[tab,setTab]=useState("fahrt"),[si,setSi]=useState(0);
  const [conf,setConf]=useState(false),[navP,setNavP]=useState(false),[showAll,setShowAll]=useState(false);
  const [showAl,setShowAl]=useState(false),[gpsOn,setGpsOn]=useState(false),[showAns,setShowAns]=useState(false);
  const [pruef,setPruef]=useState(false),[chk,setChk]=useState([]),[time,setTime]=useState(new Date());
  const wRef=useRef(null);

  useEffect(()=>{const x=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(x);},[]);

  const tour=mine[ti];
  const stops=tour?tour.stops.map(ts=>({...getStop(ts.stopId),dep:ts.dep,note:ts.note})):[];
  const cur=stops[si];
  const prog=stops.length>1?Math.round((si/(stops.length-1))*100):0;

  const startGPS=()=>{
    if(!navigator.geolocation)return;
    setGpsOn(true);
    wRef.current=navigator.geolocation.watchPosition(pos=>{
      if(cur){const d=distM(pos.coords.latitude,pos.coords.longitude,cur.lat,cur.lng);if(d<GPS_RADIUS_M)setShowAns(true);}
    },()=>{},{enableHighAccuracy:true,maximumAge:5000,timeout:10000});
  };
  const stopGPS=()=>{if(wRef.current)navigator.geolocation.clearWatch(wRef.current);setGpsOn(false);setShowAns(false);};
  useEffect(()=>()=>{if(wRef.current)navigator.geolocation.clearWatch(wRef.current);},[]);

  const confirm=()=>{
    setConf(true);setShowAns(false);
    setTimeout(()=>{setConf(false);if(si<stops.length-1){setSi(i=>i+1);setTimeout(()=>setNavP(true),400);}},700);
  };

  if(!tour) return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center",color:"#fff"}}>
      <style>{FONTS}</style>
      <div style={{fontSize:48,marginBottom:16}}>📋</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,color:"#E8C84A"}}>KEINE TOUR</div>
      <div style={{fontSize:16,color:"#888",marginTop:8}}>Bitte Disponenten kontaktieren.</div>
      <div style={{display:"flex",gap:12,marginTop:32}}>
        <Btn ch="💬 WhatsApp" onClick={waLS} v="secondary"/>
        <Btn ch="📞 Leitstelle" onClick={callLS} v="secondary"/>
      </div>
      <Btn ch="Abmelden" onClick={onLogout} v="ghost" style={{marginTop:16}}/>
    </div>
  );

  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",color:"#fff",maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{FONTS}</style>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px 8px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:"#2ECC71",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:13,color:"#C0CAD8"}}>S2 · {driver.bus} · Dienst {tour.dienst}</span>
          {gpsOn&&<span style={{fontSize:11,color:"#3498DB"}}>📡 GPS</span>}
        </div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#E8C84A",letterSpacing:3}}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
        <button onClick={onLogout} style={{background:"transparent",border:"none",color:"#666",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Abmelden</button>
      </div>

      {mine.length>1&&(
        <div style={{display:"flex",gap:6,padding:"8px 16px 0",overflowX:"auto"}}>
          {mine.map((t,i)=>(
            <button key={t.id} onClick={()=>{setTi(i);setSi(0);setNavP(false);setShowAll(false);}} style={{flexShrink:0,padding:"6px 12px",borderRadius:10,border:"none",cursor:"pointer",background:ti===i?"#6E1E6E":"rgba(255,255,255,.06)",color:ti===i?"#E8C84A":"#888",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:11}}>
              Tour {i+1}: {getStop(t.stops[0]?.stopId).short} {t.stops[0]?.dep}
            </button>
          ))}
        </div>
      )}

      <div style={{display:"flex",background:"rgba(255,255,255,.03)",borderBottom:"1px solid rgba(255,255,255,.07)",marginTop:8}}>
        {[["fahrt","🚌","Fahrt"],["qualitaet","📋","Qualität"]].map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px 8px",border:"none",background:tab===id?"rgba(232,200,74,.1)":"transparent",borderBottom:tab===id?"2px solid #E8C84A":"2px solid transparent",color:tab===id?"#E8C84A":"#666",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{ic} {lb}</button>
        ))}
      </div>

      {tab==="fahrt"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{height:3,background:"rgba(255,255,255,.06)",margin:"10px 16px 0",borderRadius:2}}>
            <div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#6E1E6E,#E8C84A)",borderRadius:2,transition:"width .6s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",padding:"8px 16px 0"}}>
            <button onClick={gpsOn?stopGPS:startGPS} style={{background:gpsOn?"rgba(52,152,219,.2)":"rgba(255,255,255,.05)",border:`1px solid ${gpsOn?"rgba(52,152,219,.4)":"rgba(255,255,255,.1)"}`,borderRadius:10,padding:"6px 14px",color:gpsOn?"#3498DB":"#C0CAD8",fontFamily:"'Nunito',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
              <span style={{animation:gpsOn?"gps 1.5s infinite":"none",display:"inline-block"}}>📡</span>
              {gpsOn?"GPS aktiv":"GPS starten"}
            </button>
          </div>

          {showAns&&(
            <div style={{margin:"10px 16px 0",background:"rgba(46,204,113,.12)",border:"2px solid rgba(46,204,113,.4)",borderRadius:16,padding:"14px 18px",animation:"arrive .4s ease"}}>
              <div style={{fontWeight:800,fontSize:15,color:"#2ECC71",marginBottom:8}}>📍 Haltestelle erkannt — Bitte ansagen:</div>
              <div style={{fontSize:17,color:"#fff",fontStyle:"italic",marginBottom:12}}>"Nächste Haltestelle: {cur?.name}."</div>
              <button onClick={()=>setShowAns(false)} style={{background:"#2ECC71",border:"none",borderRadius:10,padding:"8px 16px",color:"#0B0F1A",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,cursor:"pointer"}}>✓ Angesagt</button>
            </div>
          )}

          <button onClick={()=>setShowAl(!showAl)} style={{margin:"10px 16px 0",padding:"10px 16px",borderRadius:12,background:"rgba(243,156,18,.1)",border:"1px solid rgba(243,156,18,.25)",color:"#F39C12",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,animation:"warn 2s infinite"}}>
            ⚠️ {INIT_ALERTS.filter(a=>a.type==="warn").length} Sondermeldungen aktiv <span style={{marginLeft:"auto"}}>{showAl?"▲":"▼"}</span>
          </button>
          {showAl&&(
            <div style={{margin:"6px 16px 0"}}>
              {INIT_ALERTS.map(a=>(
                <div key={a.id} style={{background:a.type==="warn"?"rgba(243,156,18,.08)":"rgba(52,152,219,.08)",border:`1px solid ${a.type==="warn"?"rgba(243,156,18,.2)":"rgba(52,152,219,.2)"}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
                  <div style={{fontWeight:800,fontSize:13,color:a.type==="warn"?"#F39C12":"#3498DB",marginBottom:3}}>{a.title}</div>
                  <div style={{fontSize:12,color:"#C0CAD8",lineHeight:1.5}}>{a.text}</div>
                </div>
              ))}
              <button onClick={()=>setShowAl(false)} style={{width:"100%",background:"transparent",border:"none",color:"#666",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",padding:"6px"}}>▲ Schließen</button>
            </div>
          )}

          {navP&&cur&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:36,zIndex:100,animation:"fadeIn .25s ease"}}>
              <div style={{fontSize:13,color:"#555",textTransform:"uppercase",letterSpacing:3,marginBottom:18}}>NÄCHSTER HALT</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:cur.name?.length>20?40:54,color:"#fff",textAlign:"center",lineHeight:1.05,marginBottom:8}}>{cur.name}</div>
              <div style={{fontSize:18,color:"#E8C84A",fontWeight:700,marginBottom:12}}>⏱ {cur.dep}</div>
              {cur.note&&<div style={{background:"rgba(243,156,18,.12)",border:"1px solid rgba(243,156,18,.3)",borderRadius:14,padding:"12px 18px",marginBottom:24,fontSize:14,color:"#F39C12",textAlign:"center",maxWidth:380,lineHeight:1.5}}>{cur.note}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:360}}>
                <Btn ch="🗺️ Navigation starten" onClick={()=>{setNavP(false);openMaps(cur);}} v="primary" style={{width:"100%",fontSize:20,padding:"22px",borderRadius:18}}/>
                <Btn ch="Ich kenne den Weg" onClick={()=>setNavP(false)} v="ghost" style={{width:"100%",fontSize:17,padding:"18px",borderRadius:18}}/>
              </div>
            </div>
          )}

          {!showAll?(
            <div style={{flex:1,display:"flex",flexDirection:"column",padding:"16px 20px"}}>
              {si===stops.length-1&&conf?(
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:52,color:"#2ECC71",letterSpacing:3,animation:"arrive .6s ease"}}>ZIEL ERREICHT</div>
                  <div style={{fontSize:18,color:"#888",marginTop:8}}>Gute Fahrt!</div>
                  <div style={{marginTop:16,background:"rgba(52,152,219,.1)",border:"1px solid rgba(52,152,219,.2)",borderRadius:14,padding:"12px 20px",fontSize:13,color:"#3498DB"}}>🅿️ Pausenplatz: Zamilastraße, Berg am Laim</div>
                  {ti<mine.length-1&&<Btn ch="▶ Nächste Tour" onClick={()=>{setTi(i=>i+1);setSi(0);setConf(false);}} v="primary" style={{marginTop:24,fontSize:18,padding:"18px 28px"}}/>}
                </div>
              ):(
                <>
                  <div style={{fontSize:14,color:"#888",textTransform:"uppercase",letterSpacing:3,marginBottom:12}}>NÄCHSTER HALT</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:cur?.name?.length>20?42:58,color:"#fff",lineHeight:1,marginBottom:6}}>{cur?.name}</div>
                  <div style={{fontSize:18,color:"#E8C84A",fontWeight:700,marginBottom:cur?.note?10:20}}>⏱ Abfahrt {cur?.dep}</div>
                  {cur?.note&&<div style={{background:"rgba(243,156,18,.08)",border:"1px solid rgba(243,156,18,.2)",borderRadius:12,padding:"10px 14px",marginBottom:16,fontSize:14,color:"#F39C12",lineHeight:1.5}}>{cur.note}</div>}
                  <Btn ch={conf?"Halt bestätigt ✓":"✓ Erledigt"} onClick={confirm} v={conf?"green":"primary"} style={{width:"100%",marginBottom:12,fontSize:22,padding:"22px",borderRadius:18}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                    {[["🗺️","Navigation",()=>openMaps(cur)],["💬","WhatsApp",waLS],["📞","Leitstelle",callLS]].map(([ic,lb,fn])=>(
                      <button key={lb} onClick={fn} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:14,padding:"14px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:13,color:"#D0D8E4"}}>
                        <span style={{fontSize:24}}>{ic}</span>{lb}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setShowAll(true)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"12px",color:"#D0D8E4",fontSize:14,fontFamily:"'Nunito',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    📋 Alle {stops.length} Halte · {stops.length-si-1} verbleibend
                  </button>
                  <div style={{display:"flex",overflowX:"auto",gap:0,marginTop:12}}>
                    {stops.map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",flexShrink:0}}>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:52}}>
                          <div style={{width:10,height:10,borderRadius:"50%",marginBottom:3,background:i<si?"#1a1a1a":i===si?"#E8C84A":"rgba(255,255,255,.1)",boxShadow:i===si?"0 0 10px #E8C84A":"none"}}/>
                          <div style={{fontSize:8,color:i===si?"#E8C84A":i<si?"#222":"#555",textAlign:"center",maxWidth:48,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.short||s.name?.split(" ")[0]}</div>
                        </div>
                        {i<stops.length-1&&<div style={{width:8,height:2,background:"rgba(255,255,255,.06)",marginBottom:12}}/>}
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,background:"rgba(52,152,219,.07)",border:"1px solid rgba(52,152,219,.15)",borderRadius:10,padding:"8px 14px",fontSize:13,color:"#6EC6FF"}}>🅿️ Pausenplatz: Zamilastraße, Berg am Laim</div>
                </>
              )}
            </div>
          ):(
            <div style={{flex:1,padding:16,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:"#E8C84A"}}>ALLE HALTE</div>
                <button onClick={()=>setShowAll(false)} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Zurück</button>
              </div>
              {stops.map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:4,opacity:i<si?.4:1}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:16,flexShrink:0}}>
                    <div style={{width:14,height:14,borderRadius:"50%",marginTop:10,flexShrink:0,background:i<si?"#111":i===si?"#E8C84A":"rgba(255,255,255,.1)",border:i===si?"2px solid #E8C84A":"none",boxShadow:i===si?"0 0 12px #E8C84A":"none"}}/>
                    {i<stops.length-1&&<div style={{width:2,flex:1,background:"rgba(255,255,255,.06)",marginTop:2}}/>}
                  </div>
                  <div style={{flex:1,background:i===si?"rgba(232,200,74,.07)":"rgba(255,255,255,.03)",border:i===si?"1px solid rgba(232,200,74,.2)":"1px solid rgba(255,255,255,.05)",borderRadius:12,padding:"10px 12px",marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:16,fontWeight:800,color:i===si?"#E8C84A":"#fff"}}>{s.name}</div>
                        {s.note&&<div style={{fontSize:12,color:"#F39C12",marginTop:4}}>{s.note}</div>}
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:i===si?"#E8C84A":"#888",letterSpacing:2,marginLeft:10}}>{s.dep}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="qualitaet"&&(
        <div style={{flex:1,overflowY:"auto",padding:16}}>
          <button onClick={()=>setPruef(!pruef)} style={{width:"100%",padding:16,borderRadius:14,border:"none",background:pruef?"rgba(231,76,60,.2)":"rgba(243,156,18,.1)",color:pruef?"#E74C3C":"#F39C12",fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
            {pruef?"🔴 PRÜFUNG LÄUFT — Checkliste":"🔍 Prüfung läuft? Checkliste öffnen"}
          </button>
          {pruef&&(
            <div style={{background:"rgba(231,76,60,.06)",border:"1px solid rgba(231,76,60,.2)",borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontSize:13,color:"#E74C3C",fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Prüf-Checkliste RVO</div>
              {CHECKLIST.map((item,i)=>(
                <button key={i} onClick={()=>setChk(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8,borderRadius:12,border:"none",cursor:"pointer",background:chk.includes(i)?"rgba(46,204,113,.12)":"rgba(255,255,255,.04)",transition:"all .15s"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",border:`2px solid ${chk.includes(i)?"#2ECC71":"rgba(255,255,255,.2)"}`,background:chk.includes(i)?"#2ECC71":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13,color:"#0B0F1A"}}>{chk.includes(i)?"✓":""}</div>
                  <span style={{fontSize:14,color:chk.includes(i)?"#2ECC71":"#D0D8E4",textAlign:"left",lineHeight:1.4}}>{item}</span>
                </button>
              ))}
              <div style={{textAlign:"right",fontSize:12,color:"#666",marginTop:6}}>{chk.length}/{CHECKLIST.length} erledigt</div>
            </div>
          )}
          <div style={{fontSize:13,color:"#888",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Pönale — RVO</div>
          {POENALE.map((p,i)=>(
            <div key={i} style={{background:`rgba(${p.sev==="high"?"231,76,60":p.sev==="medium"?"243,156,18":"46,204,113"},.06)`,border:`1px solid rgba(${p.sev==="high"?"231,76,60":p.sev==="medium"?"243,156,18":"46,204,113"},.2)`,borderLeft:`4px solid ${p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
              <div style={{fontWeight:800,fontSize:14,color:"#fff"}}>{p.rule}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71",flexShrink:0}}>{p.amount}€</div>
            </div>
          ))}
          <div style={{marginTop:16,background:"rgba(46,204,113,.08)",border:"1px solid rgba(46,204,113,.2)",borderRadius:14,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:"#2ECC71"}}>RVO-Leitstelle 24/7</div>
              <div style={{fontSize:13,color:"#C0CAD8",marginTop:2}}>089 55164 120</div>
              <div style={{fontSize:11,color:"#666",marginTop:2}}>Nummer nicht an Dritte weitergeben</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={waLS} style={{background:"#25D366",border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",cursor:"pointer",fontSize:18}}>💬</button>
              <button onClick={callLS} style={{background:"#3498DB",border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",cursor:"pointer",fontSize:18}}>📞</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DisponentApp({touren,setTouren,onLogout}) {
  const [tab,setTab]=useState("overview"),[time,setTime]=useState(new Date());
  const [alerts,setAlerts]=useState(INIT_ALERTS),[newAlert,setNewAlert]=useState({title:"",text:"",type:"warn"});
  const [sent,setSent]=useState(null),[showForm,setShowForm]=useState(false);
  const [newTour,setNewTour]=useState({fahrer:"",datum:"",dienst:"",linie:"S2"});
  const [newStops,setNewStops]=useState([]);

  useEffect(()=>{const x=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(x);},[]);

  const sendAlert=a=>{window.open(`https://wa.me/${LEITSTELLE_WA}?text=${encodeURIComponent("🔔 SONDERMELDUNG S2:\n"+a.title+"\n"+a.text)}`,"_blank");setSent(a.id);setTimeout(()=>setSent(null),3000);};
  const addAlert=()=>{if(!newAlert.title||!newAlert.text)return;setAlerts(p=>[{id:Date.now(),...newAlert,validFrom:"Heute",validTo:"—"},...p]);setNewAlert({title:"",text:"",type:"warn"});};

  const sendTour=t=>{
    const f=DRIVERS.find(d=>d.name===t.fahrer);
    if(!f)return;
    const stopText=t.stops.map(s=>`${s.dep} ${getStop(s.stopId).name}`).join("\n");
    const msg=`Fahrauftrag für ${t.fahrer}:\nDienst: ${t.dienst} · ${t.datum} · ${t.linie}\n\n${stopText}\n\nLeitstelle: 089 55164 120\nGute Fahrt!`;
    window.open(`https://wa.me/${f.tel}?text=${encodeURIComponent(msg)}`,"_blank");
    setSent(t.id);setTimeout(()=>setSent(null),3000);
  };

  const saveTour=()=>{
    if(!newTour.fahrer||!newTour.datum||newStops.length<2)return;
    const f=DRIVERS.find(d=>d.name===newTour.fahrer);
    setTouren(p=>[...p,{id:`T-${Date.now()}`,...newTour,bus:f?.bus||"",stops:newStops.map(s=>({...s,stopId:parseInt(s.stopId),note:""}))}]);
    setNewTour({fahrer:"",datum:"",dienst:"",linie:"S2"});setNewStops([]);setShowForm(false);
  };

  const TABS=[["overview","📋","Übersicht"],["touren","🚌","Touren"],["alerts","⚠️","Meldungen"],["fahrer","👨‍✈️","Fahrer"]];

  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#f0f4f8",minHeight:"100vh",maxWidth:960,margin:"0 auto"}}>
      <style>{FONTS}</style>
      <div style={{background:"linear-gradient(135deg,#1a2a4a,#0d1b33)",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#E8C84A",letterSpacing:3}}>SEV CONNECT · S2</div>
          <div style={{fontSize:11,color:"#4a6fa5",letterSpacing:1,textTransform:"uppercase"}}>Berg am Laim ↔ Markt Schwaben · 01.05–14.06.2026 · RVO / DB</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#E8C84A",letterSpacing:3}}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
          <button onClick={onLogout} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",borderRadius:10,padding:"6px 14px",color:"#aaa",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Abmelden</button>
        </div>
      </div>
      <div style={{background:"#fff",borderBottom:"2px solid #e8ecf0",display:"flex"}}>
        {TABS.map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px 6px",border:"none",background:"transparent",borderBottom:tab===id?"3px solid #1a6fb5":"3px solid transparent",color:tab===id?"#1a6fb5":"#888",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{ic} {lb}</button>
        ))}
      </div>
      <div style={{padding:20}}>

        {tab==="overview"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {[{l:"Fahrer",v:DRIVERS.length,c:"#6E1E6E"},{l:"Touren",v:touren.length,c:"#3498DB"},{l:"Haltestellen",v:ALL_STOPS.length,c:"#2ECC71"},{l:"Meldungen",v:alerts.filter(a=>a.type==="warn").length,c:"#F39C12"}].map(k=>(
                <div key={k.l} style={{background:"#fff",border:"1px solid #e8ecf0",borderRadius:14,padding:"14px 8px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:k.c,letterSpacing:2}}>{k.v}</div>
                  <div style={{fontSize:11,color:"#999",marginTop:2}}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#1a2a4a",borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#E8C84A",letterSpacing:2,marginBottom:14}}>STRECKE S2 — ALLE HALTESTELLEN</div>
              <div style={{display:"flex",overflowX:"auto",paddingBottom:4}}>
                {ALL_STOPS.map((s,i)=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",flexShrink:0}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:72}}>
                      <div style={{width:12,height:12,borderRadius:"50%",background:"rgba(255,255,255,.3)",marginBottom:5}}/>
                      <div style={{fontSize:9,color:"rgba(255,255,255,.4)",textAlign:"center",maxWidth:68,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.short}</div>
                    </div>
                    {i<ALL_STOPS.length-1&&<div style={{width:16,height:2,background:"rgba(255,255,255,.08)",marginBottom:14}}/>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#fff",border:"1px solid #e8ecf0",borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:16}}>RVO-Leitstelle</div>
                <div style={{fontSize:13,color:"#2ECC71"}}>● 24/7 · 089 55164 120</div>
              </div>
              <button onClick={waLS} style={{background:"#25D366",border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",cursor:"pointer",fontSize:18}}>💬</button>
              <button onClick={callLS} style={{background:"#3498DB",border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",cursor:"pointer",fontSize:18}}>📞</button>
            </div>
          </div>
        )}

        {tab==="touren"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:800,fontSize:18}}>Fahraufträge</div>
              <button onClick={()=>setShowForm(!showForm)} style={{background:"#1a6fb5",border:"none",borderRadius:12,padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>+ Neue Tour</button>
            </div>
            {showForm&&(
              <div style={{background:"#fff",border:"2px solid #1a6fb5",borderRadius:16,padding:20,marginBottom:16}}>
                <div style={{fontSize:12,color:"#1a6fb5",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Neue Tour erstellen</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                  {[["Fahrer","fahrer","select"],["Dienst-Nr.","dienst","text"],["Datum","datum","date"],["Linie","linie","text"]].map(([lb,key,type])=>(
                    <div key={key}>
                      <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:6}}>{lb}</div>
                      {type==="select"?(
                        <select value={newTour[key]} onChange={e=>setNewTour(p=>({...p,[key]:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none"}}>
                          <option value="">— wählen —</option>
                          {DRIVERS.map(d=><option key={d.id}>{d.name}</option>)}
                        </select>
                      ):(
                        <input type={type} value={newTour[key]} onChange={e=>setNewTour(p=>({...p,[key]:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none"}}/>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{fontSize:12,fontWeight:700,color:"#555",marginBottom:8}}>Haltestellen</div>
                {newStops.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                    <select value={s.stopId} onChange={e=>setNewStops(p=>p.map((x,idx)=>idx===i?{...x,stopId:e.target.value}:x))} style={{flex:2,padding:"8px 10px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:13,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none"}}>
                      <option value="">— Haltestelle —</option>
                      {ALL_STOPS.map(st=><option key={st.id} value={st.id}>{st.name}</option>)}
                    </select>
                    <input type="time" value={s.dep} onChange={e=>setNewStops(p=>p.map((x,idx)=>idx===i?{...x,dep:e.target.value}:x))} style={{flex:1,padding:"8px 10px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:13,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none"}}/>
                    <button onClick={()=>setNewStops(p=>p.filter((_,idx)=>idx!==i))} style={{background:"#fef2f2",border:"none",borderRadius:8,padding:"8px 10px",color:"#E74C3C",cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>✕</button>
                  </div>
                ))}
                <button onClick={()=>setNewStops(p=>[...p,{stopId:"",dep:""}])} style={{width:"100%",padding:"10px",borderRadius:10,border:"2px dashed #e8ecf0",background:"transparent",color:"#1a6fb5",fontSize:13,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700,marginBottom:14}}>+ Haltestelle hinzufügen</button>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>{setShowForm(false);setNewStops([]);}} style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid #e8ecf0",background:"#f8fafc",color:"#999",fontSize:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:700}}>Abbrechen</button>
                  <button onClick={saveTour} style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:"#1a6fb5",color:"#fff",fontSize:14,cursor:"pointer",fontFamily:"'Nunito',sans-serif",fontWeight:800}}>Tour speichern ✓</button>
                </div>
              </div>
            )}
            {touren.map(t=>(
              <div key={t.id} style={{background:"#fff",border:"1px solid #e8ecf0",borderLeft:"4px solid #6E1E6E",borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:800,fontSize:16}}>{t.fahrer}</span>
                      <span style={{background:"#f0f4f8",borderRadius:6,padding:"2px 8px",fontSize:12,color:"#666",fontWeight:700}}>{t.bus}</span>
                      <span style={{background:"#f5f0ff",borderRadius:6,padding:"2px 8px",fontSize:12,color:"#6E1E6E",fontWeight:700}}>Dienst {t.dienst}</span>
                    </div>
                    <div style={{fontSize:13,color:"#777"}}>📅 {t.datum} · {t.linie} · {t.stops.length} Halte · {t.stops[0]?.dep} – {t.stops[t.stops.length-1]?.dep}</div>
                    <div style={{fontSize:12,color:"#aaa",marginTop:4}}>{getStop(t.stops[0]?.stopId).short} → {getStop(t.stops[t.stops.length-1]?.stopId).short}</div>
                  </div>
                  <div style={{display:"flex",gap:6,marginLeft:12,alignItems:"center"}}>
                    {sent===t.id&&<span style={{fontSize:12,color:"#2ECC71",fontWeight:700}}>✓ Gesendet</span>}
                    <button onClick={()=>sendTour(t)} style={{background:"#25D366",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",cursor:"pointer",fontSize:16}}>💬</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="alerts"&&(
          <div>
            <div style={{background:"#fff",border:"2px solid #1a6fb5",borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{fontSize:12,color:"#1a6fb5",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Neue Sondermeldung</div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {[["warn","⚠️ Warnung"],["info","ℹ️ Info"]].map(([t,l])=>(
                  <button key={t} onClick={()=>setNewAlert(p=>({...p,type:t}))} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:newAlert.type===t?(t==="warn"?"rgba(243,156,18,.15)":"rgba(52,152,219,.15)"):"#f8fafc",color:newAlert.type===t?(t==="warn"?"#F39C12":"#3498DB"):"#999",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:13}}>{l}</button>
                ))}
              </div>
              <input value={newAlert.title} onChange={e=>setNewAlert(p=>({...p,title:e.target.value}))} placeholder="Titel..." style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none",marginBottom:10}}/>
              <textarea value={newAlert.text} onChange={e=>setNewAlert(p=>({...p,text:e.target.value}))} placeholder="Details..." rows={3} style={{width:"100%",padding:"12px 14px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none",resize:"vertical",marginBottom:12}}/>
              <button onClick={addAlert} style={{width:"100%",background:"#1a6fb5",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>+ Speichern & senden</button>
            </div>
            {alerts.map(a=>(
              <div key={a.id} style={{background:"#fff",border:"1px solid #e8ecf0",borderLeft:`4px solid ${a.type==="warn"?"#F39C12":"#3498DB"}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontWeight:800,fontSize:14,color:a.type==="warn"?"#F39C12":"#3498DB"}}>{a.title}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {sent===a.id&&<span style={{fontSize:12,color:"#2ECC71",fontWeight:700}}>Gesendet ✓</span>}
                    <button onClick={()=>sendAlert(a)} style={{background:"#25D366",border:"none",borderRadius:8,padding:"6px 10px",color:"#fff",cursor:"pointer",fontSize:14}}>💬</button>
                  </div>
                </div>
                <div style={{fontSize:13,color:"#777",lineHeight:1.4}}>{a.text}</div>
                <div style={{fontSize:11,color:"#bbb",marginTop:6}}>{a.validFrom} – {a.validTo}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="fahrer"&&(
          <div>
            <div style={{fontSize:13,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Fahrer — Piloteinsatz S2</div>
            {DRIVERS.map(d=>(
              <div key={d.id} style={{background:"#fff",border:"1px solid #e8ecf0",borderRadius:14,padding:"14px 18px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"#6E1E6E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#E8C84A",flexShrink:0}}>{d.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:16}}>{d.name}</div>
                  <div style={{fontSize:12,color:"#999"}}>Bus: {d.bus}</div>
                </div>
                <button onClick={()=>waDriver(d.tel)} style={{background:"#25D366",border:"none",borderRadius:10,padding:"9px 14px",color:"#fff",cursor:"pointer",fontSize:18}}>💬</button>
                <button onClick={()=>window.open(`tel:+${d.tel}`,"_blank")} style={{background:"#3498DB",border:"none",borderRadius:10,padding:"9px 14px",color:"#fff",cursor:"pointer",fontSize:18}}>📞</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view,setView]=useState("login"),[driver,setDriver]=useState(null);
  const [touren,setTouren]=useState(INIT_TOUREN);
  return (
    <div>
      <style>{FONTS}</style>
      {view==="login"    && <Login onD={d=>{setDriver(d);setView("driver");}} onDis={()=>setView("dispatch")}/>}
      {view==="driver"   && <FahrerApp driver={driver} touren={touren} onLogout={()=>setView("login")}/>}
      {view==="dispatch" && <DisponentApp touren={touren} setTouren={setTouren} onLogout={()=>setView("login")}/>}
    </div>
  );
}
