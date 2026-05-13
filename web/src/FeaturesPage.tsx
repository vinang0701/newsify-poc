import { useNavigate } from "react-router";
import { useEffect } from "react";

const FEATURES = [
  {
    id: "news-feed",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    title: "Personalised News Feed",
    subtitle: "Stay informed with news tailored just for you",
    desc: "Newsify's intelligent news feed learns your interests and delivers the most relevant content from your institution. No more scrolling through irrelevant posts — just the news that matters to you.",
    points: [
      "Personalised feed based on your interests and followings",
      "Filter news by category, community, or author",
      "Bookmark posts to read later",
      "Like and comment to engage with your community",
      "Get notified when your favourite authors post",
    ],
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    id: "communities",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    title: "Communities",
    subtitle: "Find your people and grow together",
    desc: "Join or create communities around shared interests within your institution. Whether it's a study group, a club, or a department — Newsify brings your people together in one place.",
    points: [
      "Create and manage communities within your institution",
      "Join communities based on your interests",
      "Share news and updates within your community",
      "Invite other students and staff to join",
      "Community admins can moderate content and members",
    ],
    color: "#7C3AED",
    bg: "#F5F3FF",
  },
  {
    id: "get-creative",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
    title: "Get Creative",
    subtitle: "Your voice, your story, your school",
    desc: "Anyone can be a journalist at Newsify. Draft, create, and publish your own news articles to share with your school community. Express yourself and make your voice heard.",
    points: [
      "Rich text editor for writing and formatting articles",
      "Draft and save posts before publishing",
      "Add images and media to your posts",
      "Share posts to specific communities or the whole institution",
      "Track views, likes, and comments on your posts",
    ],
    color: "#0891B2",
    bg: "#ECFEFF",
  },
  {
    id: "engagement",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    title: "Engagement",
    subtitle: "Build meaningful connections on campus",
    desc: "Newsify is more than just news — it's a social platform for your institution. Like, comment, follow, and build real relationships with students and staff across your campus.",
    points: [
      "Like and comment on posts and articles",
      "Follow other users to see their latest posts",
      "Build a following within your institution",
      "Get notified when someone interacts with your content",
      "See trending posts and popular authors",
    ],
    color: "#059669",
    bg: "#ECFDF5",
  },
  {
    id: "save-news",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>),
    title: "Save Your News",
    subtitle: "Never miss an important story",
    desc: "Found an interesting article but don't have time to read it now? Bookmark it and come back later. Your saved posts are always just a tap away.",
    points: [
      "Bookmark any post or article with one click",
      "Access your saved posts from your profile",
      "Organise saved posts by category",
      "Never lose track of important announcements",
      "Sync across all your devices",
    ],
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    id: "achievements",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>),
    title: "Achievements",
    subtitle: "Get rewarded for being an active member",
    desc: "Newsify rewards active participation with achievements and badges. The more you engage, the more you earn. Show off your badges on your profile and climb the leaderboard.",
    points: [
      "Earn badges for reaching milestones",
      "Unlock achievements by engaging with the platform",
      "Display your badges on your profile",
      "Track your progress towards the next achievement",
      "Compete with friends on the leaderboard",
    ],
    color: "#EC4899",
    bg: "#FDF2F8",
  },

  {
    id: "livestream",
    icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>),
    title: "Live Streaming",
    subtitle: "Coming Soon",
    desc: "Stream live events and announcements directly to your institution. Stay connected in real time with your school community.",
    points: [
      "Stream live events and announcements",
      "Interact with live chat during streams",
      "Record and replay streams later",
      "Get notified when a live stream starts",
    ],
    color: "#E11D48",
    bg: "#FFF1F2",
  },
];



export default function FeaturesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "clip", background: "#030303" }}>

      {/* Navbar */}
      <nav style={{ background: "#030303", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
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
        <h1 style={{ fontSize: 48, fontWeight: 800, color: "#fff", margin: "0 0 16px 0" }}>Features</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Everything you need to stay informed, connected, and engaged with your school community.
        </p>
        <button
          onClick={() => { sessionStorage.setItem("scrollTo", "contact"); navigate("/"); }}
          onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          style={{ background: "#fff", color: "#2563EB", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          Get Started
        </button>
      </section>

      {/* Features */}
      <section style={{ background: "#0F172A", padding: "80px 60px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 80 }}>
          {FEATURES.map((f, i) => (
            <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", direction: i % 2 === 0 ? "ltr" : "rtl" }}>
              <div style={{ direction: "ltr" }}>
                <div style={{ width: 56, height: 56, background: f.bg, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{f.title}</h2>
                <p style={{ fontSize: 15, color: f.color, fontWeight: 600, marginBottom: 16 }}>{f.subtitle}</p>
                <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.8, marginBottom: 24 }}>{f.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {f.points.map(p => (
                    <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#CBD5E1", marginBottom: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ direction: "ltr" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${f.color}30`, borderRadius: 16, aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                  <div style={{ width: 64, height: 64, background: f.bg, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {f.icon}
                  </div>
                  <p style={{ color: "#475569", fontSize: 13 }}>Screenshot coming soon</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)", padding: "80px 60px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Ready to experience Newsify?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>Join your institution on Newsify today.</p>
        <button
          onClick={() => { sessionStorage.setItem("scrollTo", "contact"); navigate("/"); }}
          onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          style={{ background: "#fff", color: "#2563EB", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: "#000000", padding: "28px 60px", textAlign: "center", borderTop: "1px solid #1E293B" }}>
        <span style={{ color: "#475569", fontSize: 13 }}>© 2026 Newsify. All rights reserved.</span>
      </footer>
    </div>
  );
}
