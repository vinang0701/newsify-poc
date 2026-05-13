import { useNavigate } from "react-router";
import { useEffect } from "react";

const TEAM = [
  {
    name: "Vincent",
    role: "Team Leader",
    initials: "V",
    color: "#2563EB",
    photo: "/team/vincent.jpg",
    bio: "Leading the vision and architecture of Newsify, ensuring every feature delivers real value to institutions and their communities.",
  },
  {
    name: "Gabrielle",
    role: "Head Creative Designer",
    initials: "G",
    color: "#EC4899",
    photo: "/team/gabrielle.jpg",
    bio: "Driving the visual identity and user experience of Newsify, creating designs that are both beautiful and intuitive.",
  },
  {
    name: "Jedidiah",
    role: "Software Engineer (Web & UI/UX)",
    initials: "J",
    color: "#7C3AED",
    photo: "/team/jedidiah.jpg",
    bio: "Building and refining the features that make Newsify a seamless experience for students and staff alike.",
  },
  {
    name: "Timothy",
    role: "Software Engineer (Mobile & UI/UX)",
    initials: "T",
    color: "#0891B2",
    photo: "/team/tim.jpg",
    bio: "Developing robust and scalable solutions that power Newsify's core functionality and user interactions.",
  },
  {
    name: "Sameer",
    role: "Backend & Database Engineer",
    initials: "S",
    color: "#059669",
    photo: "/team/sam.jpg",
    bio: "Architecting the backend infrastructure and database systems that keep Newsify fast, secure, and reliable.",
  },
  {
    name: "Andrew",
    role: "Software Developer",
    initials: "A",
    color: "#D97706",
    photo: "/team/andrew.jpg",
    bio: "Contributing to the development of Newsify's features and supporting the team in delivering a quality product.",
  },
];

const VALUES = [
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>),
    title: "Mission-Driven",
    desc: "We exist to keep school communities informed, connected, and engaged.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    title: "Community First",
    desc: "Every feature we build puts the needs of students and staff at the center.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>),
    title: "Innovation",
    desc: "We constantly push boundaries to deliver the best possible experience.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>),
    title: "Trust & Security",
    desc: "We take data privacy seriously and protect every user's information.",
  },
];

export default function AboutPage() {
  const navigate = useNavigate();
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "clip", background: "#030303" }}>

      {/* Navbar */}
      <nav style={{ background: "#030303", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div onClick={() => { navigate("/"); window.scrollTo(0, 0); }} style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 700, fontSize: 18, cursor: "pointer" }}>
          <img src="/icon_light.png" alt="logo" width={30} style={{ objectFit: "contain" }} />
          Newsify
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <button onClick={() => { navigate("/"); window.scrollTo(0, 0); }} style={{ background: "transparent", border: "none", color: "#9CA3AF", fontSize: 14, cursor: "pointer", fontWeight: 400 }}>
            ← Back to Home
          </button>
          <button
            onClick={() => navigate("/login")}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#111827"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
            style={{ background: "transparent", border: "1.5px solid #fff", borderRadius: 8, padding: "7px 24px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
          >Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)", padding: "80px 60px", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", margin: "0 0 16px 0" }}>About Us</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
          We're a passionate team of students building the future of school communication.
        </p>
      </section>

      {/* Mission */}
      <section style={{ background: "#0F172A", padding: "80px 60px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Our Mission</h2>
          <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8, marginBottom: 24 }}>
            Newsify was built to bridge the gap between institutions and their people. We believe every school deserves a dedicated space where news flows freely, communities thrive, and achievements are celebrated.
          </p>
          <p style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.8 }}>
            From personalised news feeds to community hubs and achievement systems, we're making it easier than ever for students and staff to stay connected, get involved, and make their voices heard.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "#1E293B", padding: "80px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 48 }}>Our Values</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 1000, margin: "0 auto" }}>
          {VALUES.map(v => (
            <div key={v.title}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 20px", textAlign: "center", transition: "all 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{v.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{v.title}</div>
              <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ background: "#0F172A", padding: "80px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Meet The Team</h2>
        <p style={{ textAlign: "center", fontSize: 14, color: "#94A3B8", marginBottom: 48 }}>The people behind Newsify. While we each have our specialisations, we are all full stack developers who contribute across the entire product.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, maxWidth: 900, margin: "0 auto" }}>
          {TEAM.map(member => (
            <div key={member.name}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "32px 24px", textAlign: "center", transition: "all 0.2s" }}
            >
              <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", margin: "0 auto 20px" }}>
                <img src={member.photo} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{member.name}</div>
              <div style={{ fontSize: 13, color: member.color, fontWeight: 600, marginBottom: 14 }}>{member.role}</div>
              <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{member.bio}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)", padding: "80px 60px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Ready to get started?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>Join institutions across Singapore on Newsify today.</p>
        <button
          onClick={() => { sessionStorage.setItem("scrollTo", "plans"); navigate("/"); }}
          onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          style={{ background: "#fff", color: "#2563EB", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          View Plans
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: "#000000", padding: "28px 60px", textAlign: "center", borderTop: "1px solid #1E293B" }}>
        <span style={{ color: "#475569", fontSize: 13 }}>© 2026 Newsify. All rights reserved.</span>
      </footer>
    </div>
  );
}
