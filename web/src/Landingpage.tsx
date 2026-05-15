import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = ["Home", "Features", "Plans", "FAQ", "Contact"];

const FEATURES = [
  {
    icon: (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    title: "Personalised News Feed",
    desc: "Get news posts tailored to your interests and followings.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    title: "Communities",
    desc: "Create and join communities to find others with similar interests as you.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
    title: "Get Creative",
    desc: "Draft, create and publish your own news to share with your school.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    title: "Engagement",
    desc: "Like, comment, follow, and build relations with others users from your school.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>),
    title: "Save Your News",
    desc: "Bookmark news posts anytime to save for later.",
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>),
    title: "Achievements",
    desc: "Unlock achievements and collect badges when you hit the target milestone.",
  },
];

const TESTIMONIALS = [
  { quote: "Amazing app!", stars: 5, name: "Jimmy", institution: "National University of Singapore" },
  { quote: "Da best!", stars: 5, name: "Samuel", institution: "Singapore Institute of Management" },
  { quote: "Exceeded my expectations!", stars: 5, name: "Adam", institution: "Ngee Ann Polytechnic" },
];

const PLANS = [
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="#F97316"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
    name: "Basic", price: "$18,000", btnColor: "#2563EB",
    features: ["Up to 15,000 users", "Up to 100 communities", "User management", "Email support", "Analytics dashboard"],
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="#7C3AED"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
    name: "Pro", price: "$30,000", btnColor: "#7C3AED",
    features: ["Up to 20,000 users", "Up to 200 communities", "Content moderation tools", "User management", "Priority email support", "Analytics dashboard"],
  },
  {
    icon: (<svg viewBox="0 0 24 24" width="28" height="28" fill="#D97706"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z"/></svg>),
    name: "Premium", price: "$50,000", btnColor: "#D97706",
    features: ["Unlimited users", "Unlimited communities", "Content moderation tools", "User management", "24/7 priority support", "Analytics dashboard", "Livestream (Coming soon)"],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", cursor: "pointer" }}
      >
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{q}</span>
        <span style={{ color: "#3B82F6", fontSize: 20, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "rotate(0deg)", display: "inline-block" }}>+</span>
      </div>
      {open && (
        <div style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.7, paddingBottom: 18 }}>{a}</div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("Home");
  const [sent, setSent] = useState(false);
  const isScrolling = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const target = sessionStorage.getItem("scrollTo");
    if (target) {
      sessionStorage.removeItem("scrollTo");
      setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "instant", block: "start" }));
    }
  }, []);

  useEffect(() => {
	const sections = ["home", "features", "plans", "faq", "contact"];
	const observer = new IntersectionObserver(
		(entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting && !isScrolling.current) {
			const id = entry.target.id;
			const match = NAV_LINKS.find(l => l.toLowerCase() === id);
			if (match) setActiveLink(match);
			}
		});
		},
		{ threshold: 0.3 }
	);
	sections.forEach(id => {
		const el = document.getElementById(id);
		if (el) observer.observe(el);
	});
	return () => observer.disconnect();
	}, []);

  const scrollTo = (id: string) => {
    isScrolling.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    const match = NAV_LINKS.find(l => l.toLowerCase() === id);
    if (match) setActiveLink(match);
    setTimeout(() => { isScrolling.current = false; }, 1000);
  };
  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "clip" }}>

      {/* Navbar */}
      <nav style={{ background: "#030303", padding: "0 48px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 700, fontSize: 18 }}>
          <img src="/icon_light.png" alt="logo" width={30} style={{ objectFit: "contain" }} />
          Newsify
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV_LINKS.map(link => (
            <a key={link}
              href={`#${link.toLowerCase()}`}
              onClick={(e) => { e.preventDefault(); setActiveLink(link); scrollTo(link.toLowerCase()); }}
              onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { if (link !== activeLink) e.currentTarget.style.color = "#9CA3AF"; }}
              style={{ color: link === activeLink ? "#fff" : "#9CA3AF", fontSize: 15, textDecoration: "none", fontWeight: link === activeLink ? 700 : 400, borderBottom: link === activeLink ? "2px solid #fff" : "none", paddingBottom: 2, transition: "color 0.2s", cursor: "pointer" }}
            >{link}</a>
          ))}
          <button onClick={() => navigate("/login")}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#111827"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
            style={{ background: "transparent", border: "1.5px solid #fff", borderRadius: 8, padding: "7px 24px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
          >Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" style={{ background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)", padding: "60px 80px", display: "flex", alignItems: "center", justifyContent: "center", gap: 200, minHeight: 420 }}>
        <div style={{ flex: 1, maxWidth: 480 }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.2, fontStyle: "italic", margin: "0 0 16px 0" }}>
            Stay Informed About<br />Your School
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: "0 0 28px 0" }}>
            Discover what's happening in your school and join the conversation!
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
			        onClick={() => scrollTo("features")}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              style={{ background: "transparent", color: "#fff", border: "1.5px solid #fff", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >Find out more</button>
            <button
              onClick={() => scrollTo("video")}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.2)"; }}
              style={{ background: "rgba(0,0,0,0.2)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
            >
              <span style={{ width: 24, height: 24, background: "#fff", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="8" height="10" viewBox="0 0 8 10" fill="#2563EB"><polygon points="2,0 8,5 2,10"/></svg>
              </span>
              Watch Video
            </button>
          </div>
        </div>
        <div style={{ flexShrink: 0, borderRadius: 12, overflow: "hidden" }}>
          <img src="/news_1.png" alt="News illustration" style={{ width: 580, height: 380, objectFit: "cover", display: "block" }} />
        </div>
      </section>

      {/* Trusted */}
      <section style={{ background: "linear-gradient(180deg, #60A5FA 0%, #818CF8 60%, #A78BFA 100%)", padding: "48px 60px", textAlign: "center" }}>
        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 40 }}>Trusted By Institutions In Singapore</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 100 }}>
          {[{ val: "10", label: "Institutions" }, { val: "5.0 ★", label: "Overall Star Rating" }].map(s => (
            <div key={s.label}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; }}
            style={{ background: "#fff", borderRadius: 14, padding: "28px 56px", textAlign: "center", minWidth: 200, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transition: "all 0.2s" }}
          >
              <div style={{ fontSize: 22, fontWeight: 800, color: "#2563EB" }}>{s.val}</div>
              <div style={{ fontSize: 14, color: "#2563EB", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: "linear-gradient(180deg, #818CF8 0%, #6366F1 100%)", padding: "80px 60px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "48px", background: "rgba(255,255,255,0.06)" }}>
          <h2 style={{ textAlign: "center", color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 36 }}>Features</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
                style={{ background: "#fff", borderRadius: 14, padding: "24px 20px", transition: "all 0.2s" }}
              >
                <div style={{ width: 48, height: 48, background: "#EFF6FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6, marginBottom: 14 }}>{f.desc}</div>
                <a href="#"
                  onClick={(e) => { e.preventDefault(); navigate("/features"); }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#1D4ED8"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#2563EB"; }}
                  style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
                >Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      {/* Video */}
	<section id="video" style={{ background: "linear-gradient(180deg, #6366F1 0%, #8B5CF6 40%, #C026D3 80%, #BE185D 100%)", padding: "80px 60px", textAlign: "center" }}>
	<h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 36 }}>Video</h2>
	<div style={{ maxWidth: 800, margin: "0 auto", borderRadius: 14, overflow: "hidden", aspectRatio: "16/9" }}>
		<iframe
		width="100%"
		height="100%"
		src="https://www.youtube.com/embed/dQw4w9WgXcQ"
		title="Newsify Video"
		frameBorder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
		allowFullScreen
		style={{ display: "block" }}
		/>
	</div>
	</section>

      {/* Testimonials */}
      <section style={{ background: "linear-gradient(180deg, #BE185D 0%, #6366F1 60%, #3B82F6 100%)", padding: "80px 60px" }}>
        <h2 style={{ textAlign: "center", color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 36 }}>What others say about Newsify</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 900, margin: "0 auto" }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name}
				onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
				onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
				style={{ background: "#fff", borderRadius: 14, padding: "24px", transition: "all 0.2s", cursor: "default" }}
				>
              <div style={{ fontSize: 32, color: "#2563EB", lineHeight: 1, marginBottom: 10 }}>"</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 10 }}>{t.quote}</div>
              <div style={{ fontSize: 16, marginBottom: 14, color: "#FBBF24" }}>{"★".repeat(t.stars)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: "#E5E7EB", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{t.institution}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" style={{ background: "linear-gradient(180deg, #3B82F6 0%, #6366F1 100%)", padding: "80px 60px" }}>
        <h2 style={{ textAlign: "center", color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 36 }}>Our Plans</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 920, margin: "0 auto" }}>
          {PLANS.map(p => (
            <div key={p.name}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
              style={{ background: "#fff", borderRadius: 14, padding: "28px 22px", position: "relative", transition: "all 0.2s", display: "flex", flexDirection: "column" }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                {p.price} <span style={{ fontSize: 13, fontWeight: 400, color: "#6B7280" }}>/ year</span>
              </div>
              <div style={{ height: 1, background: "#E5E7EB", margin: "16px 0" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#374151", marginBottom: 10 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={p.btnColor} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
                onClick={() => scrollTo("contact")}
                style={{ width: "100%", background: p.btnColor, color: "#fff", border: "none", borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", marginTop: "auto" }}
              >Get Started</button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
	  <section id="faq" style={{ background: "linear-gradient(180deg, #4F46E5 0%, #0F172A 50%)", padding: "80px 60px" }}>
	  <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>Frequently Asked Questions</h2>
	  <p style={{ color: "#94A3B8", fontSize: 14, textAlign: "center", marginBottom: 48 }}>Everything you need to know about Newsify.</p>
	  <div style={{ maxWidth: 720, margin: "0 auto" }}>
		  {[
		  { q: "What is Newsify?", a: "Newsify is a school news platform that keeps students and staff informed about what's happening in their institution. Users can read, post, and engage with news from their school community." },
		  { q: "How do I get started?", a: "Contact us to set up your institution's account. Once set up, your users can sign in and start reading and posting news right away." },
		  { q: "Which plan is right for my institution?", a: "It depends on your institution size. Basic covers up to 15,000 users, Pro up to 20,000, and Premium is unlimited. You can always upgrade later." },
		  { q: "Can I switch plans later?", a: "Yes! You can upgrade or downgrade your plan at any time by contacting our support team." },
		  { q: "Is my data secure?", a: "Absolutely. We take data security seriously and follow industry best practices to keep your institution's data safe and private." },
		  { q: "How do I contact support?", a: "You can reach us via the contact form on this page or email us directly at newsify.fyp@gmail.com. We'll get back to you within 24 hours." },
		  ].map((item, i) => (
		  <FaqItem key={i} q={item.q} a={item.a} />
		  ))}
	  </div>
	  </section>

      {/* Contact */}
		<section id="contact" style={{ background: "#1E293B", padding: "80px 60px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
		<div style={{ textAlign: "center", marginBottom: 56 }}>
			<h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Contact Us</h2>
			<p style={{ color: "#94A3B8", fontSize: 14 }}>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
		</div>
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, maxWidth: 900, margin: "0 auto" }}>
			<div>
			<div style={{ marginBottom: 18 }}>
				<label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Your Name</label>
				<input type="text" placeholder="John Doe" ref={nameRef} style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} onFocus={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.25)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }} />
			</div>
			<div style={{ marginBottom: 18 }}>
				<label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Email Address</label>
				<input type="email" placeholder="john@example.com" ref={emailRef} style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} onFocus={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.25)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }} />
			</div>
			<div style={{ marginBottom: 18 }}>
				<label style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Message</label>
				<textarea placeholder="How can we help you?" rows={5} ref={messageRef} style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const, fontFamily: "inherit" }} onFocus={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.25)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.boxShadow = "none"; }} />
			</div>
			<button
			onClick={() => {
			let valid = true;
			if (!nameRef.current?.value) { nameRef.current!.style.borderColor = "#EF4444"; valid = false; }
			const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRef.current?.value || "");
			if (!emailRef.current?.value || !emailValid) { emailRef.current!.style.borderColor = "#EF4444"; valid = false; }
						if (!messageRef.current?.value) { messageRef.current!.style.borderColor = "#EF4444"; valid = false; }
			if (!valid) return;
			setSent(true);
			setTimeout(() => {
				setSent(false);
				if (nameRef.current) { nameRef.current.value = ""; nameRef.current.style.borderColor = "rgba(255,255,255,0.12)"; }
				if (emailRef.current) { emailRef.current.value = ""; emailRef.current.style.borderColor = "rgba(255,255,255,0.12)"; }
				if (messageRef.current) { messageRef.current.value = ""; messageRef.current.style.borderColor = "rgba(255,255,255,0.12)"; }
			}, 3000);
			}}
			style={{ width: "100%", background: "#fff", color: "#111827", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", marginTop: 4 }}
			onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
			onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}
			>
			Submit
			</button>
			{sent && (
			<div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "14px 18px", color: "#4ADE80", fontSize: 13, fontWeight: 500, textAlign: "center", marginTop: 12 }}>
				✓ Message sent! We'll get back to you soon.
			</div>
			)}
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 32, paddingTop: 8 }}>
			<div>
				<div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Contact Information</div>
				<div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6 }}>Fill up the form and our team will get back to you within 24 hours.</div>
			</div>
			<div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
				<div style={{ width: 44, height: 44, background: "rgba(37,99,235,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
				</div>
				<div>
				<div style={{ fontSize: 11, color: "#64748B", marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Email</div>
				<div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>newsify.fyp@gmail.com</div>
				</div>
			</div>
			<div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
				<div style={{ width: 44, height: 44, background: "rgba(37,99,235,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
				</div>
				<div>
				<div style={{ fontSize: 11, color: "#64748B", marginBottom: 3, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Location</div>
				<div style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>Singapore</div>
				</div>
			</div>
			</div>
		</div>
		</section>

      {/* Footer */}
      <footer style={{ background: "#000000", padding: "56px 60px 28px", borderTop: "1px solid #1E293B" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 700, fontSize: 17 }}>
            <img src="/icon_light.png" alt="logo" width={28} style={{ objectFit: "contain" }} /> Newsify
          </div>
          <div style={{ display: "flex", gap: 80 }}>
            <div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Resources</div>
              {["Plans", "Contact"].map(l => <div key={l} style={{ marginBottom: 12 }}><a href="#" onClick={(e) => { e.preventDefault(); scrollTo(l.toLowerCase()); }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"} style={{ color: "#94A3B8", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}>{l}</a></div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Company</div>
              {["About us"].map(l => <div key={l} style={{ marginBottom: 12 }}><a href="#" onClick={(e) => { e.preventDefault(); navigate("/about"); }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"} style={{ color: "#94A3B8", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}>{l}</a></div>)}
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Help</div>
              {["Privacy Policy", "Terms of Service", "FAQ"].map(l => <div key={l} style={{ marginBottom: 12 }}><a href="#" onClick={(e) => { e.preventDefault(); if (l === "FAQ") scrollTo("faq"); if (l === "Privacy Policy") navigate("/privacy-policy"); if (l === "Terms of Service") navigate("/terms-of-service"); }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"} style={{ color: "#94A3B8", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}>{l}</a></div>)}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #333", paddingTop: 24, textAlign: "center" }}>
          <span style={{ color: "#94A3B8", fontSize: 13 }}>© 2026 Newsify. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
