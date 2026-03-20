import { useState, useEffect, useRef } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  pageBg:"#EEF4FB",gradStart:"#EFF6FF",gradEnd:"#DCF0FB",
  white:"#FFFFFF",card:"#FFFFFF",sidebarBg:"#FAFCFF",
  accent:"#4BA3E3",accentDark:"#2E86C9",accentLight:"#EAF4FD",
  textPrimary:"#0D1B2A",textSecondary:"#6B8299",textMuted:"#9BB0C4",
  border:"#E2EDF7",borderLight:"#EEF4FB",
  online:"#34C759",notification:"#FF3B30",hover:"#F5FAFF",warning:"#F59E0B",
};
const F = "'Plus Jakarta Sans','DM Sans',sans-serif";
const COLORS = ["#4BA3E3","#F472B6","#34D399","#FBBF24","#A78BFA","#FB923C","#60A5FA","#F87171"];
const ROLES = ["Product Manager","Designer","Engineer","Marketing","Community Lead","Founder","Student","Other"];
const INTERESTS = ["Technology","Design","Startups","Community Building","Education","Health & Wellness","Arts & Culture","Finance","Social Impact","Sports"];

// ── Shared Components ─────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const initials = (user?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:user?.color||C.accent, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.33, fontFamily:F, position:"relative", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
      {initials}
      {user?.online !== undefined && <div style={{ position:"absolute", bottom:1, right:1, width:Math.max(size*0.26,7), height:Math.max(size*0.26,7), borderRadius:"50%", background:user.online?C.online:"#CBD5E1", border:"2px solid white" }} />}
    </div>
  );
}

function Btn({ children, onClick, variant="primary", small, disabled, fullWidth, icon }) {
  const s = {
    primary:{ background:C.accent, color:"#fff", border:"none", boxShadow:"0 4px 14px rgba(75,163,227,0.3)" },
    outline:{ background:C.white, color:C.textPrimary, border:`1.5px solid ${C.border}` },
    ghost:{ background:C.accentLight, color:C.accentDark, border:"none" },
    danger:{ background:"#FEE2E2", color:"#DC2626", border:"none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...s[variant], borderRadius:999, cursor:disabled?"not-allowed":"pointer", fontFamily:F, fontWeight:700, fontSize:small?12:14, padding:small?"8px 18px":"13px 28px", opacity:disabled?0.5:1, width:fullWidth?"100%":"auto", display:"inline-flex", alignItems:"center", gap:6, transition:"all 0.15s", whiteSpace:"nowrap" }}>
      {icon && <span style={{ fontSize:small?14:16 }}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(13,27,42,0.05)", cursor:onClick?"pointer":"default", transition:onClick?"transform 0.15s,box-shadow 0.15s":"none", ...style }}
      onMouseEnter={onClick ? e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(13,27,42,0.1)"; } : undefined}
      onMouseLeave={onClick ? e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 16px rgba(13,27,42,0.05)"; } : undefined}
    >{children}</div>
  );
}

function Field({ label, type="text", value, onChange, placeholder, error, hint }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <label style={{ display:"block", fontFamily:F, fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:6 }}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${error?C.notification:C.border}`, borderRadius:12, padding:"12px 16px", fontFamily:F, fontSize:14, color:C.textPrimary, background:C.white, outline:"none" }}
        onFocus={e=>e.target.style.borderColor=C.accent}
        onBlur={e=>e.target.style.borderColor=error?C.notification:C.border} />
      {error && <p style={{ fontFamily:F, fontSize:12, color:C.notification, margin:"4px 0 0" }}>{error}</p>}
      {hint && !error && <p style={{ fontFamily:F, fontSize:12, color:C.textMuted, margin:"4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label:"8+ characters", pass:password.length >= 8 },
    { label:"Uppercase", pass:/[A-Z]/.test(password) },
    { label:"Number", pass:/[0-9]/.test(password) },
    { label:"Special char", pass:/[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["#E2EDF7", C.notification, C.warning, C.accent, C.online];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginBottom:16, marginTop:-10 }}>
      <div style={{ display:"flex", gap:4, marginBottom:6 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:4, borderRadius:4, background:i<=score?colors[score]:C.border, transition:"background 0.3s" }} />)}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {checks.map(c => <span key={c.label} style={{ fontFamily:F, fontSize:11, color:c.pass?C.online:C.textMuted }}>{c.pass?"✓":"○"} {c.label}</span>)}
        </div>
        <span style={{ fontFamily:F, fontSize:11, fontWeight:700, color:colors[score] }}>{labels[score]}</span>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action, onAction }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, padding:"60px 40px", textAlign:"center" }}>
      <div style={{ fontSize:52, marginBottom:20, opacity:0.5 }}>{icon}</div>
      <h3 style={{ fontFamily:F, fontWeight:800, fontSize:20, color:C.textPrimary, margin:"0 0 8px", letterSpacing:-0.5 }}>{title}</h3>
      <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, margin:"0 0 24px", lineHeight:1.6, maxWidth:340 }}>{subtitle}</p>
      {action && <Btn onClick={onAction} icon="+">{action}</Btn>}
    </div>
  );
}

function PolicyPage({ type, onBack, onAccept }) {
  return (
    <div style={{ minHeight:"100vh", background:C.pageBg, fontFamily:F }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", fontFamily:F, fontWeight:600, fontSize:14, color:C.accent, cursor:"pointer", marginBottom:24 }}>← Back</button>
        <Card style={{ padding:40 }}>
          <h1 style={{ fontFamily:F, fontWeight:800, fontSize:28, color:C.textPrimary, margin:"0 0 6px" }}>{type==="privacy"?"Privacy Policy":"Terms of Service"}</h1>
          <p style={{ fontFamily:F, fontSize:13, color:C.textMuted, margin:"0 0 32px" }}>Last updated: March 2026</p>
          {type==="privacy" ? (
            <>
              {[["What we collect","We collect your name, email, and content you create on Bridges — messages, posts, and profile info. We do not sell your data to any third party."],["How we protect your data","All data is encrypted in transit using TLS 1.3 and stored with AES-256 encryption at rest. Only you and your intended recipients can read your messages."],["Data retention","You can delete your account and all associated data at any time from Settings. We permanently remove your data within 30 days of a deletion request."],["Your rights","You have the right to access, correct, or delete your personal data. Contact us at privacy@buildbridges.app."],["Cookies","We use essential cookies only for authentication and session management. No tracking or advertising cookies."]].map(([t,d]) => (
                <div key={t} style={{ marginBottom:24 }}>
                  <h3 style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, margin:"0 0 8px" }}>{t}</h3>
                  <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, lineHeight:1.7, margin:0 }}>{d}</p>
                </div>
              ))}
            </>
          ) : (
            <>
              {[["Acceptance","By creating a Bridges account, you agree to these Terms of Service."],["Your account","You are responsible for keeping your credentials secure. You must be at least 13 years old to use Bridges."],["Acceptable use","You agree not to use Bridges to harass, spam, or harm others. We may suspend accounts that violate these terms."],["Your content","You own the content you create on Bridges. We do not claim ownership of your content."],["Changes","We may update these terms and will notify you by email. Continued use constitutes acceptance."]].map(([t,d]) => (
                <div key={t} style={{ marginBottom:24 }}>
                  <h3 style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, margin:"0 0 8px" }}>{t}</h3>
                  <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, lineHeight:1.7, margin:0 }}>{d}</p>
                </div>
              ))}
            </>
          )}
          <Btn onClick={onAccept}>Accept & Return</Btn>
        </Card>
      </div>
    </div>
  );
}

// ── SCREEN 1: Landing ─────────────────────────────────────────────────────────
function LandingScreen({ onSignUp, onLogin }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.gradStart} 0%,${C.gradEnd} 55%,${C.pageBg} 100%)`, fontFamily:F }}>
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 48px", background:"rgba(255,255,255,0.85)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🌉</div>
          <span style={{ fontFamily:F, fontWeight:800, fontSize:20, color:C.textPrimary, letterSpacing:-0.5 }}>Bridges</span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={onLogin} style={{ background:"none", border:"none", fontFamily:F, fontWeight:600, fontSize:14, color:C.textSecondary, cursor:"pointer", padding:"8px 16px" }}>Sign in</button>
          <Btn onClick={onSignUp} small>Get Started Free →</Btn>
        </div>
      </nav>

      <div style={{ textAlign:"center", padding:"90px 48px 70px", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(28px)", transition:"all 0.65s ease" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"6px 16px", fontFamily:F, fontSize:12, fontWeight:700, marginBottom:28, letterSpacing:0.5 }}>
          🚀 NOW IN BETA
        </div>
        <h1 style={{ fontFamily:F, fontWeight:800, fontSize:72, color:C.textPrimary, letterSpacing:-3, margin:"0 0 20px", lineHeight:1.0 }}>Bridges</h1>
        <p style={{ fontFamily:F, fontSize:22, color:C.textSecondary, margin:"0 0 14px", fontWeight:400 }}>Connect everyone. Seamlessly.</p>
        <p style={{ fontFamily:F, fontSize:16, color:C.textMuted, margin:"0 0 48px", maxWidth:500, marginLeft:"auto", marginRight:"auto", lineHeight:1.75 }}>
          The communication platform that brings teams, families, and communities together — with real-time messaging, group collaboration, and crystal-clear video calls.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn onClick={onSignUp}>Create Free Account →</Btn>
          <Btn onClick={onLogin} variant="outline">Sign in to existing account</Btn>
        </div>
        <p style={{ fontFamily:F, fontSize:12, color:C.textMuted, marginTop:18 }}>No credit card required · Free to get started · Your data stays yours</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, padding:"0 48px 80px", maxWidth:1080, margin:"0 auto" }}>
        {[
          { icon:"💬", title:"Real-time Messaging", desc:"Chat with anyone, instantly. Direct messages and group chats in one place." },
          { icon:"🌐", title:"Communities", desc:"Create and join groups around any topic, team, or interest." },
          { icon:"📁", title:"Project Collaboration", desc:"Tasks, progress tracking, and file sharing — all in one workspace." },
          { icon:"📹", title:"Video Calls", desc:"Crystal-clear video and audio calls directly in your browser." },
        ].map((f, i) => (
          <div key={f.title} style={{ background:"rgba(255,255,255,0.72)", borderRadius:20, padding:24, border:`1px solid ${C.border}`, backdropFilter:"blur(8px)", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(18px)", transition:`all 0.5s ease ${0.1+i*0.1}s` }}>
            <div style={{ fontSize:30, marginBottom:12 }}>{f.icon}</div>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary, marginBottom:6 }}>{f.title}</div>
            <div style={{ fontFamily:F, fontSize:13, color:C.textSecondary, lineHeight:1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop:`1px solid ${C.border}`, background:"rgba(255,255,255,0.6)", padding:"18px 48px", display:"flex", justifyContent:"center", gap:36, flexWrap:"wrap" }}>
        {["🔒 End-to-end encrypted","🛡️ GDPR compliant","✅ We never sell your data","🔐 AES-256 at rest"].map(b => (
          <span key={b} style={{ fontFamily:F, fontSize:13, color:C.textSecondary, fontWeight:600 }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

// ── SCREEN 2: Sign Up ─────────────────────────────────────────────────────────
function SignUpScreen({ onSignUp, onGoLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPolicy, setShowPolicy] = useState(null);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (password.length < 8) e.password = "Minimum 8 characters";
    if (!/[A-Z]/.test(password)) e.password = "Must include an uppercase letter";
    if (!/[0-9]/.test(password)) e.password = "Must include a number";
    if (!agreed) e.agreed = "You must accept the terms to continue";
    setErrors(e);
    return !Object.keys(e).length;
  };

  if (showPolicy) return <PolicyPage type={showPolicy} onBack={() => setShowPolicy(null)} onAccept={() => { setAgreed(true); setShowPolicy(null); }} />;

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:F, background:C.pageBg }}>
      {/* Left */}
      <div style={{ width:"44%", background:`linear-gradient(155deg,${C.gradStart},${C.gradEnd})`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"60px 48px", borderRight:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(75,163,227,0.07)" }} />
        <div style={{ position:"relative", textAlign:"center", maxWidth:340 }}>
          <div style={{ fontFamily:F, fontWeight:800, fontSize:44, color:C.textPrimary, marginBottom:10, letterSpacing:-2 }}>Bridges</div>
          <p style={{ fontFamily:F, fontSize:16, color:C.textSecondary, margin:"0 0 40px", lineHeight:1.65 }}>Join thousands of people building real connections.</p>
          <div style={{ background:"rgba(255,255,255,0.82)", borderRadius:16, padding:22, border:`1px solid ${C.border}`, textAlign:"left" }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:14, color:C.textPrimary, marginBottom:14 }}>🔒 Your data is always safe</div>
            {["End-to-end encryption on all messages","We never sell your personal data","GDPR & CCPA compliant","Delete your account anytime"].map(item => (
              <div key={item} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                <span style={{ color:C.online, fontSize:14, fontWeight:700 }}>✓</span>
                <span style={{ fontFamily:F, fontSize:13, color:C.textSecondary }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <h2 style={{ fontFamily:F, fontWeight:800, fontSize:28, color:C.textPrimary, margin:"0 0 6px", letterSpacing:-0.8 }}>Create your account</h2>
          <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, margin:"0 0 28px" }}>Free to start. No credit card needed.</p>

          <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" error={errors.name} />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a strong password" error={errors.password} />
          <PasswordStrength password={password} />

          <div style={{ marginBottom:20 }}>
            <div onClick={() => setAgreed(!agreed)} style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${errors.agreed?C.notification:agreed?C.accent:C.border}`, background:agreed?C.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all 0.15s" }}>
                {agreed && <span style={{ color:"white", fontSize:12, fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ fontFamily:F, fontSize:13, color:C.textSecondary, lineHeight:1.55 }}>
                I agree to the{" "}
                <span onClick={e => { e.stopPropagation(); setShowPolicy("terms"); }} style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Terms of Service</span>
                {" "}and{" "}
                <span onClick={e => { e.stopPropagation(); setShowPolicy("privacy"); }} style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Privacy Policy</span>
              </span>
            </div>
            {errors.agreed && <p style={{ fontFamily:F, fontSize:12, color:C.notification, margin:"6px 0 0" }}>{errors.agreed}</p>}
          </div>

          <div style={{ background:C.accentLight, borderRadius:12, padding:"12px 16px", marginBottom:22, display:"flex", alignItems:"center", gap:10, border:`1px solid ${C.border}` }}>
            <span style={{ fontSize:18 }}>🔐</span>
            <span style={{ fontFamily:F, fontSize:12, color:C.accentDark, lineHeight:1.5 }}>Your data is encrypted in transit and at rest using AES-256 encryption.</span>
          </div>

          <div style={{ marginBottom:18 }}><Btn onClick={() => validate() && onSignUp({ name, email })} fullWidth>Create Account →</Btn></div>
          <p style={{ textAlign:"center", fontFamily:F, fontSize:14, color:C.textSecondary }}>Already have an account? <span onClick={onGoLogin} style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Sign in</span></p>

          <div style={{ margin:"20px 0", display:"flex", alignItems:"center", gap:12 }}><div style={{ flex:1, height:1, background:C.border }} /><span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>or</span><div style={{ flex:1, height:1, background:C.border }} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {["🔵  Google","⚫  Apple"].map(p => <button key={p} onClick={() => onSignUp({ name:"Demo User", email:"demo@bridges.app" })} style={{ border:`1.5px solid ${C.border}`, borderRadius:999, padding:"12px", background:C.white, fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary, cursor:"pointer" }}>{p}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 3: Login ───────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onGoSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const validate = () => { const e = {}; if (!email.includes("@")) e.email = "Invalid email"; if (!password) e.password = "Required"; setErrors(e); return !Object.keys(e).length; };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:F, background:C.pageBg }}>
      <div style={{ width:"44%", background:`linear-gradient(155deg,${C.gradStart},${C.gradEnd})`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"60px 48px", borderRight:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(75,163,227,0.07)" }} />
        <div style={{ position:"relative", textAlign:"center", maxWidth:340 }}>
          <div style={{ fontFamily:F, fontWeight:800, fontSize:44, color:C.textPrimary, marginBottom:10, letterSpacing:-2 }}>Bridges</div>
          <p style={{ fontFamily:F, fontSize:16, color:C.textSecondary, margin:"0 0 40px", lineHeight:1.65 }}>Your communities and connections are waiting for you.</p>
          <div style={{ background:"rgba(255,255,255,0.82)", borderRadius:12, padding:"16px 20px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:24 }}>🔒</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:C.textPrimary }}>Secure login</div>
              <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, marginTop:2 }}>Your session is encrypted end-to-end</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <h2 style={{ fontFamily:F, fontWeight:800, fontSize:28, color:C.textPrimary, margin:"0 0 6px", letterSpacing:-0.8 }}>Welcome back 👋</h2>
          <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, margin:"0 0 28px" }}>Sign in to your Bridges account.</p>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" error={errors.password} />
          <div style={{ textAlign:"right", marginBottom:20, marginTop:-10 }}><span style={{ fontFamily:F, fontSize:13, color:C.accent, cursor:"pointer", fontWeight:600 }}>Forgot password?</span></div>
          <div style={{ marginBottom:18 }}><Btn onClick={() => validate() && onLogin()} fullWidth>Sign In →</Btn></div>
          <p style={{ textAlign:"center", fontFamily:F, fontSize:14, color:C.textSecondary }}>No account? <span onClick={onGoSignUp} style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Sign up free</span></p>
          <div style={{ margin:"20px 0", display:"flex", alignItems:"center", gap:12 }}><div style={{ flex:1, height:1, background:C.border }} /><span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>or</span><div style={{ flex:1, height:1, background:C.border }} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {["🔵  Google","⚫  Apple"].map(p => <button key={p} onClick={onLogin} style={{ border:`1.5px solid ${C.border}`, borderRadius:999, padding:"12px", background:C.white, fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary, cursor:"pointer" }}>{p}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 4: Onboarding ──────────────────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name:user?.name||"", role:"", bio:"", color:COLORS[0], interests:[], useCase:"" });
  const initials = profile.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  const toggle = i => setProfile(p => ({ ...p, interests:p.interests.includes(i)?p.interests.filter(x=>x!==i):[...p.interests,i] }));

  const useCases = [
    { id:"team", icon:"👥", label:"My team or workplace" },
    { id:"community", icon:"🌐", label:"A community or group" },
    { id:"family", icon:"🏠", label:"Family and friends" },
    { id:"network", icon:"🤝", label:"Professional networking" },
    { id:"all", icon:"✨", label:"All of the above" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.gradStart},${C.gradEnd})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, padding:"40px 20px" }}>
      <div style={{ width:"100%", maxWidth:600, background:C.white, borderRadius:24, overflow:"hidden", boxShadow:"0 20px 60px rgba(13,27,42,0.12)", border:`1px solid ${C.border}` }}>
        <div style={{ padding:"28px 40px 0" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontFamily:F, fontSize:12, fontWeight:700, color:C.textMuted, letterSpacing:0.8 }}>STEP {step} OF 4</span>
            {step > 1 && <button onClick={() => setStep(s=>s-1)} style={{ background:"none", border:"none", fontFamily:F, fontSize:13, color:C.textSecondary, cursor:"pointer", fontWeight:600 }}>← Back</button>}
          </div>
          <div style={{ background:C.border, borderRadius:4, height:4, marginBottom:32, overflow:"hidden" }}>
            <div style={{ width:`${((step-1)/4)*100}%`, height:"100%", background:C.accent, borderRadius:4, transition:"width 0.4s ease" }} />
          </div>
        </div>

        <div style={{ padding:"0 40px 44px" }}>
          {step === 1 && <>
            <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 6px", letterSpacing:-0.5 }}>Set up your profile</h2>
            <p style={{ color:C.textSecondary, fontSize:14, margin:"0 0 28px" }}>This is how others will see you on Bridges.</p>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:profile.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, margin:"0 auto 14px", boxShadow:"0 4px 20px rgba(0,0,0,0.15)", transition:"background 0.2s" }}>{initials}</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                {COLORS.map(c => <div key={c} onClick={() => setProfile(p=>({...p,color:c}))} style={{ width:26, height:26, borderRadius:"50%", background:c, cursor:"pointer", border:profile.color===c?"3px solid #0D1B2A":"3px solid transparent", transition:"border 0.15s" }} />)}
              </div>
            </div>
            <Field label="Full Name" value={profile.name} onChange={v=>setProfile(p=>({...p,name:v}))} placeholder="Your full name" />
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:8, fontFamily:F }}>Your role</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {ROLES.map(r => <div key={r} onClick={() => setProfile(p=>({...p,role:r}))} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${profile.role===r?C.accent:C.border}`, background:profile.role===r?C.accentLight:C.white, color:profile.role===r?C.accentDark:C.textSecondary, fontFamily:F, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>{r}</div>)}
              </div>
            </div>
            <Btn onClick={() => setStep(2)} disabled={!profile.name||!profile.role} fullWidth>Continue →</Btn>
          </>}

          {step === 2 && <>
            <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 6px", letterSpacing:-0.5 }}>How will you use Bridges?</h2>
            <p style={{ color:C.textSecondary, fontSize:14, margin:"0 0 24px" }}>We'll tailor your experience based on this.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
              {useCases.map(u => <div key={u.id} onClick={() => setProfile(p=>({...p,useCase:u.id}))} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:12, border:`1.5px solid ${profile.useCase===u.id?C.accent:C.border}`, background:profile.useCase===u.id?C.accentLight:C.white, cursor:"pointer", transition:"all 0.15s" }}><span style={{ fontSize:22 }}>{u.icon}</span><span style={{ fontFamily:F, fontWeight:600, fontSize:15, color:profile.useCase===u.id?C.accentDark:C.textPrimary }}>{u.label}</span>{profile.useCase===u.id&&<span style={{ marginLeft:"auto", color:C.accent, fontWeight:700 }}>✓</span>}</div>)}
            </div>
            <Btn onClick={() => setStep(3)} disabled={!profile.useCase} fullWidth>Continue →</Btn>
          </>}

          {step === 3 && <>
            <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 6px", letterSpacing:-0.5 }}>What are you into?</h2>
            <p style={{ color:C.textSecondary, fontSize:14, margin:"0 0 22px" }}>Pick interests to find the right communities.</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:32 }}>
              {INTERESTS.map(i => <div key={i} onClick={() => toggle(i)} style={{ padding:"9px 18px", borderRadius:999, border:`1.5px solid ${profile.interests.includes(i)?C.accent:C.border}`, background:profile.interests.includes(i)?C.accentLight:C.white, color:profile.interests.includes(i)?C.accentDark:C.textSecondary, fontFamily:F, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>{profile.interests.includes(i)?"✓ ":""}{i}</div>)}
            </div>
            <Btn onClick={() => setStep(4)} disabled={!profile.interests.length} fullWidth>Continue →</Btn>
          </>}

          {step === 4 && (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:profile.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, margin:"0 auto 20px", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>{initials}</div>
              <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 10px", letterSpacing:-0.5 }}>You're all set, {profile.name.split(" ")[0]}!</h2>
              <p style={{ color:C.textSecondary, fontSize:15, margin:"0 0 28px", lineHeight:1.65 }}>Your profile is ready. Time to build some bridges.</p>
              <div style={{ background:C.pageBg, borderRadius:16, padding:20, marginBottom:28, textAlign:"left", border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                  <span style={{ background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:700, fontFamily:F }}>{profile.role}</span>
                  {profile.interests.slice(0,3).map(i => <span key={i} style={{ background:C.borderLight, color:C.textSecondary, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:600, fontFamily:F }}>{i}</span>)}
                  {profile.interests.length > 3 && <span style={{ background:C.borderLight, color:C.textSecondary, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:600, fontFamily:F }}>+{profile.interests.length-3} more</span>}
                </div>
                <p style={{ fontFamily:F, fontSize:13, color:C.textSecondary, margin:0, lineHeight:1.5 }}>🔒 Your data is encrypted and only visible to you.</p>
              </div>
              <Btn onClick={() => onComplete(profile)} fullWidth>Enter Bridges 🌉</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 5: Feature Tour ────────────────────────────────────────────────────
function FeatureTour({ user, onFinish }) {
  const [step, setStep] = useState(0);
  const firstName = user?.name?.split(" ")[0] || "there";
  const slides = [
    { icon:"🌉", title:`Welcome, ${firstName}!`, desc:"You're in. Here's a 30-second look at everything Bridges can do.", color:C.accent, features:null },
    { icon:"💬", title:"Messages", desc:"Send real-time messages to anyone. Direct chats and group conversations all in one place.", color:"#34D399", features:["Direct messages to anyone","Group chats with your team","Video and audio calls built in"] },
    { icon:"🌐", title:"Communities", desc:"Create or join communities around any topic. Each has a board, live chat, events, and shared files.", color:"#A78BFA", features:["Post to the group board","Real-time community chat","Invite members and manage permissions"] },
    { icon:"📁", title:"Projects", desc:"Stay organized and keep your team aligned. Create projects, assign tasks, and track progress together.", color:"#F472B6", features:["Task lists with checkboxes","Live progress tracking","Shared project workspace"] },
    { icon:"🔒", title:"Your privacy, always", desc:"Everything on Bridges is private and encrypted. You are always in full control of your data.", color:C.textPrimary, features:["AES-256 encryption at rest","TLS 1.3 in transit","Delete your data anytime from Settings"] },
  ];
  const current = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.gradStart},${C.gradEnd})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, padding:"40px 20px" }}>
      <div style={{ width:"100%", maxWidth:540 }}>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:28 }}>
          {slides.map((_,i) => <div key={i} onClick={() => setStep(i)} style={{ width:i===step?28:8, height:8, borderRadius:4, background:i===step?C.accent:C.border, cursor:"pointer", transition:"all 0.3s" }} />)}
        </div>
        <div style={{ background:C.white, borderRadius:24, padding:"48px 48px 44px", boxShadow:"0 20px 60px rgba(13,27,42,0.12)", border:`1px solid ${C.border}`, textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:24, background:`${current.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 24px" }}>{current.icon}</div>
          <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 12px", letterSpacing:-0.5 }}>{current.title}</h2>
          <p style={{ fontFamily:F, fontSize:15, color:C.textSecondary, lineHeight:1.72, margin:"0 0 28px" }}>{current.desc}</p>
          {current.features && (
            <div style={{ background:C.pageBg, borderRadius:14, padding:"16px 22px", marginBottom:32, textAlign:"left" }}>
              {current.features.map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0" }}>
                  <span style={{ color:current.color, fontSize:15, fontWeight:700 }}>✓</span>
                  <span style={{ fontFamily:F, fontSize:14, color:C.textPrimary }}>{f}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            {isLast ? (
              <Btn onClick={onFinish}>Start using Bridges →</Btn>
            ) : (
              <>
                <Btn onClick={() => setStep(s=>s+1)}>Next →</Btn>
                <Btn onClick={onFinish} variant="ghost">Skip tour</Btn>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP SHELL ────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", icon:"⊞", label:"Dashboard" },
  { id:"messages",  icon:"💬", label:"Messages" },
  { id:"community", icon:"🌐", label:"Community" },
  { id:"projects",  icon:"📁", label:"Projects" },
  { id:"profile",   icon:"👤", label:"Profile" },
  { id:"settings",  icon:"⚙️", label:"Settings" },
];

function Sidebar({ active, onNav, onSignOut, user }) {
  const initials = (user?.name||"YO").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ width:240, background:C.sidebarBg, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🌉</div>
          <div>
            <div style={{ fontFamily:F, fontWeight:800, fontSize:18, color:C.textPrimary, letterSpacing:-0.5 }}>Bridges</div>
            <div style={{ fontFamily:F, fontSize:10, color:C.textMuted, fontWeight:600, letterSpacing:0.8 }}>CONNECT · GROW · BUILD</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"12px 10px", flex:1 }}>
        <div style={{ fontFamily:F, fontSize:10, fontWeight:700, color:C.textMuted, letterSpacing:1, padding:"6px 14px 10px", textTransform:"uppercase" }}>Menu</div>
        {NAV.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:"none", cursor:"pointer", background:active===item.id?C.accentLight:"transparent", color:active===item.id?C.accentDark:C.textSecondary, fontFamily:F, fontWeight:active===item.id?700:500, fontSize:14, marginBottom:2, textAlign:"left", transition:"all 0.15s" }}
            onMouseEnter={e => { if (active!==item.id) e.currentTarget.style.background=C.hover; }}
            onMouseLeave={e => { if (active!==item.id) e.currentTarget.style.background="transparent"; }}>
            <span style={{ fontSize:16, width:22, textAlign:"center" }}>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:user?.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:700, flexShrink:0 }}>{initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:C.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name||"You"}</div>
          <div style={{ fontFamily:F, fontSize:11, color:C.online, fontWeight:600 }}>● Online</div>
        </div>
        <span onClick={onSignOut} title="Sign out" style={{ fontSize:16, cursor:"pointer", color:C.textMuted }}>🚪</span>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle }) {
  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
      <div>
        <h1 style={{ margin:0, fontFamily:F, fontWeight:800, fontSize:20, color:C.textPrimary, letterSpacing:-0.5 }}>{title}</h1>
        {subtitle && <p style={{ margin:0, fontFamily:F, fontSize:13, color:C.textSecondary, marginTop:2 }}>{subtitle}</p>}
      </div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ background:C.pageBg, border:`1px solid ${C.border}`, borderRadius:999, padding:"9px 20px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <span style={{ fontSize:13 }}>🔍</span>
          <span style={{ fontFamily:F, fontSize:13, color:C.textMuted }}>Search Bridges...</span>
        </div>
        <span style={{ fontSize:20, cursor:"pointer" }}>🔔</span>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardScreen({ user, onNav, appData }) {
  const firstName = user?.name?.split(" ")[0] || "there";
  const checklist = [
    { icon:"💬", title:"Send your first message", desc:"Reach out and start a conversation.", nav:"messages", done:appData.messages.length > 0 },
    { icon:"🌐", title:"Create a community", desc:"Build a space for your group or team.", nav:"community", done:appData.communities.length > 0 },
    { icon:"📁", title:"Start a project", desc:"Track tasks and collaborate with others.", nav:"projects", done:appData.projects.length > 0 },
    { icon:"👤", title:"Complete your profile", desc:"Add a bio so others know who you are.", nav:"profile", done:!!user?.bio },
  ];
  const doneCount = checklist.filter(s=>s.done).length;

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.pageBg }}>
      <div style={{ background:`linear-gradient(135deg,${C.gradStart},${C.gradEnd})`, padding:"36px 32px", borderBottom:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"rgba(75,163,227,0.07)" }} />
        <div style={{ position:"relative" }}>
          <h2 style={{ margin:"0 0 8px", fontFamily:F, fontWeight:800, fontSize:28, color:C.textPrimary, letterSpacing:-0.5 }}>Welcome to Bridges, {firstName}! 🎉</h2>
          <p style={{ margin:"0 0 22px", fontFamily:F, fontSize:15, color:C.textSecondary, lineHeight:1.65, maxWidth:560 }}>Your account is all set. Complete the checklist below to get the most out of Bridges.</p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:999, height:8, width:180, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(doneCount/checklist.length)*100}%`, background:C.accent, borderRadius:999, transition:"width 0.4s" }} />
            </div>
            <span style={{ fontFamily:F, fontSize:13, fontWeight:700, color:C.textSecondary }}>{doneCount} of {checklist.length} done</span>
          </div>
        </div>
      </div>

      <div style={{ padding:"28px 32px" }}>
        <h3 style={{ fontFamily:F, fontWeight:700, fontSize:17, color:C.textPrimary, margin:"0 0 16px" }}>Get started</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14, marginBottom:36 }}>
          {checklist.map(item => (
            <Card key={item.title} onClick={() => onNav(item.nav)} style={{ padding:20, opacity:item.done?0.6:1, border:item.done?`1px solid ${C.online}40`:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:item.done?"#F0FDF4":C.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{item.done?"✅":item.icon}</div>
                <div>
                  <div style={{ fontFamily:F, fontWeight:700, fontSize:14, color:C.textPrimary, marginBottom:4, textDecoration:item.done?"line-through":"none" }}>{item.title}</div>
                  <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, lineHeight:1.5 }}>{item.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <h3 style={{ fontFamily:F, fontWeight:700, fontSize:17, color:C.textPrimary, margin:"0 0 14px" }}>Your activity</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:32 }}>
          {[["💬","Messages",appData.messages.length],["🌐","Communities",appData.communities.length],["📁","Projects",appData.projects.length],["📅","Events",appData.events.length]].map(([icon,label,val]) => (
            <Card key={label} style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:C.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily:F, fontWeight:800, fontSize:24, color:C.textPrimary, lineHeight:1, letterSpacing:-0.5 }}>{val}</div>
                <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, fontWeight:600, marginTop:2 }}>{label}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card style={{ padding:20, background:"#F0FDF4", border:`1px solid ${C.online}30` }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ fontSize:32, flexShrink:0 }}>🔒</div>
            <div>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:"#166534", marginBottom:4 }}>Your account is secure</div>
              <div style={{ fontFamily:F, fontSize:13, color:"#15803D", lineHeight:1.55 }}>All data encrypted with AES-256. Messages are end-to-end protected. We never sell your data.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────
function MessagesScreen({ appData, onUpdateData }) {
  const [activeConvo, setActiveConvo] = useState(null);
  const [input, setInput] = useState("");
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeConvo, appData.messages]);

  const startConvo = () => {
    if (!newName.trim()) return;
    const contact = { name:newName, color:COLORS[Math.floor(Math.random()*COLORS.length)], online:true };
    const convo = { id:Date.now(), contact, lastMsg:"", time:"Now", messages:[] };
    onUpdateData({ messages:[...appData.messages, convo] });
    setActiveConvo(convo.id); setShowNew(false); setNewName("");
  };

  const send = () => {
    if (!input.trim() || !activeConvo) return;
    const updated = appData.messages.map(c => c.id===activeConvo ? { ...c, lastMsg:input, time:"Now", messages:[...(c.messages||[]), { id:Date.now(), text:input, mine:true, time:"Now" }] } : c);
    onUpdateData({ messages:updated }); setInput("");
  };

  const current = appData.messages.find(c => c.id===activeConvo);

  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <div style={{ width:280, borderRight:`1px solid ${C.border}`, background:C.sidebarBg, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ background:C.pageBg, borderRadius:999, padding:"9px 16px", display:"flex", alignItems:"center", gap:8, border:`1px solid ${C.border}`, marginBottom:10 }}>
            <span style={{ fontSize:13 }}>🔍</span><span style={{ fontFamily:F, fontSize:13, color:C.textMuted }}>Search messages...</span>
          </div>
          <Btn onClick={() => setShowNew(true)} small fullWidth icon="✉️">New Message</Btn>
        </div>
        {showNew && (
          <div style={{ padding:16, borderBottom:`1px solid ${C.border}`, background:C.accentLight }}>
            <div style={{ fontFamily:F, fontSize:13, fontWeight:700, color:C.textPrimary, marginBottom:8 }}>Start a conversation</div>
            <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Enter a name..." onKeyDown={e=>e.key==="Enter"&&startConvo()} autoFocus
              style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"9px 12px", fontFamily:F, fontSize:13, outline:"none", marginBottom:8 }} />
            <div style={{ display:"flex", gap:8 }}><Btn onClick={startConvo} small>Start</Btn><Btn onClick={() => setShowNew(false)} variant="outline" small>Cancel</Btn></div>
          </div>
        )}
        <div style={{ flex:1, overflowY:"auto" }}>
          {appData.messages.length === 0 ? (
            <div style={{ padding:24, textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>💬</div>
              <div style={{ fontFamily:F, fontSize:13, color:C.textSecondary, lineHeight:1.55 }}>No conversations yet.<br/>Start one above!</div>
            </div>
          ) : appData.messages.map(c => (
            <div key={c.id} onClick={() => setActiveConvo(c.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderBottom:`1px solid ${C.borderLight}`, cursor:"pointer", background:activeConvo===c.id?C.accentLight:"transparent" }}>
              <Avatar user={c.contact} size={44} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:F, fontWeight:700, fontSize:13, color:C.textPrimary }}>{c.contact.name}</div>
                <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.lastMsg||"No messages yet"}</div>
              </div>
              <span style={{ fontFamily:F, fontSize:10, color:C.textMuted, flexShrink:0 }}>{c.time}</span>
            </div>
          ))}
        </div>
      </div>

      {current ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.pageBg }}>
          <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"14px 22px", display:"flex", alignItems:"center", gap:14 }}>
            <Avatar user={current.contact} size={42} />
            <div>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary }}>{current.contact.name}</div>
              <div style={{ fontFamily:F, fontSize:12, color:C.online, fontWeight:600 }}>● Online</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
              <Btn small icon="📹">Video Call</Btn>
              <Btn small variant="outline" icon="📞">Audio</Btn>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", display:"flex", flexDirection:"column", gap:14 }}>
            {!current.messages?.length ? (
              <div style={{ textAlign:"center", marginTop:60 }}>
                <Avatar user={current.contact} size={60} />
                <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, marginTop:14 }}>{current.contact.name}</div>
                <div style={{ fontFamily:F, fontSize:13, color:C.textSecondary, marginTop:6 }}>Say hello! This is the start of your conversation.</div>
              </div>
            ) : current.messages.map(m => (
              <div key={m.id} style={{ display:"flex", justifyContent:m.mine?"flex-end":"flex-start" }}>
                <div style={{ background:m.mine?C.accent:C.white, color:m.mine?"white":C.textPrimary, borderRadius:m.mine?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"11px 16px", maxWidth:"62%", fontFamily:F, fontSize:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", lineHeight:1.5, border:m.mine?"none":`1px solid ${C.borderLight}` }}>
                  {m.text}<div style={{ fontSize:10, opacity:0.6, marginTop:4, textAlign:"right" }}>{m.time}</div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ background:C.white, borderTop:`1px solid ${C.border}`, padding:"14px 22px", display:"flex", gap:12, alignItems:"center" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={`Message ${current.contact.name}...`}
              style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:999, padding:"11px 20px", fontFamily:F, fontSize:14, outline:"none", background:C.pageBg, color:C.textPrimary }}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
            <button onClick={send} style={{ background:C.accent, color:"white", border:"none", borderRadius:"50%", width:42, height:42, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(75,163,227,0.35)" }}>➤</button>
          </div>
        </div>
      ) : (
        <EmptyState icon="💬" title="No conversation selected" subtitle="Pick a conversation from the left, or start a new one." action="New Message" onAction={() => setShowNew(true)} />
      )}
    </div>
  );
}

// ── Community ─────────────────────────────────────────────────────────────────
function CommunityScreen({ appData, onUpdateData }) {
  const [openGroup, setOpenGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const create = () => {
    if (!newName.trim()) return;
    const group = { id:Date.now(), name:newName, desc:newDesc, icon:"🌐", members:1, isAdmin:true, posts:[], chat:[] };
    onUpdateData({ communities:[...appData.communities, group] });
    setShowCreate(false); setNewName(""); setNewDesc(""); setOpenGroup(group.id);
  };

  if (openGroup) {
    const g = appData.communities.find(g => g.id===openGroup);
    if (!g) return null;
    return <GroupDetail group={g} onBack={() => setOpenGroup(null)} appData={appData} onUpdateData={onUpdateData} />;
  }

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.pageBg, padding:"28px" }}>
      {showCreate && (
        <Card style={{ padding:24, marginBottom:24, border:`1.5px solid ${C.accent}` }}>
          <h3 style={{ fontFamily:F, fontWeight:800, fontSize:18, color:C.textPrimary, margin:"0 0 16px" }}>Create a community</h3>
          <Field label="Name" value={newName} onChange={setNewName} placeholder="e.g. Design Collective" />
          <Field label="Description" value={newDesc} onChange={setNewDesc} placeholder="What's this community about?" />
          <div style={{ display:"flex", gap:10 }}><Btn onClick={create} disabled={!newName.trim()}>Create</Btn><Btn onClick={() => setShowCreate(false)} variant="outline">Cancel</Btn></div>
        </Card>
      )}
      {appData.communities.length === 0 ? (
        <EmptyState icon="🌐" title="No communities yet" subtitle="Create your first community or discover groups to join." action="Create Community" onAction={() => setShowCreate(true)} />
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}><Btn onClick={() => setShowCreate(true)} small icon="🌐">Create Community</Btn></div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {appData.communities.map(g => (
              <Card key={g.id} onClick={() => setOpenGroup(g.id)} style={{ overflow:"hidden" }}>
                <div style={{ background:`linear-gradient(135deg,${C.gradStart},${C.gradEnd})`, padding:"22px 22px 16px", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>{g.icon}</div>
                  <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, marginBottom:4 }}>{g.name}</div>
                  <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary }}>{g.desc||"No description"}</div>
                </div>
                <div style={{ padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:F, fontSize:12, color:C.textSecondary }}>👥 {g.members} member{g.members!==1?"s":""}</span>
                  <span style={{ fontFamily:F, fontSize:12, color:C.accentDark, fontWeight:700 }}>Open →</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GroupDetail({ group, onBack, appData, onUpdateData }) {
  const [tab, setTab] = useState("board");
  const [postText, setPostText] = useState("");
  const [chatInput, setChatInput] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [tab, group.chat]);

  const addPost = () => { if (!postText.trim()) return; const updated = appData.communities.map(g => g.id===group.id ? { ...g, posts:[...(g.posts||[]), { id:Date.now(), text:postText, time:"Now" }] } : g); onUpdateData({ communities:updated }); setPostText(""); };
  const sendChat = () => { if (!chatInput.trim()) return; const updated = appData.communities.map(g => g.id===group.id ? { ...g, chat:[...(g.chat||[]), { id:Date.now(), text:chatInput, time:"Now", mine:true }] } : g); onUpdateData({ communities:updated }); setChatInput(""); };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ background:`linear-gradient(135deg,${C.accent}CC,${C.accentDark}CC)`, padding:"20px 28px", color:"white" }}>
        <button onClick={onBack} style={{ background:"rgba(255,255,255,0.2)", border:"none", color:"white", borderRadius:999, padding:"7px 14px", fontFamily:F, fontWeight:600, fontSize:13, cursor:"pointer", marginBottom:14 }}>← Back</button>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:36 }}>{group.icon}</div>
          <div><h2 style={{ margin:0, fontFamily:F, fontWeight:800, fontSize:22 }}>{group.name}</h2><p style={{ margin:"4px 0 0", fontFamily:F, fontSize:13, opacity:0.85 }}>{group.members} member{group.members!==1?"s":""}{group.desc?` · ${group.desc}`:""}</p></div>
        </div>
      </div>
      <div style={{ display:"flex", background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 24px" }}>
        {["board","chat","members","events","files"].map(t => <button key={t} onClick={() => setTab(t)} style={{ padding:"14px 18px", border:"none", background:"none", fontFamily:F, fontWeight:tab===t?700:500, fontSize:14, color:tab===t?C.accent:C.textSecondary, borderBottom:tab===t?`3px solid ${C.accent}`:"3px solid transparent", cursor:"pointer", marginBottom:-1, textTransform:"capitalize" }}>{t}</button>)}
      </div>
      {tab==="board" && (
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:C.pageBg }}>
          <Card style={{ padding:20, marginBottom:20 }}>
            <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Share something with the group..." rows={3} style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"12px 16px", fontFamily:F, fontSize:14, outline:"none", resize:"none", color:C.textPrimary, marginBottom:10 }} />
            <Btn onClick={addPost} disabled={!postText.trim()} small>Post</Btn>
          </Card>
          {!group.posts?.length ? <EmptyState icon="📋" title="No posts yet" subtitle="Be the first to post something to this community." /> : group.posts.map(p => (
            <Card key={p.id} style={{ padding:20, marginBottom:14 }}><p style={{ fontFamily:F, fontSize:14, color:C.textPrimary, lineHeight:1.65, margin:"0 0 10px" }}>{p.text}</p><div style={{ fontFamily:F, fontSize:12, color:C.textMuted }}>{p.time}</div></Card>
          ))}
        </div>
      )}
      {tab==="chat" && (
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 28px", background:C.pageBg }}>
            {!group.chat?.length ? <EmptyState icon="💬" title="No messages yet" subtitle="Start the conversation in this community." /> : group.chat.map(m => (
              <div key={m.id} style={{ display:"flex", justifyContent:m.mine?"flex-end":"flex-start", marginBottom:12 }}>
                <div style={{ background:m.mine?C.accent:C.white, color:m.mine?"white":C.textPrimary, borderRadius:m.mine?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"10px 16px", maxWidth:"62%", fontFamily:F, fontSize:14, lineHeight:1.5 }}>{m.text}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ background:C.white, borderTop:`1px solid ${C.border}`, padding:"14px 22px", display:"flex", gap:12 }}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Message the group..." style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:999, padding:"11px 20px", fontFamily:F, fontSize:14, outline:"none", background:C.pageBg, color:C.textPrimary }} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
            <button onClick={sendChat} style={{ background:C.accent, color:"white", border:"none", borderRadius:"50%", width:42, height:42, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>➤</button>
          </div>
        </div>
      )}
      {tab==="members" && <EmptyState icon="👥" title="Just you so far" subtitle="Invite friends and colleagues to join this community." action="Invite Members" onAction={() => {}} />}
      {tab==="events" && <EmptyState icon="📅" title="No events yet" subtitle="Create an event for this community." action="Create Event" onAction={() => {}} />}
      {tab==="files" && <EmptyState icon="📁" title="No files yet" subtitle="Upload documents and resources." action="Upload File" onAction={() => {}} />}
    </div>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────
function ProjectsScreen({ appData, onUpdateData }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [openProject, setOpenProject] = useState(null);

  const create = () => {
    if (!newName.trim()) return;
    const p = { id:Date.now(), name:newName, desc:newDesc, progress:0, tasks:[], status:"Active" };
    onUpdateData({ projects:[...appData.projects, p] });
    setShowCreate(false); setNewName(""); setNewDesc("");
  };

  if (openProject) {
    const p = appData.projects.find(p => p.id===openProject);
    if (!p) return null;
    return <ProjectDetail project={p} onBack={() => setOpenProject(null)} appData={appData} onUpdateData={onUpdateData} />;
  }

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.pageBg, padding:"28px" }}>
      {showCreate && (
        <Card style={{ padding:24, marginBottom:24, border:`1.5px solid ${C.accent}` }}>
          <h3 style={{ fontFamily:F, fontWeight:800, fontSize:18, color:C.textPrimary, margin:"0 0 16px" }}>New project</h3>
          <Field label="Project name" value={newName} onChange={setNewName} placeholder="e.g. Website Redesign" />
          <Field label="Description" value={newDesc} onChange={setNewDesc} placeholder="What are you building?" />
          <div style={{ display:"flex", gap:10 }}><Btn onClick={create} disabled={!newName.trim()}>Create Project</Btn><Btn onClick={() => setShowCreate(false)} variant="outline">Cancel</Btn></div>
        </Card>
      )}
      {appData.projects.length === 0 ? (
        <EmptyState icon="📁" title="No projects yet" subtitle="Create your first project to start collaborating." action="Create Project" onAction={() => setShowCreate(true)} />
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:20 }}><Btn onClick={() => setShowCreate(true)} small icon="📁">New Project</Btn></div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            {appData.projects.map(p => (
              <Card key={p.id} onClick={() => setOpenProject(p.id)} style={{ padding:22 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div><div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary, marginBottom:3 }}>{p.name}</div><div style={{ fontFamily:F, fontSize:12, color:C.textSecondary }}>{p.tasks?.length||0} tasks · {p.status}</div></div>
                  <span style={{ background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"4px 12px", fontFamily:F, fontSize:11, fontWeight:700 }}>{p.status}</span>
                </div>
                <div style={{ background:C.borderLight, borderRadius:8, height:7, overflow:"hidden" }}><div style={{ width:`${p.progress}%`, height:"100%", background:`linear-gradient(90deg,${C.accent}88,${C.accent})`, borderRadius:8 }} /></div>
                <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, marginTop:8 }}>{p.progress}% complete</div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectDetail({ project, onBack, appData, onUpdateData }) {
  const [taskText, setTaskText] = useState("");

  const addTask = () => {
    if (!taskText.trim()) return;
    const tasks = [...(project.tasks||[]), { id:Date.now(), text:taskText, done:false }];
    const done = tasks.filter(t=>t.done).length;
    const progress = tasks.length ? Math.round((done/tasks.length)*100) : 0;
    onUpdateData({ projects:appData.projects.map(p => p.id===project.id ? { ...p, tasks, progress } : p) });
    setTaskText("");
  };

  const toggleTask = id => {
    const tasks = project.tasks.map(t => t.id===id ? { ...t, done:!t.done } : t);
    const done = tasks.filter(t=>t.done).length;
    const progress = tasks.length ? Math.round((done/tasks.length)*100) : 0;
    onUpdateData({ projects:appData.projects.map(p => p.id===project.id ? { ...p, tasks, progress } : p) });
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.pageBg }}>
      <div style={{ background:`linear-gradient(135deg,${C.gradStart},${C.gradEnd})`, padding:"20px 28px", borderBottom:`1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ background:"rgba(0,0,0,0.08)", border:"none", color:C.textPrimary, borderRadius:999, padding:"7px 14px", fontFamily:F, fontWeight:600, fontSize:13, cursor:"pointer", marginBottom:14 }}>← Back to Projects</button>
        <h2 style={{ fontFamily:F, fontWeight:800, fontSize:22, color:C.textPrimary, margin:"0 0 4px" }}>{project.name}</h2>
        <p style={{ fontFamily:F, fontSize:13, color:C.textSecondary, margin:"0 0 14px" }}>{project.desc||"No description"}</p>
        <div style={{ background:"rgba(255,255,255,0.7)", borderRadius:8, height:8, overflow:"hidden", maxWidth:300 }}>
          <div style={{ width:`${project.progress}%`, height:"100%", background:C.accent, borderRadius:8, transition:"width 0.4s" }} />
        </div>
        <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, marginTop:6 }}>{project.progress}% · {(project.tasks||[]).filter(t=>t.done).length}/{(project.tasks||[]).length} tasks done</div>
      </div>
      <div style={{ padding:"24px 28px" }}>
        <Card style={{ padding:24 }}>
          <h3 style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, margin:"0 0 16px" }}>Tasks</h3>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <input value={taskText} onChange={e=>setTaskText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Add a task and press Enter..."
              style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontFamily:F, fontSize:14, outline:"none", color:C.textPrimary }}
              onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border} />
            <Btn onClick={addTask} disabled={!taskText.trim()} small>Add</Btn>
          </div>
          {!project.tasks?.length ? (
            <div style={{ textAlign:"center", padding:"28px 0" }}><div style={{ fontFamily:F, fontSize:13, color:C.textMuted }}>No tasks yet. Add one above!</div></div>
          ) : project.tasks.map(t => (
            <div key={t.id} onClick={() => toggleTask(t.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.borderLight}`, cursor:"pointer" }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${t.done?C.online:C.border}`, background:t.done?C.online:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>{t.done&&<span style={{ color:"white", fontSize:12 }}>✓</span>}</div>
              <span style={{ fontFamily:F, fontSize:14, color:t.done?C.textMuted:C.textPrimary, textDecoration:t.done?"line-through":"none", flex:1 }}>{t.text}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfileScreen({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name||"");
  const [bio, setBio] = useState(user?.bio||"");
  const [role, setRole] = useState(user?.role||"");
  const initials = (user?.name||"YO").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.pageBg, padding:"28px" }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <Card style={{ overflow:"hidden", marginBottom:20 }}>
          <div style={{ background:`linear-gradient(135deg,${C.gradStart},${C.gradEnd})`, height:120, borderBottom:`1px solid ${C.border}`, position:"relative" }}>
            <div style={{ position:"absolute", bottom:-36, left:28 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:user?.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:24, fontWeight:700, border:"3px solid white", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>{initials}</div>
            </div>
          </div>
          <div style={{ padding:"48px 28px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            {editing ? (
              <div style={{ flex:1, marginRight:20 }}>
                <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
                <Field label="Role" value={role} onChange={setRole} placeholder="Your role" />
                <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell people about yourself" />
                <div style={{ display:"flex", gap:10 }}><Btn onClick={() => { onUpdate({ name, bio, role }); setEditing(false); }} small>Save</Btn><Btn onClick={() => setEditing(false)} variant="outline" small>Cancel</Btn></div>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily:F, fontWeight:800, fontSize:22, color:C.textPrimary, letterSpacing:-0.5 }}>{user?.name}</div>
                <div style={{ fontFamily:F, fontSize:14, color:C.textSecondary, marginTop:2 }}>{user?.role||<span style={{ fontStyle:"italic", color:C.textMuted }}>No role set</span>}</div>
                {user?.bio ? <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, marginTop:8, lineHeight:1.6 }}>{user.bio}</p> : <p style={{ fontFamily:F, fontSize:13, color:C.textMuted, marginTop:8, fontStyle:"italic" }}>No bio yet — add one to let people know who you are!</p>}
                {user?.interests?.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>{user.interests.map(i => <span key={i} style={{ background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:600, fontFamily:F }}>{i}</span>)}</div>}
              </div>
            )}
            {!editing && <Btn onClick={() => setEditing(true)} variant="outline" small>Edit Profile</Btn>}
          </div>
        </Card>
        <Card style={{ padding:20 }}>
          <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary, marginBottom:12 }}>Profile color</div>
          <div style={{ display:"flex", gap:10 }}>
            {COLORS.map(c => <div key={c} onClick={() => onUpdate({ color:c })} style={{ width:32, height:32, borderRadius:"50%", background:c, cursor:"pointer", border:user?.color===c?"3px solid #0D1B2A":"3px solid transparent", transition:"border 0.15s" }} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsScreen({ onSignOut }) {
  const [notifs, setNotifs] = useState(true);
  const [emails, setEmails] = useState(true);
  const Toggle = ({ value, onChange, label, desc }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0", borderBottom:`1px solid ${C.borderLight}` }}>
      <div><div style={{ fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary }}>{label}</div>{desc&&<div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, marginTop:2 }}>{desc}</div>}</div>
      <div onClick={() => onChange(!value)} style={{ width:44, height:24, borderRadius:12, background:value?C.accent:C.border, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:2, left:value?22:2, width:20, height:20, borderRadius:"50%", background:"white", transition:"left 0.2s", boxShadow:"0 2px 4px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.pageBg, padding:"28px" }}>
      <div style={{ maxWidth:580, margin:"0 auto" }}>
        <Card style={{ padding:"0 24px", marginBottom:20 }}>
          <div style={{ padding:"20px 0 16px", borderBottom:`1px solid ${C.border}` }}><div style={{ fontFamily:F, fontWeight:800, fontSize:16, color:C.textPrimary }}>Notifications</div></div>
          <Toggle label="Push notifications" desc="Get notified about new messages and activity" value={notifs} onChange={setNotifs} />
          <Toggle label="Email updates" desc="Receive weekly digest and product updates" value={emails} onChange={setEmails} />
          <div style={{ height:16 }} />
        </Card>
        <Card style={{ padding:"0 24px", marginBottom:20 }}>
          <div style={{ padding:"20px 0 16px", borderBottom:`1px solid ${C.border}` }}><div style={{ fontFamily:F, fontWeight:800, fontSize:16, color:C.textPrimary }}>Privacy</div></div>
          <Toggle label="Profile visibility" desc="Who can see your profile" value={true} onChange={() => {}} />
          <Toggle label="Online status" desc="Show when you're active" value={true} onChange={() => {}} />
          <Toggle label="Read receipts" desc="Let others know you've read messages" value={true} onChange={() => {}} />
          <div style={{ height:16 }} />
        </Card>
        <Card style={{ padding:"0 24px", marginBottom:20 }}>
          <div style={{ padding:"20px 0 16px", borderBottom:`1px solid ${C.border}` }}><div style={{ fontFamily:F, fontWeight:800, fontSize:16, color:C.textPrimary }}>About</div></div>
          {[["Version","0.1.0 Alpha"],["Terms of Service","→"],["Privacy Policy","→"],["Contact Support","→"]].map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${C.borderLight}`, cursor:"pointer" }}>
              <span style={{ fontFamily:F, fontSize:14, color:C.textPrimary }}>{l}</span>
              <span style={{ fontFamily:F, fontSize:14, color:C.textSecondary }}>{v}</span>
            </div>
          ))}
          <div style={{ height:16 }} />
        </Card>
        <Btn onClick={onSignOut} variant="danger" fullWidth icon="🚪">Sign Out</Btn>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TITLES = {
  dashboard: ["Dashboard", null],
  messages:  ["Messages",  "Stay connected with your network"],
  community: ["Community", "Explore and build communities"],
  projects:  ["Projects",  "Collaborate with your team"],
  profile:   ["Profile",   "Manage your account"],
  settings:  ["Settings",  "Customize your experience"],
};

function MainApp({ user, onSignOut, onUpdateUser }) {
  const [tab, setTab] = useState("dashboard");
  const [appData, setAppData] = useState({ messages:[], communities:[], projects:[], events:[] });
  const updateData = patch => setAppData(d => ({ ...d, ...patch }));
  const [title, subtitle] = TITLES[tab] || ["Bridges",""];

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:F, background:C.pageBg }}>
      <Sidebar active={tab} onNav={setTab} onSignOut={onSignOut} user={user} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TopBar title={tab==="dashboard"?`Welcome, ${user?.name?.split(" ")[0]||"there"} 👋`:title} subtitle={subtitle} />
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {tab==="dashboard" && <DashboardScreen user={user} onNav={setTab} appData={appData} />}
          {tab==="messages"  && <MessagesScreen appData={appData} onUpdateData={updateData} />}
          {tab==="community" && <CommunityScreen appData={appData} onUpdateData={updateData} />}
          {tab==="projects"  && <ProjectsScreen appData={appData} onUpdateData={updateData} />}
          {tab==="profile"   && <ProfileScreen user={user} onUpdate={onUpdateUser} />}
          {tab==="settings"  && <SettingsScreen onSignOut={onSignOut} />}
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  return (
    <>
      {screen==="landing"    && <LandingScreen   onSignUp={() => setScreen("signup")} onLogin={() => setScreen("login")} />}
      {screen==="signup"     && <SignUpScreen     onSignUp={d => { setUser(d); setScreen("onboarding"); }} onGoLogin={() => setScreen("login")} />}
      {screen==="login"      && <LoginScreen      onLogin={() => { setUser({ name:"Mateo Whitehead", role:"Founder", color:"#4BA3E3", interests:["Technology","Community Building"] }); setScreen("app"); }} onGoSignUp={() => setScreen("signup")} />}
      {screen==="onboarding" && <OnboardingScreen user={user} onComplete={p => { setUser(u => ({ ...u, ...p })); setScreen("tour"); }} />}
      {screen==="tour"       && <FeatureTour      user={user} onFinish={() => setScreen("app")} />}
      {screen==="app"        && <MainApp user={user} onSignOut={() => { setUser(null); setScreen("landing"); }} onUpdateUser={u => setUser(p => ({ ...p, ...u }))} />}
    </>
  );
}
