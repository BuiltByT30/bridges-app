import { useState, useEffect, useRef } from "react";

const C = {
  skyTop: "#4FC3F7",
  skyMid: "#74D0F7",
  skyBottom: "#B3E5FC",
  accent: "#2AABEE",
  accentDark: "#1A8FC9",
  accentLight: "#E3F5FE",
  white: "#FFFFFF",
  bg: "#F0F7FB",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  textPrimary: "#0D1B2A",
  textSecondary: "#5A7A8A",
  border: "#E0EEF5",
  online: "#34C759",
  away: "#FF9500",
  notification: "#FF3B30",
  hover: "#F5FBFF",
};

const users = [
  { id: 1, name: "Alex Rivera", role: "Product Manager", avatar: "AR", color: "#FF6B6B", online: true, unread: 3, lastMsg: "The new feature is ready for review 🚀", time: "9:41 AM" },
  { id: 2, name: "Maya Johnson", role: "UI Designer", avatar: "MJ", color: "#4ECDC4", online: true, unread: 1, lastMsg: "Looks amazing! Checking designs now.", time: "9:38 AM" },
  { id: 3, name: "Chris Park", role: "Engineer", avatar: "CP", color: "#45B7D1", online: false, unread: 0, lastMsg: "I pushed the latest build ✓", time: "Yesterday" },
  { id: 4, name: "Sam Torres", role: "Marketing", avatar: "ST", color: "#F7A93B", online: true, unread: 7, lastMsg: "Campaign is live! Check the metrics", time: "8:55 AM" },
  { id: 5, name: "Jordan Lee", role: "Community Lead", avatar: "JL", color: "#96CEB4", online: false, unread: 0, lastMsg: "Great meetup last night everyone!", time: "Yesterday" },
  { id: 6, name: "Design Team", role: "Group · 5 members", avatar: "DT", color: "#C77DFF", online: true, unread: 2, lastMsg: "Maya: Updated the component library", time: "10:02 AM" },
];

const initMessages = [
  { id: 1, userId: 1, text: "Hey team! The new feature is ready for review 🚀", time: "9:41 AM", mine: false },
  { id: 2, userId: 2, text: "Looks amazing! I'll check the designs now.", time: "9:43 AM", mine: false },
  { id: 3, userId: null, text: "Just joined the channel — excited to be here!", time: "9:45 AM", mine: true },
  { id: 4, userId: 1, text: "Welcome! So glad you're here 🎉 Let me know if you need anything.", time: "9:46 AM", mine: false },
  { id: 5, userId: 3, text: "I pushed the latest build — should be live in a few minutes.", time: "9:50 AM", mine: false },
  { id: 6, userId: null, text: "Perfect timing, thanks Chris!", time: "9:51 AM", mine: true },
  { id: 7, userId: 2, text: "The new color system is looking 🔥 really cohesive now", time: "10:02 AM", mine: false },
];

const events = [
  { id: 1, title: "Product Sprint Kickoff", date: "Today", time: "2:00 PM", attendees: 12, color: C.accent, emoji: "🚀", desc: "Kicking off the Q2 sprint with the full product team." },
  { id: 2, title: "Community Meetup", date: "Tomorrow", time: "6:00 PM", attendees: 34, color: "#FF6B6B", emoji: "🤝", desc: "Monthly in-person gathering for the Bridges community." },
  { id: 3, title: "Design Review", date: "Wed, Mar 19", time: "11:00 AM", attendees: 6, color: "#4ECDC4", emoji: "🎨", desc: "Review the latest UI updates and component library." },
  { id: 4, title: "Team Retrospective", date: "Fri, Mar 21", time: "3:00 PM", attendees: 8, color: "#96CEB4", emoji: "📋", desc: "End-of-sprint retro — what went well, what to improve." },
  { id: 5, title: "Bridges Hackathon", date: "Sat, Mar 22", time: "10:00 AM", attendees: 52, color: "#C77DFF", emoji: "💡", desc: "24-hour build challenge open to the entire community." },
];

const projects = [
  { id: 1, name: "Bridges Web App", progress: 72, members: [0,1,2], status: "In Progress", tasks: 14, done: 10, color: C.accent },
  { id: 2, name: "Community Platform", progress: 45, members: [3,4], status: "Active", tasks: 22, done: 10, color: "#FF6B6B" },
  { id: 3, name: "API Integration", progress: 90, members: [2,0], status: "Review", tasks: 8, done: 7, color: "#4ECDC4" },
  { id: 4, name: "Mobile App", progress: 30, members: [1,3,4], status: "Planning", tasks: 30, done: 9, color: "#F7A93B" },
];

const communities = [
  { id: 1, name: "Product Builders", members: 1240, icon: "🏗️", color: C.accent },
  { id: 2, name: "Design Collective", members: 876, icon: "🎨", color: "#C77DFF" },
  { id: 3, name: "Dev Network", members: 2103, icon: "⚡", color: "#4ECDC4" },
  { id: 4, name: "Startup Founders", members: 543, icon: "🚀", color: "#FF6B6B" },
];

function Avatar({ user, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user?.color || C.accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.33,
      fontFamily: "'DM Sans', sans-serif", flexShrink: 0, position: "relative",
    }}>
      {user?.avatar}
      {user?.online !== undefined && (
        <div style={{
          position: "absolute", bottom: 1, right: 1,
          width: Math.max(size * 0.28, 8), height: Math.max(size * 0.28, 8),
          borderRadius: "50%", background: user.online ? C.online : "#CCC",
          border: "2px solid white",
        }} />
      )}
    </div>
  );
}

function Sidebar({ active, onNav, unreadTotal }) {
  const navItems = [
    { id: "home", icon: "⊞", label: "Dashboard" },
    { id: "messages", icon: "💬", label: "Messages", badge: unreadTotal },
    { id: "events", icon: "📅", label: "Events" },
    { id: "projects", icon: "📁", label: "Projects" },
    { id: "community", icon: "🌐", label: "Community" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{
      width: 240, background: C.sidebar, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
      boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
    }}>
      {/* Logo */}
      <div style={{
        padding: "22px 20px 18px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.skyTop}, ${C.accentDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18,
          }}>🌉</div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.textPrimary, lineHeight: 1 }}>Bridges</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.textSecondary, fontWeight: 600 }}>CONNECT · GROW · BUILD</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: C.textSecondary, letterSpacing: 1.2, padding: "6px 10px 10px", textTransform: "uppercase" }}>Menu</div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
            background: active === item.id ? C.accentLight : "transparent",
            color: active === item.id ? C.accentDark : C.textSecondary,
            fontFamily: "'DM Sans', sans-serif", fontWeight: active === item.id ? 700 : 500,
            fontSize: 14, marginBottom: 2, textAlign: "left",
            transition: "all 0.15s ease",
          }}>
            <span style={{ fontSize: 17, width: 22, textAlign: "center" }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge > 0 && (
              <span style={{
                background: C.notification, color: "white",
                borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700,
              }}>{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar user={{ avatar: "YO", color: C.accent, online: true }} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: C.textPrimary }}>You</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.online }}>● Online</div>
        </div>
        <span style={{ fontSize: 16, cursor: "pointer", color: C.textSecondary }}>⚙</span>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle, actions }) {
  return (
    <div style={{
      background: C.white, borderBottom: `1px solid ${C.border}`,
      padding: "16px 28px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexShrink: 0,
    }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.textPrimary }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {actions}
        <div style={{
          background: C.accentLight, border: `1px solid ${C.border}`,
          borderRadius: 22, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer",
        }}>
          <span>🔍</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSecondary }}>Search...</span>
        </div>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{
            position: "absolute", top: -4, right: -4, width: 16, height: 16,
            borderRadius: "50%", background: C.notification,
            border: "2px solid white", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontSize: 8, fontWeight: 700,
          }}>4</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: "20px 22px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}20`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 24, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: C.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSecondary, fontWeight: 600, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.online, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function HomeScreen({ onNav }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      {/* Hero banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.skyTop} 0%, ${C.accentDark} 100%)`,
        padding: "32px 28px", color: "white", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -60, right: 60, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <h2 style={{ margin: "0 0 6px", fontFamily: "'DM Serif Display', serif", fontSize: 28, position: "relative" }}>Good morning 👋</h2>
        <p style={{ margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif", fontSize: 15, opacity: 0.9, position: "relative" }}>Here's what's happening across your Bridges today.</p>
        <button onClick={() => onNav("community")} style={{
          background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
          color: "white", borderRadius: 22, padding: "9px 22px",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>Explore Community →</button>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard icon="🤝" label="Connections" value="128" color={C.accent} sub="+12 this week" />
          <StatCard icon="💬" label="Messages" value="11" color="#FF6B6B" sub="4 unread" />
          <StatCard icon="📅" label="Events" value="5" color="#4ECDC4" sub="1 today" />
          <StatCard icon="📁" label="Projects" value="4" color="#F7A93B" sub="2 active" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Recent Activity */}
          <div>
            <h3 style={{ margin: "0 0 14px", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.textPrimary }}>Recent Messages</h3>
            <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {users.slice(0, 4).map((u, i) => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                  borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                  cursor: "pointer", transition: "background 0.1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.hover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <Avatar user={u} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: C.textPrimary }}>{u.name}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.textSecondary }}>{u.time}</span>
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSecondary, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.lastMsg}</div>
                  </div>
                  {u.unread > 0 && (
                    <div style={{ background: C.accent, color: "white", borderRadius: 10, minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, padding: "0 6px", flexShrink: 0 }}>{u.unread}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Projects preview */}
            <h3 style={{ margin: "24px 0 14px", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.textPrimary }}>Active Projects</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {projects.slice(0, 2).map(p => (
                <div key={p.id} style={{ background: C.card, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: C.textPrimary }}>{p.name}</div>
                    <span style={{
                      background: `${p.color}20`, color: p.color, borderRadius: 20,
                      padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    }}>{p.status}</span>
                  </div>
                  <div style={{ background: C.border, borderRadius: 6, height: 6, marginBottom: 8, overflow: "hidden" }}>
                    <div style={{ width: `${p.progress}%`, height: "100%", background: `linear-gradient(90deg, ${p.color}99, ${p.color})`, borderRadius: 6 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex" }}>
                      {p.members.map((idx, i) => (
                        <div key={idx} style={{ marginLeft: i > 0 ? -8 : 0, position: "relative", zIndex: p.members.length - i }}>
                          <Avatar user={users[idx]} size={24} />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: p.color, fontWeight: 700 }}>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div>
            {/* Active users */}
            <h3 style={{ margin: "0 0 14px", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.textPrimary }}>Online Now</h3>
            <div style={{ background: C.card, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {users.filter(u => u.online).map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
                  <Avatar user={u} size={36} />
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: C.textPrimary }}>{u.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.textSecondary }}>{u.role}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming event */}
            <h3 style={{ margin: "0 0 14px", fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.textPrimary }}>Up Next</h3>
            <div style={{
              background: `linear-gradient(135deg, ${C.skyTop}, ${C.accentDark})`,
              borderRadius: 16, padding: 20, color: "white",
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🚀</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, marginBottom: 4 }}>Product Sprint Kickoff</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: 0.85, marginBottom: 16 }}>Today · 2:00 PM · 12 attending</div>
              <button onClick={() => onNav("events")} style={{
                background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
                color: "white", borderRadius: 20, padding: "7px 18px",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>View Event →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesScreen() {
  const [activeUser, setActiveUser] = useState(users[0]);
  const [messages, setMessages] = useState(initMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { id: Date.now(), userId: null, text: input, time: "Now", mine: true }]);
    setInput("");
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* Conversation list */}
      <div style={{ width: 300, borderRight: `1px solid ${C.border}`, background: C.sidebar, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ background: C.accentLight, borderRadius: 10, padding: "9px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span>🔍</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSecondary }}>Search messages...</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {users.map(u => (
            <div key={u.id} onClick={() => setActiveUser(u)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`, cursor: "pointer",
              background: activeUser?.id === u.id ? C.accentLight : "transparent",
              transition: "background 0.1s",
            }}>
              <Avatar user={u} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, color: C.textPrimary }}>{u.name}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.textSecondary }}>{u.time}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{u.lastMsg}</span>
                  {u.unread > 0 && <div style={{ background: C.accent, color: "white", borderRadius: 10, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, padding: "0 5px", flexShrink: 0 }}>{u.unread}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: `1px solid ${C.border}` }}>
          <button style={{ width: "100%", background: C.accent, color: "white", border: "none", borderRadius: 10, padding: "10px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ New Message</button>
        </div>
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.bg }}>
        {/* Chat header */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "14px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar user={activeUser} size={42} />
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: C.textPrimary }}>{activeUser?.name}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: activeUser?.online ? C.online : C.textSecondary }}>{activeUser?.online ? "● Online" : "○ Offline"}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 18, color: C.textSecondary }}>
            <span style={{ cursor: "pointer" }}>📞</span>
            <span style={{ cursor: "pointer" }}>📹</span>
            <span style={{ cursor: "pointer" }}>⋯</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map(m => {
            const sender = users.find(u => u.id === m.userId);
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: m.mine ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
                {!m.mine && <Avatar user={sender || activeUser} size={32} />}
                <div style={{
                  background: m.mine ? C.accent : C.white,
                  color: m.mine ? "white" : C.textPrimary,
                  borderRadius: m.mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "11px 16px", maxWidth: "62%",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)", lineHeight: 1.5,
                }}>
                  {m.text}
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{m.time}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "14px 22px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20, cursor: "pointer" }}>📎</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={`Message ${activeUser?.name}...`}
            style={{
              flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 22,
              padding: "11px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
              outline: "none", background: C.bg, color: C.textPrimary,
            }}
          />
          <button onClick={send} style={{
            background: C.accent, color: "white", border: "none",
            borderRadius: "50%", width: 42, height: 42, fontSize: 18,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>➤</button>
        </div>
      </div>
    </div>
  );
}

function EventsScreen() {
  const [rsvp, setRsvp] = useState({ 1: true });
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{ padding: "28px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div />
          <button style={{ background: C.accent, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Create Event</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
          {events.map(ev => (
            <div key={ev.id} style={{ background: C.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${C.border}` }}>
              <div style={{ background: `linear-gradient(135deg, ${ev.color}30, ${ev.color}10)`, padding: "22px 22px 16px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{ev.emoji}</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: C.textPrimary, marginBottom: 4 }}>{ev.title}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSecondary }}>{ev.date} · {ev.time}</div>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <p style={{ margin: "0 0 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{ev.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex" }}>
                      {users.slice(0, 3).map((u, i) => (
                        <div key={u.id} style={{ marginLeft: i > 0 ? -8 : 0, position: "relative", zIndex: 3 - i }}>
                          <Avatar user={u} size={26} />
                        </div>
                      ))}
                    </div>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSecondary }}>{ev.attendees} attending</span>
                  </div>
                  <button
                    onClick={() => setRsvp(r => ({ ...r, [ev.id]: !r[ev.id] }))}
                    style={{
                      background: rsvp[ev.id] ? C.online : C.accent,
                      color: "white", border: "none", borderRadius: 20,
                      padding: "8px 18px", fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700, fontSize: 13, cursor: "pointer",
                    }}>{rsvp[ev.id] ? "✓ Going" : "RSVP"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsScreen() {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg, padding: "28px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22 }}>
        <button style={{ background: C.accent, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ New Project</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {projects.map(p => (
          <div key={p.id} style={{ background: C.card, borderRadius: 18, padding: 22, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: C.textPrimary, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSecondary }}>{p.done} of {p.tasks} tasks done</div>
              </div>
              <span style={{ background: `${p.color}20`, color: p.color, borderRadius: 20, padding: "4px 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700 }}>{p.status}</span>
            </div>
            <div style={{ background: C.border, borderRadius: 8, height: 8, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ width: `${p.progress}%`, height: "100%", background: `linear-gradient(90deg, ${p.color}99, ${p.color})`, borderRadius: 8 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex" }}>
                {p.members.map((idx, i) => (
                  <div key={idx} style={{ marginLeft: i > 0 ? -10 : 0, position: "relative", zIndex: p.members.length - i }}>
                    <Avatar user={users[idx]} size={32} />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: p.color, fontWeight: 700 }}>{p.progress}%</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: C.textSecondary }}>complete</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunityScreen() {
  const [joined, setJoined] = useState({ 1: true, 3: true });
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg, padding: "28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.textPrimary }}>Communities</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {communities.map(c => (
              <div key={c.id} style={{ background: C.card, borderRadius: 18, padding: 22, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: C.textPrimary, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: C.textSecondary, marginBottom: 16 }}>{c.members.toLocaleString()} members</div>
                <button
                  onClick={() => setJoined(j => ({ ...j, [c.id]: !j[c.id] }))}
                  style={{
                    background: joined[c.id] ? `${c.color}20` : c.color,
                    color: joined[c.id] ? c.color : "white",
                    border: `1.5px solid ${c.color}`,
                    borderRadius: 20, padding: "7px 18px",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  }}>{joined[c.id] ? "✓ Joined" : "Join"}</button>
              </div>
            ))}
          </div>
        </div>

        {/* People you may know */}
        <div>
          <h3 style={{ margin: "0 0 16px", fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.textPrimary }}>People to Connect</h3>
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {users.slice(0, 5).map((u, i) => (
              <div key={u.id} style={{ padding: "14px 16px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar user={u} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: C.textPrimary }}>{u.name}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.textSecondary }}>{u.role}</div>
                </div>
                <button style={{ background: C.accentLight, color: C.accent, border: `1px solid ${C.accent}`, borderRadius: 16, padding: "5px 12px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Connect</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg, padding: "28px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Profile card */}
        <div style={{ background: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <div style={{ background: `linear-gradient(135deg, ${C.skyTop}, ${C.accentDark})`, height: 120, position: "relative" }}>
            <div style={{ position: "absolute", bottom: -36, left: 28 }}>
              <Avatar user={{ avatar: "YO", color: C.accent, online: true }} size={72} />
            </div>
          </div>
          <div style={{ padding: "48px 28px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: C.textPrimary }}>Your Name</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.textSecondary, marginTop: 2 }}>Community Member · Joined March 2026</div>
            </div>
            <button style={{ background: C.accent, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Edit Profile</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
            {[["128", "Connections"], ["4", "Events"], ["4", "Projects"], ["3", "Communities"]].map(([v, l]) => (
              <div key={l} style={{ padding: "16px 10px", borderRight: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: C.textPrimary }}>{v}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          {[
            { icon: "🔔", label: "Notifications", value: "Enabled" },
            { icon: "🔒", label: "Privacy & Security", value: "" },
            { icon: "🎨", label: "Appearance", value: "Light Mode" },
            { icon: "🤝", label: "Invite Friends", value: "" },
            { icon: "❓", label: "Help & Support", value: "" },
            { icon: "🚪", label: "Sign Out", value: "" },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", padding: "16px 22px",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
              cursor: "pointer",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.hover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 20, marginRight: 16 }}>{item.icon}</span>
              <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: C.textPrimary, fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.textSecondary }}>{item.value} ›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SCREEN_TITLES = {
  home: ["Dashboard", "Welcome back to Bridges 👋"],
  messages: ["Messages", "Stay connected with your network"],
  events: ["Events", "Discover and join community events"],
  projects: ["Projects", "Collaborate with your team"],
  community: ["Community", "Explore communities and people"],
  profile: ["Profile", "Manage your account"],
};

export default function BridgesWebApp() {
  const [tab, setTab] = useState("home");
  const unreadTotal = users.reduce((sum, u) => sum + u.unread, 0);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const [title, subtitle] = SCREEN_TITLES[tab] || ["Bridges", ""];

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif", background: C.bg,
    }}>
      <Sidebar active={tab} onNav={setTab} unreadTotal={unreadTotal} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar title={title} subtitle={subtitle} />
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {tab === "home" && <HomeScreen onNav={setTab} />}
          {tab === "messages" && <MessagesScreen />}
          {tab === "events" && <EventsScreen />}
          {tab === "projects" && <ProjectsScreen />}
          {tab === "community" && <CommunityScreen />}
          {tab === "profile" && <ProfileScreen />}
        </div>
      </div>
    </div>
  );
}
