import { useState, useEffect, useRef } from "react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes slideUp { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes gps     { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.4} }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { margin:0; padding:0; background:#0B0F1A; }
`;

const LEITSTELLE_TEL = "08955164120";
const DISPATCH_PIN   = "1234";
const GPS_RADIUS_M   = 150;

const DRIVERS = [
  { id:1, name:"Elisabeth Bachmeier", avatar:"EB", bus:"ED DB 42", tel:"4917628200012" },
  { id:2, name:"Sebastian Deuschel",  avatar:"SD", bus:"ED DB XX", tel:"4915158530409" },
  { id:3, name:"Gerhard Geschwinder", avatar:"GG", bus:"ED DB 94", tel:"4915163429782" },
];

const STOPS = [
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

const DIENSTPLAENE = {
  "Gerhard Geschwinder": {
    dienst:"0472407", datum:"07.05.2026", dienstbeginn:"04:46", dienstende:"15:12",
    anfahrt: { ziel:"München Ostbahnhof Friedenstraße", lat:48.1276, lng:11.6077 },
    touren:[
      { id:"GG1", dep:"05:16", arr:"06:10", vonId:1, nachId:9,
        stops:[{id:1,t:"05:16"},{id:2,t:"05:19"},{id:3,t:"05:22"},{id:4,t:"05:34"},{id:5,t:"05:45",warn:"⚠️ Maifest: Münchner Str. nutzen"},{id:6,t:"05:51"},{id:7,t:"05:55"},{id:8,t:"05:59"},{id:9,t:"06:10"}]},
      { id:"GG2", dep:"06:14", arr:"07:02", vonId:9, nachId:3,
        stops:[{id:9,t:"06:14"},{id:8,t:"06:25"},{id:7,t:"06:29"},{id:6,t:"06:33"},{id:5,t:"06:39",warn:"⚠️ Maifest: Münchner Str. nutzen"},{id:4,t:"06:50"},{id:3,t:"07:02"}]},
      { id:"GG3", dep:"07:18", arr:"08:06", vonId:3, nachId:9,
        stops:[{id:3,t:"07:18"},{id:4,t:"07:30"},{id:5,t:"07:41"},{id:6,t:"07:47"},{id:7,t:"07:51"},{id:8,t:"07:55"},{id:9,t:"08:06"}]},
      { id:"GG4", dep:"08:14", arr:"09:02", vonId:9, nachId:3,
        stops:[{id:9,t:"08:14"},{id:8,t:"08:25"},{id:7,t:"08:29"},{id:6,t:"08:33"},{id:5,t:"08:39"},{id:4,t:"08:50"},{id:3,t:"09:02"}]},
      { id:"GG5", dep:"10:18", arr:"11:06", vonId:3, nachId:9,
        stops:[{id:3,t:"10:18"},{id:4,t:"10:30"},{id:5,t:"10:41"},{id:6,t:"10:47"},{id:7,t:"10:51"},{id:8,t:"10:55"},{id:9,t:"11:06"}]},
      { id:"GG6", dep:"11:14", arr:"12:02", vonId:9, nachId:3,
        stops:[{id:9,t:"11:14"},{id:8,t:"11:25"},{id:7,t:"11:29"},{id:6,t:"11:33"},{id:5,t:"11:39"},{id:4,t:"11:50"},{id:3,t:"12:02"}]},
      { id:"GG7", dep:"12:58", arr:"13:46", vonId:3, nachId:9,
        stops:[{id:3,t:"12:58"},{id:4,t:"13:10"},{id:5,t:"13:21"},{id:6,t:"13:27"},{id:7,t:"13:31"},{id:8,t:"13:35"},{id:9,t:"13:46"}]},
      { id:"GG8", dep:"13:54", arr:"14:42", vonId:9, nachId:3,
        stops:[{id:9,t:"13:54"},{id:8,t:"14:05"},{id:7,t:"14:09"},{id:6,t:"14:13"},{id:5,t:"14:19"},{id:4,t:"14:30"},{id:3,t:"14:42"}]},
    ]
  },
  "Sebastian Deuschel": {
    dienst:"0472408", datum:"07.05.2026", dienstbeginn:"14:28", dienstende:"00:16",
    anfahrt: { ziel:"München Berg am Laim", lat:48.1272, lng:11.6390 },
    touren:[
      { id:"SD1", dep:"14:58", arr:"15:46", vonId:3, nachId:9,
        stops:[{id:3,t:"14:58"},{id:4,t:"15:10"},{id:5,t:"15:21",warn:"⚠️ 07.05: Umleitung Baustelle MS"},{id:6,t:"15:27"},{id:7,t:"15:31"},{id:8,t:"15:35"},{id:9,t:"15:46"}]},
      { id:"SD2", dep:"15:54", arr:"16:42", vonId:9, nachId:3,
        stops:[{id:9,t:"15:54"},{id:8,t:"16:05"},{id:7,t:"16:09"},{id:6,t:"16:13"},{id:5,t:"16:19"},{id:4,t:"16:30"},{id:3,t:"16:42"}]},
      { id:"SD3", dep:"17:58", arr:"18:46", vonId:3, nachId:9,
        stops:[{id:3,t:"17:58"},{id:4,t:"18:10"},{id:5,t:"18:21"},{id:6,t:"18:27"},{id:7,t:"18:31"},{id:8,t:"18:35"},{id:9,t:"18:46"}]},
      { id:"SD4", dep:"18:54", arr:"19:42", vonId:9, nachId:3,
        stops:[{id:9,t:"18:54"},{id:8,t:"19:05"},{id:7,t:"19:09"},{id:6,t:"19:13"},{id:5,t:"19:19"},{id:4,t:"19:30"},{id:3,t:"19:42"}]},
    ]
  },
  "Elisabeth Bachmeier": {
    dienst:"—", datum:"07.05.2026", dienstbeginn:"—", dienstende:"—",
    anfahrt: null, touren:[]
  },
};

const SONDERMELDUNGEN = [
  { id:1, type:"warn", haltId:5, title:"⚠️ Maifest Feldkirchen", text:"Haltestelle Feldkirchen Bahnhof NICHT erreichbar. 'Münchner Straße' (beidseitig) nutzen.", isNew:false },
  { id:2, type:"warn", haltId:9, title:"⚠️ Baustelle Markt Schwaben", text:"07.05. 08:30–16:30 Uhr: Herzog-Ludwig-Str. gesperrt. Umleitung: Finsingstr. → Am Roßacker → Münsterstr.", isNew:true },
  { id:3, type:"info", haltId:null, title:"🅿️ Pausenplatz", text:"Zamilastraße, Berg am Laim.", isNew:false },
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

const getStop = id => STOPS.find(s=>s.id===id) || {};

const distM = (a1,o1,a2,o2) => {
  const R=6371000,dA=(a2-a1)*Math.PI/180,dO=(o2-o1)*Math.PI/180;
  const a=Math.sin(dA/2)**2+Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

const timeToMin = t => { const [h,m]=t.split(":").map(Number); return h*60+m; };

const getDelayColor = (min) => {
  if(min < 0) return "#E74C3C";
  if(min <= 2) return "#2ECC71";
  return "#F39C12";
};

const getDelayText = (min) => {
  if(min === 0) return "pünktlich";
  if(min < 0) return `${min} Min`;
  return `+${min} Min`;
};

const callLS = () => window.open(`tel:${LEITSTELLE_TEL}`,"_blank");
const openMaps = (lat,lng,name) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,"_blank");

// ── LEITSTELLE BUTTON — immer sichtbar ─────────────────────────
const LSButton = () => (
  <button onClick={callLS} style={{position:"fixed",bottom:24,right:20,width:56,height:56,borderRadius:"50%",background:"#E74C3C",border:"none",color:"#fff",fontSize:22,cursor:"pointer",boxShadow:"0 4px 20px rgba(231,76,60,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
    📞
  </button>
);

// ══════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════
function Login({ onDriver, onDispatch }) {
  const [mode,setMode]=useState(null),[sel,setSel]=useState(""),[pin,setPin]=useState(""),[err,setErr]=useState("");
  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <style>{FONTS}</style>
      <div style={{textAlign:"center",marginBottom:48,animation:"fadeUp .5s ease"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:64,color:"#E8C84A",letterSpacing:6,lineHeight:1}}>SEV CONNECT</div>
        <div style={{fontSize:14,color:"#E74C3C",letterSpacing:2,marginTop:8,fontWeight:800,textTransform:"uppercase"}}>S2 · Berg am Laim ↔ Markt Schwaben</div>
        <div style={{fontSize:12,color:"#555",marginTop:6}}>07.05.2026 · Piloteinsatz · RVO / DB</div>
      </div>
      {!mode?(
        <div style={{width:"100%",maxWidth:420,display:"flex",flexDirection:"column",gap:14}}>
          <button onClick={()=>setMode("d")} style={{background:"#E8C84A",color:"#0B0F1A",border:"none",borderRadius:20,padding:"26px",fontSize:22,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>👨‍✈️ Ich bin Fahrer</button>
          <button onClick={()=>setMode("dis")} style={{background:"rgba(255,255,255,.07)",color:"#fff",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"22px",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>🖥️ Ich bin Disponent</button>
        </div>
      ):mode==="d"?(
        <div style={{width:"100%",maxWidth:420,animation:"fadeUp .3s ease"}}>
          <div style={{fontSize:12,color:"#666",textTransform:"uppercase",letterSpacing:2,marginBottom:16}}>Fahrer wählen</div>
          {DRIVERS.map(d=>(
            <button key={d.id} onClick={()=>setSel(d.name)} style={{width:"100%",display:"flex",alignItems:"center",gap:16,background:sel===d.name?"rgba(232,200,74,.12)":"rgba(255,255,255,.04)",border:sel===d.name?"2px solid #E8C84A":"2px solid transparent",borderRadius:16,padding:"16px 20px",cursor:"pointer",marginBottom:10,transition:"all .15s"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:"#6E1E6E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#E8C84A",flexShrink:0}}>{d.avatar}</div>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{d.name}</div>
                <div style={{fontSize:13,color:"#C0CAD8",marginTop:2}}>Bus: {d.bus}</div>
              </div>
              {sel===d.name&&<span style={{color:"#E8C84A",fontSize:22}}>✓</span>}
            </button>
          ))}
          {err&&<div style={{color:"#E74C3C",fontSize:13,marginBottom:10,textAlign:"center"}}>{err}</div>}
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button onClick={()=>setMode(null)} style={{flex:1,background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:14,padding:"14px",color:"#C0CAD8",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Zurück</button>
            <button onClick={()=>{if(!sel){setErr("Bitte Fahrer wählen");return;}onDriver(DRIVERS.find(d=>d.name===sel));}} style={{flex:2,background:"#2ECC71",border:"none",borderRadius:14,padding:"14px",color:"#0B0F1A",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Anmelden →</button>
          </div>
        </div>
      ):(
        <div style={{width:"100%",maxWidth:420,animation:"fadeUp .3s ease"}}>
          <div style={{fontSize:12,color:"#666",textTransform:"uppercase",letterSpacing:2,marginBottom:14}}>Disponent-PIN</div>
          <input type="password" maxLength={4} value={pin} onChange={e=>{setPin(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&(pin===DISPATCH_PIN?onDispatch():setErr("Falscher PIN"))} placeholder="● ● ● ●"
            style={{width:"100%",background:"rgba(255,255,255,.07)",border:"2px solid rgba(255,255,255,.15)",borderRadius:16,padding:"22px",fontSize:36,textAlign:"center",color:"#E8C84A",fontFamily:"monospace",letterSpacing:18,outline:"none",marginBottom:8}}/>
          <div style={{fontSize:12,color:"#444",textAlign:"center",marginBottom:20}}>PIN: 1234</div>
          {err&&<div style={{color:"#E74C3C",fontSize:13,marginBottom:10,textAlign:"center"}}>{err}</div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setMode(null)} style={{flex:1,background:"transparent",border:"1px solid rgba(255,255,255,.15)",borderRadius:14,padding:"14px",color:"#C0CAD8",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Zurück</button>
            <button onClick={()=>pin===DISPATCH_PIN?onDispatch():setErr("Falscher PIN")} style={{flex:2,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.2)",borderRadius:14,padding:"14px",color:"#fff",fontSize:17,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Anmelden →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FAHRER APP
// ══════════════════════════════════════════════════════════════
function FahrerApp({ driver, onLogout }) {
  const plan = DIENSTPLAENE[driver.name];
  const touren = plan?.touren || [];

  const [phase,      setPhase]      = useState("tagesplan"); // tagesplan | anfahrt | tour
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [stopIdx,    setStopIdx]    = useState(0);
  const [doneTours,  setDoneTours]  = useState([]);
  const [anfahrtDone,setAnfahrtDone]= useState(false);
  const [time,       setTime]       = useState(new Date());
  const [gpsOn,      setGpsOn]      = useState(false);
  const [gpsBanner,  setGpsBanner]  = useState(null);
  const [delay,      setDelay]      = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showQ,      setShowQ]      = useState(false);
  const wRef = useRef(null);
  const tRef = useRef(null);

  // Persist
  useEffect(()=>{
    try {
      const s = localStorage.getItem("sev4_"+driver.name);
      if(s) { const d=JSON.parse(s); setDoneTours(d.doneTours||[]); setAnfahrtDone(d.anfahrtDone||false); setActiveIdx(d.activeIdx||0); }
    } catch(e){}
  },[driver.name]);

  useEffect(()=>{
    try { localStorage.setItem("sev4_"+driver.name, JSON.stringify({doneTours,anfahrtDone,activeIdx})); } catch(e){}
  },[doneTours,anfahrtDone,activeIdx,driver.name]);

  useEffect(()=>{ const x=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(x); },[]);

  const activeTour = touren[activeIdx];
  const curTourStop = activeTour?.stops[stopIdx];
  const curStop = curTourStop ? getStop(curTourStop.id) : null;

  // Delay calculation
  useEffect(()=>{
    if(!curTourStop) return;
    const planned = timeToMin(curTourStop.t);
    const now = time.getHours()*60 + time.getMinutes();
    setDelay(now - planned);
  },[time,curTourStop]);

  // GPS
  const startGPS = () => {
    if(!navigator.geolocation) return;
    setGpsOn(true);
    wRef.current = navigator.geolocation.watchPosition(pos=>{
      const {latitude:la,longitude:lo} = pos.coords;
      if(phase==="anfahrt" && plan?.anfahrt) {
        if(distM(la,lo,plan.anfahrt.lat,plan.anfahrt.lng) < GPS_RADIUS_M) handleAnfahrtDone();
      } else if(phase==="tour" && curStop?.lat) {
        if(distM(la,lo,curStop.lat,curStop.lng) < GPS_RADIUS_M) handleStopConfirm();
      }
    },()=>{},{enableHighAccuracy:true,maximumAge:3000,timeout:8000});
  };
  const stopGPS = () => { if(wRef.current) navigator.geolocation.clearWatch(wRef.current); setGpsOn(false); };
  useEffect(()=>()=>{ if(wRef.current) navigator.geolocation.clearWatch(wRef.current); },[]);

  const showBanner = (name) => {
    setGpsBanner(name);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(()=>setGpsBanner(null),4000);
  };

  const handleAnfahrtDone = () => {
    showBanner(plan.anfahrt.ziel);
    setAnfahrtDone(true);
    setPhase("tagesplan");
  };

  const handleStopConfirm = () => {
    if(!activeTour) return;
    const name = getStop(activeTour.stops[stopIdx].id).name;
    showBanner(name);
    if(stopIdx < activeTour.stops.length-1) {
      setStopIdx(i=>i+1);
    } else {
      setDoneTours(p=>[...p,activeTour.id]);
      setActiveIdx(i=>i+1);
      setStopIdx(0);
      setPhase("tagesplan");
    }
  };

  const getTourStatus = (t,i) => {
    if(doneTours.includes(t.id)) return "done";
    if(i===activeIdx && anfahrtDone) return "active";
    if(i===0 && anfahrtDone) return "active";
    if(i>0 && doneTours.includes(touren[i-1]?.id)) return "active";
    return "locked";
  };

  const newAlerts = SONDERMELDUNGEN.filter(a=>a.isNew);
  const curStopWarn = curTourStop?.warn || SONDERMELDUNGEN.find(s=>s.haltId===curTourStop?.id)?.text;

  // ── ANFAHRT VIEW ────────────────────────────────────────────
  if(phase==="anfahrt") return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",color:"#fff",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{FONTS}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={()=>setPhase("tagesplan")} style={{background:"transparent",border:"none",color:"#C0CAD8",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Tagesplan</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#E8C84A",letterSpacing:3}}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
        <button onClick={gpsOn?stopGPS:startGPS} style={{background:gpsOn?"rgba(52,152,219,.2)":"rgba(255,255,255,.06)",border:`1px solid ${gpsOn?"#3498DB":"rgba(255,255,255,.15)"}`,borderRadius:10,padding:"6px 12px",color:gpsOn?"#3498DB":"#888",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>
          <span style={{animation:gpsOn?"gps 1.5s infinite":"none",display:"inline-block"}}>📡</span>{gpsOn?"GPS":"GPS an"}
        </button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
        <div style={{fontSize:13,color:"#666",textTransform:"uppercase",letterSpacing:3,marginBottom:16}}>ANFAHRT</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:38,color:"#fff",lineHeight:1.1,marginBottom:8}}>{plan?.anfahrt?.ziel}</div>
        <div style={{fontSize:14,color:"#888",marginBottom:32}}>Dienstbeginn: {plan?.dienstbeginn} Uhr</div>
        <button onClick={()=>openMaps(plan?.anfahrt?.lat,plan?.anfahrt?.lng,plan?.anfahrt?.ziel)} style={{width:"100%",maxWidth:320,background:"#E8C84A",border:"none",borderRadius:16,padding:"20px",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",color:"#0B0F1A",marginBottom:14}}>
          🗺️ Navigation starten
        </button>
        <button onClick={handleAnfahrtDone} style={{width:"100%",maxWidth:320,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:16,padding:"16px",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",color:"#C0CAD8"}}>
          ✓ Angekommen
        </button>
        <div style={{marginTop:16,fontSize:12,color:"#555"}}>📡 GPS erkennt Ankunft automatisch</div>
      </div>
      <LSButton/>
    </div>
  );

  // ── TOUR VIEW ───────────────────────────────────────────────
  if(phase==="tour" && activeTour) return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",color:"#fff",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{FONTS}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <button onClick={()=>setPhase("tagesplan")} style={{background:"transparent",border:"none",color:"#C0CAD8",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>← Tagesplan</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:"#E8C84A",letterSpacing:3}}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
        <button onClick={gpsOn?stopGPS:startGPS} style={{background:gpsOn?"rgba(52,152,219,.2)":"rgba(255,255,255,.06)",border:`1px solid ${gpsOn?"#3498DB":"rgba(255,255,255,.15)"}`,borderRadius:10,padding:"6px 12px",color:gpsOn?"#3498DB":"#888",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif",display:"flex",alignItems:"center",gap:5}}>
          <span style={{animation:gpsOn?"gps 1.5s infinite":"none",display:"inline-block"}}>📡</span>{gpsOn?"GPS":"GPS an"}
        </button>
      </div>

      {/* Progress */}
      <div style={{height:4,background:"rgba(255,255,255,.06)",margin:"0 0 0 0"}}>
        <div style={{height:"100%",width:`${(stopIdx/Math.max(activeTour.stops.length-1,1))*100}%`,background:"linear-gradient(90deg,#6E1E6E,#E8C84A)",transition:"width .5s"}}/>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"20px 20px 100px"}}>
        <div style={{fontSize:12,color:"#555",textTransform:"uppercase",letterSpacing:3,marginBottom:12}}>NÄCHSTER HALT</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:curStop?.name?.length>18?42:curStop?.name?.length>12?52:62,color:"#fff",lineHeight:1.05,marginBottom:8}}>{curStop?.name}</div>

        {/* Verspätungsanzeige */}
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,.05)",borderRadius:12,padding:"10px 16px",marginBottom:curStopWarn?12:20,alignSelf:"flex-start"}}>
          <span style={{fontSize:16,color:"#888"}}>⏱ {curTourStop?.t}</span>
          <span style={{fontSize:16,fontWeight:800,color:getDelayColor(delay)}}>{getDelayText(delay)}</span>
        </div>

        {curStopWarn&&(
          <div style={{background:"rgba(243,156,18,.1)",border:"1px solid rgba(243,156,18,.3)",borderRadius:14,padding:"12px 16px",marginBottom:20,fontSize:14,color:"#F39C12",lineHeight:1.5}}>
            {curStopWarn}
          </div>
        )}

        {/* Stop Strip */}
        <div style={{display:"flex",overflowX:"auto",paddingBottom:8,marginBottom:20,gap:0}}>
          {activeTour.stops.map((s,i)=>{
            const st=getStop(s.id);
            return (
              <div key={i} style={{display:"flex",alignItems:"center",flexShrink:0}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:54}}>
                  <div style={{width:12,height:12,borderRadius:"50%",marginBottom:4,background:i<stopIdx?"#2ECC71":i===stopIdx?"#E8C84A":"rgba(255,255,255,.12)",boxShadow:i===stopIdx?"0 0 12px #E8C84A":"none"}}/>
                  <div style={{fontSize:9,color:i===stopIdx?"#E8C84A":i<stopIdx?"#2ECC71":"#555",textAlign:"center",maxWidth:50,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{st.short}</div>
                  <div style={{fontSize:8,color:"#444",marginTop:1}}>{s.t}</div>
                </div>
                {i<activeTour.stops.length-1&&<div style={{width:10,height:2,background:i<stopIdx?"rgba(46,204,113,.4)":"rgba(255,255,255,.06)",marginBottom:18}}/>}
              </div>
            );
          })}
        </div>

        <button onClick={handleStopConfirm} style={{width:"100%",background:"rgba(255,255,255,.06)",border:"2px solid rgba(255,255,255,.15)",borderRadius:18,padding:"20px",fontSize:16,color:"#C0CAD8",fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif",marginBottom:12}}>
          ✓ Halt manuell bestätigen
        </button>
        <div style={{fontSize:12,color:"#444",textAlign:"center"}}>📡 GPS bestätigt automatisch</div>
      </div>

      {/* Bottom Verspätungsbalken */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,background:"#0d1520",borderTop:"1px solid rgba(255,255,255,.08)",padding:"12px 20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:"#888"}}>
          Nächster Halt <span style={{color:"#fff",fontWeight:800}}>{curStop?.short}</span> · {curTourStop?.t}
        </div>
        <div style={{fontSize:16,fontWeight:800,color:getDelayColor(delay)}}>{getDelayText(delay)}</div>
      </div>

      {gpsBanner&&(
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"#1a3a2a",border:"2px solid #2ECC71",borderRadius:16,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,zIndex:100,animation:"slideUp .3s ease",maxWidth:340}}>
          <span style={{fontSize:20}}>✓</span>
          <div>
            <div style={{fontSize:13,color:"#2ECC71",fontWeight:800}}>GPS — Halt bestätigt</div>
            <div style={{fontSize:12,color:"#aaa"}}>{gpsBanner}</div>
          </div>
          <button onClick={()=>setGpsBanner(null)} style={{background:"transparent",border:"none",color:"#666",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif",marginLeft:"auto"}}>Korrigieren</button>
        </div>
      )}
      <LSButton/>
    </div>
  );

  // ── LAYER 1: TAGESPLAN ──────────────────────────────────────
  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#0B0F1A",minHeight:"100vh",color:"#fff",maxWidth:520,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{FONTS}</style>

      {/* Header */}
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#E8C84A",letterSpacing:3,lineHeight:1}}>{driver.name}</div>
            <div style={{fontSize:13,color:"#888",marginTop:3}}>Bus {driver.bus} · Dienst {plan?.dienst}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#E8C84A",letterSpacing:3}}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
            <div style={{fontSize:12,color:"#555",marginTop:2}}>{plan?.datum}</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 100px"}}>

        {/* Anfahrt */}
        {plan?.anfahrt && (
          <button onClick={()=>setPhase("anfahrt")} style={{width:"100%",display:"flex",alignItems:"center",gap:14,background:anfahrtDone?"rgba(46,204,113,.06)":"rgba(232,200,74,.08)",border:anfahrtDone?"1px solid rgba(46,204,113,.2)":"2px solid rgba(232,200,74,.3)",borderRadius:16,padding:"16px 18px",cursor:"pointer",marginBottom:10,transition:"all .15s",textAlign:"left"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:anfahrtDone?"#2ECC71":"#E8C84A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
              {anfahrtDone?"✓":"▶"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:anfahrtDone?"#2ECC71":"#E8C84A",fontWeight:800,textTransform:"uppercase",letterSpacing:1}}>Anfahrt</div>
              <div style={{fontSize:15,color:"#fff",fontWeight:700,marginTop:2}}>{plan.anfahrt.ziel}</div>
            </div>
            <div style={{fontSize:12,color:"#555"}}>Beginn {plan.dienstbeginn}</div>
          </button>
        )}

        {/* Touren */}
        {touren.map((t,i)=>{
          const status = getTourStatus(t,i);
          const von = getStop(t.vonId);
          const nach = getStop(t.nachId);
          return (
            <button key={t.id} disabled={status==="locked"} onClick={()=>{if(status==="active"||status==="done"){setActiveIdx(i);setStopIdx(0);setPhase("tour");}}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,background:status==="done"?"rgba(46,204,113,.06)":status==="active"?"rgba(232,200,74,.08)":"rgba(255,255,255,.02)",border:status==="done"?"1px solid rgba(46,204,113,.2)":status==="active"?"2px solid rgba(232,200,74,.3)":"1px solid rgba(255,255,255,.05)",borderRadius:16,padding:"16px 18px",cursor:status==="locked"?"not-allowed":"pointer",marginBottom:10,transition:"all .15s",textAlign:"left",opacity:status==="locked"?.5:1}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:status==="done"?"#2ECC71":status==="active"?"#E8C84A":"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,color:status==="done"?"#fff":status==="active"?"#0B0F1A":"#666"}}>
                {status==="done"?"✓":status==="active"?"▶":"🔒"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,color:"#fff",fontWeight:800}}>{von.short} → {nach.short}</div>
                <div style={{fontSize:13,color:"#888",marginTop:2}}>{t.dep} – {t.arr}</div>
              </div>
              {status==="active"&&<div style={{fontSize:11,color:"#E8C84A",fontWeight:800,background:"rgba(232,200,74,.15)",borderRadius:8,padding:"3px 8px"}}>JETZT</div>}
            </button>
          );
        })}

        {/* Dienstende */}
        {plan?.dienstende && (
          <div style={{textAlign:"center",padding:"12px 0",fontSize:13,color:"#444"}}>
            Dienstende: {plan.dienstende} Uhr
          </div>
        )}

        {/* Sondermeldungen */}
        <div style={{marginTop:8}}>
          {SONDERMELDUNGEN.map(a=>(
            <div key={a.id} style={{background:a.type==="warn"?"rgba(243,156,18,.08)":"rgba(52,152,219,.08)",border:`1px solid ${a.type==="warn"?"rgba(243,156,18,.2)":"rgba(52,152,219,.2)"}`,borderRadius:12,padding:"10px 14px",marginBottom:8}}>
              <div style={{fontWeight:800,fontSize:13,color:a.type==="warn"?"#F39C12":"#3498DB",marginBottom:3,animation:a.isNew?"blink 1s infinite":""}}>{a.title} {a.isNew&&"🔴"}</div>
              <div style={{fontSize:12,color:"#C0CAD8",lineHeight:1.5}}>{a.text}</div>
            </div>
          ))}
        </div>

        {/* Qualität */}
        <button onClick={()=>setShowQ(!showQ)} style={{width:"100%",marginTop:8,padding:"14px 16px",borderRadius:14,background:"rgba(110,30,110,.15)",border:"1px solid rgba(110,30,110,.3)",color:"#C090C0",fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
          📋 Qualitätsanforderungen RVO <span style={{marginLeft:"auto"}}>{showQ?"▲":"▼"}</span>
        </button>
        {showQ&&(
          <div style={{marginTop:8,animation:"fadeUp .2s ease"}}>
            {POENALE.map((p,i)=>(
              <div key={i} style={{background:`rgba(${p.sev==="high"?"231,76,60":p.sev==="medium"?"243,156,18":"46,204,113"},.06)`,border:`1px solid rgba(${p.sev==="high"?"231,76,60":p.sev==="medium"?"243,156,18":"46,204,113"},.2)`,borderLeft:`4px solid ${p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71"}`,borderRadius:10,padding:"10px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{p.rule}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71",flexShrink:0}}>{p.amount}€</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,background:"#0d1520",borderTop:"1px solid rgba(255,255,255,.08)",padding:"12px 20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:"#555"}}>{driver.name} · {driver.bus}</div>
        <button onClick={onLogout} style={{background:"transparent",border:"none",color:"#444",fontSize:12,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>Abmelden</button>
      </div>

      {gpsBanner&&(
        <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"#1a3a2a",border:"2px solid #2ECC71",borderRadius:16,padding:"12px 20px",display:"flex",alignItems:"center",gap:10,zIndex:100,animation:"slideUp .3s ease",maxWidth:340}}>
          <span style={{fontSize:20}}>✓</span>
          <div>
            <div style={{fontSize:13,color:"#2ECC71",fontWeight:800}}>GPS — Angekommen</div>
            <div style={{fontSize:12,color:"#aaa"}}>{gpsBanner}</div>
          </div>
        </div>
      )}

      <LSButton/>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// DISPONENT APP
// ══════════════════════════════════════════════════════════════
function DisponentApp({ onLogout }) {
  const [time,setTime]=useState(new Date());
  const [tab,setTab]=useState("live");
  const [alerts,setAlerts]=useState(SONDERMELDUNGEN);
  const [newMsg,setNewMsg]=useState({title:"",text:""});
  const [lsLog,setLsLog]=useState([
    {fahrer:"Gerhard Geschwinder",bus:"ED DB 94",time:"06:31",pos:"Zwischen Grub und Heimstetten"}
  ]);

  useEffect(()=>{const x=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(x);},[]);

  const TABS=[["live","🗺️","Live"],["touren","🚌","Touren"],["meldungen","⚠️","Meldungen"],["leitstelle","📞","Leitstelle"]];

  return (
    <div style={{fontFamily:"'Nunito',sans-serif",background:"#f0f4f8",minHeight:"100vh",maxWidth:960,margin:"0 auto"}}>
      <style>{FONTS}</style>
      <div style={{background:"linear-gradient(135deg,#1a2a4a,#0d1b33)",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:"#E8C84A",letterSpacing:3}}>SEV CONNECT · DISPONENT</div>
          <div style={{fontSize:11,color:"#4a6fa5",letterSpacing:1,textTransform:"uppercase"}}>S2 · Berg am Laim ↔ Markt Schwaben · 07.05.2026</div>
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

        {tab==="live"&&(
          <div>
            <div style={{fontSize:13,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Live Status — Alle Fahrer</div>
            {DRIVERS.map(d=>{
              const plan = DIENSTPLAENE[d.name];
              const isActive = plan?.touren?.length > 0;
              return (
                <div key={d.id} style={{background:"#fff",border:"1px solid #e8ecf0",borderLeft:`4px solid ${isActive?"#2ECC71":"#ccc"}`,borderRadius:14,padding:"14px 18px",marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:"#6E1E6E",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#E8C84A",flexShrink:0}}>{d.avatar}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15}}>{d.name}</div>
                    <div style={{fontSize:12,color:"#999",marginTop:2}}>Bus: {d.bus} · Dienst: {plan?.dienst||"—"}</div>
                    {isActive&&<div style={{fontSize:12,color:"#2ECC71",marginTop:2}}>● Aktiv · {plan.dienstbeginn} – {plan.dienstende} Uhr</div>}
                  </div>
                  <button onClick={()=>window.open(`tel:+${d.tel}`,"_blank")} style={{background:"#3498DB",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",cursor:"pointer",fontSize:16}}>📞</button>
                  <button onClick={()=>window.open(`https://wa.me/${d.tel}`,"_blank")} style={{background:"#25D366",border:"none",borderRadius:10,padding:"8px 12px",color:"#fff",cursor:"pointer",fontSize:16}}>💬</button>
                </div>
              );
            })}
            {lsLog.length>0&&(
              <div style={{background:"#fff",border:"2px solid #E74C3C",borderRadius:14,padding:"14px 18px",marginTop:16}}>
                <div style={{fontWeight:800,fontSize:14,color:"#E74C3C",marginBottom:10}}>🔴 Leitstelle angerufen</div>
                {lsLog.map((l,i)=>(
                  <div key={i} style={{fontSize:13,color:"#555",padding:"6px 0",borderBottom:i<lsLog.length-1?"1px solid #f0f0f0":"none"}}>
                    <span style={{fontWeight:700,color:"#333"}}>{l.fahrer}</span> · {l.bus} · {l.time} Uhr · {l.pos}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="touren"&&(
          <div>
            <div style={{fontSize:13,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Fahraufträge heute — 07.05.2026</div>
            {Object.entries(DIENSTPLAENE).map(([name,plan])=>(
              <div key={name} style={{background:"#fff",border:"1px solid #e8ecf0",borderRadius:14,padding:"14px 18px",marginBottom:16}}>
                <div style={{fontWeight:800,fontSize:15,marginBottom:8,color:"#1a2a4a"}}>{name} · {plan.dienst}</div>
                {plan.touren.map((t,i)=>{
                  const von=getStop(t.vonId),nach=getStop(t.nachId);
                  return (
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<plan.touren.length-1?"1px solid #f5f5f5":"none"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:"#f0f4f8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#6E1E6E",flexShrink:0}}>{i+1}</div>
                      <div style={{flex:1,fontSize:13}}>
                        <span style={{fontWeight:700}}>{von.short}</span> → <span style={{fontWeight:700}}>{nach.short}</span>
                        <span style={{color:"#999",marginLeft:8}}>{t.dep} – {t.arr}</span>
                      </div>
                    </div>
                  );
                })}
                {plan.touren.length===0&&<div style={{fontSize:13,color:"#bbb"}}>Keine Touren zugewiesen</div>}
              </div>
            ))}
          </div>
        )}

        {tab==="meldungen"&&(
          <div>
            <div style={{background:"#fff",border:"2px solid #1a6fb5",borderRadius:16,padding:20,marginBottom:16}}>
              <div style={{fontSize:12,color:"#1a6fb5",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Neue Meldung senden</div>
              <input value={newMsg.title} onChange={e=>setNewMsg(p=>({...p,title:e.target.value}))} placeholder="Titel..." style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none",marginBottom:10}}/>
              <textarea value={newMsg.text} onChange={e=>setNewMsg(p=>({...p,text:e.target.value}))} placeholder="Details..." rows={3} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"2px solid #e8ecf0",fontSize:14,fontFamily:"'Nunito',sans-serif",background:"#f8fafc",outline:"none",resize:"vertical",marginBottom:12}}/>
              <button onClick={()=>{if(!newMsg.title)return;setAlerts(p=>[{id:Date.now(),type:"warn",title:newMsg.title,text:newMsg.text,isNew:true,haltId:null},...p]);setNewMsg({title:"",text:""}); }} style={{width:"100%",background:"#1a6fb5",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"'Nunito',sans-serif"}}>
                🔴 Meldung senden — erscheint blinkend bei Fahrern
              </button>
            </div>
            {alerts.map(a=>(
              <div key={a.id} style={{background:"#fff",border:"1px solid #e8ecf0",borderLeft:`4px solid ${a.type==="warn"?"#F39C12":"#3498DB"}`,borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{fontWeight:800,fontSize:14,color:a.type==="warn"?"#F39C12":"#3498DB",marginBottom:4}}>{a.title} {a.isNew&&<span style={{fontSize:11,background:"#E74C3C",color:"#fff",borderRadius:6,padding:"2px 6px",marginLeft:6}}>NEU</span>}</div>
                <div style={{fontSize:13,color:"#777"}}>{a.text}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="leitstelle"&&(
          <div>
            <div style={{background:"#fff",border:"2px solid #E74C3C",borderRadius:16,padding:20,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:800,fontSize:16}}>RVO-Leitstelle</div>
                <div style={{fontSize:14,color:"#2ECC71",marginTop:2}}>● 24/7 · 089 55164 120</div>
                <div style={{fontSize:11,color:"#bbb",marginTop:2}}>Nummer nicht an Dritte weitergeben</div>
              </div>
              <button onClick={callLS} style={{background:"#E74C3C",border:"none",borderRadius:14,padding:"14px 20px",color:"#fff",fontSize:20,cursor:"pointer"}}>📞</button>
            </div>
            <div style={{fontSize:13,color:"#999",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Leitstellen-Anrufe heute</div>
            {lsLog.map((l,i)=>(
              <div key={i} style={{background:"#fff",border:"1px solid #e8ecf0",borderLeft:"4px solid #E74C3C",borderRadius:14,padding:"14px 18px",marginBottom:10}}>
                <div style={{fontWeight:800,fontSize:14,color:"#E74C3C",marginBottom:4}}>🔴 {l.fahrer} · {l.bus}</div>
                <div style={{fontSize:13,color:"#777"}}>{l.time} Uhr · {l.pos}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]=useState("login"),[driver,setDriver]=useState(null);
  return (
    <div>
      <style>{FONTS}</style>
      {view==="login"    && <Login onDriver={d=>{setDriver(d);setView("driver");}} onDispatch={()=>setView("dispatch")}/>}
      {view==="driver"   && <FahrerApp driver={driver} onLogout={()=>setView("login")}/>}
      {view==="dispatch" && <DisponentApp onLogout={()=>setView("login")}/>}
    </div>
  );
}
