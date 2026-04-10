import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase Client ────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://fhgsvgtoidwlfosqqdqi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3N2Z3RvaWR3bGZvc3FxZHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODY2NzcsImV4cCI6MjA4OTQ2MjY3N30.RlI1lpCvJCPfPjZuU3nugjtFodj2np7Zj586E7q6o0g"
);

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

function Btn({ children, onClick, variant="primary", small, disabled, fullWidth, icon, loading }) {
  const s = {
    primary:{ background:C.accent, color:"#fff", border:"none", boxShadow:"0 4px 14px rgba(75,163,227,0.3)" },
    outline:{ background:C.white, color:C.textPrimary, border:`1.5px solid ${C.border}` },
    ghost:{ background:C.accentLight, color:C.accentDark, border:"none" },
    danger:{ background:"#FEE2E2", color:"#DC2626", border:"none" },
  };
  return (
    <button onClick={onClick} disabled={disabled||loading} style={{ ...s[variant], borderRadius:999, cursor:(disabled||loading)?"not-allowed":"pointer", fontFamily:F, fontWeight:700, fontSize:small?12:14, padding:small?"8px 18px":"13px 28px", opacity:(disabled||loading)?0.5:1, width:fullWidth?"100%":"auto", display:"inline-flex", alignItems:"center", gap:6, transition:"all 0.15s", whiteSpace:"nowrap" }}>
      {icon && <span style={{ fontSize:small?14:16 }}>{icon}</span>}
      {loading ? "Please wait..." : children}
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

function AuthError({ msg }) {
  if (!msg) return null;
  return <div style={{ background:"#FEE2E2", border:"1.5px solid #FCA5A5", borderRadius:12, padding:"12px 16px", marginBottom:20, fontFamily:F, fontSize:13, color:"#DC2626" }}>{msg}</div>;
}

function PolicyPage({ type, onBack, onAccept }) {
  return (
    <div style={{ minHeight:"100vh", background:C.pageBg, fontFamily:F }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", fontFamily:F, fontWeight:600, fontSize:14, color:C.accent, cursor:"pointer", marginBottom:24 }}>← Back</button>
        <Card style={{ padding:40 }}>
          <h1 style={{ fontFamily:F, fontWeight:800, fontSize:28, color:C.textPrimary, margin:"0 0 6px" }}>{type==="privacy"?"Privacy Policy":"Terms of Service"}</h1>
          <p style={{ fontFamily:F, fontSize:13, color:C.textMuted, margin:"0 0 32px" }}>Last updated: March 2026</p>
          {(type==="privacy" ? [["What we collect","We collect your name, email, and content you create on Bridges — messages, posts, and profile info. We do not sell your data to any third party."],["How we protect your data","All data is encrypted in transit using TLS 1.3 and stored with AES-256 encryption at rest. Only you and your intended recipients can read your messages."],["Data retention","You can delete your account and all associated data at any time from Settings. We permanently remove your data within 30 days of a deletion request."],["Your rights","You have the right to access, correct, or delete your personal data. Contact us at privacy@buildbridges.app."],["Cookies","We use essential cookies only for authentication and session management. No tracking or advertising cookies."]] : [["Acceptance","By creating a Bridges account, you agree to these Terms of Service."],["Your account","You are responsible for keeping your credentials secure. You must be at least 13 years old to use Bridges."],["Acceptable use","You agree not to use Bridges to harass, spam, or harm others. We may suspend accounts that violate these terms."],["Your content","You own the content you create on Bridges. We do not claim ownership of your content."],["Changes","We may update these terms and will notify you by email. Continued use constitutes acceptance."]]).map(([t,d]) => (
            <div key={t} style={{ marginBottom:24 }}>
              <h3 style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, margin:"0 0 8px" }}>{t}</h3>
              <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, lineHeight:1.7, margin:0 }}>{d}</p>
            </div>
          ))}
          <Btn onClick={onAccept}>Accept & Return</Btn>
        </Card>
      </div>
    </div>
  );
}

// ── Demo user / seed data ─────────────────────────────────────────────────────
const DEMO_USER = {
  id:"demo-user",
  email:"demo@buildbridges.app",
  name:"Alex Rivera",
  role:"Product Manager",
  bio:"Building the future of community communication at Bridges.",
  color:"#4BA3E3",
  interests:["Technology","Design","Startups","Community Building"],
  useCase:"team",
  settings:{ notifications:true, emailDigest:false },
};

// ── SCREEN 1: Landing ─────────────────────────────────────────────────────────
function LandingScreen({ onSignUp, onLogin, onDemo }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const features = [
    { icon:"💬", color:"#34D399", title:"Real-time Messaging", desc:"Direct messages and group chats with instant delivery. Your conversations, always in sync." },
    { icon:"🌐", color:"#A78BFA", title:"Communities", desc:"Create or join communities around any topic. A shared board, live chat, and events all in one place." },
    { icon:"📁", color:"#FBBF24", title:"Project Collaboration", desc:"Organise work with tasks, progress tracking, and team updates — all connected to your conversations." },
  ];

  const trust = [
    { icon:"🔒", label:"End-to-end encrypted" },
    { icon:"🛡️", label:"GDPR compliant" },
    { icon:"✅", label:"We never sell your data" },
    { icon:"🔐", label:"AES-256 at rest" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg,${C.gradStart} 0%,${C.gradEnd} 60%,${C.pageBg} 100%)`, fontFamily:F }}>

      {/* ── Nav ── */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 48px", background:"rgba(255,255,255,0.88)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center" }}>
          <img src="/logo.svg" alt="Bridges" style={{ height:32, width:"auto" }} />
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={onLogin} style={{ background:"none", border:"none", fontFamily:F, fontWeight:600, fontSize:14, color:C.textSecondary, cursor:"pointer", padding:"8px 16px", borderRadius:8 }}>Sign in</button>
          <Btn onClick={onDemo} small variant="ghost">▶ Try Demo</Btn>
          <Btn onClick={onSignUp} small>Get Started Free →</Btn>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ maxWidth:780, margin:"0 auto", textAlign:"center", padding:"80px 32px 64px", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)", transition:"all 0.6s ease" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"5px 14px", fontFamily:F, fontSize:12, fontWeight:700, marginBottom:32, letterSpacing:0.6 }}>🚀 NOW IN BETA</div>
        {/* Hero logo */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
          <img src="/logo.svg" alt="Bridges" style={{ height:72, width:"auto" }} />
        </div>
        <p style={{ fontFamily:F, fontSize:20, color:C.textSecondary, margin:"0 0 12px", fontWeight:500 }}>The platform that brings people together</p>
        <p style={{ fontFamily:F, fontSize:16, color:C.textMuted, margin:"0 0 44px", lineHeight:1.75, maxWidth:560, marginLeft:"auto", marginRight:"auto" }}>
          Messaging, communities, and project collaboration — all in one place. Built for teams, families, and everyone in between.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
          <Btn onClick={onSignUp} icon="✦">Create Free Account</Btn>
          <Btn onClick={onDemo} variant="ghost" icon="▶">Try Demo — no sign-up needed</Btn>
        </div>
        <p style={{ fontFamily:F, fontSize:12, color:C.textMuted }}>No credit card required · Free to get started · Your data stays yours</p>
      </div>

      {/* ── Trust bar ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:0, flexWrap:"wrap", padding:"14px 48px", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.5)", backdropFilter:"blur(8px)", marginBottom:80 }}>
        {trust.map((t, i) => (
          <div key={t.label} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 24px", borderRight: i < trust.length-1 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize:14 }}>{t.icon}</span>
            <span style={{ fontFamily:F, fontSize:13, fontWeight:600, color:C.textSecondary }}>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── Feature cards ── */}
      <div style={{ maxWidth:1040, margin:"0 auto", padding:"0 48px 100px" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h2 style={{ fontFamily:F, fontWeight:800, fontSize:34, color:C.textPrimary, letterSpacing:-1, margin:"0 0 12px" }}>Everything your community needs</h2>
          <p style={{ fontFamily:F, fontSize:16, color:C.textSecondary, margin:0 }}>Powerful tools, simple enough for everyone.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
          {features.map((f, i) => (
            <div key={f.title} style={{ background:"rgba(255,255,255,0.80)", borderRadius:20, padding:"28px 26px", border:`1px solid ${C.border}`, backdropFilter:"blur(10px)", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:`all 0.5s ease ${0.1+i*0.1}s`, boxShadow:"0 2px 20px rgba(13,27,42,0.04)" }}>
              <div style={{ width:48, height:48, borderRadius:14, background:`${f.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:16 }}>{f.icon}</div>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:17, color:C.textPrimary, marginBottom:8, letterSpacing:-0.3 }}>{f.title}</div>
              <div style={{ fontFamily:F, fontSize:14, color:C.textSecondary, lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div style={{ background:`linear-gradient(135deg,${C.accent},${C.accentDark})`, padding:"60px 48px", textAlign:"center" }}>
        <h2 style={{ fontFamily:F, fontWeight:800, fontSize:32, color:"#fff", letterSpacing:-1, margin:"0 0 12px" }}>Ready to build your community?</h2>
        <p style={{ fontFamily:F, fontSize:16, color:"rgba(255,255,255,0.8)", margin:"0 0 32px" }}>Join Bridges for free — no credit card, no limits to start.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onSignUp} style={{ background:"#fff", border:"none", borderRadius:999, padding:"14px 32px", fontFamily:F, fontWeight:700, fontSize:15, color:C.accentDark, cursor:"pointer" }}>Create Free Account →</button>
          <button onClick={onLogin} style={{ background:"rgba(255,255,255,0.15)", border:"2px solid rgba(255,255,255,0.4)", borderRadius:999, padding:"14px 32px", fontFamily:F, fontWeight:700, fontSize:15, color:"#fff", cursor:"pointer" }}>Sign In</button>
        </div>
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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (password.length < 8) e.password = "Minimum 8 characters";
    if (!/[A-Z]/.test(password)) e.password = "Must include an uppercase letter";
    if (!/[0-9]/.test(password)) e.password = "Must include a number";
    if (!agreed) e.agreed = "You must accept the terms to continue";
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true); setAuthError("");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) { setAuthError(error.message); return; }
      onSignUp({ name, email, id: data.user?.id });
    } catch { setAuthError("Network error — please check your connection."); }
    finally { setLoading(false); }
  };

  const handleOAuth = async (provider) => {
    setLoading(true); setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
      if (error) setAuthError(error.message);
    } catch { setAuthError("Network error — please check your connection."); }
    finally { setLoading(false); }
  };

  if (showPolicy) return <PolicyPage type={showPolicy} onBack={() => setShowPolicy(null)} onAccept={() => { setAgreed(true); setShowPolicy(null); }} />;

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:F, background:C.pageBg }}>
      <div style={{ width:"44%", background:`linear-gradient(155deg,${C.gradStart},${C.gradEnd})`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"60px 48px", borderRight:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(75,163,227,0.07)" }} />
        <div style={{ position:"relative", textAlign:"center", maxWidth:340 }}>
          <img src="/logo.svg" alt="Bridges" style={{ height:44, width:"auto", marginBottom:10 }} />
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
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", overflowY:"auto" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <h2 style={{ fontFamily:F, fontWeight:800, fontSize:28, color:C.textPrimary, margin:"0 0 6px", letterSpacing:-0.8 }}>Create your account</h2>
          <p style={{ fontFamily:F, fontSize:14, color:C.textSecondary, margin:"0 0 28px" }}>Free to start. No credit card needed.</p>
          <AuthError msg={authError} />
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
          <div style={{ marginBottom:18 }}><Btn onClick={handleSignUp} fullWidth loading={loading}>Create Account →</Btn></div>
          <p style={{ textAlign:"center", fontFamily:F, fontSize:14, color:C.textSecondary }}>Already have an account? <span onClick={onGoLogin} style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Sign in</span></p>
          <div style={{ margin:"20px 0", display:"flex", alignItems:"center", gap:12 }}><div style={{ flex:1, height:1, background:C.border }} /><span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>or continue with</span><div style={{ flex:1, height:1, background:C.border }} /></div>
          <button onClick={() => handleOAuth("google")} disabled={loading}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"13px 20px", background:C.white, fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1, transition:"all 0.15s", boxSizing:"border-box" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = "#4285F4"; e.currentTarget.style.background = "#F8FBFF"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
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
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.includes("@")) e.email = "Invalid email";
    if (!password) e.password = "Required";
    setErrors(e); return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true); setAuthError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setAuthError(error.message); return; }
      const meta = data.user?.user_metadata || {};
      onLogin({ id:data.user.id, email:data.user.email, name:meta.full_name||meta.name||email.split("@")[0], role:meta.role||"", bio:meta.bio||"", color:meta.color||COLORS[0], interests:meta.interests||[], useCase:meta.useCase||"" });
    } catch { setAuthError("Network error — please check your connection."); }
    finally { setLoading(false); }
  };

  const handleOAuth = async (provider) => {
    setLoading(true); setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
      if (error) setAuthError(error.message);
    } catch { setAuthError("Network error — please check your connection."); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email.includes("@")) { setErrors({ email:"Enter your email first" }); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo:`${window.location.origin}?reset=true` });
      if (error) { setAuthError(error.message); return; }
      setResetSent(true);
    } catch { setAuthError("Network error — please check your connection."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:F, background:C.pageBg }}>
      <div style={{ width:"44%", background:`linear-gradient(155deg,${C.gradStart},${C.gradEnd})`, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", padding:"60px 48px", borderRight:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:400, height:400, borderRadius:"50%", background:"rgba(75,163,227,0.07)" }} />
        <div style={{ position:"relative", textAlign:"center", maxWidth:340 }}>
          <img src="/logo.svg" alt="Bridges" style={{ height:44, width:"auto", marginBottom:10 }} />
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
          <AuthError msg={authError} />
          {resetSent && <div style={{ background:"#DCFCE7", border:"1.5px solid #86EFAC", borderRadius:12, padding:"12px 16px", marginBottom:20, fontFamily:F, fontSize:13, color:"#16A34A" }}>✓ Password reset email sent — check your inbox.</div>}
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errors.email} />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" error={errors.password} />
          <div style={{ textAlign:"right", marginBottom:20, marginTop:-10 }}>
            <span onClick={handleForgotPassword} style={{ fontFamily:F, fontSize:13, color:C.accent, cursor:"pointer", fontWeight:600 }}>Forgot password?</span>
          </div>
          <div style={{ marginBottom:18 }}><Btn onClick={handleLogin} fullWidth loading={loading}>Sign In →</Btn></div>
          <p style={{ textAlign:"center", fontFamily:F, fontSize:14, color:C.textSecondary }}>No account? <span onClick={onGoSignUp} style={{ color:C.accent, fontWeight:700, cursor:"pointer" }}>Sign up free</span></p>
          <div style={{ margin:"20px 0", display:"flex", alignItems:"center", gap:12 }}><div style={{ flex:1, height:1, background:C.border }} /><span style={{ fontSize:12, color:C.textMuted, fontFamily:F }}>or continue with</span><div style={{ flex:1, height:1, background:C.border }} /></div>
          <button onClick={() => handleOAuth("google")} disabled={loading}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"13px 20px", background:C.white, fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1, transition:"all 0.15s", boxSizing:"border-box" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = "#4285F4"; e.currentTarget.style.background = "#F8FBFF"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.white; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 4: Onboarding ──────────────────────────────────────────────────────
function OnboardingScreen({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name:user?.name||"", role:"", bio:"", color:COLORS[0], interests:[], useCase:"" });
  const [saving, setSaving] = useState(false);
  const initials = profile.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";
  const toggle = i => setProfile(p => ({ ...p, interests:p.interests.includes(i)?p.interests.filter(x=>x!==i):[...p.interests,i] }));
  const useCases = [{ id:"team", icon:"👥", label:"My team or workplace" },{ id:"community", icon:"🌐", label:"A community or group" },{ id:"family", icon:"🏠", label:"Family and friends" },{ id:"network", icon:"🤝", label:"Professional networking" },{ id:"all", icon:"✨", label:"All of the above" }];

  const handleComplete = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name:profile.name, role:profile.role, bio:profile.bio, color:profile.color, interests:profile.interests, useCase:profile.useCase, onboarded:true } });
    setSaving(false);
    if (error) { alert("Failed to save profile: " + error.message); return; }
    onComplete(profile);
  };

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
            <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 6px" }}>Set up your profile</h2>
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
            <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 6px" }}>How will you use Bridges?</h2>
            <p style={{ color:C.textSecondary, fontSize:14, margin:"0 0 24px" }}>We'll tailor your experience based on this.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
              {useCases.map(u => <div key={u.id} onClick={() => setProfile(p=>({...p,useCase:u.id}))} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:12, border:`1.5px solid ${profile.useCase===u.id?C.accent:C.border}`, background:profile.useCase===u.id?C.accentLight:C.white, cursor:"pointer", transition:"all 0.15s" }}><span style={{ fontSize:22 }}>{u.icon}</span><span style={{ fontFamily:F, fontWeight:600, fontSize:15, color:profile.useCase===u.id?C.accentDark:C.textPrimary }}>{u.label}</span>{profile.useCase===u.id&&<span style={{ marginLeft:"auto", color:C.accent, fontWeight:700 }}>✓</span>}</div>)}
            </div>
            <Btn onClick={() => setStep(3)} disabled={!profile.useCase} fullWidth>Continue →</Btn>
          </>}
          {step === 3 && <>
            <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 6px" }}>What are you into?</h2>
            <p style={{ color:C.textSecondary, fontSize:14, margin:"0 0 22px" }}>Pick interests to find the right communities.</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:32 }}>
              {INTERESTS.map(i => <div key={i} onClick={() => toggle(i)} style={{ padding:"9px 18px", borderRadius:999, border:`1.5px solid ${profile.interests.includes(i)?C.accent:C.border}`, background:profile.interests.includes(i)?C.accentLight:C.white, color:profile.interests.includes(i)?C.accentDark:C.textSecondary, fontFamily:F, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>{profile.interests.includes(i)?"✓ ":""}{i}</div>)}
            </div>
            <Btn onClick={() => setStep(4)} disabled={!profile.interests.length} fullWidth>Continue →</Btn>
          </>}
          {step === 4 && (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:profile.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:28, fontWeight:700, margin:"0 auto 20px", boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>{initials}</div>
              <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 10px" }}>You're all set, {profile.name.split(" ")[0]}!</h2>
              <p style={{ color:C.textSecondary, fontSize:15, margin:"0 0 28px", lineHeight:1.65 }}>Your profile is ready. Time to build some bridges.</p>
              <div style={{ background:C.pageBg, borderRadius:16, padding:20, marginBottom:28, textAlign:"left", border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                  <span style={{ background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:700, fontFamily:F }}>{profile.role}</span>
                  {profile.interests.slice(0,3).map(i => <span key={i} style={{ background:C.borderLight, color:C.textSecondary, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:600, fontFamily:F }}>{i}</span>)}
                  {profile.interests.length > 3 && <span style={{ background:C.borderLight, color:C.textSecondary, borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:600, fontFamily:F }}>+{profile.interests.length-3} more</span>}
                </div>
                <p style={{ fontFamily:F, fontSize:13, color:C.textSecondary, margin:0, lineHeight:1.5 }}>🔒 Your data is encrypted and only visible to you.</p>
              </div>
              <Btn onClick={handleComplete} fullWidth loading={saving}>Enter Bridges 🌉</Btn>
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
    { icon:"📁", title:"Projects", desc:"Organize work with tasks, milestones, and shared files — all linked to your community.", color:"#FBBF24", features:["Visual task management","Progress tracking","Team file sharing"] },
    { icon:"🚀", title:"You're ready!", desc:"Your workspace is set up. Start by exploring your dashboard or joining a community.", color:C.accent, features:null },
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
          <h2 style={{ fontFamily:F, fontWeight:800, fontSize:26, color:C.textPrimary, margin:"0 0 12px" }}>{current.title}</h2>
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
            {isLast ? <Btn onClick={onFinish}>Start using Bridges →</Btn> : (<><Btn onClick={() => setStep(s=>s+1)}>Next →</Btn><Btn onClick={onFinish} variant="ghost">Skip tour</Btn></>)}
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
    <div data-testid="sidebar" style={{ width:240, background:C.sidebarBg, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"18px 20px 16px", borderBottom:`1px solid ${C.border}` }}>
        <img src="/logo.svg" alt="Bridges" style={{ height:28, width:"auto" }} />
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

const DEMO_NOTIFICATIONS = [
  { id:1, icon:"💬", title:"Alex Rivera messaged you",          sub:"Hey! How's the Bridges build going?",   time:"2m ago",  unread:true,  nav:"messages"  },
  { id:2, icon:"❤️", title:"Jordan Lee liked your post",        sub:"Just launched our first beta 🎉",       time:"18m ago", unread:true,  nav:"community" },
  { id:3, icon:"🌐", title:"New member joined Founders Circle", sub:"Dana Park joined your community",       time:"1h ago",  unread:false, nav:"community" },
  { id:4, icon:"📁", title:"Task completed in Bridges App",     sub:"Wire up Supabase auth — done",          time:"3h ago",  unread:false, nav:"projects"  },
];

function TopBar({ title, subtitle, users = [], onUserSelect, onNav, notifications = DEMO_NOTIFICATIONS }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState(notifications);
  const searchRef = useRef(null);
  const notifRef  = useRef(null);
  const inputRef  = useRef(null);

  const unreadCount = notifs.filter(n => n.unread).length;

  // Filter: when query empty + focused → show all users; when typing → filter
  const displayResults = searchFocused
    ? (query.trim() ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase())) : users)
    : [];

  // Outside-click: separate listeners so they don't interfere
  useEffect(() => {
    const handleSearch = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
        setQuery("");
      }
    };
    const handleNotif = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleSearch);
    document.addEventListener("mousedown", handleNotif);
    return () => {
      document.removeEventListener("mousedown", handleSearch);
      document.removeEventListener("mousedown", handleNotif);
    };
  }, []);

  // Escape key closes both
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") { setSearchFocused(false); setQuery(""); setShowNotif(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread:false })));

  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, gap:16 }}>
      {/* Left: title */}
      <div style={{ minWidth:0 }}>
        <h1 style={{ margin:0, fontFamily:F, fontWeight:800, fontSize:20, color:C.textPrimary, letterSpacing:-0.5, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{title}</h1>
        {subtitle && <p style={{ margin:0, fontFamily:F, fontSize:13, color:C.textSecondary, marginTop:2 }}>{subtitle}</p>}
      </div>

      {/* Right: search + bell */}
      <div style={{ display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>

        {/* ── Search bar ── */}
        <div ref={searchRef} style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:searchFocused ? C.white : C.pageBg, border:`1.5px solid ${searchFocused ? C.accent : C.border}`, borderRadius:12, padding:"8px 14px", transition:"all 0.2s", width: searchFocused ? 280 : 200 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, opacity:0.4 }}>
              <circle cx="7" cy="7" r="5.5" stroke={C.textPrimary} strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke={C.textPrimary} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search people, chats..."
              style={{ border:"none", outline:"none", background:"transparent", fontFamily:F, fontSize:13, color:C.textPrimary, width:"100%", caretColor:C.accent }}
            />
            {query && (
              <button onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                style={{ background:"none", border:"none", cursor:"pointer", padding:0, color:C.textMuted, fontSize:14, lineHeight:1, flexShrink:0 }}>✕</button>
            )}
          </div>

          {/* Dropdown */}
          {searchFocused && (
            <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, width:280, background:C.white, border:`1px solid ${C.border}`, borderRadius:14, boxShadow:"0 12px 32px rgba(13,27,42,0.12)", zIndex:300, overflow:"hidden" }}>
              <div style={{ padding:"8px 14px 6px", fontFamily:F, fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:0.6 }}>
                {query.trim() ? `RESULTS FOR "${query.toUpperCase()}"` : "PEOPLE"}
              </div>
              {displayResults.length > 0 ? displayResults.map(u => (
                <div key={u.id}
                  onClick={() => { onUserSelect?.(u); setSearchFocused(false); setQuery(""); }}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:"pointer", transition:"background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:u.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:700, flexShrink:0, position:"relative" }}>
                    {u.name.split(" ").map(w=>w[0]).join("")}
                    <div style={{ position:"absolute", bottom:0, right:0, width:9, height:9, borderRadius:"50%", background:u.online?C.online:"#CBD5E1", border:"2px solid white" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:F, fontWeight:600, fontSize:13, color:C.textPrimary }}>{u.name}</div>
                    <div style={{ fontFamily:F, fontSize:11, color:u.online?C.online:C.textMuted }}>{u.online?"● Online now":"○ Offline"}</div>
                  </div>
                  <div style={{ fontFamily:F, fontSize:11, color:C.textMuted }}>Open chat →</div>
                </div>
              )) : (
                <div style={{ padding:"16px 14px", textAlign:"center", fontFamily:F, fontSize:13, color:C.textMuted }}>
                  {query.trim() ? `No results for "${query}"` : "No people to show"}
                </div>
              )}
              {query.trim() === "" && (
                <div style={{ padding:"8px 14px 10px", borderTop:`1px solid ${C.borderLight}`, fontFamily:F, fontSize:11, color:C.textMuted }}>
                  Click a person to open their chat · press Esc to close
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Notification bell ── */}
        <div ref={notifRef} style={{ position:"relative" }}>
          <button
            onClick={() => setShowNotif(v => !v)}
            style={{ position:"relative", width:38, height:38, borderRadius:10, background: showNotif ? C.accentLight : C.pageBg, border:`1.5px solid ${showNotif ? C.accent : C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}
            title="Notifications — click a notification to go there"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={showNotif ? C.accent : C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={showNotif ? C.accent : C.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:C.notification, border:"2px solid white", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontSize:9, fontWeight:800, color:"white", lineHeight:1 }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:320, background:C.white, border:`1px solid ${C.border}`, borderRadius:16, boxShadow:"0 16px 40px rgba(13,27,42,0.14)", zIndex:300, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:F, fontWeight:700, fontSize:14, color:C.textPrimary }}>Notifications</span>
                  {unreadCount > 0 && <span style={{ background:C.notification, color:"white", borderRadius:999, fontFamily:F, fontSize:10, fontWeight:800, padding:"2px 7px" }}>{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background:"none", border:"none", fontFamily:F, fontSize:12, fontWeight:600, color:C.accent, cursor:"pointer", padding:0 }}>Mark all read</button>
                )}
              </div>
              {/* List */}
              <div style={{ maxHeight:340, overflowY:"auto" }}>
                {notifs.map(n => {
                  const navLabel = n.nav === "messages" ? "Go to Messages" : n.nav === "community" ? "Go to Community" : n.nav === "projects" ? "Go to Projects" : null;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, unread:false } : x));
                        if (n.nav && onNav) { onNav(n.nav); setShowNotif(false); }
                      }}
                      style={{ width:"100%", display:"flex", gap:12, padding:"12px 16px", background:n.unread ? `${C.accent}08` : "transparent", borderBottom:`1px solid ${C.borderLight}`, cursor:"pointer", border:"none", borderBottomWidth:1, borderBottomStyle:"solid", borderBottomColor:C.borderLight, textAlign:"left", transition:"background 0.12s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = n.unread ? `${C.accent}08` : "transparent"; }}
                    >
                      <div style={{ width:36, height:36, borderRadius:10, background:C.accentLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{n.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:F, fontSize:13, fontWeight: n.unread ? 700 : 500, color:C.textPrimary, marginBottom:2 }}>{n.title}</div>
                        <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.sub}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
                          <span style={{ fontFamily:F, fontSize:11, color:C.textMuted }}>{n.time}</span>
                          {navLabel && <span style={{ fontFamily:F, fontSize:11, color:C.accent, fontWeight:600 }}>{navLabel} →</span>}
                        </div>
                      </div>
                      {n.unread && <div style={{ width:8, height:8, borderRadius:"50%", background:C.accent, flexShrink:0, marginTop:4 }} />}
                    </button>
                  );
                })}
              </div>
              {/* Footer */}
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.border}`, textAlign:"center" }}>
                <button onClick={() => setShowNotif(false)} style={{ background:"none", border:"none", fontFamily:F, fontSize:12, fontWeight:600, color:C.accent, cursor:"pointer" }}>Close</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Dashboard feed seed (mirrors data in the other screens) ──────────────────
const DASHBOARD_FEED = [
  { id:1,  type:"message",   color:"#34D399", avatar:"AR", source:"Alex Rivera",     body:"Hey! How's the Bridges build going?",                         time:"2m ago",  nav:"messages"  },
  { id:2,  type:"community", color:"#4BA3E3", avatar:"FC", source:"Founders Circle", body:"Alex R. posted: Just launched our first beta 🎉 Who wants early access?", time:"10m ago", nav:"community" },
  { id:3,  type:"project",   color:"#FBBF24", avatar:"BA", source:"Bridges App",     body:"Task completed: Wire up Supabase auth ✓",                      time:"45m ago", nav:"projects"  },
  { id:4,  type:"community", color:"#A78BFA", avatar:"DL", source:"Design Lab",      body:"New member joined · 89 members now",                          time:"1h ago",  nav:"community" },
  { id:5,  type:"message",   color:"#F472B6", avatar:"JL", source:"Jordan Lee",      body:"Can we sync on the community feature tomorrow?",               time:"2h ago",  nav:"messages"  },
  { id:6,  type:"project",   color:"#FBBF24", avatar:"BA", source:"Bridges App",     body:"New task added: Build community screen",                       time:"3h ago",  nav:"projects"  },
  { id:7,  type:"community", color:"#4BA3E3", avatar:"FC", source:"Founders Circle", body:"Jordan Lee liked your post · 12 likes total",                 time:"4h ago",  nav:"community" },
  { id:8,  type:"message",   color:"#34D399", avatar:"AR", source:"Alex Rivera",     body:"Just pushed the new design files 🎨",                          time:"5h ago",  nav:"messages"  },
];

const FEED_FILTERS = [
  { key:"all",       label:"All",         icon:"⊞" },
  { key:"message",   label:"Messages",    icon:"💬" },
  { key:"community", label:"Communities", icon:"🌐" },
  { key:"project",   label:"Projects",    icon:"📁" },
];

const TYPE_LABELS = { message:"Message", community:"Community", project:"Project" };
const TYPE_COLORS = { message:"#34D399", community:"#4BA3E3", project:"#FBBF24" };

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardScreen({ user, onNav, appData }) {
  const [filter, setFilter] = useState("all");

  const hasMessages    = appData.messages.length > 0;
  const hasCommunities = appData.communities.length > 0;
  const hasProjects    = appData.projects.length > 0;

  const stats = [
    { label:"Communities", value:appData.communities.length||0, icon:"🌐", color:"#A78BFA", nav:"community",
      hint: hasCommunities ? "View communities →" : "Join one →" },
    { label:"Messages",    value:appData.messages.length||0,    icon:"💬", color:"#34D399", nav:"messages",
      hint: hasMessages    ? "Open messages →"    : "Start chatting →" },
    { label:"Projects",    value:appData.projects.length||0,    icon:"📁", color:"#FBBF24", nav:"projects",
      hint: hasProjects    ? "View projects →"    : "Create one →" },
    { label:"Events",      value:appData.events.length||0,      icon:"📅", color:"#FB923C", nav:null,
      hint:"Coming soon" },
  ];

  const quickActions = [
    { icon:"💬", label: hasMessages    ? "Send a message"     : "Start a conversation", nav:"messages"  },
    { icon:"🌐", label: hasCommunities ? "View communities"   : "Join a community",     nav:"community" },
    { icon:"📁", label: hasProjects    ? "View projects"      : "Create a project",     nav:"projects"  },
    { icon:"👤", label:"Edit profile",                                                   nav:"profile"   },
  ];

  const feed = filter === "all" ? DASHBOARD_FEED : DASHBOARD_FEED.filter(f => f.type === filter);

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>

      {/* ── Stat cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {stats.map(s => (
          <Card key={s.label} onClick={s.nav ? () => onNav(s.nav) : undefined}
            style={{ padding:20, cursor:s.nav?"pointer":"default" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{s.icon}</div>
              <span style={{ fontFamily:F, fontWeight:800, fontSize:30, color:C.textPrimary }}>{s.value}</span>
            </div>
            <div style={{ fontFamily:F, fontSize:13, fontWeight:700, color:C.textPrimary, marginBottom:4 }}>{s.label}</div>
            <div style={{ fontFamily:F, fontSize:11, fontWeight:600, color:s.nav?s.color:C.textMuted }}>{s.hint}</div>
          </Card>
        ))}
      </div>

      {/* ── Feed + sidebar ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:24 }}>

        {/* Feed */}
        <div>
          {/* Filter bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary }}>Your Bridges Feed</div>
            <div style={{ display:"flex", gap:6, background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:4 }}>
              {FEED_FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:8, border:"none", background:filter===f.key?C.accent:"transparent", color:filter===f.key?"#fff":C.textSecondary, fontFamily:F, fontWeight:600, fontSize:12, cursor:"pointer", transition:"all 0.15s" }}>
                  <span style={{ fontSize:12 }}>{f.icon}</span>{f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed items */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {feed.length > 0 ? feed.map((item, idx) => (
              <Card key={item.id} onClick={() => onNav(item.nav)}
                style={{ padding:"14px 16px", cursor:"pointer", opacity:1, animation:`fadeIn 0.3s ease ${idx*0.04}s both` }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:`${item.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, fontSize:12, fontWeight:800, color:item.color, flexShrink:0 }}>
                    {item.avatar}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontFamily:F, fontWeight:700, fontSize:14, color:C.textPrimary }}>{item.source}</span>
                        <span style={{ fontFamily:F, fontSize:10, fontWeight:700, color:"#fff", background:TYPE_COLORS[item.type], borderRadius:999, padding:"2px 8px", letterSpacing:0.3 }}>
                          {TYPE_LABELS[item.type]}
                        </span>
                      </div>
                      <span style={{ fontFamily:F, fontSize:11, color:C.textMuted, flexShrink:0, marginLeft:8 }}>{item.time}</span>
                    </div>
                    <div style={{ fontFamily:F, fontSize:13, color:C.textSecondary, lineHeight:1.55 }}>{item.body}</div>
                  </div>
                  <div style={{ color:C.textMuted, fontSize:14, flexShrink:0, marginTop:2 }}>→</div>
                </div>
              </Card>
            )) : (
              <Card style={{ padding:40 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:12, opacity:0.4 }}>
                    {filter==="message"?"💬":filter==="community"?"🌐":"📁"}
                  </div>
                  <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary, marginBottom:6 }}>No {filter} activity yet</div>
                  <div style={{ fontFamily:F, fontSize:13, color:C.textMuted }}>Activity will appear here as you use Bridges.</div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Profile card */}
          <Card style={{ padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ width:46, height:46, borderRadius:"50%", background:user?.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:16, fontWeight:800, flexShrink:0 }}>
                {(user?.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.name||"Your Name"}</div>
                <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary }}>{user?.role||"No role set"}</div>
              </div>
            </div>
            {user?.bio && <div style={{ fontFamily:F, fontSize:12, color:C.textSecondary, marginBottom:12, lineHeight:1.6, borderTop:`1px solid ${C.borderLight}`, paddingTop:12 }}>{user.bio}</div>}
            {user?.interests?.length > 0 && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {user.interests.slice(0,4).map(i => (
                  <span key={i} style={{ background:C.accentLight, color:C.accentDark, borderRadius:999, padding:"3px 9px", fontSize:10, fontWeight:700, fontFamily:F }}>{i}</span>
                ))}
              </div>
            )}
            <button onClick={() => onNav("profile")}
              style={{ marginTop:14, width:"100%", padding:"8px", borderRadius:8, border:`1px solid ${C.border}`, background:"transparent", fontFamily:F, fontSize:12, fontWeight:600, color:C.accent, cursor:"pointer" }}>
              Edit Profile →
            </button>
          </Card>

          {/* Quick actions */}
          <Card style={{ padding:20 }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:14, color:C.textPrimary, marginBottom:12 }}>Quick Actions</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {quickActions.map(a => (
                <button key={a.label} onClick={() => onNav(a.nav)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", fontFamily:F, fontSize:12, fontWeight:600, color:C.textPrimary, textAlign:"left", transition:"background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = C.white}>
                  <span style={{ fontSize:15 }}>{a.icon}</span>
                  <span style={{ flex:1 }}>{a.label}</span>
                  <span style={{ color:C.textMuted, fontSize:11 }}>→</span>
                </button>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────
function MessagesScreen({ appData, onUpdateData, initialSelectedId, onClearSelectedId }) {
  const [selected, setSelected] = useState(initialSelectedId || null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState(
    MOCK_USERS.map((u, i) => ({
      ...u,
      messages: i === 0
        ? [{ id:1, text:"Hey! How's the Bridges build going?", mine:false, time:"10:32 AM" }]
        : [{ id:1, text:"Can we sync on the community feature?", mine:false, time:"Yesterday" }],
    }))
  );

  useEffect(() => {
    if (initialSelectedId) {
      setSelected(initialSelectedId);
      onClearSelectedId?.();
    }
  }, [initialSelectedId]);
  const active = chats.find(c => c.id === selected);
  const send = () => {
    if (!input.trim() || !selected) return;
    setChats(prev => prev.map(c => c.id===selected ? { ...c, messages:[...c.messages, { id:Date.now(), text:input, mine:true, time:"Now" }] } : c));
    setInput("");
  };
  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <div style={{ width:280, borderRight:`1px solid ${C.border}`, background:C.white, overflowY:"auto", flexShrink:0 }}>
        <div style={{ padding:"16px 16px 8px", fontFamily:F, fontWeight:700, fontSize:13, color:C.textMuted, letterSpacing:0.5 }}>DIRECT MESSAGES</div>
        {chats.map(c => (
          <div key={c.id} onClick={() => setSelected(c.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", cursor:"pointer", background:selected===c.id?C.accentLight:"transparent", borderLeft:`3px solid ${selected===c.id?C.accent:"transparent"}`, transition:"all 0.15s" }}>
            <div style={{ position:"relative" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:c.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:700 }}>{c.name.split(" ").map(w=>w[0]).join("")}</div>
              <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, borderRadius:"50%", background:c.online?C.online:"#CBD5E1", border:"2px solid white" }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
              <div style={{ fontFamily:F, fontSize:12, color:C.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.messages[c.messages.length-1]?.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.pageBg }}>
        {active ? (
          <>
            <div style={{ background:C.white, padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:active.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:700 }}>{active.name.split(" ").map(w=>w[0]).join("")}</div>
              <div>
                <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary }}>{active.name}</div>
                <div style={{ fontFamily:F, fontSize:12, color:active.online?C.online:C.textMuted }}>{active.online?"● Online":"○ Offline"}</div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:10 }}>
              {active.messages.map(m => (
                <div key={m.id} style={{ display:"flex", justifyContent:m.mine?"flex-end":"flex-start" }}>
                  <div style={{ background:m.mine?C.accent:C.white, color:m.mine?"white":C.textPrimary, borderRadius:m.mine?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"10px 16px", maxWidth:"70%", fontFamily:F, fontSize:14, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                    {m.text}
                    <div style={{ fontSize:10, color:m.mine?"rgba(255,255,255,0.7)":C.textMuted, marginTop:4, textAlign:"right" }}>{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding:"14px 20px", background:C.white, borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type a message..." style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:999, padding:"10px 18px", fontFamily:F, fontSize:14, outline:"none" }} />
              <Btn onClick={send} small disabled={!input.trim()}>Send</Btn>
            </div>
          </>
        ) : <EmptyState icon="💬" title="Your Messages" subtitle="Select a conversation or start a new one." />}
      </div>
    </div>
  );
}

// ── Community ─────────────────────────────────────────────────────────────────
function CommunityScreen({ appData, onUpdateData }) {
  const [communities, setCommunities] = useState([
    { id:1, name:"Founders Circle", desc:"For builders, makers, and early-stage founders.", members:142, color:"#4BA3E3", icon:"🚀" },
    { id:2, name:"Design Lab", desc:"Share work, get feedback, discuss design thinking.", members:89, color:"#A78BFA", icon:"🎨" },
  ]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [tab, setTab] = useState("board");
  const [posts, setPosts] = useState([{ id:1, author:"Alex R.", text:"Just launched our first beta 🎉 Who wants early access?", time:"2h ago", likes:12 }]);
  const [postInput, setPostInput] = useState("");
  const active = communities.find(c => c.id === selected);

  const createCommunity = () => {
    if (!newName.trim()) return;
    const newItem = { id:Date.now(), name:newName, desc:newDesc, members:1, color:COLORS[Math.floor(Math.random()*COLORS.length)], icon:"🌐" };
    const updated = [...communities, newItem];
    setCommunities(updated);
    onUpdateData?.({ communities: updated });
    setShowNew(false); setNewName(""); setNewDesc("");
  };
  const addPost = () => {
    if (!postInput.trim()) return;
    setPosts(p => [{ id:Date.now(), author:"You", text:postInput, time:"Just now", likes:0 }, ...p]);
    setPostInput("");
  };

  if (selected && active) {
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:C.white, padding:"14px 24px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", fontFamily:F, color:C.accent, fontWeight:600, cursor:"pointer", fontSize:14 }}>← Back</button>
          <div style={{ width:36, height:36, borderRadius:10, background:`${active.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{active.icon}</div>
          <div>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary }}>{active.name}</div>
            <div style={{ fontFamily:F, fontSize:12, color:C.textMuted }}>{active.members} members</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {["board","chat","events","files"].map(t => <button key={t} onClick={() => setTab(t)} style={{ background:tab===t?C.accentLight:"none", border:`1px solid ${tab===t?C.accent:C.border}`, borderRadius:999, padding:"6px 14px", fontFamily:F, fontSize:13, fontWeight:600, color:tab===t?C.accentDark:C.textSecondary, cursor:"pointer" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:24 }}>
          {tab === "board" && (
            <>
              <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:20, marginBottom:20 }}>
                <textarea value={postInput} onChange={e=>setPostInput(e.target.value)} placeholder="Share something with the community..." style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"12px 16px", fontFamily:F, fontSize:14, resize:"none", height:80, outline:"none" }} />
                <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}><Btn onClick={addPost} small disabled={!postInput.trim()}>Post</Btn></div>
              </div>
              {posts.map(p => (
                <Card key={p.id} style={{ padding:20, marginBottom:14 }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:700, flexShrink:0 }}>{p.author.split(" ").map(w=>w[0]).join("")}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:F, fontWeight:700, fontSize:14, color:C.textPrimary }}>{p.author} <span style={{ fontWeight:400, color:C.textMuted, fontSize:12 }}>{p.time}</span></div>
                      <p style={{ fontFamily:F, fontSize:14, color:C.textPrimary, margin:"6px 0 12px", lineHeight:1.55 }}>{p.text}</p>
                      <span onClick={() => setPosts(prev => prev.map(x => x.id===p.id ? { ...x, likes:x.likes+1 } : x))} style={{ fontFamily:F, fontSize:12, color:C.textMuted, cursor:"pointer" }}>❤️ {p.likes}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
          {tab !== "board" && <EmptyState icon={tab==="chat"?"💬":tab==="events"?"📅":"📁"} title={`${tab.charAt(0).toUpperCase()+tab.slice(1)} coming soon`} subtitle="This feature is being built. Check back soon!" />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ fontFamily:F, fontWeight:700, fontSize:18, color:C.textPrimary }}>Communities</div>
        <Btn onClick={() => setShowNew(true)} small icon="+">New Community</Btn>
      </div>
      {showNew && (
        <Card style={{ padding:24, marginBottom:24 }}>
          <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, marginBottom:16 }}>Create Community</div>
          <Field label="Name" value={newName} onChange={setNewName} placeholder="Community name" />
          <Field label="Description" value={newDesc} onChange={setNewDesc} placeholder="What is this community about?" />
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={createCommunity} disabled={!newName.trim()}>Create</Btn>
            <Btn onClick={() => setShowNew(false)} variant="outline">Cancel</Btn>
          </div>
        </Card>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {communities.map(c => (
          <Card key={c.id} onClick={() => setSelected(c.id)} style={{ padding:24 }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{c.icon}</div>
              <div>
                <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary }}>{c.name}</div>
                <div style={{ fontFamily:F, fontSize:12, color:C.textMuted }}>{c.members} members</div>
              </div>
            </div>
            <p style={{ fontFamily:F, fontSize:13, color:C.textSecondary, margin:0, lineHeight:1.5 }}>{c.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────
function ProjectsScreen({ appData, onUpdateData }) {
  const [projects, setProjects] = useState([
    { id:1, name:"Bridges App", desc:"Building the core platform", progress:65, color:"#4BA3E3", tasks:[{ id:1, text:"Wire up Supabase auth", done:true },{ id:2, text:"Build community screen", done:false }] },
  ]);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const active = projects.find(p => p.id === selected);

  const createProject = () => {
    if (!newName.trim()) return;
    const newItem = { id:Date.now(), name:newName, desc:"", progress:0, color:COLORS[Math.floor(Math.random()*COLORS.length)], tasks:[] };
    const updated = [...projects, newItem];
    setProjects(updated);
    onUpdateData?.({ projects: updated });
    setShowNew(false); setNewName("");
  };
  const addTask = () => {
    if (!taskInput.trim() || !selected) return;
    setProjects(prev => prev.map(p => p.id===selected ? { ...p, tasks:[...p.tasks, { id:Date.now(), text:taskInput, done:false }] } : p));
    setTaskInput("");
  };
  const toggleTask = (taskId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== selected) return p;
      const tasks = p.tasks.map(t => t.id===taskId ? { ...t, done:!t.done } : t);
      const progress = tasks.length ? Math.round((tasks.filter(t=>t.done).length / tasks.length) * 100) : 0;
      return { ...p, tasks, progress };
    }));
  };

  if (selected && active) {
    return (
      <div style={{ flex:1, overflowY:"auto", padding:28 }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", fontFamily:F, color:C.accent, fontWeight:600, cursor:"pointer", fontSize:14, marginBottom:20 }}>← Back to Projects</button>
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:28 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:`${active.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>📁</div>
          <div>
            <div style={{ fontFamily:F, fontWeight:800, fontSize:22, color:C.textPrimary }}>{active.name}</div>
            <div style={{ fontFamily:F, fontSize:13, color:C.textSecondary }}>{active.progress}% complete</div>
          </div>
        </div>
        <div style={{ background:C.border, borderRadius:8, height:8, marginBottom:28, overflow:"hidden" }}>
          <div style={{ width:`${active.progress}%`, height:"100%", background:active.color, borderRadius:8, transition:"width 0.4s" }} />
        </div>
        <Card style={{ padding:24 }}>
          <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, marginBottom:16 }}>Tasks</div>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            <input value={taskInput} onChange={e=>setTaskInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Add a task..." style={{ flex:1, border:`1.5px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontFamily:F, fontSize:14, outline:"none" }} />
            <Btn onClick={addTask} small disabled={!taskInput.trim()}>Add</Btn>
          </div>
          {active.tasks.map(t => (
            <div key={t.id} onClick={() => toggleTask(t.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", cursor:"pointer", borderBottom:`1px solid ${C.borderLight}` }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${t.done?C.accent:C.border}`, background:t.done?C.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                {t.done && <span style={{ color:"white", fontSize:11, fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ fontFamily:F, fontSize:14, color:t.done?C.textMuted:C.textPrimary, textDecoration:t.done?"line-through":"none" }}>{t.text}</span>
            </div>
          ))}
          {!active.tasks.length && <p style={{ fontFamily:F, fontSize:13, color:C.textMuted, margin:0 }}>No tasks yet. Add one above.</p>}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div style={{ fontFamily:F, fontWeight:700, fontSize:18, color:C.textPrimary }}>Projects</div>
        <Btn onClick={() => setShowNew(true)} small icon="+">New Project</Btn>
      </div>
      {showNew && (
        <Card style={{ padding:24, marginBottom:24 }}>
          <Field label="Project name" value={newName} onChange={setNewName} placeholder="What are you building?" />
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={createProject} disabled={!newName.trim()}>Create</Btn>
            <Btn onClick={() => setShowNew(false)} variant="outline">Cancel</Btn>
          </div>
        </Card>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {projects.map(p => (
          <Card key={p.id} onClick={() => setSelected(p.id)} style={{ padding:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${p.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📁</div>
              <div style={{ fontFamily:F, fontWeight:700, fontSize:15, color:C.textPrimary }}>{p.name}</div>
            </div>
            <div style={{ background:C.border, borderRadius:4, height:6, marginBottom:8, overflow:"hidden" }}>
              <div style={{ width:`${p.progress}%`, height:"100%", background:p.color, borderRadius:4 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:F, fontSize:12, color:C.textMuted }}>{p.tasks.filter(t=>t.done).length}/{p.tasks.length} tasks</span>
              <span style={{ fontFamily:F, fontSize:12, fontWeight:700, color:p.color }}>{p.progress}%</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function ProfileScreen({ user, onUpdate }) {
  const [name, setName] = useState(user?.name||"");
  const [bio, setBio] = useState(user?.bio||"");
  const [role, setRole] = useState(user?.role||"");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const toastRef = useRef(null);

  const handleSave = async () => {
    setSaving(true); setSaveError("");
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name:name, bio, role } });
      if (error) { setSaveError(error.message); return; }
      onUpdate({ name, bio, role });
      setSaved(true);
      clearTimeout(toastRef.current);
      toastRef.current = setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => () => clearTimeout(toastRef.current), []);

  const initials = (name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>
      <div style={{ maxWidth:560 }}>
        {saved && <div style={{ background:"#DCFCE7", border:"1.5px solid #86EFAC", borderRadius:12, padding:"12px 18px", marginBottom:20, fontFamily:F, fontSize:13, color:"#16A34A", fontWeight:600 }}>✓ Profile saved successfully</div>}
        {saveError && <div style={{ background:"#FEE2E2", border:"1.5px solid #FCA5A5", borderRadius:12, padding:"12px 18px", marginBottom:20, fontFamily:F, fontSize:13, color:"#DC2626" }}>⚠ {saveError}</div>}
        <Card style={{ padding:28, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:28 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:user?.color||C.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:26, fontWeight:700 }}>{initials}</div>
            <div>
              <div style={{ fontFamily:F, fontWeight:800, fontSize:20, color:C.textPrimary }}>{user?.name||"Your Name"}</div>
              <div style={{ fontFamily:F, fontSize:13, color:C.textMuted }}>{user?.email||""}</div>
            </div>
          </div>
          <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontFamily:F, fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:6 }}>Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell people a bit about yourself..." style={{ width:"100%", boxSizing:"border-box", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"12px 16px", fontFamily:F, fontSize:14, color:C.textPrimary, background:C.white, outline:"none", resize:"vertical", minHeight:80 }} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontFamily:F, fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:8 }}>Role</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {ROLES.map(r => <div key={r} onClick={()=>setRole(r)} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${role===r?C.accent:C.border}`, background:role===r?C.accentLight:C.white, color:role===r?C.accentDark:C.textSecondary, fontFamily:F, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>{r}</div>)}
            </div>
          </div>
          <Btn onClick={handleSave} loading={saving}>Save Profile</Btn>
        </Card>
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsScreen({ user, onSignOut, onUpdate }) {
  const savedSettings = user?.settings || {};
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [notifications, setNotifications] = useState(savedSettings.notifications ?? true);
  const [emailDigest, setEmailDigest] = useState(savedSettings.emailDigest ?? false);
  const [darkMode, setDarkMode] = useState(false); // dark mode not yet implemented
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const toastRef = useRef(null);

  const saveSettings = async () => {
    setSaving(true); setSaveError("");
    const newSettings = { notifications, emailDigest };
    try {
      const { error } = await supabase.auth.updateUser({ data: { settings: newSettings } });
      if (error) { setSaveError(error.message); return; }
      onUpdate?.({ settings: newSettings });
      setSaved(true);
      clearTimeout(toastRef.current);
      toastRef.current = setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => () => clearTimeout(toastRef.current), []);

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{ width:44, height:26, borderRadius:13, background:value?C.accent:C.border, cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:value?20:3, width:20, height:20, borderRadius:"50%", background:"white", boxShadow:"0 1px 4px rgba(0,0,0,0.15)", transition:"left 0.2s" }} />
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", padding:28 }}>
      <div style={{ maxWidth:560 }}>
        {saved && <div style={{ background:"#DCFCE7", border:"1.5px solid #86EFAC", borderRadius:12, padding:"12px 18px", marginBottom:20, fontFamily:F, fontSize:13, color:"#16A34A", fontWeight:600 }}>✓ Settings saved</div>}
        {saveError && <div style={{ background:"#FEE2E2", border:"1.5px solid #FCA5A5", borderRadius:12, padding:"12px 18px", marginBottom:20, fontFamily:F, fontSize:13, color:"#DC2626" }}>⚠ {saveError}</div>}
        <Card style={{ padding:24, marginBottom:20 }}>
          <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, marginBottom:18 }}>Notifications</div>
          {[{ label:"Push notifications", sub:"Get notified about messages and activity", value:notifications, onChange:setNotifications },{ label:"Email digest", sub:"Weekly summary of your communities", value:emailDigest, onChange:setEmailDigest }].map(({ label, sub, value, onChange }) => (
            <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${C.borderLight}` }}>
              <div>
                <div style={{ fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary }}>{label}</div>
                <div style={{ fontFamily:F, fontSize:12, color:C.textMuted, marginTop:2 }}>{sub}</div>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </Card>
        <Card style={{ padding:24, marginBottom:20 }}>
          <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:C.textPrimary, marginBottom:18 }}>Appearance</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", opacity:0.5 }}>
            <div>
              <div style={{ fontFamily:F, fontWeight:600, fontSize:14, color:C.textPrimary }}>Dark mode</div>
              <div style={{ fontFamily:F, fontSize:12, color:C.textMuted, marginTop:2 }}>Coming soon</div>
            </div>
            {/* Disabled — not yet implemented */}
            <Toggle value={darkMode} onChange={() => {}} />
          </div>
        </Card>
        <div style={{ marginBottom:20 }}><Btn onClick={saveSettings} loading={saving}>Save Settings</Btn></div>
        {confirmSignOut ? (
          <Card style={{ padding:24, border:`1.5px solid ${C.notification}30`, background:"#FFF5F5" }}>
            <div style={{ fontFamily:F, fontWeight:700, fontSize:16, color:"#DC2626", marginBottom:8 }}>Are you sure you want to sign out?</div>
            <div style={{ fontFamily:F, fontSize:13, color:C.textSecondary, marginBottom:20 }}>You'll need to sign back in to access your account.</div>
            <div style={{ display:"flex", gap:12 }}>
              <Btn onClick={onSignOut} variant="danger" icon="🚪">Yes, sign out</Btn>
              <Btn onClick={() => setConfirmSignOut(false)} variant="outline">Cancel</Btn>
            </div>
          </Card>
        ) : (
          <Btn onClick={() => setConfirmSignOut(true)} variant="danger" fullWidth icon="🚪">Sign Out</Btn>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const TITLES = {
  dashboard:["Dashboard",null], messages:["Messages","Stay connected with your network"],
  community:["Community","Explore and build communities"], projects:["Projects","Collaborate with your team"],
  profile:["Profile","Manage your account"], settings:["Settings","Customize your experience"],
};

// Shared user directory — used by both MessagesScreen and TopBar search
const MOCK_USERS = [
  { id:1, name:"Alex Rivera", color:"#34D399", online:true },
  { id:2, name:"Jordan Lee", color:"#F472B6", online:false },
];

// appData stats counts to match each screen's own initial state
const DEMO_SEED = {
  messages:    [1, 2],           // 2 contacts (MOCK_USERS)
  communities: [1, 2],           // 2 communities (Founders Circle + Design Lab)
  projects:    [1],              // 1 project (Bridges App)
  events:      [],
};

function MainApp({ user, onSignOut, onUpdateUser, isDemo }) {
  const [tab, setTab] = useState("dashboard");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [appData, setAppData] = useState(isDemo ? DEMO_SEED : { messages:[], communities:[], projects:[], events:[] });
  const updateData = patch => setAppData(d => ({ ...d, ...patch }));
  const [title, subtitle] = TITLES[tab] || ["Bridges",""];

  const handleUserSelect = (u) => {
    setSelectedChatId(u.id);
    setTab("messages");
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", fontFamily:F, background:C.pageBg }}>
      {isDemo && (
        <div style={{ background:`linear-gradient(90deg,${C.accent},${C.accentDark})`, color:"#fff", textAlign:"center", padding:"8px 16px", fontFamily:F, fontSize:13, fontWeight:600, letterSpacing:0.2, flexShrink:0 }}>
          ▶ Demo Mode — All data is local and resets on refresh. &nbsp;
          <button onClick={onSignOut} style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:999, color:"#fff", fontFamily:F, fontWeight:700, fontSize:12, padding:"3px 12px", cursor:"pointer" }}>Exit Demo</button>
        </div>
      )}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <Sidebar active={tab} onNav={setTab} onSignOut={onSignOut} user={user} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <TopBar
          title={tab==="dashboard"?`Welcome, ${user?.name?.split(" ")[0]||"there"} 👋`:title}
          subtitle={subtitle}
          users={MOCK_USERS}
          onUserSelect={handleUserSelect}
          onNav={setTab}
        />
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          {tab==="dashboard" && <DashboardScreen user={user} onNav={setTab} appData={appData} />}
          {tab==="messages"  && <MessagesScreen appData={appData} onUpdateData={updateData} initialSelectedId={selectedChatId} onClearSelectedId={() => setSelectedChatId(null)} />}
          {tab==="community" && <CommunityScreen appData={appData} onUpdateData={updateData} />}
          {tab==="projects"  && <ProjectsScreen appData={appData} onUpdateData={updateData} />}
          {tab==="profile"   && <ProfileScreen user={user} onUpdate={onUpdateUser} />}
          {tab==="settings"  && <SettingsScreen user={user} onSignOut={onSignOut} onUpdate={onUpdateUser} />}
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.pageBg, fontFamily:F }}>
      <div style={{ textAlign:"center" }}>
        <img src="/logo.svg" alt="Bridges" style={{ height:40, width:"auto", marginBottom:16 }} />
        <div style={{ fontFamily:F, fontSize:13, color:C.textMuted }}>Loading your workspace...</div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load Google Font
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);

    // Check existing Supabase session on mount
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          setUser({ id:session.user.id, email:session.user.email, name:meta.full_name||meta.name||session.user.email?.split("@")[0]||"User", role:meta.role||"", bio:meta.bio||"", color:meta.color||COLORS[0], interests:meta.interests||[], useCase:meta.useCase||"", settings:meta.settings||{} });
          setScreen(meta.onboarded ? "app" : "onboarding");
        } else {
          setScreen("landing");
        }
      })
      .catch(() => setScreen("landing"));

    // Listen for auth state changes (OAuth redirect, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const u = { id:session.user.id, email:session.user.email, name:meta.full_name||meta.name||session.user.email?.split("@")[0]||"User", role:meta.role||"", bio:meta.bio||"", color:meta.color||COLORS[0], interests:meta.interests||[], useCase:meta.useCase||"", settings:meta.settings||{} };
        setUser(u);
        setScreen(s => s === "loading" ? (meta.onboarded ? "app" : "onboarding") : s);
      } else {
        setUser(null);
        setScreen("landing");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [isDemo, setIsDemo] = useState(false);

  const handleSignOut = async () => {
    if (!isDemo) await supabase.auth.signOut();
    setUser(null);
    setIsDemo(false);
    setScreen("landing");
  };

  const handleDemo = () => {
    setUser(DEMO_USER);
    setIsDemo(true);
    setScreen("app");
  };

  return (
    <>
      {screen==="loading"    && <LoadingScreen />}
      {screen==="landing"    && <LandingScreen onSignUp={() => setScreen("signup")} onLogin={() => setScreen("login")} onDemo={handleDemo} />}
      {screen==="signup"     && <SignUpScreen onSignUp={d => { setUser(d); setScreen("onboarding"); }} onGoLogin={() => setScreen("login")} />}
      {screen==="login"      && <LoginScreen onLogin={u => { setUser(u); setScreen("app"); }} onGoSignUp={() => setScreen("signup")} />}
      {screen==="onboarding" && <OnboardingScreen user={user} onComplete={p => { setUser(u => ({ ...u, ...p })); setScreen("tour"); }} />}
      {screen==="tour"       && <FeatureTour user={user} onFinish={() => setScreen("app")} />}
      {screen==="app"        && <MainApp user={user} onSignOut={handleSignOut} onUpdateUser={u => setUser(p => ({ ...p, ...u }))} isDemo={isDemo} />}
    </>
  );
}
