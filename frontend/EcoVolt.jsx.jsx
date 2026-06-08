import { useState, useEffect, useRef } from "react";

// ─── GLOBAL NAV ───────────────────────────────────────────────────────────────
// Fluxo: landing → register → onboarding → dashboard
let _currentPage = "landing";
let _currentUser = null;
let _lastAnalysis = null;
const _subs = new Set();
const API_BASE_URL = "http://127.0.0.1:5000";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.erro || "Erro ao comunicar com o backend EcoVolt");
  return data;
}

function setCurrentUser(user) {
  _currentUser = user;
}

function setLastAnalysis(result) {
  _lastAnalysis = result;
}

function navigate(p) {
  _currentPage = p;
  _subs.forEach(fn => fn(p));
}

// Chamado ao submeter o cadastro — vai para onboarding
function completeRegister() {
  navigate("onboarding");
}

// Chamado ao terminar/pular onboarding — vai para dashboard
function completeOnboarding() {
  navigate("dashboard");
}

function usePage() {
  const [page, set] = useState(_currentPage);
  useEffect(() => { _subs.add(set); return () => _subs.delete(set); }, []);
  return [page, navigate];
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  emerald:"#00C896", azure:"#0A84FF", warning:"#F59E0B",
  danger:"#EF4444", purple:"#8B5CF6", green:"#10B981",
};

// ─── TINY ICON SVG ────────────────────────────────────────────────────────────
const Ic = ({ n, s=20, c="currentColor" }) => {
  const d = {
    battery:<><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></>,
    bolt:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    leaf:<><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></>,
    chart:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></>,
    map:<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    bell:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    store:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    recycle:<><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></>,
    trending:<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    check:<polyline points="20 6 9 17 4 12"/>,
    arrow:<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    dollar:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    car:<><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><rect x="7" y="17" width="10" height="4" rx="2"/><path d="M7 9l1.5-4h7L17 9"/></>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d[n]}</svg>;
};

// ─── BATTERY GAUGE ────────────────────────────────────────────────────────────
const BatteryGauge = ({ value, size=120 }) => {
  const r=45, circ=2*Math.PI*r, col=value>=80?C.emerald:value>=60?C.warning:C.danger;
  return (
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{transform:"rotate(-90deg)"}}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="8"
          strokeDasharray={`${(value/100)*circ} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",textAlign:"center"}}>
        <div style={{fontWeight:900,fontSize:size*.2,color:col,lineHeight:1}}>{value}%</div>
        <div style={{fontSize:size*.1,color:"#9CA3AF",marginTop:2}}>SOH</div>
      </div>
    </div>
  );
};

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
const Spark = ({ data, color=C.emerald }) => {
  const h=36,max=Math.max(...data),min=Math.min(...data);
  const pts=data.map((v,i)=>`${(i/(data.length-1))*100},${h-((v-min)/(max-min||1))*h}`).join(" ");
  const id=`s${color.replace("#","")}`;
  return (
    <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" style={{width:"100%",height:h,display:"block"}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={`0,${h} ${pts} 100,${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, trend, color, sparkData }) => (
  <div style={{background:"#fff",borderRadius:16,padding:20,border:"1px solid #F3F4F6"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
      <div style={{width:38,height:38,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`${color}18`}}>
        <Ic n={icon} s={18} c={color}/>
      </div>
      {trend!==undefined&&<span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:99,background:trend>=0?"#ECFDF5":"#FEF2F2",color:trend>=0?"#059669":"#DC2626"}}>{trend>=0?"↑":"↓"} {Math.abs(trend)}%</span>}
    </div>
    <div style={{fontSize:26,fontWeight:900,color:"#111827",lineHeight:1}}>{value}</div>
    <div style={{fontSize:12,color:"#9CA3AF",marginTop:4,marginBottom:8}}>{label}</div>
    {sparkData&&<Spark data={sparkData} color={color}/>}
  </div>
);

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ currentPage, collapsed, setCollapsed }) => {
  const [,nav] = usePage();
  const items = [
    {id:"dashboard",icon:"chart",label:"Dashboard"},
    {id:"battery-register",icon:"battery",label:"Nova Bateria"},
    {id:"analysis",icon:"trending",label:"Análise"},
    {id:"marketplace",icon:"store",label:"Marketplace"},
    {id:"impact",icon:"leaf",label:"Impacto"},
    {id:"map",icon:"map",label:"Mapa"},
    {id:"notifications",icon:"bell",label:"Alertas"},
    {id:"profile",icon:"user",label:"Perfil"},
  ];
  const w = collapsed ? 60 : 220;
  return (
    <aside style={{width:w,minWidth:w,height:"100%",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#0d1117 0%,#0a1628 100%)",transition:"width .25s",overflow:"hidden",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 14px 16px",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <div style={{width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:"linear-gradient(135deg,#00C896,#0A84FF)"}}>
          <Ic n="bolt" s={15} c="#fff"/>
        </div>
        {!collapsed&&<span style={{fontWeight:900,color:"#fff",fontSize:14,whiteSpace:"nowrap"}}>EcoVolt</span>}
      </div>
      <nav style={{flex:1,padding:"10px 8px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
        {items.map(item=>{
          const active=currentPage===item.id;
          return (
            <button key={item.id} onClick={()=>nav(item.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px 0":"10px 12px",borderRadius:10,border:"none",cursor:"pointer",justifyContent:collapsed?"center":"flex-start",background:active?"rgba(0,200,150,.15)":"transparent",color:active?C.emerald:"rgba(255,255,255,.5)",transition:"all .15s"}}>
              <Ic n={item.icon} s={17} c={active?C.emerald:"currentColor"}/>
              {!collapsed&&<span style={{fontSize:13,fontWeight:active?700:500,whiteSpace:"nowrap"}}>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"10px 8px 12px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <button onClick={()=>nav("landing")} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:collapsed?"10px 0":"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:"transparent",color:"rgba(255,255,255,.4)",justifyContent:collapsed?"center":"flex-start"}}>
          <Ic n="logout" s={16} c="currentColor"/>
          {!collapsed&&<span style={{fontSize:13,fontWeight:500}}>Sair</span>}
        </button>
        <button onClick={()=>setCollapsed(!collapsed)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:"6px 0",marginTop:4,border:"none",background:"transparent",cursor:"pointer",color:"rgba(255,255,255,.25)"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points={collapsed?"9 18 15 12 9 6":"15 18 9 12 15 6"}/>
          </svg>
        </button>
      </div>
    </aside>
  );
};

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
const TopBar = ({ title }) => {
  const [,nav] = usePage();
  return (
    <header style={{height:60,background:"#fff",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0}}>
      <h1 style={{fontSize:16,fontWeight:800,color:"#111827",margin:0}}>{title}</h1>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>nav("notifications")} style={{position:"relative",width:36,height:36,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #F3F4F6",background:"#fff",cursor:"pointer",color:"#6B7280"}}>
          <Ic n="bell" s={17} c="currentColor"/>
          <span style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:C.emerald,border:"2px solid #fff"}}/>
        </button>
        <div onClick={()=>nav("profile")} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 8px",borderRadius:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontSize:11,fontWeight:900}}>JS</div>
          <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>João Silva</span>
        </div>
      </div>
    </header>
  );
};

// ─── SHELL ────────────────────────────────────────────────────────────────────
const Shell = ({ title, children }) => {
  const [page] = usePage();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#F9FAFB"}}>
      <Sidebar currentPage={page} collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>
        <TopBar title={title}/>
        <main style={{flex:1,overflowY:"auto",padding:24}}>{children}</main>
      </div>
    </div>
  );
};

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>
);

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════════════════════════════
const RegisterScreen = () => {
  const [,nav] = usePage();
  const [nome,setNome] = useState("");
  const [sobrenome,setSobrenome] = useState("");
  const [email,setEmail] = useState("");
  const [pwd,setPwd] = useState("");
  const [loading,setLoading] = useState(false);
  const str = !pwd?0:pwd.length<6?1:pwd.length<10?2:/[A-Z]/.test(pwd)&&/[0-9]/.test(pwd)?4:3;
  const sCols = ["#E5E7EB","#EF4444","#F59E0B","#3B82F6","#10B981"];
  const sLabs = ["","Muito fraca","Fraca","Boa","Forte"];
  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest("/cadastro", {
        method: "POST",
        body: JSON.stringify({ nome: `${nome} ${sobrenome}`.trim(), email, senha: pwd }),
      });
      setCurrentUser(data.usuario);
      completeRegister();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  const login = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, senha: pwd }),
      });
      setCurrentUser(data.usuario);
      navigate("dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  const inp = {width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #E5E7EB",fontSize:14,background:"#F9FAFB",outline:"none",boxSizing:"border-box"};
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F9FAFB",padding:24}}>
      <div style={{width:"100%",maxWidth:440,background:"#fff",borderRadius:20,border:"1px solid #F3F4F6",boxShadow:"0 1px 8px rgba(0,0,0,.04)",padding:32}}>
        <button onClick={()=>nav("landing")} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:13,marginBottom:22,padding:0}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:22}}>
          <div style={{width:34,height:34,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)"}}>
            <Ic n="bolt" s={16} c="#fff"/>
          </div>
          <div><div style={{fontWeight:900,color:"#111827",fontSize:16}}>Criar conta</div><div style={{fontSize:12,color:"#9CA3AF"}}>EcoVolt Analytics</div></div>
        </div>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {["Nome","Sobrenome"].map(l=>(
              <div key={l}>
                <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>{l}</label>
                <input type="text" placeholder={l} required value={l==="Nome"?nome:sobrenome} onChange={e=>l==="Nome"?setNome(e.target.value):setSobrenome(e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
              </div>
            ))}
          </div>
          {[["Email","email","seu@email.com",true],["Empresa","text","Nome da empresa (opcional)",false]].map(([l,t,p,r])=>(
            <div key={l}>
              <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>{l}</label>
              <input type={t} placeholder={p} required={r} value={l==="Email"?email:undefined} onChange={e=>l==="Email"&&setEmail(e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
            </div>
          ))}
          <div>
            <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>Senha</label>
            <input type="password" placeholder="••••••••" value={pwd} onChange={e=>setPwd(e.target.value)} required style={inp} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
            {pwd&&(
              <div style={{marginTop:7}}>
                <div style={{display:"flex",gap:4,marginBottom:3}}>{[1,2,3,4].map(i=><div key={i} style={{flex:1,height:4,borderRadius:99,background:i<=str?sCols[str]:"#E5E7EB",transition:"background .3s"}}/>)}</div>
                <span style={{fontSize:11,color:sCols[str],fontWeight:700}}>{sLabs[str]}</span>
              </div>
            )}
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>Confirmar senha</label>
            <input type="password" placeholder="••••••••" required style={inp} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
          </div>
          <label style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:12,color:"#6B7280",cursor:"pointer"}}>
            <input type="checkbox" required style={{marginTop:2,accentColor:C.emerald}}/>
            Aceito os <span style={{color:C.emerald,fontWeight:700}}>Termos de Uso</span> e <span style={{color:C.emerald,fontWeight:700}}>Política de Privacidade</span>
          </label>
          <button type="button" onClick={submit} disabled={loading}
            style={{padding:"13px 0",borderRadius:12,border:"none",background:loading?"#9CA3AF":"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:14,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><Spinner/>Criando sua conta...</>:"Criar conta gratuita"}
          </button>
        </form>
        <p style={{textAlign:"center",fontSize:13,color:"#9CA3AF",marginTop:14}}>
          Já tem conta?{" "}
          <button type="button" onClick={login} style={{background:"none",border:"none",cursor:"pointer",color:C.emerald,fontWeight:800,fontSize:13}}>Entrar</button>
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ONBOARDING — sempre exibido após o cadastro, antes do dashboard
// ══════════════════════════════════════════════════════════════════════════════
const OnboardingScreen = () => {
  const [step,setStep] = useState(0);
  const [fading,setFading] = useState(false);

  const steps = [
    {icon:"bolt",color:C.emerald,title:"Bem-vindo ao EcoVolt Analytics",desc:"A plataforma inteligente para monitorar, analisar e dar uma segunda vida às baterias de veículos elétricos.",cta:"Começar"},
    {icon:"battery",color:C.azure,title:"Diagnóstico em segundos",desc:"Nossa IA analisa o Estado de Saúde (SOH) de cada bateria com precisão científica — basta inserir os dados técnicos.",cta:"Próximo"},
    {icon:"recycle",color:C.purple,title:"Economia circular real",desc:"Classifique a bateria para uso automotivo, segunda vida energética ou reciclagem. Cada bateria no lugar certo.",cta:"Próximo"},
    {icon:"leaf",color:C.green,title:"Impacto ambiental mensurável",desc:"Acompanhe o CO₂ evitado, energia reaproveitada e resíduos reduzidos. Sustentabilidade em dados concretos.",cta:"Próximo"},
    {icon:"dollar",color:C.warning,title:"Monetize sua bateria",desc:"Conecte-se a empresas verificadas no marketplace e receba propostas em minutos. Transforme bateria em receita.",cta:"Entrar na plataforma"},
  ];

  const goNext = () => {
    if (fading) return;
    if (step === steps.length-1) { completeOnboarding(); return; }
    setFading(true);
    setTimeout(()=>{ setStep(s=>s+1); setFading(false); },200);
  };

  const skip = () => completeOnboarding();
  const cur = steps[step];

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#0d1117 0%,#0a1628 60%,#0d1117 100%)",padding:24,position:"relative",overflow:"hidden"}}>
      {[C.emerald,C.azure,C.purple].map((col,i)=>(
        <div key={i} style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:col,opacity:.05,filter:"blur(100px)",top:`${[10,50,70][i]}%`,left:`${[10,70,30][i]}%`,transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
      ))}
      <button onClick={skip} style={{position:"absolute",top:24,right:24,fontSize:13,color:"rgba(255,255,255,.4)",background:"transparent",border:"none",cursor:"pointer",fontWeight:600}}>Pular →</button>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:44}}>
        <div style={{width:38,height:38,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)"}}>
          <Ic n="bolt" s={18} c="#fff"/>
        </div>
        <span style={{fontWeight:900,color:"#fff",fontSize:17}}>EcoVolt Analytics</span>
      </div>

      <div style={{width:"100%",maxWidth:400,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.09)",borderRadius:24,padding:36,textAlign:"center",opacity:fading?0:1,transform:fading?"translateY(10px)":"translateY(0)",transition:"opacity .2s,transform .2s"}}>
        <div style={{width:68,height:68,borderRadius:18,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",background:`${cur.color}20`,border:`1px solid ${cur.color}35`}}>
          <Ic n={cur.icon} s={30} c={cur.color}/>
        </div>
        <h2 style={{fontWeight:900,fontSize:20,color:"#fff",margin:"0 0 12px",lineHeight:1.3}}>{cur.title}</h2>
        <p style={{fontSize:14,color:"rgba(255,255,255,.52)",lineHeight:1.75,margin:"0 0 32px"}}>{cur.desc}</p>
        <button onClick={goNext}
          style={{width:"100%",padding:"14px 0",borderRadius:12,border:"none",background:`linear-gradient(135deg,${cur.color},${C.azure})`,color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer"}}>
          {cur.cta}
        </button>
      </div>

      <div style={{display:"flex",gap:8,marginTop:26}}>
        {steps.map((_,i)=>(
          <button key={i} onClick={()=>setStep(i)} style={{width:i===step?24:8,height:8,borderRadius:99,border:"none",cursor:"pointer",background:i===step?C.emerald:"rgba(255,255,255,.2)",transition:"all .3s"}}/>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LANDING
// ══════════════════════════════════════════════════════════════════════════════
const LandingScreen = () => {
  const [,nav] = usePage();
  return (
    <div style={{minHeight:"100vh",overflowY:"auto",background:"#fff"}}>
      <nav style={{position:"sticky",top:0,zIndex:50,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 40px",background:"rgba(255,255,255,.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid #F3F4F6"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)"}}>
            <Ic n="bolt" s={14} c="#fff"/>
          </div>
          <span style={{fontWeight:900,fontSize:15,color:"#111827"}}>EcoVolt Analytics</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>nav("register")} style={{padding:"8px 18px",borderRadius:10,border:"1px solid #E5E7EB",background:"transparent",color:"#374151",fontWeight:600,fontSize:13,cursor:"pointer"}}>Entrar</button>
          <button onClick={()=>nav("register")} style={{padding:"8px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Começar →</button>
        </div>
      </nav>

      <div style={{minHeight:"88vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#0d1117,#0a1628)",padding:"80px 40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        {[C.emerald,C.azure].map((col,i)=>(
          <div key={i} style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:col,opacity:.06,filter:"blur(120px)",top:i?"60%":"20%",left:i?"70%":"15%",pointerEvents:"none"}}/>
        ))}
        <div style={{position:"relative",maxWidth:660}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:99,background:"rgba(0,200,150,.12)",border:"1px solid rgba(0,200,150,.25)",marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:C.emerald}}/>
            <span style={{fontSize:12,color:C.emerald,fontWeight:700}}>Plataforma de economia circular para baterias EV</span>
          </div>
          <h1 style={{fontWeight:900,fontSize:50,color:"#fff",lineHeight:1.1,margin:"0 0 18px"}}>
            Inteligência para{" "}
            <span style={{background:"linear-gradient(135deg,#00C896,#0A84FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>baterias sustentáveis</span>
          </h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,.52)",lineHeight:1.75,margin:"0 0 32px"}}>Analise, classifique e monetize baterias de veículos elétricos com IA. Transforme resíduos em valor.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>nav("register")} style={{padding:"13px 30px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>Criar conta gratuita →</button>
            <button onClick={()=>nav("register")} style={{padding:"13px 28px",borderRadius:12,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Já tenho conta</button>
          </div>
        </div>
      </div>

      <div style={{background:"#fff",padding:"44px 40px",display:"flex",justifyContent:"center",gap:60,flexWrap:"wrap",borderBottom:"1px solid #F3F4F6"}}>
        {[["12.400+","Baterias analisadas"],["847t","CO₂ evitado"],["3.200+","Parceiros"],["98%","Satisfação"]].map(([v,l])=>(
          <div key={l} style={{textAlign:"center"}}><div style={{fontSize:30,fontWeight:900,color:C.emerald}}>{v}</div><div style={{fontSize:13,color:"#9CA3AF",marginTop:3}}>{l}</div></div>
        ))}
      </div>

      <div style={{padding:"64px 40px",maxWidth:960,margin:"0 auto"}}>
        <h2 style={{textAlign:"center",fontWeight:900,fontSize:34,color:"#111827",margin:"0 0 40px"}}>Tudo que você precisa em uma plataforma</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18}}>
          {[
            {icon:"battery",color:C.emerald,title:"Diagnóstico Inteligente",desc:"IA analisa o SOH em segundos com precisão científica."},
            {icon:"recycle",color:C.purple,title:"Economia Circular",desc:"Maximize o valor — segunda vida ou reciclagem responsável."},
            {icon:"leaf",color:C.green,title:"Impacto Ambiental",desc:"Rastreie CO₂ evitado e resíduos reduzidos em tempo real."},
            {icon:"dollar",color:C.warning,title:"Monetização",desc:"Marketplace conecta você a compradores verificados."},
            {icon:"map",color:C.azure,title:"Rede de Parceiros",desc:"200+ recicladoras e centros mapeados no Brasil."},
            {icon:"trending",color:C.danger,title:"Analytics ESG",desc:"Dashboards para gestão corporativa e relatórios ESG."},
          ].map(f=>(
            <div key={f.title} style={{background:"#fff",border:"1px solid #F3F4F6",borderRadius:16,padding:22}}>
              <div style={{width:38,height:38,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`${f.color}15`,marginBottom:14}}><Ic n={f.icon} s={18} c={f.color}/></div>
              <div style={{fontWeight:800,fontSize:14,color:"#111827",marginBottom:7}}>{f.title}</div>
              <div style={{fontSize:13,color:"#9CA3AF",lineHeight:1.65}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"linear-gradient(135deg,#0d1117,#0a1628)",padding:"64px 40px",textAlign:"center"}}>
        <h2 style={{fontWeight:900,fontSize:32,color:"#fff",margin:"0 0 10px"}}>Pronto para transformar baterias em valor?</h2>
        <p style={{fontSize:15,color:"rgba(255,255,255,.4)",margin:"0 0 28px"}}>Junte-se a mais de 3.200 parceiros que já usam EcoVolt.</p>
        <button onClick={()=>nav("register")} style={{padding:"13px 34px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>Criar conta gratuita →</button>
      </div>

      <div style={{background:"#0d1117",padding:"20px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:22,height:22,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)"}}><Ic n="bolt" s={11} c="#fff"/></div>
          <span style={{color:"#fff",fontWeight:800,fontSize:12}}>EcoVolt Analytics</span>
        </div>
        <span style={{fontSize:11,color:"rgba(255,255,255,.2)"}}>© 2025 EcoVolt Analytics.</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
const DashboardScreen = () => {
  const [,nav] = usePage();
  const metrics = [
    {icon:"trending",label:"SOH Médio da Frota",value:"78%",trend:2.1,color:C.emerald,sparkData:[70,72,73,75,74,77,78]},
    {icon:"battery",label:"Baterias Monitoradas",value:"247",trend:4.8,color:C.azure,sparkData:[200,210,215,218,220,235,247]},
    {icon:"leaf",label:"CO₂ Economizado",value:"12.4t",trend:8.3,color:C.green,sparkData:[8,9,9.5,10,10.8,11.5,12.4]},
    {icon:"dollar",label:"Economia Gerada",value:"R$48k",trend:12.1,color:C.warning,sparkData:[30,33,36,38,40,44,48]},
  ];
  const bats = [
    {id:"#B-001",model:"BYD Blade 100kWh",soh:92,status:"Automotivo",date:"há 2 dias"},
    {id:"#B-002",model:"CATL LFP 75kWh",soh:74,status:"Segunda vida",date:"há 5 dias"},
    {id:"#B-003",model:"LG Chem 60kWh",soh:58,status:"Reciclagem",date:"há 1 sem"},
    {id:"#B-004",model:"Panasonic 82kWh",soh:85,status:"Automotivo",date:"há 1 sem"},
  ];
  const sCol = {"Automotivo":C.emerald,"Segunda vida":C.azure,"Reciclagem":C.danger};
  const alerts = [
    {type:"warn",msg:"Bateria #B-012 abaixo de 60% SOH — avaliar descarte"},
    {type:"info",msg:"3 novas propostas no marketplace para suas baterias"},
    {type:"eco",msg:"Você economizou 200kg de CO₂ esta semana. Parabéns!"},
  ];
  const aCol = {warn:C.warning,info:C.azure,eco:C.emerald};
  return (
    <Shell title="Dashboard">
      <div style={{display:"flex",flexDirection:"column",gap:18}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
          {metrics.map(m=><MetricCard key={m.label} {...m}/>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14}}>
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",borderBottom:"1px solid #F9FAFB"}}>
              <h3 style={{fontWeight:800,color:"#111827",margin:0,fontSize:14}}>Baterias Recentes</h3>
              <button onClick={()=>nav("battery-register")} style={{padding:"5px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:700,fontSize:11,cursor:"pointer"}}>+ Cadastrar</button>
            </div>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr style={{background:"#F9FAFB"}}>
                {["ID","Modelo","SOH","Status","Data"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#9CA3AF"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {bats.map(b=>(
                  <tr key={b.id} onClick={()=>nav("analysis")} style={{borderTop:"1px solid #F9FAFB",cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"11px 14px",fontFamily:"monospace",fontSize:11,color:"#9CA3AF"}}>{b.id}</td>
                    <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:"#1F2937"}}>{b.model}</td>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:52,height:4,borderRadius:99,background:"#F3F4F6",overflow:"hidden"}}><div style={{height:"100%",width:`${b.soh}%`,background:b.soh>=80?C.emerald:b.soh>=60?C.warning:C.danger,borderRadius:99}}/></div>
                        <span style={{fontSize:12,fontWeight:700,color:b.soh>=80?C.emerald:b.soh>=60?C.warning:C.danger}}>{b.soh}%</span>
                      </div>
                    </td>
                    <td style={{padding:"11px 14px"}}><span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:`${sCol[b.status]}15`,color:sCol[b.status]}}>{b.status}</span></td>
                    <td style={{padding:"11px 14px",fontSize:11,color:"#D1D5DB"}}>{b.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:16}}>
              <h3 style={{fontWeight:800,color:"#111827",margin:"0 0 10px",fontSize:13}}>Alertas Inteligentes</h3>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {alerts.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,padding:"9px 10px",borderRadius:9,background:`${aCol[a.type]}0e`}}>
                    <div style={{width:3,borderRadius:99,background:aCol[a.type],flexShrink:0}}/>
                    <p style={{fontSize:12,color:"#4B5563",margin:0,lineHeight:1.55}}>{a.msg}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:16}}>
              <h3 style={{fontWeight:800,color:"#111827",margin:"0 0 8px",fontSize:13}}>Ações Rápidas</h3>
              {[{l:"Nova Análise",i:"trending",p:"battery-register"},{l:"Ver Marketplace",i:"store",p:"marketplace"},{l:"Mapa de Parceiros",i:"map",p:"map"}].map(a=>(
                <button key={a.l} onClick={()=>nav(a.p)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 8px",borderRadius:9,border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:"#374151"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Ic n={a.i} s={14} c={C.emerald}/>{a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BATTERY REGISTER
// ══════════════════════════════════════════════════════════════════════════════
const BatteryRegisterScreen = () => {
  const [,nav] = usePage();
  const [loading,setLoading] = useState(false);
  const [battery,setBattery] = useState({ fabricante:"", modelo:"", ano:"", cap_original:"", cap_atual:"", ciclos:"", temperatura:"", tensao:"" });
  const updateBattery = (key, value) => setBattery(prev => ({ ...prev, [key]: value }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fabricante: battery.fabricante,
        modelo: battery.modelo,
        ano: Number(battery.ano),
        cap_original: Number(battery.cap_original),
        cap_atual: Number(battery.cap_atual),
        ciclos: Number(battery.ciclos),
      };
      const result = await apiRequest("/simulador/soh", { method:"POST", body: JSON.stringify(payload) });
      if (_currentUser?.id) {
        try { await apiRequest("/baterias", { method:"POST", body: JSON.stringify({ usuario_id: _currentUser.id, ...payload }) }); } catch (_) {}
      }
      setLastAnalysis(result);
      nav("analysis");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  const inp = {width:"100%",padding:"9px 13px",borderRadius:10,border:"1px solid #E5E7EB",fontSize:13,background:"#F9FAFB",outline:"none",boxSizing:"border-box"};
  return (
    <Shell title="Cadastrar Bateria">
      <div style={{maxWidth:620,margin:"0 auto"}}>
        <div style={{background:"#fff",borderRadius:18,border:"1px solid #F3F4F6"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"18px 22px",borderBottom:"1px solid #F9FAFB"}}>
            <div style={{width:42,height:42,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)"}}><Ic n="battery" s={19} c="#fff"/></div>
            <div><div style={{fontWeight:900,color:"#111827",fontSize:14}}>Dados da Bateria</div><div style={{fontSize:12,color:"#9CA3AF"}}>Preencha as especificações para análise de SOH</div></div>
          </div>
          <form onSubmit={submit} style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {l:"Fabricante",k:"fabricante",t:"select",opts:["BYD","CATL","LG Chem","Panasonic","Samsung SDI","Tesla","Outro"]},
                {l:"Modelo",k:"modelo",t:"text",p:"Ex: Blade 100kWh"},
                {l:"Ano de Fabricação",k:"ano",t:"number",p:"Ex: 2021"},
                {l:"Capacidade Original (kWh)",k:"cap_original",t:"number",p:"Ex: 100"},
                {l:"Capacidade Atual (kWh)",k:"cap_atual",t:"number",p:"Ex: 84"},
                {l:"Ciclos de Carga",k:"ciclos",t:"number",p:"Ex: 1240"},
                {l:"Temperatura Op. (°C)",k:"temperatura",t:"number",p:"Ex: 35"},
                {l:"Tensão Máxima (V)",k:"tensao",t:"number",p:"Ex: 400"},
              ].map(f=>(
                <div key={f.l}>
                  <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>{f.l}</label>
                  {f.t==="select"
                    ?<select required value={battery[f.k]} onChange={e=>updateBattery(f.k,e.target.value)} style={{...inp,appearance:"none"}} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}><option value="">Selecionar...</option>{f.opts.map(o=><option key={o}>{o}</option>)}</select>
                    :<input type={f.t} placeholder={f.p} required={["modelo","ano","cap_original","cap_atual","ciclos"].includes(f.k)} value={battery[f.k]} onChange={e=>updateBattery(f.k,e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>}
                </div>
              ))}
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>Observações</label>
              <textarea rows={3} placeholder="Histórico de manutenção, danos observados..." style={{...inp,resize:"none"}} onFocus={e=>e.target.style.borderColor=C.emerald} onBlur={e=>e.target.style.borderColor="#E5E7EB"}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button type="button" onClick={()=>nav("dashboard")} style={{flex:1,padding:"11px 0",borderRadius:11,border:"1px solid #E5E7EB",background:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",color:"#374151"}}>Cancelar</button>
              <button type="submit" disabled={loading} style={{flex:2,padding:"11px 0",borderRadius:11,border:"none",background:loading?"#9CA3AF":"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:14,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {loading?<><Spinner/>Analisando...</>:<><Ic n="trending" s={14} c="#fff"/>Iniciar Análise</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════
const AnalysisScreen = () => {
  const [,nav] = usePage();
  const analysis = _lastAnalysis || { fabricante:"CATL", modelo:"LFP 75kWh", ano:2020, ciclos:1240, cap_atual:55.5, soh:74, classificacao:"Segunda vida", recomendacao:"Desgaste moderado, com potencial para reaproveitamento energetico em sistemas estacionarios. Recomendamos cotacao no marketplace de segunda vida." };
  const soh=Math.round(Number(analysis.soh || 0)),col=soh>=80?C.emerald:soh>=60?C.warning:C.danger,cls=analysis.classificacao || (soh>=80?"Automotivo":soh>=60?"Segunda vida":"Reciclagem");
  const hist=[100,97,95,92,89,86,82,78,soh],proj=[soh,Math.max(0,soh-4),Math.max(0,soh-8),Math.max(0,soh-12),Math.max(0,soh-16),Math.max(0,soh-20),Math.max(0,soh-24)];
  const svgW=300,svgH=90;
  const toP=(v,i,len)=>({x:(i/(len-1))*svgW,y:svgH-((v-45)/55)*svgH});
  const histPts=hist.map((v,i)=>{const p=toP(v,i,hist.length+proj.length-1);return`${p.x},${p.y}`;}).join(" ");
  const projPts=proj.map((v,i)=>{const p=toP(v,i+hist.length-1,hist.length+proj.length-1);return`${p.x},${p.y}`;}).join(" ");
  const jp=toP(hist[hist.length-1],hist.length-1,hist.length+proj.length-1);
  return (
    <Shell title="Resultado da Análise">
      <div style={{maxWidth:720,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"#fff",borderRadius:18,border:"1px solid #F3F4F6",padding:22,display:"flex",flexWrap:"wrap",alignItems:"center",gap:20}}>
          <BatteryGauge value={soh} size={120}/>
          <div style={{flex:1}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:99,background:`${col}15`,marginBottom:10}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:col}}/><span style={{fontSize:13,fontWeight:800,color:col}}>{cls}</span>
            </div>
            <h2 style={{fontWeight:900,fontSize:18,color:"#111827",margin:"0 0 4px"}}>{analysis.fabricante} {analysis.modelo} · {analysis.ano}</h2>
            <p style={{fontSize:12,color:"#9CA3AF",margin:"0 0 10px"}}>{analysis.ciclos} ciclos · Capacidade atual: {analysis.cap_atual} kWh</p>
            <div style={{fontSize:13,color:"#4B5563",background:"#F9FAFB",borderRadius:9,padding:"9px 12px",lineHeight:1.65}}>
              {analysis.recomendacao}
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[{l:"Uso Automotivo",r:"SOH ≥ 80%",ok:soh>=80,i:"car",c:C.emerald},{l:"Segunda Vida",r:"60–80%",ok:soh>=60&&soh<80,i:"bolt",c:C.azure},{l:"Reciclagem",r:"SOH < 60%",ok:soh<60,i:"recycle",c:C.danger}].map(card=>(
            <div key={card.l} style={{padding:14,borderRadius:13,border:`2px solid ${card.ok?card.c:"#E5E7EB"}`,background:card.ok?`${card.c}08`:"#fff",opacity:card.ok?1:.4}}>
              <div style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${card.c}18`,marginBottom:8}}><Ic n={card.i} s={15} c={card.c}/></div>
              <div style={{fontWeight:800,fontSize:13,color:"#111827"}}>{card.l}</div>
              <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{card.r}</div>
              {card.ok&&<div style={{fontSize:11,fontWeight:800,color:card.c,marginTop:5}}>✓ Classificado</div>}
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontWeight:800,color:"#111827",margin:0,fontSize:13}}>Curva de Degradação</h3>
            <div style={{display:"flex",gap:14,fontSize:11,color:"#9CA3AF"}}>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:2,background:C.emerald,display:"inline-block",borderRadius:99}}/>Histórico</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:14,height:2,background:C.azure,display:"inline-block",borderRadius:99}}/>Projeção</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${svgW} ${svgH+4}`} style={{width:"100%",display:"block"}}>
            {[100,80,60,40].map(v=>{const y=svgH-((v-45)/55)*svgH;return<g key={v}><line x1="0" y1={y} x2={svgW} y2={y} stroke="#F3F4F6" strokeWidth="0.8"/><text x="2" y={y-2} fontSize="7" fill="#D1D5DB">{v}%</text></g>;})}
            <polyline points={histPts} fill="none" stroke={C.emerald} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points={projPts} fill="none" stroke={C.azure} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,3"/>
            <circle cx={jp.x} cy={jp.y} r="4.5" fill={C.azure} stroke="#fff" strokeWidth="2"/>
          </svg>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <button onClick={()=>nav("marketplace")} style={{padding:"12px 0",borderRadius:12,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Ic n="store" s={14} c="#fff"/>Ver Marketplace</button>
          <button onClick={()=>nav("impact")} style={{padding:"12px 0",borderRadius:12,border:`2px solid ${C.emerald}`,background:"#fff",color:C.emerald,fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Ic n="leaf" s={14} c={C.emerald}/>Impacto Ambiental</button>
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MARKETPLACE
// ══════════════════════════════════════════════════════════════════════════════
const MarketplaceScreen = () => {
  const [modal,setModal] = useState(null);
  const listings = [
    {id:1,company:"GreenPower Soluções",type:"Energia Estacionária",offer:3200,rating:4.8,location:"SP",verified:true,resp:"< 2h"},
    {id:2,company:"SolarBank Brasil",type:"Armazenamento Solar",offer:2950,rating:4.6,location:"RJ",verified:true,resp:"< 4h"},
    {id:3,company:"EcoReserva Tech",type:"Grid Distribuída",offer:2800,rating:4.5,location:"MG",verified:false,resp:"< 8h"},
    {id:4,company:"Recicla+ Brasil",type:"Reciclagem Certificada",offer:800,rating:4.9,location:"PE",verified:true,resp:"< 1h"},
    {id:5,company:"VoltaCiclo",type:"Remanufatura",offer:3500,rating:4.7,location:"SC",verified:true,resp:"< 3h"},
  ];
  return (
    <Shell title="Marketplace de Segunda Vida">
      {modal!==null&&(
        <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:20,padding:28,maxWidth:340,width:"100%"}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${C.emerald}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><Ic n="check" s={22} c={C.emerald}/></div>
            <h3 style={{fontWeight:900,color:"#111827",textAlign:"center",margin:"0 0 8px",fontSize:16}}>Proposta enviada! 🎉</h3>
            <p style={{fontSize:14,color:"#9CA3AF",textAlign:"center",margin:"0 0 18px",lineHeight:1.6}}>Proposta enviada para <strong style={{color:"#374151"}}>{listings.find(l=>l.id===modal)?.company}</strong>. Aguarde contato em até {listings.find(l=>l.id===modal)?.resp}.</p>
            <button onClick={()=>setModal(null)} style={{width:"100%",padding:"11px 0",borderRadius:11,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer"}}>Entendido</button>
          </div>
        </div>
      )}
      <div style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #F3F4F6",padding:16,display:"flex",alignItems:"center",gap:16}}>
          <BatteryGauge value={74} size={76}/>
          <div><div style={{fontWeight:800,color:"#111827",fontSize:14}}>CATL LFP 75kWh · 2020</div><div style={{fontSize:12,color:"#9CA3AF",margin:"3px 0 6px"}}>Segunda vida · 1.240 ciclos</div><div style={{fontSize:13}}><span style={{color:"#9CA3AF"}}>Valor estimado: </span><span style={{fontWeight:900,color:C.emerald}}>R$ 2.800 – R$ 3.500</span></div></div>
        </div>
        {listings.map(l=>(
          <div key={l.id} style={{background:"#fff",borderRadius:13,border:"1px solid #F3F4F6",padding:16}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
              <div style={{display:"flex",gap:11,flex:1}}>
                <div style={{width:38,height:38,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:900,fontSize:14,flexShrink:0}}>{l.company[0]}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontWeight:800,color:"#111827",fontSize:14}}>{l.company}</span>
                    {l.verified&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#ECFDF5",color:"#059669",fontWeight:700}}>✓ Verificada</span>}
                  </div>
                  <div style={{fontSize:12,color:"#9CA3AF",margin:"2px 0 5px"}}>{l.type} · {l.location}</div>
                  <div style={{fontSize:12,color:"#9CA3AF"}}>⭐ {l.rating} · Resposta {l.resp}</div>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:19,fontWeight:900,color:"#111827"}}>R$ {l.offer.toLocaleString("pt-BR")}</div>
                <button onClick={()=>setModal(l.id)} style={{marginTop:7,padding:"6px 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Vender Bateria</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// IMPACT
// ══════════════════════════════════════════════════════════════════════════════
const ImpactScreen = () => {
  const months=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const co2=[280,320,410,380,450,520,490,610,580,720,680,847];
  const maxV=Math.max(...co2);
  return (
    <Shell title="Impacto Ambiental">
      <div style={{maxWidth:840,margin:"0 auto",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:13}}>
          {[{l:"CO₂ Evitado",v:"847t",i:"leaf",c:C.green,d:"Toneladas este ano"},{l:"Árvores Equiv.",v:"38.500",i:"leaf",c:"#059669",d:"Preservação florestal"},{l:"Energia Economizada",v:"12,4 GWh",i:"bolt",c:C.azure,d:"Energia reutilizada"},{l:"Resíduos Evitados",v:"124t",i:"recycle",c:C.purple,d:"Baterias não aterradas"},{l:"Economia Circular",v:"R$ 2,1M",i:"dollar",c:C.warning,d:"Valor regenerado"},{l:"Índice ESG",v:"A+",i:"trending",c:C.emerald,d:"Classificação sustentável"}].map(m=>(
            <div key={m.l} style={{background:"#fff",borderRadius:13,border:"1px solid #F3F4F6",padding:16}}>
              <div style={{width:34,height:34,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:`${m.c}15`,marginBottom:10}}><Ic n={m.i} s={16} c={m.c}/></div>
              <div style={{fontSize:22,fontWeight:900,color:m.c}}>{m.v}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#1F2937",marginTop:4}}>{m.l}</div>
              <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{m.d}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",padding:20}}>
          <h3 style={{fontWeight:800,color:"#111827",margin:"0 0 16px",fontSize:14}}>CO₂ Evitado por Mês (toneladas)</h3>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:130}}>
            {co2.map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,height:"100%",justifyContent:"flex-end"}}>
                <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:i===co2.length-1?"linear-gradient(180deg,#00C896,#0A84FF)":`${C.emerald}30`,height:`${(v/maxV)*110}px`}} title={`${months[i]}: ${v}t`}/>
                <span style={{fontSize:8,color:"#D1D5DB"}}>{months[i].slice(0,3)}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #F3F4F6",padding:20}}>
          <h3 style={{fontWeight:800,color:"#111827",margin:"0 0 14px",fontSize:14}}>Equivalências Sustentáveis</h3>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[{l:"Árvores preservadas",v:38500,max:50000,c:C.green,e:"🌳"},{l:"Km dirigidos por EV",v:4200000,max:5000000,c:C.azure,e:"⚡"},{l:"Residências abastecidas",v:2800,max:5000,c:C.warning,e:"🏠"},{l:"Voos SP-RJ evitados",v:1240,max:2000,c:C.purple,e:"✈️"}].map(e=>(
              <div key={e.l} style={{display:"flex",alignItems:"center",gap:11}}>
                <span style={{fontSize:18,width:26,textAlign:"center"}}>{e.e}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}>
                    <span style={{fontWeight:600,color:"#374151"}}>{e.l}</span>
                    <span style={{fontWeight:800,color:e.c}}>{e.v.toLocaleString("pt-BR")}</span>
                  </div>
                  <div style={{height:6,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(e.v/e.max)*100}%`,background:e.c,borderRadius:99}}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAP
// ══════════════════════════════════════════════════════════════════════════════
const MapScreen = () => {
  const [sel,setSel] = useState(null);
  const partners = [
    {id:1,name:"GreenCiclo Recicladoras",type:"Reciclagem",city:"São Paulo, SP",lat:48,lng:52,rating:4.9,dist:"12 km"},
    {id:2,name:"VoltaVerde",type:"Segunda Vida",city:"Campinas, SP",lat:36,lng:34,rating:4.7,dist:"85 km"},
    {id:3,name:"EcoPower Est.",type:"Energia Solar",city:"Rio de Janeiro, RJ",lat:65,lng:72,rating:4.8,dist:"440 km"},
    {id:4,name:"SolarBank",type:"Grid",city:"Belo Horizonte, MG",lat:44,lng:42,rating:4.6,dist:"480 km"},
    {id:5,name:"BatRenova",type:"Reciclagem",city:"Recife, PE",lat:28,lng:68,rating:4.5,dist:"2.400 km"},
    {id:6,name:"CicloAtivo Sul",type:"Segunda Vida",city:"Florianópolis, SC",lat:74,lng:44,rating:4.8,dist:"1.100 km"},
  ];
  const tCol={"Reciclagem":C.danger,"Segunda Vida":C.azure,"Energia Solar":C.warning,"Grid":C.purple};
  return (
    <Shell title="Mapa de Parceiros">
      <div style={{display:"grid",gridTemplateColumns:"1fr 270px",gap:14,height:"calc(100vh - 140px)"}}>
        <div style={{position:"relative",borderRadius:16,border:"1px solid #F3F4F6",overflow:"hidden",background:"linear-gradient(135deg,#e8f5ee,#e0f0f8,#eef5e4)"}}>
          {[...Array(8)].map((_,i)=><div key={`h${i}`} style={{position:"absolute",width:"100%",top:`${12.5*i}%`,borderTop:"1px solid rgba(0,0,0,.04)",pointerEvents:"none"}}/>)}
          {[...Array(10)].map((_,i)=><div key={`v${i}`} style={{position:"absolute",height:"100%",left:`${10*i}%`,borderLeft:"1px solid rgba(0,0,0,.04)",pointerEvents:"none"}}/>)}
          <div style={{position:"absolute",top:"15%",left:"20%",width:"60%",height:"70%",borderRadius:"50%",background:C.emerald,opacity:.04,pointerEvents:"none"}}/>
          {partners.map(p=>(
            <button key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)}
              style={{position:"absolute",left:`${p.lng}%`,top:`${p.lat}%`,transform:"translate(-50%,-100%)",background:"none",border:"none",cursor:"pointer",padding:0,zIndex:10}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",transform:sel===p.id?"scale(1.25)":"scale(1)",transition:"transform .2s"}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:tCol[p.type]||C.emerald,display:"flex",alignItems:"center",justifyContent:"center",border:"2.5px solid #fff",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
                  <Ic n={p.type==="Reciclagem"?"recycle":"bolt"} s={12} c="#fff"/>
                </div>
                <div style={{width:2,height:7,background:tCol[p.type]||C.emerald}}/>
                {sel===p.id&&(
                  <div style={{position:"absolute",bottom:"calc(100% + 4px)",left:"50%",transform:"translateX(-50%)",width:156,background:"#fff",borderRadius:11,padding:11,boxShadow:"0 8px 24px rgba(0,0,0,.12)",border:"1px solid #F3F4F6",textAlign:"left",pointerEvents:"none"}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#111827"}}>{p.name}</div>
                    <div style={{fontSize:11,color:"#9CA3AF",margin:"2px 0 5px"}}>{p.city}</div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,fontWeight:700,color:tCol[p.type]}}>{p.type}</span>
                      <span style={{fontSize:11,color:"#9CA3AF"}}>⭐ {p.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
          <div style={{position:"absolute",bottom:12,left:12,background:"rgba(255,255,255,.92)",backdropFilter:"blur(8px)",borderRadius:11,padding:"9px 13px"}}>
            <div style={{fontSize:11,fontWeight:800,color:"#374151",marginBottom:5}}>Legenda</div>
            {Object.entries(tCol).map(([k,c])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#4B5563",marginBottom:2}}>
                <span style={{width:9,height:9,borderRadius:"50%",background:c,flexShrink:0}}/>{k}
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,overflowY:"auto"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#374151",marginBottom:3}}>{partners.length} parceiros encontrados</div>
          {partners.map(p=>(
            <div key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)}
              style={{background:"#fff",borderRadius:11,border:`1.5px solid ${sel===p.id?`${C.emerald}40`:"#F3F4F6"}`,padding:12,cursor:"pointer"}}>
              <div style={{display:"flex",gap:9}}>
                <div style={{width:30,height:30,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${tCol[p.type]||C.emerald}15`,flexShrink:0}}>
                  <Ic n={p.type==="Reciclagem"?"recycle":"bolt"} s={13} c={tCol[p.type]||C.emerald}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#111827",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#9CA3AF",margin:"1px 0 4px"}}>{p.city}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:10,padding:"1px 6px",borderRadius:99,fontWeight:700,background:`${tCol[p.type]}15`,color:tCol[p.type]}}>{p.type}</span>
                    <span style={{fontSize:10,color:"#D1D5DB"}}>{p.dist}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
const NotificationsScreen = () => {
  const [notes,setNotes] = useState([
    {id:1,type:"warn",title:"Degradação Detectada",msg:"Bateria #B-012 atingiu 58% de SOH. Avalie descarte.",time:"há 2h",read:false},
    {id:2,type:"info",title:"Nova Proposta",msg:"GreenPower ofereceu R$ 3.200 pela bateria #B-007.",time:"há 4h",read:false},
    {id:3,type:"eco",title:"Meta Atingida!",msg:"Você evitou 100kg de CO₂ este mês. Continue assim!",time:"há 6h",read:true},
    {id:4,type:"info",title:"Análise Concluída",msg:"Bateria #B-009: SOH 82% — Apta para uso automotivo.",time:"há 1d",read:true},
    {id:5,type:"warn",title:"Ciclos Elevados",msg:"Bateria #B-003 atingiu 1.800 ciclos. Recomenda-se avaliação.",time:"há 2d",read:true},
  ]);
  const nc={warn:C.warning,info:C.azure,eco:C.emerald};
  const ni={warn:"bell",info:"trending",eco:"leaf"};
  const unread=notes.filter(n=>!n.read).length;
  return (
    <Shell title="Notificações">
      <div style={{maxWidth:580,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={{fontSize:13,color:"#9CA3AF"}}>{unread} não lidas</span>
          {unread>0&&<button onClick={()=>setNotes(n=>n.map(x=>({...x,read:true})))} style={{background:"none",border:"none",cursor:"pointer",color:C.emerald,fontSize:13,fontWeight:700}}>Marcar todas como lidas</button>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {notes.map(n=>(
            <div key={n.id} onClick={()=>setNotes(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}
              style={{background:"#fff",borderRadius:13,border:`${n.read?"1px":"2px"} solid ${n.read?"#F3F4F6":nc[n.type]+"40"}`,padding:14,cursor:"pointer",opacity:n.read?.85:1}}>
              <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:`${nc[n.type]}15`,flexShrink:0}}><Ic n={ni[n.type]} s={15} c={nc[n.type]}/></div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                    <span style={{fontSize:14,fontWeight:800,color:n.read?"#6B7280":"#111827"}}>{n.title}</span>
                    <span style={{fontSize:11,color:"#D1D5DB",flexShrink:0}}>{n.time}</span>
                  </div>
                  <p style={{fontSize:13,color:"#6B7280",margin:"4px 0 0",lineHeight:1.6}}>{n.msg}</p>
                </div>
                {!n.read&&<span style={{width:7,height:7,borderRadius:"50%",background:nc[n.type],flexShrink:0,marginTop:6}}/>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════════════════
const ProfileScreen = () => {
  const [,nav] = usePage();
  const [tab,setTab] = useState("analyses");
  const analyses=[{id:"#B-001",model:"BYD Blade 100kWh",soh:92,result:"Automotivo",date:"12/05/2025"},{id:"#B-002",model:"CATL LFP 75kWh",soh:74,result:"Segunda vida",date:"08/05/2025"},{id:"#B-003",model:"LG Chem 60kWh",soh:58,result:"Reciclagem",date:"01/05/2025"},{id:"#B-004",model:"Panasonic 82kWh",soh:85,result:"Automotivo",date:"25/04/2025"}];
  const rCol={"Automotivo":C.emerald,"Segunda vida":C.azure,"Reciclagem":C.danger};
  const inp={width:"100%",padding:"9px 13px",borderRadius:9,border:"1px solid #E5E7EB",fontSize:14,background:"#F9FAFB",outline:"none",boxSizing:"border-box"};
  return (
    <Shell title="Perfil">
      <div style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:"#fff",borderRadius:18,border:"1px solid #F3F4F6",padding:22}}>
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{width:56,height:56,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontSize:18,fontWeight:900}}>JS</div>
            <div style={{flex:1}}>
              <div style={{fontSize:19,fontWeight:900,color:"#111827"}}>João Silva</div>
              <div style={{fontSize:13,color:"#9CA3AF"}}>joao.silva@empresa.com</div>
              <div style={{display:"flex",gap:7,marginTop:6}}>
                <span style={{fontSize:11,padding:"2px 9px",borderRadius:99,background:"#ECFDF5",color:"#059669",fontWeight:700}}>✓ Verificado</span>
                <span style={{fontSize:11,color:"#D1D5DB"}}>Membro desde Jan 2024</span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,textAlign:"center"}}>
              {[["24","Análises"],["R$18k","Gerados"],["A+","ESG"]].map(([v,l])=>(
                <div key={l}><div style={{fontWeight:900,color:"#111827",fontSize:17}}>{v}</div><div style={{fontSize:11,color:"#9CA3AF"}}>{l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:18,border:"1px solid #F3F4F6",overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:"1px solid #F3F4F6"}}>
            {[{id:"analyses",l:"Análises"},{id:"financial",l:"Financeiro"},{id:"environmental",l:"Ambiental"},{id:"settings",l:"Configurações"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"13px 0",fontSize:13,fontWeight:700,border:"none",background:"transparent",cursor:"pointer",color:tab===t.id?C.emerald:"#9CA3AF",borderBottom:`2px solid ${tab===t.id?C.emerald:"transparent"}`}}>{t.l}</button>
            ))}
          </div>
          <div style={{padding:18}}>
            {tab==="analyses"&&(
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {analyses.map(a=>(
                  <div key={a.id} onClick={()=>nav("analysis")} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:9,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <span style={{fontFamily:"monospace",fontSize:11,color:"#D1D5DB",width:56}}>{a.id}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:"#1F2937"}}>{a.model}</span>
                    <span style={{fontSize:13,fontWeight:800,color:a.soh>=80?C.emerald:a.soh>=60?C.warning:C.danger}}>{a.soh}%</span>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:99,fontWeight:700,background:`${rCol[a.result]}15`,color:rCol[a.result]}}>{a.result}</span>
                    <span style={{fontSize:11,color:"#D1D5DB"}}>{a.date}</span>
                  </div>
                ))}
              </div>
            )}
            {tab==="financial"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                {[{l:"Total Gerado",v:"R$ 18.200",c:C.emerald},{l:"Baterias Vendidas",v:"8",c:C.azure},{l:"Ticket Médio",v:"R$ 2.275",c:C.warning},{l:"Em negociação",v:"R$ 6.800",c:C.purple}].map(m=>(
                  <div key={m.l} style={{padding:14,borderRadius:11,background:`${m.c}08`,border:`1px solid ${m.c}20`}}>
                    <div style={{fontSize:21,fontWeight:900,color:m.c}}>{m.v}</div>
                    <div style={{fontSize:12,color:"#6B7280",marginTop:3}}>{m.l}</div>
                  </div>
                ))}
              </div>
            )}
            {tab==="environmental"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                {[{l:"CO₂ Evitado",v:"3,4t",c:C.green,i:"leaf"},{l:"Energia Reaprov.",v:"48 MWh",c:C.azure,i:"bolt"},{l:"Resíduos Evitados",v:"520kg",c:C.purple,i:"recycle"},{l:"Score ESG",v:"A+",c:C.emerald,i:"trending"}].map(m=>(
                  <div key={m.l} style={{padding:14,borderRadius:11,background:`${m.c}08`,border:`1px solid ${m.c}20`}}>
                    <Ic n={m.i} s={16} c={m.c}/><div style={{fontSize:21,fontWeight:900,color:m.c,margin:"7px 0 4px"}}>{m.v}</div>
                    <div style={{fontSize:12,color:"#6B7280"}}>{m.l}</div>
                  </div>
                ))}
              </div>
            )}
            {tab==="settings"&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[["Nome completo","text","João Silva"],["Email","email","joao@empresa.com"],["Empresa","text","TechBR Soluções"],["Telefone","tel","(81) 99999-0000"]].map(([l,t,v])=>(
                  <div key={l}>
                    <label style={{fontSize:12,fontWeight:700,color:"#4B5563",display:"block",marginBottom:5}}>{l}</label>
                    <input type={t} defaultValue={v} style={inp}/>
                  </div>
                ))}
                <button style={{alignSelf:"flex-start",padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#00C896,#0A84FF)",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>Salvar Alterações</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [page] = usePage();
  const map = {
    onboarding: <OnboardingScreen/>,
    landing: <LandingScreen/>,
    register: <RegisterScreen/>,
    dashboard: <DashboardScreen/>,
    "battery-register": <BatteryRegisterScreen/>,
    analysis: <AnalysisScreen/>,
    marketplace: <MarketplaceScreen/>,
    impact: <ImpactScreen/>,
    map: <MapScreen/>,
    notifications: <NotificationsScreen/>,
    profile: <ProfileScreen/>,
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%;font-family:'DM Sans',system-ui,sans-serif}
        @keyframes pulse{0%,100%{opacity:.07}50%{opacity:.18}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:99px}
      `}</style>
      {map[page] ?? <LandingScreen/>}
    </>
  );
}


