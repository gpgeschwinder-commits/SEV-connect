import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
//  SEV CONNECT — S2 PILOTEINSATZ v2.0
//  Berg am Laim ↔ Markt Schwaben · 01.05–14.06.2026
//  iPad + iPhone optimiert · Vorführversion
// ═══════════════════════════════════════════════════════════════

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

  /* ── LESBARKEIT: Maximaler Kontrast ─────────────────────────
     Alle dunklen/grauen Texte auf helles Weiß/Hellgrau */
  [style*="color:#888"], [style*="color: #888"] { color: #C8D0DC !important; }
  [style*="color:#666"], [style*="color: #666"] { color: #B0BAC8 !important; }
  [style*="color:#555"], [style*="color: #555"] { color: #A8B4C4 !important; }
  [style*="color:#444"], [style*="color: #444"] { color: #98A8BC !important; }
  [style*="color:#aaa"], [style*="color: #aaa"] { color: #D0D8E4 !important; }
  [style*="color:#999"], [style*="color: #999"] { color: #C0CAD8 !important; }
  [style*="color:#777"], [style*="color: #777"] { color: #B8C4D2 !important; }
  [style*="color:#bbb"], [style*="color: #bbb"] { color: #C8D0DC !important; }
  [style*="color:#ccc"], [style*="color: #ccc"] { color: #D4DCE8 !important; }

  /* Weiße Texte noch heller */
  [style*="color:#fff"], [style*="color: #fff"] { color: #FFFFFF !important; }

  /* Fahrer-Hauptscreen: Schrift generell größer */
  .fahrt-main { font-size: 17px !important; }
`;


const LEITSTELLE_TEL = "08955164120";
const LEITSTELLE_WA  = "4989551641200";
const DISPATCH_PIN   = "1234";
const GPS_RADIUS_M   = 200;

const DRIVERS = [
  { id:1, name:"Elisabeth Bachmeier", avatar:"EB", bus:"ED DB 42" },
  { id:2, name:"Sebastian Deuschel",  avatar:"SD", bus:"ED DB XX" },
  { id:3, name:"Gerhard Geschwinder", avatar:"GG", bus:"ED DB 94" },
];

const ANSAGEN = {
  "Berg am Laim":      "Nächste Haltestelle: Berg am Laim. Bitte alle aussteigen.",
  "Feldkirchen":       "Nächste Haltestelle: Feldkirchen. Umstieg S2 Richtung München möglich.",
  "Heimstetten":       "Nächste Haltestelle: Heimstetten.",
  "Grub":              "Nächste Haltestelle: Grub. Haltestelle Senator-Gerauer-Straße, beidseitig.",
  "Riem":              "Nächste Haltestelle: Riem. Anschluss Linien 183, 190 und 194.",
  "Poing":             "Nächste Haltestelle: Poing.",
  "Markt Schwaben":    "Endstation: Markt Schwaben. Bitte alle aussteigen. Auf Wiedersehen.",
};

const STOPS_HIN = [
  { id:1, name:"Berg am Laim",   platform:"Zamilastraße",         dep:"—",   wait:0, lat:48.1272, lng:11.6390, note:"Wendeschleife Zamilastraße benutzen" },
  { id:2, name:"Feldkirchen",    platform:"Bahnhof",              dep:"+4",  wait:2, lat:48.1315, lng:11.7270, note:"⚠️ 01.05–03.05: Umleitung Maifest! → Münchner Straße (beidseitig)" },
  { id:3, name:"Heimstetten",    platform:"S-Bahn Haltestelle",   dep:"+7",  wait:1, lat:48.1362, lng:11.7510, note:"" },
  { id:4, name:"Grub",           platform:"Senator-Gerauer-Str.", dep:"+11", wait:1, lat:48.1410, lng:11.7710, note:"Haltestelle beidseitig Senator-Gerauer-Straße" },
  { id:5, name:"Riem",           platform:"Graf-Lendorff-Str.",   dep:"+15", wait:2, lat:48.1380, lng:11.7000, note:"Linien 183/190/194 Graf-Lendorff-Str. beidseitig" },
  { id:6, name:"Poing",          platform:"Bahnhof",              dep:"+22", wait:1, lat:48.1720, lng:11.8100, note:"" },
  { id:7, name:"Markt Schwaben", platform:"Bahnhof",              dep:"+30", wait:0, lat:48.1930, lng:11.8680, note:"⚠️ 07.05 08:30–16:30: Umleitung Baustelle Herzog-Ludwig-Str." },
];

const STOPS_RUECK = [
  { id:10, name:"Markt Schwaben", platform:"Bahnhof",              dep:"—",   wait:0, lat:48.1930, lng:11.8680, note:"⚠️ 07.05 08:30–16:30: Umleitung Baustelle Herzog-Ludwig-Str." },
  { id:11, name:"Poing",          platform:"Bahnhof",              dep:"+8",  wait:1, lat:48.1720, lng:11.8100, note:"" },
  { id:12, name:"Grub",           platform:"Senator-Gerauer-Str.", dep:"+14", wait:1, lat:48.1410, lng:11.7710, note:"Haltestelle beidseitig Senator-Gerauer-Straße" },
  { id:13, name:"Riem",           platform:"Graf-Lendorff-Str.",   dep:"+18", wait:2, lat:48.1380, lng:11.7000, note:"Linien 183/190/194 Graf-Lendorff-Str. beidseitig" },
  { id:14, name:"Heimstetten",    platform:"S-Bahn Haltestelle",   dep:"+22", wait:1, lat:48.1362, lng:11.7510, note:"" },
  { id:15, name:"Feldkirchen",    platform:"Bahnhof",              dep:"+26", wait:2, lat:48.1315, lng:11.7270, note:"⚠️ 01.05–03.05: Umleitung Maifest! → Münchner Straße (beidseitig)" },
  { id:16, name:"Berg am Laim",   platform:"Zamilastraße",         dep:"+32", wait:0, lat:48.1272, lng:11.6390, note:"Wendeschleife Zamilastraße — Pausenplatz hier" },
];

const INIT_ALERTS = [
  { id:1, type:"warn", title:"⚠️ Maifest Feldkirchen", text:"01.05–03.05. bis 20:00 Uhr: Reguläre Haltestelle Feldkirchen Bahnhof NICHT erreichbar. Linienhaltestelle 'Münchner Straße' (beidseitig) benutzen.", validFrom:"01.05", validTo:"03.05" },
  { id:2, type:"warn", title:"⚠️ Maifest Erding — NUR 01.05. Abend", text:"Nur 01.05. abends: Sperrung Erding–Altenerding. Alternative: 'H.Tassilo-Realschule' (beidseitig) Münchner Str.", validFrom:"01.05", validTo:"01.05" },
  { id:3, type:"warn", title:"⚠️ Baustelle Markt Schwaben — NUR 07.05.", text:"Nur 07.05. zwischen 08:30–16:30 Uhr: Herzog-Ludwig-Straße gesperrt. Umleitung zur regulären EV-Haltestelle beachten.", validFrom:"07.05", validTo:"07.05" },
  { id:4, type:"info", title:"🅿️ Pausenplatz", text:"Alle Pausenplätze in der Zamilastraße (Berg am Laim). Gelenkbusse DB42 + DB94 übernachten dort. Falschparker bei Leitstelle melden.", validFrom:"01.05", validTo:"14.06" },
  { id:5, type:"info", title:"🔍 BEG-Qualitätsprüfung", text:"Unangemeldete Prüfungen durch BEG und S-Bahn München. Korrekte Beschilderung und Haltestellenansagen sind Pflicht. Pönale bei Verstößen!", validFrom:"01.05", validTo:"14.06" },
];

const POENALE = [
  { rule:"Fahrt ausgefallen",              consequence:"Teilweiser oder gänzlicher Ausfall je Fahrt",          amount:250, sev:"high" },
  { rule:"Fahrzeug technisch defekt",      consequence:"KOM aus laufendem EV genommen je Vorgang",             amount:250, sev:"high" },
  { rule:"Lenk-/Ruhezeiten verletzt",      consequence:"Verstoß festgestellt je Verstoß",                      amount:250, sev:"high" },
  { rule:"Falscher Bustyp",                consequence:"Nicht gemeldeter KOM je Umlauf",                       amount:150, sev:"medium" },
  { rule:"Falsche/fehlende Beschilderung", consequence:"Keine sichtbare Beschilderung je Einsatztag",          amount:100, sev:"medium" },
  { rule:"DB SEM App nicht benutzt",       consequence:"Nichtbenutzung pro Abrufcode",                         amount:100, sev:"medium" },
  { rule:"Verspätete/verfrühte Abfahrt",   consequence:"Selbstverantwortete Verspätung je Fahrt",              amount:100, sev:"medium" },
  { rule:"Zwischenhalt nicht bedient",     consequence:"Zu früh abgefahren oder nicht bedient je Haltestelle", amount:100, sev:"medium" },
  { rule:"Störung nicht gemeldet",         consequence:"Fahrpersonal meldet nicht oder verspätet je Vorfall",  amount:100, sev:"medium" },
  { rule:"Haltestelle nicht angesagt",     consequence:"Haltestelle nicht angesagt je Haltestelle",            amount:50,  sev:"low" },
];

const CHECKLIST = [
  "Beschilderung vorne: 'Ersatzverkehr' + Linie + Ziel sichtbar",
  "Beschilderung seitlich rechts: 'EV' + Fahrtziel + Logo",
  "Fahrzeug sauber — Innenraum, Scheiben, Einstieg",
  "Gepflegte Kleidung — keine Sport-/Trainingskleidung, Schultern bedeckt",
  "5 Minuten vor Abfahrt am Fahrzeug",
  "Haltestellenansagen korrekt — jeden Halt ankündigen",
  "Begrüßung bei Einsteigen, Verabschiedung bei Aussteigen",
  "Rauchverbot im Bus — auch in Pause",
  "Rollstühle und Kinderwagen haben Vorrang",
  "Störungen sofort an Leitstelle 089 55164 120 melden",
];

const distM = (a1,o1,a2,o2) => {
  const R=6371000,dA=(a2-a1)*Math.PI/180,dO=(o2-o1)*Math.PI/180;
  const a=Math.sin(dA/2)**2+Math.cos(a1*Math.PI/180)*Math.cos(a2*Math.PI/180)*Math.sin(dO/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

const openMaps = s => window.open(`https://www.google.com/maps/search/${encodeURIComponent(s.name+", München")}`, "_blank");
const callLS   = () => window.open(`tel:${LEITSTELLE_TEL}`, "_blank");
const waLS     = () => window.open(`https://wa.me/${LEITSTELLE_WA}`, "_blank");

const B = ({ ch, onClick, style={}, v="primary", disabled=false }) => {
  const vs = {
    primary:   { background:"#E8C84A", color:"#0B0F1A", fontSize:20, padding:"18px 22px", borderRadius:16 },
    secondary: { background:"rgba(255,255,255,.07)", color:"#fff", fontSize:16, padding:"14px 20px", borderRadius:14, border:"1px solid rgba(255,255,255,.15)" },
    green:     { background:"#2ECC71", color:"#0B0F1A", fontSize:18, padding:"18px 22px", borderRadius:16 },
    ghost:     { background:"transparent", color:"#888", fontSize:14, padding:"10px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,.1)" },
  }[v]||{};
  return <button onClick={onClick} disabled={disabled} style={{ border:"none", fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .15s", ...vs, ...style }}>{ch}</button>;
};

// ── LOGIN ────────────────────────────────────────────────────────
const Login = ({ onD, onDis }) => {
  const [m, setM] = useState(null);
  const [s, setS] = useState("");
  const [p, setP] = useState("");
  const [e, setE] = useState("");
  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#0B0F1A", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <style>{FONTS}</style>
      <div style={{ textAlign:"center", marginBottom:48, animation:"fadeUp .5s ease" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, color:"#E8C84A", letterSpacing:6, lineHeight:1 }}>SEV CONNECT</div>
        <div style={{ fontSize:16, color:"#E74C3C", letterSpacing:2, marginTop:8, fontWeight:800, textTransform:"uppercase" }}>S2 · Berg am Laim ↔ Markt Schwaben</div>
        <div style={{ fontSize:14, color:"#8899AA", marginTop:6 }}>01.05. – 14.06.2026 · Piloteinsatz · RVO / DB</div>
      </div>
      {!m ? (
        <div style={{ width:"100%", maxWidth:440, display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .4s ease .1s both" }}>
          <B ch="👨‍✈️ Ich bin Fahrer" onClick={()=>setM("d")} v="primary" style={{ width:"100%", fontSize:24, padding:"28px", borderRadius:22 }}/>
          <B ch="🖥️ Ich bin Disponent" onClick={()=>setM("dis")} v="secondary" style={{ width:"100%", fontSize:20, padding:"22px", borderRadius:22 }}/>
        </div>
      ) : m==="d" ? (
        <div style={{ width:"100%", maxWidth:440, animation:"fadeUp .3s ease" }}>
          <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>Fahrer wählen</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            {DRIVERS.map(d=>(
              <button key={d.id} onClick={()=>setS(d.name)} style={{ background:s===d.name?"rgba(232,200,74,.15)":"rgba(255,255,255,.04)", border:s===d.name?"2px solid #E8C84A":"2px solid transparent", borderRadius:18, padding:"18px 22px", cursor:"pointer", display:"flex", alignItems:"center", gap:18, transition:"all .15s" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:"#6E1E6E", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:18, color:"#E8C84A", flexShrink:0 }}>{d.avatar}</div>
                <div style={{ flex:1, textAlign:"left" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:22, fontWeight:800, color:"#fff" }}>{d.name}</div>
                  <div style={{ fontSize:15, color:"#C0CAD8", marginTop:2 }}>Bus: {d.bus}</div>
                </div>
                {s===d.name && <span style={{ color:"#E8C84A", fontSize:24 }}>✓</span>}
              </button>
            ))}
          </div>
          {e && <div style={{ color:"#E74C3C", fontSize:14, marginBottom:12, textAlign:"center" }}>{e}</div>}
          <div style={{ display:"flex", gap:12 }}>
            <B ch="← Zurück" onClick={()=>setM(null)} v="ghost" style={{ flex:1 }}/>
            <B ch="Anmelden →" onClick={()=>{ if(!s){setE("Bitte Fahrer wählen"); return;} onD(DRIVERS.find(d=>d.name===s)); }} v="green" style={{ flex:2, fontSize:20 }}/>
          </div>
        </div>
      ) : (
        <div style={{ width:"100%", maxWidth:440, animation:"fadeUp .3s ease" }}>
          <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:2, marginBottom:14 }}>Disponent-PIN</div>
          <input type="password" maxLength={4} value={p} onChange={ev=>{setP(ev.target.value);setE("");}} onKeyDown={ev=>ev.key==="Enter"&&(p===DISPATCH_PIN?onDis():setE("Falscher PIN"))} placeholder="● ● ● ●"
            style={{ width:"100%", background:"rgba(255,255,255,.07)", border:"2px solid rgba(255,255,255,.15)", borderRadius:18, padding:"24px", fontSize:40, textAlign:"center", color:"#E8C84A", fontFamily:"monospace", letterSpacing:20, outline:"none", marginBottom:10 }}/>
          <div style={{ fontSize:12, color:"#444", textAlign:"center", marginBottom:24 }}>PIN: 1234</div>
          {e && <div style={{ color:"#E74C3C", fontSize:14, marginBottom:12, textAlign:"center" }}>{e}</div>}
          <div style={{ display:"flex", gap:12 }}>
            <B ch="← Zurück" onClick={()=>setM(null)} v="ghost" style={{ flex:1 }}/>
            <B ch="Anmelden →" onClick={()=>p===DISPATCH_PIN?onDis():setE("Falscher PIN")} v="secondary" style={{ flex:2, fontSize:18 }}/>
          </div>
        </div>
      )}
    </div>
  );
};

// ── FAHRER ──────────────────────────────────────────────────────
const Fahrer = ({ driver, onLogout }) => {
  const [richt,   setRicht]   = useState("hin");
  const [stops,   setStops]   = useState(STOPS_HIN.map((s,i)=>({...s,done:false,current:i===0})));
  const [tab,     setTab]     = useState("fahrt");
  const [showAll, setShowAll] = useState(false);
  const [showAl,  setShowAl]  = useState(false);
  const [navP,    setNavP]    = useState(false);
  const [conf,    setConf]    = useState(false);
  const [gpsOn,   setGpsOn]   = useState(false);
  const [gpsNear, setGpsNear] = useState(null);
  const [showAns, setShowAns] = useState(false);
  const [pruef,   setPruef]   = useState(false);
  const [chk,     setChk]     = useState([]);
  const [time,    setTime]    = useState(new Date());
  const wRef = useRef(null);

  useEffect(()=>{ const x=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(x); },[]);

  const startGPS = () => {
    if (!navigator.geolocation) return;
    setGpsOn(true);
    wRef.current = navigator.geolocation.watchPosition(pos=>{
      const {latitude:la,longitude:lo} = pos.coords;
      const ci = stops.findIndex(s=>s.current);
      const ns = stops[ci];
      if (ns&&!ns.done) {
        const d = distM(la,lo,ns.lat,ns.lng);
        if (d<GPS_RADIUS_M) { setGpsNear(ns.id); setShowAns(true); }
        else { setGpsNear(null); }
      }
    }, err=>console.log(err), {enableHighAccuracy:true,maximumAge:5000,timeout:10000});
  };

  const stopGPS = () => {
    if(wRef.current) navigator.geolocation.clearWatch(wRef.current);
    setGpsOn(false); setGpsNear(null); setShowAns(false);
  };
  useEffect(()=>()=>{ if(wRef.current) navigator.geolocation.clearWatch(wRef.current); },[]);

  const switchR = r => {
    setRicht(r);
    setStops((r==="hin"?STOPS_HIN:STOPS_RUECK).map((s,i)=>({...s,done:false,current:i===0})));
    setShowAll(false); setNavP(false); setGpsNear(null); setShowAns(false);
  };

  const ci  = stops.findIndex(s=>s.current);
  const cur = stops[ci];
  const isLast = ci===stops.length-1 && cur?.done;
  const prog = Math.round((ci/(stops.length-1))*100);

  const confirm = () => {
    setConf(true); setShowAns(false); setGpsNear(null);
    setTimeout(()=>{
      setConf(false);
      if(ci<stops.length-1) {
        setStops(p=>p.map((s,i)=>i===ci?{...s,done:true,current:false}:i===ci+1?{...s,current:true}:s));
        setTimeout(()=>setNavP(true),400);
      } else {
        setStops(p=>p.map((s,i)=>i===ci?{...s,done:true,current:false}:s));
      }
    },700);
  };

  if(isLast) return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#0B0F1A", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center", color:"#fff" }}>
      <style>{FONTS}</style>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:64, color:"#2ECC71", letterSpacing:4, animation:"arrive .6s ease" }}>ZIEL ERREICHT</div>
      <div style={{ fontSize:22, color:"#888", marginTop:10 }}>Gute Fahrt! Auf Wiedersehen.</div>
      <div style={{ marginTop:20, background:"rgba(52,152,219,.1)", border:"1px solid rgba(52,152,219,.2)", borderRadius:14, padding:"14px 24px", fontSize:14, color:"#3498DB" }}>🅿️ Pausenplatz: Zamilastraße, Berg am Laim</div>
      <div style={{ display:"flex", gap:14, marginTop:36 }}>
        <B ch="🔄 Rücktour" onClick={()=>switchR(richt==="hin"?"rueck":"hin")} v="primary" style={{ fontSize:18, padding:"18px 28px" }}/>
        <B ch="Abmelden" onClick={onLogout} v="ghost"/>
      </div>
    </div>
  );

  const TABS = [{ id:"fahrt", label:"Fahrt", icon:"🚌" },{ id:"qualitaet", label:"Qualität", icon:"📋" }];

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#0B0F1A", minHeight:"100vh", color:"#fff", maxWidth:680, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <style>{FONTS}</style>

      {/* STATUS */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px 8px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:9, height:9, borderRadius:"50%", background:"#2ECC71", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:15, color:"#D0D8E4" }}>S2 · {driver.bus}</span>
          {gpsOn && <span style={{ fontSize:13, color:"#3498DB", display:"flex", alignItems:"center", gap:4 }}><span style={{ animation:"gps 1.5s infinite", display:"inline-block" }}>📡</span>GPS</span>}
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"#E8C84A", letterSpacing:3 }}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
        <button onClick={onLogout} style={{ background:"transparent", border:"none", color:"#555", fontSize:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Abmelden</button>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", background:"rgba(255,255,255,.03)", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"12px 8px", border:"none", background:tab===t.id?"rgba(232,200,74,.1)":"transparent", borderBottom:tab===t.id?"2px solid #E8C84A":"2px solid transparent", color:tab===t.id?"#E8C84A":"#666", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ── FAHRT ────────────────────────────────────────────── */}
      {tab==="fahrt" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          {/* Richtung */}
          <div style={{ display:"flex", background:"rgba(255,255,255,.04)", margin:"10px 16px 0", borderRadius:14, padding:4, gap:4 }}>
            {[["hin","→ Berg am Laim → Markt Schwaben"],["rueck","← Markt Schwaben → Berg am Laim"]].map(([r,l])=>(
              <button key={r} onClick={()=>switchR(r)} style={{ flex:1, padding:"10px 8px", borderRadius:10, border:"none", cursor:"pointer", background:richt===r?"#6E1E6E":"transparent", color:richt===r?"#E8C84A":"#555", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:12, transition:"all .2s" }}>{l}</button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ height:3, background:"rgba(255,255,255,.06)", margin:"10px 16px 0", borderRadius:2 }}>
            <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#6E1E6E,#E8C84A)", borderRadius:2, transition:"width .6s" }}/>
          </div>

          {/* GPS */}
          <div style={{ display:"flex", justifyContent:"flex-end", padding:"8px 16px 0" }}>
            <button onClick={gpsOn?stopGPS:startGPS} style={{ background:gpsOn?"rgba(52,152,219,.2)":"rgba(255,255,255,.05)", border:`1px solid ${gpsOn?"rgba(52,152,219,.4)":"rgba(255,255,255,.1)"}`, borderRadius:10, padding:"8px 16px", color:gpsOn?"#3498DB":"#B0BAC8", fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ animation:gpsOn?"gps 1.5s infinite":"none", display:"inline-block" }}>📡</span>
              {gpsOn?"GPS aktiv":"GPS starten"}
            </button>
          </div>

          {/* GPS Ansage */}
          {showAns && gpsNear && (
            <div style={{ margin:"10px 16px 0", background:"rgba(46,204,113,.12)", border:"2px solid rgba(46,204,113,.4)", borderRadius:16, padding:"16px 18px", animation:"arrive .4s ease" }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#2ECC71", marginBottom:8 }}>📍 Haltestelle erkannt — Bitte ansagen:</div>
              <div style={{ fontSize:17, color:"#fff", lineHeight:1.5, fontStyle:"italic", marginBottom:12 }}>"{ANSAGEN[cur?.name] || `Nächste Haltestelle: ${cur?.name}.`}"</div>
              <button onClick={()=>setShowAns(false)} style={{ background:"#2ECC71", border:"none", borderRadius:10, padding:"8px 16px", color:"#0B0F1A", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, cursor:"pointer" }}>✓ Angesagt</button>
            </div>
          )}

          {/* Alerts */}
          <button onClick={()=>setShowAl(!showAl)} style={{ margin:"10px 16px 0", padding:"10px 16px", borderRadius:12, background:"rgba(243,156,18,.1)", border:"1px solid rgba(243,156,18,.25)", color:"#F39C12", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:8, animation:"warn 2s infinite" }}>
            ⚠️ {INIT_ALERTS.filter(a=>a.type==="warn").length} Sondermeldungen aktiv <span style={{ marginLeft:"auto" }}>{showAl?"▲":"▼"}</span>
          </button>
          {showAl && (
            <div style={{ margin:"6px 16px 0", animation:"fadeIn .2s ease" }}>
              {INIT_ALERTS.map(a=>(
                <div key={a.id} style={{ background:a.type==="warn"?"rgba(243,156,18,.08)":"rgba(52,152,219,.08)", border:`1px solid ${a.type==="warn"?"rgba(243,156,18,.2)":"rgba(52,152,219,.2)"}`, borderRadius:12, padding:"10px 14px", marginBottom:8 }}>
                  <div style={{ fontWeight:800, fontSize:13, color:a.type==="warn"?"#F39C12":"#3498DB", marginBottom:3 }}>{a.title}</div>
                  <div style={{ fontSize:14, color:"#D0D8E4", lineHeight:1.5 }}>{a.text}</div>
                </div>
              ))}
              <button onClick={()=>setShowAl(false)} style={{ width:"100%", background:"transparent", border:"none", color:"#555", fontSize:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif", padding:"6px" }}>▲ Schließen</button>
            </div>
          )}

          {/* Nav Prompt */}
          {navP && (()=>{
            const ns = stops.find(s=>s.current);
            return (
              <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.9)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:36, zIndex:100, animation:"fadeIn .25s ease" }}>
                <div style={{ fontSize:13, color:"#555", textTransform:"uppercase", letterSpacing:3, marginBottom:18 }}>NÄCHSTER HALT</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:ns?.name.length>14?48:62, color:"#fff", textAlign:"center", lineHeight:1.05, marginBottom:8 }}>{ns?.name}</div>
                <div style={{ fontSize:18, color:"#E8C84A", fontWeight:700, marginBottom:12 }}>📍 {ns?.platform}</div>
                {ns?.note && <div style={{ background:"rgba(243,156,18,.12)", border:"1px solid rgba(243,156,18,.3)", borderRadius:14, padding:"12px 18px", marginBottom:24, fontSize:14, color:"#F39C12", textAlign:"center", maxWidth:380, lineHeight:1.5 }}>{ns.note}</div>}
                <div style={{ display:"flex", flexDirection:"column", gap:14, width:"100%", maxWidth:360 }}>
                  <B ch="🗺️ Navigation starten" onClick={()=>{ setNavP(false); openMaps(ns); }} v="primary" style={{ width:"100%", fontSize:20, padding:"22px", borderRadius:18 }}/>
                  <B ch="Ich kenne den Weg" onClick={()=>setNavP(false)} v="ghost" style={{ width:"100%", fontSize:17, padding:"18px", borderRadius:18 }}/>
                </div>
              </div>
            );
          })()}

          {!showAll ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"16px 20px" }}>
              <div style={{ fontSize:14, color:"#8899AA", textTransform:"uppercase", letterSpacing:3, marginBottom:12 }}>NÄCHSTER HALT</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:cur?.name.length>14?52:66, color:"#fff", lineHeight:1, marginBottom:6 }}>{cur?.name}</div>
              <div style={{ fontSize:20, color:"#E8C84A", fontWeight:700, marginBottom:cur?.note?12:22 }}>📍 {cur?.platform}</div>
              {cur?.note && <div style={{ background:"rgba(243,156,18,.1)", border:"1px solid rgba(243,156,18,.25)", borderRadius:12, padding:"12px 14px", marginBottom:18, fontSize:16, color:"#F39C12", lineHeight:1.6 }}>{cur.note}</div>}
              <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                <div style={{ flex:1, background:"rgba(232,200,74,.08)", border:"1px solid rgba(232,200,74,.2)", borderRadius:16, padding:"14px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Abfahrt</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:"#E8C84A", letterSpacing:2, lineHeight:1 }}>{cur?.dep}</div>
                </div>
                {cur?.wait>0 && <div style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:16, padding:"14px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Aufenthalt</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:"#aaa", letterSpacing:2, lineHeight:1 }}>{cur.wait}<span style={{ fontSize:18, color:"#555" }}>Min</span></div>
                </div>}
              </div>
              <B ch={conf?"Halt bestätigt ✓":"✓ Erledigt"} onClick={confirm} v={conf?"green":"primary"} style={{ width:"100%", marginBottom:12, fontSize:22, padding:"22px", borderRadius:18 }}/>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
                {[["🗺️","Navigation",()=>openMaps(cur)],["💬","WhatsApp",waLS],["📞","Leitstelle",callLS]].map(([ic,lb,fn])=>(
                  <button key={lb} onClick={fn} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:14, padding:"14px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:14, color:"#D0D8E4" }}>
                    <span style={{ fontSize:24 }}>{ic}</span>{lb}
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowAll(true)} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:12, padding:"14px", color:"#D0D8E4", fontSize:15, fontFamily:"'Nunito',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                📋 Alle {stops.length} Halte · {stops.length-ci-1} verbleibend
              </button>
              <div style={{ display:"flex", overflowX:"auto", gap:0, marginTop:12 }}>
                {stops.map((s,i)=>(
                  <div key={s.id} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:48 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", marginBottom:3, background:s.done?"#1a1a1a":s.current?"#E8C84A":s.note?"rgba(243,156,18,.4)":"rgba(255,255,255,.1)", boxShadow:s.current?"0 0 10px #E8C84A":"none" }}/>
                      <div style={{ fontSize:8, color:s.current?"#E8C84A":s.done?"#222":"#444", textAlign:"center", maxWidth:44, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:s.current?800:400 }}>{s.name.split(" ")[0]}</div>
                    </div>
                    {i<stops.length-1 && <div style={{ width:8, height:2, background:"rgba(255,255,255,.06)", marginBottom:12 }}/>}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, background:"rgba(52,152,219,.1)", border:"1px solid rgba(52,152,219,.25)", borderRadius:10, padding:"10px 14px", fontSize:14, color:"#6EC6FF" }}>🅿️ Pausenplatz: Zamilastraße, Berg am Laim</div>
            </div>
          ) : (
            <div style={{ flex:1, padding:16, overflowY:"auto", animation:"fadeIn .2s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:2, color:"#E8C84A" }}>{richt==="hin"?"→ HINFAHRT":"← RÜCKFAHRT"}</div>
                <button onClick={()=>setShowAll(false)} style={{ background:"rgba(255,255,255,.08)", border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>← Zurück</button>
              </div>
              {stops.map((s,i)=>(
                <div key={s.id} style={{ display:"flex", gap:12, marginBottom:4, opacity:s.done?.4:1 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:16, flexShrink:0 }}>
                    <div style={{ width:14, height:14, borderRadius:"50%", marginTop:10, flexShrink:0, background:s.done?"#111":s.current?"#E8C84A":"rgba(255,255,255,.1)", border:s.current?"2px solid #E8C84A":"none", boxShadow:s.current?"0 0 12px #E8C84A":"none" }}/>
                    {i<stops.length-1 && <div style={{ width:2, flex:1, background:"rgba(255,255,255,.06)", marginTop:2 }}/>}
                  </div>
                  <div style={{ flex:1, background:s.current?"rgba(232,200,74,.07)":"rgba(255,255,255,.03)", border:s.current?"1px solid rgba(232,200,74,.2)":"1px solid rgba(255,255,255,.05)", borderRadius:12, padding:"10px 12px", marginBottom:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:18, fontWeight:800, color:s.current?"#E8C84A":"#fff", marginBottom:3 }}>{s.name}</div>
                        <div style={{ fontSize:14, color:"#B0BAC8" }}>📍 {s.platform}</div>
                        {s.note && <div style={{ fontSize:13, color:"#F39C12", marginTop:5, lineHeight:1.5 }}>{s.note}</div>}
                        {ANSAGEN[s.name] && !s.done && <div style={{ fontSize:12, color:"#8899AA", marginTop:4, fontStyle:"italic" }}>🔊 "{ANSAGEN[s.name].substring(0,50)}..."</div>}
                      </div>
                      <div style={{ textAlign:"right", marginLeft:10 }}>
                        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:s.current?"#E8C44A":"#666", letterSpacing:2 }}>{s.dep}</div>
                        {!s.done && <button onClick={()=>openMaps(s)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.08)", borderRadius:8, padding:"3px 8px", color:"#555", fontSize:10, cursor:"pointer", fontFamily:"'Nunito',sans-serif", marginTop:4 }}>🗺️</button>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUALITÄT ─────────────────────────────────────────── */}
      {tab==="qualitaet" && (
        <div style={{ flex:1, overflowY:"auto", padding:16 }}>
          {/* Prüfung Button */}
          <button onClick={()=>setPruef(!pruef)} style={{ width:"100%", padding:16, borderRadius:14, border:"none", background:pruef?"rgba(231,76,60,.2)":"rgba(243,156,18,.1)", borderLeft:`4px solid ${pruef?"#E74C3C":"#F39C12"}`, color:pruef?"#E74C3C":"#F39C12", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
            {pruef?"🔴 PRÜFUNG LÄUFT — Checkliste":"🔍 Prüfung läuft? Checkliste öffnen"}
          </button>

          {/* Checklist */}
          {pruef && (
            <div style={{ background:"rgba(231,76,60,.06)", border:"1px solid rgba(231,76,60,.2)", borderRadius:16, padding:16, marginBottom:16, animation:"fadeIn .2s ease" }}>
              <div style={{ fontSize:13, color:"#E74C3C", fontWeight:800, textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>Prüf-Checkliste RVO</div>
              {CHECKLIST.map((item,i)=>(
                <button key={i} onClick={()=>setChk(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"12px 14px", marginBottom:8, borderRadius:12, border:"none", cursor:"pointer", background:chk.includes(i)?"rgba(46,204,113,.12)":"rgba(255,255,255,.04)", transition:"all .15s" }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", border:`2px solid ${chk.includes(i)?"#2ECC71":"rgba(255,255,255,.2)"}`, background:chk.includes(i)?"#2ECC71":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13, color:"#0B0F1A" }}>{chk.includes(i)?"✓":""}</div>
                  <span style={{ fontSize:15, color:chk.includes(i)?"#2ECC71":"#E0E8F4", textAlign:"left", lineHeight:1.5 }}>{item}</span>
                </button>
              ))}
              <div style={{ textAlign:"right", fontSize:12, color:"#666", marginTop:6 }}>{chk.length}/{CHECKLIST.length} erledigt</div>
            </div>
          )}

          {/* Pönale */}
          <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Pönale — RVO Qualitätsanforderungen</div>
          {POENALE.map((p,i)=>(
            <div key={i} style={{ background:`rgba(${p.sev==="high"?"231,76,60":p.sev==="medium"?"243,156,18":"46,204,113"},.06)`, border:`1px solid rgba(${p.sev==="high"?"231,76,60":p.sev==="medium"?"243,156,18":"46,204,113"},.2)`, borderLeft:`4px solid ${p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71"}`, borderRadius:12, padding:"12px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:16, color:"#fff", marginBottom:4 }}>{p.rule}</div>
                <div style={{ fontSize:13, color:"#C0CAD8", lineHeight:1.5 }}>{p.consequence}</div>
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71", letterSpacing:1, flexShrink:0 }}>{p.amount}€</div>
            </div>
          ))}

          {/* Ansagen */}
          <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:1, margin:"20px 0 10px" }}>Haltestellenansagen — Pflicht laut RVO</div>
          {Object.entries(ANSAGEN).map(([halt,ansage])=>(
            <div key={halt} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ fontWeight:800, fontSize:16, color:"#E8C84A", marginBottom:5 }}>{halt}</div>
              <div style={{ fontSize:15, color:"#D0D8E4", fontStyle:"italic", lineHeight:1.6 }}>"{ansage}"</div>
            </div>
          ))}

          {/* Pflichten */}
          <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:1, margin:"20px 0 10px" }}>Allgemeine Pflichten</div>
          {["5 Minuten vor Abfahrt am Fahrzeug","Gepflegte Kleidung — keine Sport-/Trainingskleidung","Rauchverbot im Bus — auch in Pausen","Begrüßung und Verabschiedung obligatorisch","Rollstühle und Kinderwagen haben Vorrang","Fundsachen sofort mit Fundzeit und -ort melden","Störungen unverzüglich an RVO-Leitstelle 089 55164 120 melden"].map((t,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
              <span style={{ color:"#E8C84A", fontSize:14, flexShrink:0, marginTop:1 }}>•</span>
              <span style={{ fontSize:15, color:"#D0D8E4", lineHeight:1.6 }}>{t}</span>
            </div>
          ))}

          {/* Leitstelle */}
          <div style={{ marginTop:20, background:"rgba(46,204,113,.08)", border:"1px solid rgba(46,204,113,.2)", borderRadius:14, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:800, fontSize:15, color:"#2ECC71" }}>RVO-Leitstelle 24/7</div>
              <div style={{ fontSize:13, color:"#888", marginTop:2 }}>089 55164 120</div>
              <div style={{ fontSize:11, color:"#555", marginTop:2 }}>Nummer nicht an Dritte weitergeben</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={waLS} style={{ background:"#25D366", border:"none", borderRadius:10, padding:"10px 14px", color:"#fff", cursor:"pointer", fontSize:18 }}>💬</button>
              <button onClick={callLS} style={{ background:"#3498DB", border:"none", borderRadius:10, padding:"10px 14px", color:"#fff", cursor:"pointer", fontSize:18 }}>📞</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── DISPONENT ────────────────────────────────────────────────────
const Disponent = ({ onLogout }) => {
  const [time,   setTime]   = useState(new Date());
  const [tab,    setTab]    = useState("overview");
  const [alerts, setAlerts] = useState(INIT_ALERTS);
  const [nA,     setNA]     = useState({ title:"", text:"", type:"warn" });
  const [sent,   setSent]   = useState(null);
  useEffect(()=>{ const x=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(x); },[]);

  const sendA = a => {
    window.open(`https://wa.me/${LEITSTELLE_WA}?text=${encodeURIComponent("🔔 SONDERMELDUNG S2:\n"+a.title+"\n"+a.text)}`, "_blank");
    setSent(a.id); setTimeout(()=>setSent(null),3000);
  };
  const addA = () => {
    if(!nA.title||!nA.text) return;
    setAlerts(p=>[{ id:Date.now(), ...nA, validFrom:"Heute", validTo:"—" },...p]);
    setNA({ title:"", text:"", type:"warn" });
  };

  const TABS = [{ id:"overview",label:"Übersicht",icon:"📋" },{ id:"alerts",label:"Meldungen",icon:"⚠️" },{ id:"quality",label:"Qualität",icon:"🎯" },{ id:"fahrer",label:"Fahrer",icon:"👨‍✈️" }];

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#f0f4f8", minHeight:"100vh", maxWidth:960, margin:"0 auto" }}>
      <style>{FONTS}</style>
      <div style={{ background:"linear-gradient(135deg,#1a2a4a,#0d1b33)", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"#E8C84A", letterSpacing:3 }}>SEV CONNECT · S2</div>
          <div style={{ fontSize:11, color:"#4a6fa5", letterSpacing:1, textTransform:"uppercase" }}>Berg am Laim ↔ Markt Schwaben · 01.05–14.06.2026 · RVO / DB</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:"#E8C84A", letterSpacing:3 }}>{time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", borderRadius:10, padding:"6px 14px", color:"#aaa", fontSize:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Abmelden</button>
        </div>
      </div>
      <div style={{ background:"#fff", borderBottom:"2px solid #e8ecf0", display:"flex" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"12px 6px", border:"none", background:"transparent", borderBottom:tab===t.id?"3px solid #1a6fb5":"3px solid transparent", color:tab===t.id?"#1a6fb5":"#888", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>{t.icon} {t.label}</button>
        ))}
      </div>
      <div style={{ padding:20 }}>

        {tab==="overview" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
              {[{l:"Fahrer",v:DRIVERS.length,c:"#6E1E6E"},{l:"Haltestellen",v:STOPS_HIN.length,c:"#3498DB"},{l:"Meldungen",v:alerts.filter(a=>a.type==="warn").length,c:"#F39C12"},{l:"Leitstelle",v:"24/7",c:"#2ECC71"}].map(k=>(
                <div key={k.l} style={{ background:"#fff", border:"1px solid #e8ecf0", borderRadius:14, padding:"14px 8px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:k.c, letterSpacing:2 }}>{k.v}</div>
                  <div style={{ fontSize:11, color:"#999", marginTop:2 }}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#1a2a4a", borderRadius:16, padding:20, marginBottom:16 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:"#E8C84A", letterSpacing:2, marginBottom:14 }}>STRECKE S2 — HINFAHRT</div>
              <div style={{ display:"flex", overflowX:"auto", paddingBottom:4 }}>
                {STOPS_HIN.map((s,i)=>(
                  <div key={s.id} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:76 }}>
                      <div style={{ width:13, height:13, borderRadius:"50%", background:s.note?"#F39C12":"rgba(255,255,255,.25)", marginBottom:5, boxShadow:s.note?"0 0 8px #F39C12":"none" }}/>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,.4)", textAlign:"center", maxWidth:70, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name.split(" ")[0]}</div>
                    </div>
                    {i<STOPS_HIN.length-1 && <div style={{ width:20, height:2, background:"rgba(255,255,255,.08)", marginBottom:14 }}/>}
                  </div>
                ))}
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.25)", marginTop:6 }}>🟠 = Sondermeldung aktiv</div>
            </div>
            <div style={{ background:"#fff", border:"1px solid #e8ecf0", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:16 }}>RVO-Leitstelle</div>
                <div style={{ fontSize:13, color:"#2ECC71" }}>● 24/7 · 089 55164 120</div>
                <div style={{ fontSize:11, color:"#bbb", marginTop:2 }}>rvo.ersatzverkehr@deutschebahn.com</div>
              </div>
              <button onClick={waLS} style={{ background:"#25D366", border:"none", borderRadius:10, padding:"10px 16px", color:"#fff", cursor:"pointer", fontSize:18 }}>💬</button>
              <button onClick={callLS} style={{ background:"#3498DB", border:"none", borderRadius:10, padding:"10px 16px", color:"#fff", cursor:"pointer", fontSize:18 }}>📞</button>
            </div>
          </div>
        )}

        {tab==="alerts" && (
          <div>
            <div style={{ background:"#fff", border:"2px solid #1a6fb5", borderRadius:16, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#1a6fb5", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>Neue Sondermeldung</div>
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                {[["warn","⚠️ Warnung"],["info","ℹ️ Info"]].map(([t,l])=>(
                  <button key={t} onClick={()=>setNA(p=>({...p,type:t}))} style={{ flex:1, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", background:nA.type===t?(t==="warn"?"rgba(243,156,18,.15)":"rgba(52,152,219,.15)"):"#f8fafc", color:nA.type===t?(t==="warn"?"#F39C12":"#3498DB"):"#999", fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13 }}>{l}</button>
                ))}
              </div>
              <input value={nA.title} onChange={e=>setNA(p=>({...p,title:e.target.value}))} placeholder="Titel..." style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"2px solid #e8ecf0", fontSize:14, fontFamily:"'Nunito',sans-serif", background:"#f8fafc", outline:"none", marginBottom:10 }}/>
              <textarea value={nA.text} onChange={e=>setNA(p=>({...p,text:e.target.value}))} placeholder="Details — Umleitung, Haltestelle, Uhrzeit..." rows={3} style={{ width:"100%", padding:"12px 14px", borderRadius:10, border:"2px solid #e8ecf0", fontSize:14, fontFamily:"'Nunito',sans-serif", background:"#f8fafc", outline:"none", resize:"vertical", marginBottom:12 }}/>
              <button onClick={addA} style={{ width:"100%", background:"#1a6fb5", border:"none", borderRadius:12, padding:"14px", color:"#fff", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>+ Speichern & senden</button>
            </div>
            {alerts.map(a=>(
              <div key={a.id} style={{ background:"#fff", border:"1px solid #e8ecf0", borderLeft:`4px solid ${a.type==="warn"?"#F39C12":"#3498DB"}`, borderRadius:14, padding:"14px 18px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ fontWeight:800, fontSize:14, color:a.type==="warn"?"#F39C12":"#3498DB" }}>{a.title}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    {sent===a.id && <span style={{ fontSize:12, color:"#2ECC71", fontWeight:700 }}>Gesendet ✓</span>}
                    <button onClick={()=>sendA(a)} style={{ background:"#25D366", border:"none", borderRadius:8, padding:"6px 10px", color:"#fff", cursor:"pointer", fontSize:14 }}>💬</button>
                  </div>
                </div>
                <div style={{ fontSize:13, color:"#777", lineHeight:1.4 }}>{a.text}</div>
                <div style={{ fontSize:11, color:"#bbb", marginTop:6 }}>{a.validFrom} – {a.validTo}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="quality" && (
          <div>
            <div style={{ fontSize:13, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:16 }}>Pönale-Übersicht · RVO Stand Mai 2025</div>
            {POENALE.map((p,i)=>(
              <div key={i} style={{ background:"#fff", border:"1px solid #e8ecf0", borderLeft:`4px solid ${p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71"}`, borderRadius:14, padding:"14px 18px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15 }}>{p.rule}</div>
                  <div style={{ fontSize:12, color:"#999", marginTop:3 }}>{p.consequence}</div>
                </div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:p.sev==="high"?"#E74C3C":p.sev==="medium"?"#F39C12":"#2ECC71", flexShrink:0 }}>{p.amount}€</div>
              </div>
            ))}
          </div>
        )}

        {tab==="fahrer" && (
          <div>
            <div style={{ fontSize:13, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:16 }}>Fahrer — Piloteinsatz S2</div>
            {DRIVERS.map(d=>(
              <div key={d.id} style={{ background:"#fff", border:"1px solid #e8ecf0", borderRadius:14, padding:"14px 18px", marginBottom:10, display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"#6E1E6E", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:"#E8C84A", flexShrink:0 }}>{d.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:16 }}>{d.name}</div>
                  <div style={{ fontSize:12, color:"#999" }}>Bus: {d.bus}</div>
                </div>
                <button onClick={waLS} style={{ background:"#25D366", border:"none", borderRadius:10, padding:"9px 14px", color:"#fff", cursor:"pointer", fontSize:18 }}>💬</button>
                <button onClick={callLS} style={{ background:"#3498DB", border:"none", borderRadius:10, padding:"9px 14px", color:"#fff", cursor:"pointer", fontSize:18 }}>📞</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── ROOT ─────────────────────────────────────────────────────────
export default function App() {
  const [view,   setView]   = useState("login");
  const [driver, setDriver] = useState(null);
  return (
    <div>
      <style>{FONTS}</style>
      {view==="login"    && <Login onD={d=>{ setDriver(d); setView("driver"); }} onDis={()=>setView("dispatch")} />}
      {view==="driver"   && <Fahrer driver={driver} onLogout={()=>setView("login")} />}
      {view==="dispatch" && <Disponent onLogout={()=>setView("login")} />}
    </div>
  );
}
