import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  SEV CONNECT v3.0
//  Eine App — drei Ansichten
//  Fahrer | Disponent | Live-Karte
//  PWA-ready, offline-fähig, mehrsprachig
// ═══════════════════════════════════════════════════════════════

// ── Google Fonts ────────────────────────────────────────────────
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap');
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes blink   { 0%,100%{background:rgba(46,204,113,.18)} 50%{background:rgba(46,204,113,.04)} }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin:0; padding:0; }
  ::-webkit-scrollbar { width:4px; } 
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:2px; }
`;

// ── TRANSLATIONS ────────────────────────────────────────────────
const T = {
  de: {
    next_stop:"NÄCHSTER HALT", platform:"Bussteig", departs:"Abfahrt",
    wait:"Aufenthalt", min:"Min", all_stops:"Alle Halte", navigate:"Navigation",
    call_dispatch:"Leitstelle anrufen", whatsapp:"WhatsApp", done:"Erledigt",
    confirm_stop:"Halt bestätigt ✓", open_doors:"Türen öffnen", close_doors:"Türen schließen",
    destination_reached:"ZIEL ERREICHT", good_trip:"Gute Fahrt!", login_driver:"Ich bin Fahrer",
    login_dispatch:"Ich bin Disponent", select_driver:"Fahrer wählen", pin:"PIN eingeben",
    pin_hint:"Disponent-PIN: 1234", enter:"Anmelden", tour_id:"Tour", line:"Linie",
    bus:"Bus", date:"Datum", dispatch_title:"Disponent", live_map:"Live-Karte",
    week_plan:"Wochenplan", tour_create:"Tour erstellen", driver:"Fahrer",
    route:"Strecke", departure:"Abfahrt", status:"Status", actions:"Aktionen",
    send_tour:"Tour senden", all_ok:"Alle pünktlich", delayed:"Verspätet",
    boarding:"Einsteigen", passengers:"Fahrgäste", speed:"km/h",
    emergency:"NOTFALL", logout:"Abmelden", stops:"Halte",
    tour_loaded:"Schicht geladen", offline_ready:"Offline bereit",
    stops_remaining:"verbleibende Halte", language:"Sprache",
  },
  tr: {
    next_stop:"SONRAKİ DURAK", platform:"Peron", departs:"Kalkış",
    wait:"Bekleme", min:"Dak", all_stops:"Tüm Duraklar", navigate:"Navigasyon",
    call_dispatch:"Merkezi Ara", whatsapp:"WhatsApp", done:"Tamam",
    confirm_stop:"Durak Onaylandı ✓", open_doors:"Kapıları Aç", close_doors:"Kapıları Kapat",
    destination_reached:"HEDEFE ULAŞILDI", good_trip:"İyi Yolculuklar!",
    login_driver:"Sürücüyüm", login_dispatch:"Dispatcherim",
    select_driver:"Sürücü Seç", pin:"PIN Gir", pin_hint:"Dispatcher PIN: 1234",
    enter:"Giriş", tour_id:"Tur", line:"Hat", bus:"Otobüs", date:"Tarih",
    dispatch_title:"Dispatcher", live_map:"Canlı Harita", week_plan:"Haftalık Plan",
    tour_create:"Tur Oluştur", driver:"Sürücü", route:"Güzergah", departure:"Kalkış",
    status:"Durum", actions:"İşlemler", send_tour:"Tur Gönder",
    all_ok:"Hepsi zamanında", delayed:"Gecikmiş", boarding:"Biniş",
    passengers:"Yolcu", speed:"km/s", emergency:"ACİL", logout:"Çıkış",
    stops:"Durak", tour_loaded:"Vardiya yüklendi", offline_ready:"Çevrimdışı hazır",
    stops_remaining:"kalan durak", language:"Dil",
  },
  pl: {
    next_stop:"NASTĘPNY PRZYSTANEK", platform:"Peron", departs:"Odjazd",
    wait:"Postój", min:"Min", all_stops:"Wszystkie przystanki", navigate:"Nawigacja",
    call_dispatch:"Zadzwoń do dyspozytorni", whatsapp:"WhatsApp", done:"Gotowe",
    confirm_stop:"Przystanek potwierdzony ✓", open_doors:"Otwórz drzwi", close_doors:"Zamknij drzwi",
    destination_reached:"CEL OSIĄGNIĘTY", good_trip:"Dobrej jazdy!",
    login_driver:"Jestem kierowcą", login_dispatch:"Jestem dyspozytorem",
    select_driver:"Wybierz kierowcę", pin:"Wpisz PIN", pin_hint:"PIN dyspozytora: 1234",
    enter:"Zaloguj", tour_id:"Kurs", line:"Linia", bus:"Autobus", date:"Data",
    dispatch_title:"Dyspozytor", live_map:"Mapa na żywo", week_plan:"Plan tygodniowy",
    tour_create:"Utwórz kurs", driver:"Kierowca", route:"Trasa", departure:"Odjazd",
    status:"Status", actions:"Akcje", send_tour:"Wyślij kurs",
    all_ok:"Wszystko punktualnie", delayed:"Opóźniony", boarding:"Wsiadanie",
    passengers:"Pasażerowie", speed:"km/h", emergency:"NAGŁY WYPADEK", logout:"Wyloguj",
    stops:"Przystanki", tour_loaded:"Zmiana załadowana", offline_ready:"Tryb offline gotowy",
    stops_remaining:"pozostałe przystanki", language:"Język",
  },
  ro: {
    next_stop:"URMĂTOAREA STAȚIE", platform:"Peron", departs:"Plecare",
    wait:"Oprire", min:"Min", all_stops:"Toate stațiile", navigate:"Navigație",
    call_dispatch:"Sună dispeceratul", whatsapp:"WhatsApp", done:"Gata",
    confirm_stop:"Stație confirmată ✓", open_doors:"Deschide ușile", close_doors:"Închide ușile",
    destination_reached:"DESTINAȚIE ATINSĂ", good_trip:"Drum bun!",
    login_driver:"Sunt șofer", login_dispatch:"Sunt dispecer",
    select_driver:"Alege șoferul", pin:"Introduceți PIN", pin_hint:"PIN dispecer: 1234",
    enter:"Autentificare", tour_id:"Cursă", line:"Linie", bus:"Autobuz", date:"Data",
    dispatch_title:"Dispecer", live_map:"Hartă live", week_plan:"Plan săptămânal",
    tour_create:"Creează cursă", driver:"Șofer", route:"Rută", departure:"Plecare",
    status:"Status", actions:"Acțiuni", send_tour:"Trimite cursa",
    all_ok:"Toate punctuale", delayed:"Întârziat", boarding:"Îmbarcare",
    passengers:"Pasageri", speed:"km/h", emergency:"URGENȚĂ", logout:"Deconectare",
    stops:"Stații", tour_loaded:"Tură încărcată", offline_ready:"Offline gata",
    stops_remaining:"stații rămase", language:"Limbă",
  },
};

// ── MOCK DATA ───────────────────────────────────────────────────
const DRIVERS = [
  { id:1, name:"Markus Huber",   avatar:"MH", lang:"de" },
  { id:2, name:"Klaus Müller",   avatar:"KM", lang:"de" },
  { id:3, name:"Stefan Weber",   avatar:"SW", lang:"de" },
  { id:4, name:"Ahmet Yilmaz",   avatar:"AY", lang:"tr" },
  { id:5, name:"Tomasz Kowalski",avatar:"TK", lang:"pl" },
];

const TOURS_WEEK = [
  { id:"R001", driver:"Markus Huber",    bus:"SEV-101", route:"Rosenheim → Salzburg", dep:"05:42", status:"confirmed", passengers:34, cap:71,  speed:68, lat:47.89, lng:12.22, delay:0 },
  { id:"R002", driver:"Klaus Müller",    bus:"SEV-102", route:"Rosenheim → Salzburg", dep:"06:45", status:"delayed",   passengers:58, cap:71,  speed:61, lat:47.87, lng:12.35, delay:4 },
  { id:"R003", driver:"Stefan Weber",    bus:"SEV-103", route:"Rosenheim → Salzburg", dep:"07:42", status:"confirmed", passengers:22, cap:110, speed:74, lat:47.86, lng:12.55, delay:0 },
  { id:"R004", driver:"Ahmet Yilmaz",    bus:"SEV-104", route:"Salzburg → Rosenheim", dep:"08:00", status:"boarding",  passengers:41, cap:71,  speed:0,  lat:47.81, lng:13.04, delay:2 },
  { id:"R005", driver:"Tomasz Kowalski", bus:"SEV-105", route:"Rosenheim → Traunstein",dep:"09:15", status:"confirmed", passengers:19, cap:71,  speed:79, lat:47.88, lng:12.68, delay:0 },
];

const STOPS_FULL = [
  { id:1, name:"Rosenheim Hbf",       platform:"3", dep:"07:42", wait:0,  lat:47.855, lng:12.128, done:true  },
  { id:2, name:"Rosenheim Süd",       platform:"A", dep:"07:46", wait:3,  lat:47.841, lng:12.121, done:true  },
  { id:3, name:"Bad Endorf",          platform:"1", dep:"08:22", wait:5,  lat:47.903, lng:12.299, done:false, current:true },
  { id:4, name:"Prien am Chiemsee",   platform:"2", dep:"08:37", wait:4,  lat:47.856, lng:12.341, done:false },
  { id:5, name:"Bernau am Chiemsee",  platform:"B", dep:"08:47", wait:3,  lat:47.812, lng:12.388, done:false },
  { id:6, name:"Übersee",             platform:"1", dep:"08:55", wait:2,  lat:47.823, lng:12.465, done:false },
  { id:7, name:"Traunstein",          platform:"4", dep:"09:33", wait:6,  lat:47.869, lng:12.641, done:false },
  { id:8, name:"Freilassing",         platform:"2", dep:"10:02", wait:5,  lat:47.839, lng:12.977, done:false },
  { id:9, name:"Salzburg Hbf",        platform:"7", dep:"10:15", wait:0,  lat:47.813, lng:13.045, done:false },
];

const DISPATCH_PIN = "1234";
const DISPATCH_WHATSAPP = "4915112345678";
const DISPATCH_PHONE = "+49151 12345678";

// ── TINY HELPERS ─────────────────────────────────────────────────
const openMaps   = (s)  => window.open(`https://www.google.com/maps/search/${encodeURIComponent(s.name+" Bussteig "+s.platform+", Deutschland")}`, "_blank");
const openWA     = ()   => window.open(`https://wa.me/${DISPATCH_WHATSAPP}`, "_blank");
const callPhone  = ()   => window.open(`tel:${DISPATCH_PHONE}`, "_blank");


// ── SHARED COMPONENTS ────────────────────────────────────────────
const Btn = ({ children, onClick, style={}, variant="primary" }) => {
  const base = {
    border:"none", borderRadius:16, fontFamily:"'Nunito',sans-serif",
    fontWeight:800, cursor:"pointer", transition:"all .15s ease",
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
  };
  const variants = {
    primary: { background:"#E8C84A", color:"#0B0F1A", fontSize:18, padding:"18px 24px" },
    secondary: { background:"rgba(255,255,255,.08)", color:"#fff", fontSize:16, padding:"16px 20px", border:"1px solid rgba(255,255,255,.15)" },
    danger:  { background:"#E74C3C", color:"#fff", fontSize:16, padding:"16px 20px" },
    green:   { background:"#2ECC71", color:"#0B0F1A", fontSize:18, padding:"18px 24px" },
    ghost:   { background:"transparent", color:"#aaa", fontSize:14, padding:"10px 16px", border:"1px solid rgba(255,255,255,.1)" },
    dispatch:{ background:"#1a6fb5", color:"#fff", fontSize:15, padding:"14px 20px", borderRadius:12 },
  };
  return <button onClick={onClick} style={{...base, ...variants[variant], ...style}}>{children}</button>;
};

const Card = ({ children, style={} }) => (
  <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)", borderRadius:20, padding:20, ...style }}>
    {children}
  </div>
);

const StatusDot = ({ status }) => {
  const cfg = { confirmed:{c:"#2ECC71",l:"●"}, delayed:{c:"#F39C12",l:"●"}, boarding:{c:"#3498DB",l:"●"} };
  const s = cfg[status]||cfg.confirmed;
  return <span style={{ color:s.c, fontSize:14, animation:status==="delayed"?"pulse 1.5s infinite":"none" }}>{s.l}</span>;
};

// ══════════════════════════════════════════════════════════════
//  LOGIN SCREEN
// ══════════════════════════════════════════════════════════════
const LoginScreen = ({ onDriver, onDispatch }) => {
  const [mode, setMode]     = useState(null); // "driver" | "dispatch"
  const [driver, setDriver] = useState("");
  const [pin, setPin]       = useState("");
  const [err, setErr]       = useState("");
  const [lang, setLang]     = useState("de");
  const t = T[lang];

  const langs = [["de","🇩🇪"],["tr","🇹🇷"],["pl","🇵🇱"],["ro","🇷🇴"]];

  const handleDriver = () => {
    if (!driver) { setErr("Bitte Fahrer wählen"); return; }
    const d = DRIVERS.find(x=>x.name===driver);
    onDriver(d, d.lang);
  };

  const handleDispatch = () => {
    if (pin === DISPATCH_PIN) { setErr(""); onDispatch(); }
    else setErr("Falscher PIN");
  };

  return (
    <div style={{
      fontFamily:"'Nunito',sans-serif", background:"#0B0F1A",
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:24,
      position:"relative", overflow:"hidden",
    }}>
      {/* Background texture */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 20% 80%, rgba(110,30,110,.25) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(52,152,219,.15) 0%, transparent 50%)", pointerEvents:"none" }}/>

      {/* Logo + Lang switcher */}
      <div style={{ textAlign:"center", marginBottom:40, animation:"fadeUp .5s ease" }}>

        {/* Lang switcher — frei stehend über dem App-Namen */}
        <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:20 }}>
          {langs.map(([l,f])=>(
            <button key={l} onClick={()=>setLang(l)} style={{
              background:lang===l?"rgba(232,200,74,.2)":"transparent",
              border:lang===l?"1px solid #E8C84A":"1px solid rgba(255,255,255,.12)",
              borderRadius:10, padding:"8px 14px", cursor:"pointer", fontSize:20,
              transition:"all .15s ease",
            }}>{f}</button>
          ))}
        </div>

        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:"#E8C84A", letterSpacing:4, lineHeight:1 }}>SEV CONNECT</div>
        <div style={{ fontSize:13, color:"#666", letterSpacing:2, marginTop:6, textTransform:"uppercase" }}>Generalsanierung Bayern 2027</div>
      </div>

      {!mode ? (
        /* Role selection */
        <div style={{ width:"100%", maxWidth:380, display:"flex", flexDirection:"column", gap:16, animation:"fadeUp .5s ease .1s both" }}>
          <Btn onClick={()=>setMode("driver")} variant="primary" style={{ fontSize:22, padding:"24px", borderRadius:20, width:"100%" }}>
            👨‍✈️ {t.login_driver}
          </Btn>
          <Btn onClick={()=>setMode("dispatch")} variant="secondary" style={{ fontSize:18, padding:"20px", borderRadius:20, width:"100%" }}>
            🖥️ {t.login_dispatch}
          </Btn>
        </div>
      ) : mode==="driver" ? (
        /* Driver login */
        <div style={{ width:"100%", maxWidth:380, animation:"fadeUp .3s ease" }}>
          <div style={{ fontSize:13, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>{t.select_driver}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {DRIVERS.map(d=>(
              <button key={d.id} onClick={()=>setDriver(d.name)} style={{
                background:driver===d.name?"rgba(232,200,74,.15)":"rgba(255,255,255,.04)",
                border:driver===d.name?"2px solid #E8C84A":"2px solid transparent",
                borderRadius:16, padding:"16px 20px", cursor:"pointer",
                display:"flex", alignItems:"center", gap:16,
                transition:"all .15s ease",
              }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"#6E1E6E", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:"#E8C84A", flexShrink:0 }}>{d.avatar}</div>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, fontWeight:700, color:"#fff" }}>{d.name}</span>
                {driver===d.name && <span style={{ marginLeft:"auto", color:"#E8C84A", fontSize:20 }}>✓</span>}
              </button>
            ))}
          </div>
          {err && <div style={{ color:"#E74C3C", fontSize:14, marginBottom:12, textAlign:"center" }}>{err}</div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setMode(null)} variant="ghost" style={{ flex:1 }}>← Zurück</Btn>
            <Btn onClick={handleDriver} variant="green" style={{ flex:2 }}>{t.enter} →</Btn>
          </div>
        </div>
      ) : (
        /* Dispatch login */
        <div style={{ width:"100%", maxWidth:380, animation:"fadeUp .3s ease" }}>
          <div style={{ fontSize:13, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:12 }}>{t.pin}</div>
          <input
            type="password" maxLength={4} value={pin}
            onChange={e=>{ setPin(e.target.value); setErr(""); }}
            onKeyDown={e=>e.key==="Enter"&&handleDispatch()}
            placeholder="● ● ● ●"
            style={{
              width:"100%", background:"rgba(255,255,255,.07)", border:"2px solid rgba(255,255,255,.15)",
              borderRadius:16, padding:"20px", fontSize:32, textAlign:"center",
              color:"#E8C84A", fontFamily:"monospace", letterSpacing:16, outline:"none",
              marginBottom:8,
            }}
          />
          <div style={{ fontSize:12, color:"#555", textAlign:"center", marginBottom:20 }}>{t.pin_hint}</div>
          {err && <div style={{ color:"#E74C3C", fontSize:14, marginBottom:12, textAlign:"center" }}>{err}</div>}
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={()=>setMode(null)} variant="ghost" style={{ flex:1 }}>← Zurück</Btn>
            <Btn onClick={handleDispatch} variant="dispatch" style={{ flex:2 }}>{t.enter} →</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  DRIVER APP
// ══════════════════════════════════════════════════════════════
const DriverApp = ({ driver, onLogout }) => {
  const lang   = driver.lang || "de";
  const t      = T[lang] || T.de;
  const [stops, setStops]     = useState(STOPS_FULL);
  const [showAll, setShowAll] = useState(false);

  const [time, setTime]       = useState(new Date());
  const [confirmed, setConfirmed] = useState(false);

  useEffect(()=>{ const x=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(x); },[]);

  const curIdx  = stops.findIndex(s=>s.current);
  const cur     = stops[curIdx];
  const isLast  = curIdx === stops.length - 1;
  const remaining = stops.length - curIdx - 1;
  const progress  = Math.round((curIdx / (stops.length-1)) * 100);

  const [navPrompt, setNavPrompt] = useState(false);

  const confirmStop = () => {
    setConfirmed(true);
    setTimeout(()=>{
      setConfirmed(false);
      if (curIdx < stops.length-1) {
        setStops(prev => prev.map((s,i) =>
          i===curIdx ? {...s, done:true, current:false} :
          i===curIdx+1 ? {...s, current:true} : s
        ));
        setTimeout(()=> setNavPrompt(true), 400);
      }
    }, 800);
  };

  if (isLast && cur?.done) {
    return (
      <div style={{ fontFamily:"'Nunito',sans-serif", background:"#0B0F1A", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>

        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:"#2ECC71", letterSpacing:3 }}>{t.destination_reached}</div>
        <div style={{ fontSize:22, color:"#aaa", marginTop:12 }}>{t.good_trip}</div>
        <Btn onClick={onLogout} variant="ghost" style={{ marginTop:40 }}>← {t.logout}</Btn>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#0B0F1A", minHeight:"100vh", color:"#fff", maxWidth:430, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <style>{FONTS}</style>

      {/* STATUS BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px 10px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#2ECC71", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:13, color:"#888" }}>R003 · SEV-103</span>
        </div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:"#E8C84A", letterSpacing:3 }}>
          {time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}
        </div>
        <button onClick={onLogout} style={{ background:"transparent", border:"none", color:"#555", fontSize:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>{t.logout}</button>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ height:4, background:"rgba(255,255,255,.06)" }}>
        <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#6E1E6E,#E8C84A)", transition:"width .6s ease" }}/>
      </div>

      {/* NAVIGATION PROMPT OVERLAY */}
      {navPrompt && (() => {
        const nextStop = stops.find(s=>s.current);
        return (
          <div style={{
            position:"fixed", inset:0, background:"rgba(0,0,0,.85)",
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:32, zIndex:100,
            animation:"fadeIn .25s ease",
          }}>
            <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:3, marginBottom:16 }}>
              {t.next_stop}
            </div>
            <div style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize: nextStop?.name.length > 16 ? 44 : 54,
              color:"#fff", textAlign:"center", lineHeight:1.05, marginBottom:8,
            }}>
              {nextStop?.name}
            </div>
            <div style={{ fontSize:18, color:"#E8C84A", fontWeight:700, marginBottom:40 }}>
              {t.platform} {nextStop?.platform} · {nextStop?.dep}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14, width:"100%", maxWidth:340 }}>
              <Btn
                onClick={()=>{ setNavPrompt(false); openMaps(nextStop); }}
                variant="primary"
                style={{ width:"100%", fontSize:20, padding:"22px", borderRadius:18 }}>
                🗺️ {t.navigate}
              </Btn>
              <Btn
                onClick={()=> setNavPrompt(false)}
                variant="ghost"
                style={{ width:"100%", fontSize:18, padding:"18px", borderRadius:18 }}>
                {t.done} — Ich kenne den Weg
              </Btn>
            </div>
          </div>
        );
      })()}

      {/* MAIN — NEXT STOP */}
      {!showAll ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"28px 24px 20px", animation:"fadeUp .35s ease" }}>

          {/* Label */}
          <div style={{ fontSize:13, color:"#666", textTransform:"uppercase", letterSpacing:3, marginBottom:16 }}>
            {t.next_stop}
          </div>

          {/* STOP NAME — THE BIG ONE */}
          <div style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize: cur?.name.length > 16 ? 44 : 56,
            lineHeight: 1.05,
            color: "#fff",
            marginBottom: 8,
            animation:"fadeUp .3s ease",
          }}>
            {cur?.name}
          </div>

          {/* Platform */}
          <div style={{ fontSize:18, color:"#E8C84A", fontWeight:700, marginBottom:28 }}>
            {t.platform} {cur?.platform}
          </div>

          {/* Time block */}
          <div style={{ display:"flex", gap:16, marginBottom:32 }}>
            <div style={{ flex:1, background:"rgba(232,200,74,.08)", border:"1px solid rgba(232,200,74,.2)", borderRadius:20, padding:"20px 16px", textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{t.departs}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:"#E8C84A", letterSpacing:3, lineHeight:1 }}>{cur?.dep}</div>
            </div>
            <div style={{ flex:1, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)", borderRadius:20, padding:"20px 16px", textAlign:"center" }}>
              <div style={{ fontSize:13, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{t.wait}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, color:"#aaa", letterSpacing:2, lineHeight:1 }}>
                {cur?.wait || "—"}
                {cur?.wait > 0 && <span style={{ fontSize:22, color:"#666" }}> {t.min}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>

            {/* Confirm */}
            <Btn
              onClick={confirmStop}
              variant={confirmed?"green":"primary"}
              style={{ width:"100%", fontSize:22, padding:"22px", borderRadius:18, opacity:confirmed?0.7:1 }}>
              {confirmed ? t.confirm_stop : `✓ ${t.done}`}
            </Btn>
          </div>

          {/* Secondary actions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <Btn onClick={()=>openMaps(cur)} variant="ghost" style={{ flexDirection:"column", gap:4, padding:"14px 8px", borderRadius:14, fontSize:12 }}>
              <span style={{ fontSize:22 }}>🗺️</span>{t.navigate}
            </Btn>
            <Btn onClick={openWA} variant="ghost" style={{ flexDirection:"column", gap:4, padding:"14px 8px", borderRadius:14, fontSize:12 }}>
              <span style={{ fontSize:22 }}>💬</span>{t.whatsapp}
            </Btn>
            <Btn onClick={callPhone} variant="ghost" style={{ flexDirection:"column", gap:4, padding:"14px 8px", borderRadius:14, fontSize:12 }}>
              <span style={{ fontSize:22 }}>📞</span>{t.call_dispatch}
            </Btn>
          </div>

          {/* All stops toggle */}
          <button onClick={()=>setShowAll(true)} style={{
            marginTop:20, background:"transparent", border:"1px solid rgba(255,255,255,.1)",
            borderRadius:14, padding:"12px", color:"#666", fontSize:14,
            fontFamily:"'Nunito',sans-serif", cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center", gap:8,
          }}>
            📋 {t.all_stops} · {remaining} {t.stops_remaining}
          </button>

          {/* Remaining stops mini-strip */}
          <div style={{ display:"flex", gap:0, marginTop:16, overflowX:"auto", paddingBottom:4 }}>
            {stops.map((s,i)=>(
              <div key={s.id} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:52 }}>
                  <div style={{
                    width:10, height:10, borderRadius:"50%", marginBottom:4, flexShrink:0,
                    background: s.done?"#333":s.current?"#E8C84A":"rgba(255,255,255,.15)",
                    boxShadow: s.current?"0 0 12px #E8C84A":"none",
                  }}/>
                  <div style={{ fontSize:9, color:s.current?"#E8C84A":s.done?"#444":"#666", textAlign:"center", maxWidth:48, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:s.current?800:400 }}>
                    {s.name.split(" ")[0]}
                  </div>
                </div>
                {i<stops.length-1 && <div style={{ width:12, height:2, background:s.done?"#222":"rgba(255,255,255,.06)", marginBottom:14 }}/>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ALL STOPS VIEW */
        <div style={{ flex:1, padding:"20px 20px", overflowY:"auto", animation:"fadeIn .2s ease" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:"#E8C84A" }}>{t.all_stops}</div>
            <button onClick={()=>setShowAll(false)} style={{ background:"rgba(255,255,255,.08)", border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:14, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>← Zurück</button>
          </div>
          {stops.map((s,i)=>(
            <div key={s.id} style={{ display:"flex", gap:14, marginBottom:4, opacity:s.done?0.35:1 }}>
              {/* Timeline */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:16, flexShrink:0 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", marginTop:12, flexShrink:0,
                  background:s.done?"#2d2d2d":s.current?"#E8C84A":"rgba(255,255,255,.15)",
                  border:s.current?"2px solid #E8C84A":"none",
                  boxShadow:s.current?"0 0 14px #E8C84A":"none",
                }}/>
                {i<stops.length-1 && <div style={{ width:2, flex:1, background:s.done?"rgba(255,255,255,.05)":"rgba(255,255,255,.08)", marginTop:2 }}/>}
              </div>
              {/* Stop card */}
              <div style={{
                flex:1, background:s.current?"rgba(232,200,74,.07)":"rgba(255,255,255,.03)",
                border:s.current?"1px solid rgba(232,200,74,.25)":"1px solid rgba(255,255,255,.06)",
                borderRadius:14, padding:"12px 14px", marginBottom:6,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontSize:17, fontWeight:800, color:s.current?"#E8C84A":"#fff", marginBottom:4 }}>{s.name}</div>
                    <div style={{ fontSize:13, color:"#666" }}>{t.platform} {s.platform} · {s.wait > 0 ? `${s.wait} ${t.min} ${t.wait}` : "Endpunkt"}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:s.current?"#E8C84A":"#aaa", letterSpacing:2 }}>{s.dep}</div>
                    {!s.done && <button onClick={()=>openMaps(s)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, padding:"4px 10px", color:"#888", fontSize:11, cursor:"pointer", fontFamily:"'Nunito',sans-serif", marginTop:4 }}>🗺️</button>}
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}


    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  DISPATCHER DASHBOARD
// ══════════════════════════════════════════════════════════════
const DispatchApp = ({ onLogout }) => {
  const [tab, setTab]         = useState("overview"); // overview | map | create
  const [tours, setTours]     = useState(TOURS_WEEK);
  const [time, setTime]       = useState(new Date());
  const [newTour, setNewTour] = useState({ driver:"", bus:"", route:"", dep:"", date:"" });
  const [sent, setSent]       = useState(false);

  useEffect(()=>{ const x=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(x); },[]);

  const onTime  = tours.filter(t=>t.status==="confirmed").length;
  const delayed = tours.filter(t=>t.status==="delayed").length;
  const boarding= tours.filter(t=>t.status==="boarding").length;

  const createTour = () => {
    if (!newTour.driver || !newTour.bus || !newTour.route || !newTour.dep) return;
    const t = { id:`R00${tours.length+1}`, ...newTour, status:"confirmed", passengers:0, cap:71, speed:0, lat:47.855, lng:12.128, delay:0 };
    setTours(prev=>[...prev, t]);
    setSent(true);
    setTimeout(()=>{ setSent(false); setNewTour({driver:"",bus:"",route:"",dep:"",date:""}); setTab("overview"); }, 1500);
  };

  const tabs = [
    { id:"overview", label:"Übersicht", icon:"📋" },
    { id:"map",      label:"Live-Karte", icon:"🗺️" },
    { id:"create",   label:"Tour +",    icon:"➕" },
  ];

  return (
    <div style={{ fontFamily:"'Nunito',sans-serif", background:"#f0f4f8", minHeight:"100vh", maxWidth:900, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <style>{FONTS}</style>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#1a2a4a,#0d1b33)", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"#E8C84A", letterSpacing:3 }}>SEV CONNECT</div>
          <div style={{ fontSize:12, color:"#4a6fa5", letterSpacing:1, textTransform:"uppercase" }}>Disponent · RE 5 · Rosenheim–Salzburg</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:"#E8C84A", letterSpacing:3 }}>
            {time.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}
          </div>
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", borderRadius:10, padding:"8px 16px", color:"#aaa", fontSize:13, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Abmelden</button>
        </div>
      </div>

      {/* KPI BAR */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e8ecf0", padding:"14px 24px", display:"flex", gap:0 }}>
        {[
          { label:"Pünktlich", value:onTime,   color:"#2ECC71", bg:"#f0faf4" },
          { label:"Verspätet", value:delayed,  color:"#F39C12", bg:"#fffbf0" },
          { label:"Einsteigen",value:boarding, color:"#3498DB", bg:"#f0f7ff" },
          { label:"Busse gesamt",value:tours.length,color:"#6E1E6E",bg:"#faf0fa" },
        ].map((k,i)=>(
          <div key={k.label} style={{ flex:1, textAlign:"center", padding:"8px 0", borderRight:i<3?"1px solid #f0f0f0":"none" }}>
            <div style={{ fontSize:32, fontWeight:900, color:k.color, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2 }}>{k.value}</div>
            <div style={{ fontSize:12, color:"#999", marginTop:2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ background:"#fff", borderBottom:"2px solid #e8ecf0", display:"flex" }}>
        {tabs.map(tab_=>(<button key={tab_.id} onClick={()=>setTab(tab_.id)} style={{
          flex:1, padding:"14px 8px", border:"none", background:"transparent",
          borderBottom:tab===tab_.id?"3px solid #1a6fb5":"3px solid transparent",
          color:tab===tab_.id?"#1a6fb5":"#888", fontFamily:"'Nunito',sans-serif",
          fontWeight:700, fontSize:14, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center", gap:6,
        }}>{tab_.icon} {tab_.label}</button>))}
      </div>

      {/* CONTENT */}
      <div style={{ flex:1, padding:24, overflowY:"auto" }}>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div style={{ animation:"fadeIn .2s ease" }}>
            <div style={{ fontSize:13, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>Aktive Touren — {new Date().toLocaleDateString("de-DE")}</div>
            {tours.map(tour=>(
              <div key={tour.id} style={{
                background:"#fff", border:"1px solid #e8ecf0", borderLeft:`4px solid ${tour.status==="delayed"?"#F39C12":tour.status==="boarding"?"#3498DB":"#2ECC71"}`,
                borderRadius:16, padding:"16px 20px", marginBottom:12,
                display:"flex", alignItems:"center", gap:16,
                boxShadow:"0 2px 8px rgba(0,0,0,.04)",
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                    <StatusDot status={tour.status}/>
                    <span style={{ fontWeight:800, fontSize:16 }}>{tour.bus}</span>
                    <span style={{ fontSize:13, color:"#999" }}>·</span>
                    <span style={{ fontSize:14, color:"#555" }}>{tour.driver}</span>
                    {tour.delay>0 && <span style={{ background:"#FFF3CD", color:"#F39C12", borderRadius:8, padding:"2px 8px", fontSize:12, fontWeight:700 }}>+{tour.delay} Min</span>}
                  </div>
                  <div style={{ fontSize:13, color:"#777" }}>
                    🛣️ {tour.route} · ⏱ {tour.dep} · 👤 {tour.passengers}/{tour.cap}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>window.open(`https://wa.me/${DISPATCH_WHATSAPP}?text=${encodeURIComponent("Hallo "+tour.driver+", bitte melden!")}`, "_blank")}
                    style={{ background:"#25D366", border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", cursor:"pointer", fontSize:18 }}>💬</button>
                  <button onClick={()=>window.open(`tel:${DISPATCH_PHONE}`, "_blank")}
                    style={{ background:"#3498DB", border:"none", borderRadius:10, padding:"8px 14px", color:"#fff", cursor:"pointer", fontSize:18 }}>📞</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIVE MAP */}
        {tab==="map" && (
          <div style={{ animation:"fadeIn .2s ease" }}>
            <div style={{ fontSize:13, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>Live-Positionen aller Busse</div>

            {/* Map placeholder — opens real Google Maps */}
            <div style={{ background:"#1a2a4a", borderRadius:20, overflow:"hidden", marginBottom:16, position:"relative" }}>
              <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,.1)" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:"#E8C84A", letterSpacing:2 }}>STRECKE ROSENHEIM → SALZBURG</div>
                <div style={{ fontSize:12, color:"#4a6fa5", marginTop:4 }}>Alle {tours.length} Busse · Aktualisierung alle 60 Sek</div>
              </div>
              {/* Schematic route map */}
              <div style={{ padding:"24px", overflowX:"auto" }}>
                <div style={{ display:"flex", alignItems:"center", gap:0, minWidth:600 }}>
                  {STOPS_FULL.map((stop,i)=>{
                    const busHere = tours.filter(t=>Math.abs(t.lat-stop.lat)<0.05&&Math.abs(t.lng-stop.lng)<0.05);
                    return (
                      <div key={stop.id} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:70 }}>
                          <div style={{ position:"relative" }}>
                            <div style={{ width:14, height:14, borderRadius:"50%", background:busHere.length?"#E8C84A":"rgba(255,255,255,.25)", boxShadow:busHere.length?"0 0 16px #E8C84A":"none", animation:busHere.length?"pulse 1.5s infinite":"none" }}/>
                            {busHere.map((b,bi)=>(
                              <div key={b.id} style={{ position:"absolute", top:-28, left:"50%", transform:"translateX(-50%)", background:"#E74C3C", color:"#fff", borderRadius:6, padding:"2px 6px", fontSize:9, fontWeight:700, whiteSpace:"nowrap" }}>{b.bus}</div>
                            ))}
                          </div>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,.5)", textAlign:"center", marginTop:6, maxWidth:64, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{stop.name.split(" ")[0]}</div>
                        </div>
                        {i<STOPS_FULL.length-1 && <div style={{ width:30, height:2, background:"rgba(255,255,255,.1)", marginBottom:18 }}/>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Open real Google Maps */}
            <button onClick={()=>window.open("https://www.google.com/maps/dir/Rosenheim+Bahnhof/Salzburg+Hauptbahnhof","_blank")}
              style={{ width:"100%", background:"#1a6fb5", border:"none", borderRadius:14, padding:"16px", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              🗺️ In Google Maps öffnen
            </button>

            {/* Bus list with positions */}
            <div style={{ marginTop:16 }}>
              {tours.map(t=>(
                <div key={t.id} style={{ background:"#fff", border:"1px solid #e8ecf0", borderRadius:14, padding:"14px 18px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:t.status==="delayed"?"#F39C12":"#2ECC71", animation:"pulse 2s infinite", flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:15 }}>{t.bus} · {t.driver}</div>
                    <div style={{ fontSize:12, color:"#999" }}>→ {t.route} · {t.speed} km/h</div>
                  </div>
                  <button onClick={()=>window.open(`https://www.google.com/maps/search/${t.lat},${t.lng}`, "_blank")}
                    style={{ background:"#f0f7ff", border:"1px solid #c8e0f0", borderRadius:10, padding:"8px 14px", color:"#1a6fb5", fontSize:13, cursor:"pointer", fontWeight:700, fontFamily:"'Nunito',sans-serif" }}>
                    📍 Zeigen
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE TOUR */}
        {tab==="create" && (
          <div style={{ animation:"fadeIn .2s ease", maxWidth:500 }}>
            <div style={{ fontSize:13, color:"#999", textTransform:"uppercase", letterSpacing:1, marginBottom:20 }}>Neue Tour erstellen</div>

            {sent ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:"#2ECC71", letterSpacing:2 }}>TOUR ERSTELLT</div>
                <div style={{ fontSize:16, color:"#999", marginTop:8 }}>Fahrer wurde benachrichtigt</div>
              </div>
            ) : (
              <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #e8ecf0", boxShadow:"0 4px 16px rgba(0,0,0,.04)" }}>
                {[
                  { label:"👨‍✈️ Fahrer", key:"driver", type:"select", options:DRIVERS.map(d=>d.name) },
                  { label:"🚌 Bus", key:"bus", type:"select", options:BUS_LIST },
                  { label:"🛣️ Strecke", key:"route", type:"select", options:ROUTE_LIST },
                  { label:"⏱ Abfahrt", key:"dep", type:"time" },
                  { label:"📅 Datum", key:"date", type:"date" },
                ].map(field=>(
                  <div key={field.key} style={{ marginBottom:18 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:8 }}>{field.label}</div>
                    {field.type==="select" ? (
                      <select value={newTour[field.key]} onChange={e=>setNewTour(p=>({...p,[field.key]:e.target.value}))}
                        style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #e8ecf0", fontSize:16, fontFamily:"'Nunito',sans-serif", background:"#f8fafc", outline:"none", color:"#333" }}>
                        <option value="">— wählen —</option>
                        {field.options.map(o=><option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} value={newTour[field.key]} onChange={e=>setNewTour(p=>({...p,[field.key]:e.target.value}))}
                        style={{ width:"100%", padding:"14px 16px", borderRadius:12, border:"2px solid #e8ecf0", fontSize:16, fontFamily:"'Nunito',sans-serif", background:"#f8fafc", outline:"none", color:"#333" }}/>
                    )}
                  </div>
                ))}

                <button onClick={createTour} style={{
                  width:"100%", background: !newTour.driver?"#ccc":"#1a6fb5",
                  border:"none", borderRadius:14, padding:"18px", color:"#fff",
                  fontSize:18, fontWeight:800, cursor:!newTour.driver?"not-allowed":"pointer",
                  fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:10,
                }}>
                  📤 Tour erstellen & senden
                </button>

                <div style={{ fontSize:12, color:"#bbb", textAlign:"center", marginTop:12 }}>
                  Fahrer erhält automatisch eine WhatsApp-Nachricht
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [view,   setView]   = useState("login"); // login | driver | dispatch
  const [driver, setDriver] = useState(null);

  return (
    <div>
      <style>{FONTS}</style>
      {view==="login" && (
        <LoginScreen
          onDriver={(d,lang)=>{ setDriver({...d,lang}); setView("driver"); }}
          onDispatch={()=>setView("dispatch")}
        />
      )}
      {view==="driver"   && <DriverApp   driver={driver} onLogout={()=>setView("login")} />}
      {view==="dispatch" && <DispatchApp onLogout={()=>setView("login")} />}
    </div>
  );
}
