import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function TermsOfServicePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sectionStyle = { marginBottom: 40 };
  const h2Style = { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 14 };
  const pStyle = { fontSize: 14, color: "#94A3B8", lineHeight: 1.8, marginBottom: 12 };
  const liStyle = { fontSize: 14, color: "#94A3B8", lineHeight: 1.8, marginBottom: 8, paddingLeft: 8 };
  const ulStyle = { listStyle: "disc", paddingLeft: 24, marginBottom: 12 };

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
      <section style={{ background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)", padding: "60px 60px 80px", textAlign: "center" }}>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", margin: "0 0 12px 0" }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0 }}>Effective Date: May 12, 2026</p>
      </section>

      {/* Content */}
      <section style={{ background: "#0F172A", padding: "80px 60px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          <div style={sectionStyle}>
            <p style={pStyle}>
              Welcome to Newsify. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before using Newsify.
            </p>
            <p style={pStyle}>
              If you do not agree to these terms, you may not use our platform. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of the updated terms.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. Eligibility</h2>
            <p style={pStyle}>
              Newsify is intended for university students and staff aged <strong style={{ color: "#fff" }}>18 years or older</strong>. By using the platform, you confirm that you meet this age requirement and are a registered member of a participating institution.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>2. Account Registration</h2>
            <p style={pStyle}>By creating an account on Newsify, you agree to:</p>
            <ul style={ulStyle}>
              <li style={liStyle}>Provide accurate and truthful information during registration</li>
              <li style={liStyle}>Keep your account credentials secure and not share them with others</li>
              <li style={liStyle}>Be responsible for all activity that occurs under your account</li>
              <li style={liStyle}>Notify us immediately of any unauthorised use of your account</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>3. Acceptable Use</h2>
            <p style={pStyle}>You may use Newsify to:</p>
            <ul style={ulStyle}>
              <li style={liStyle}>Read, post, and share news relevant to your institution</li>
              <li style={liStyle}>Comment on and engage with posts from your community</li>
              <li style={liStyle}>Join and participate in communities within your institution</li>
              <li style={liStyle}>Follow other users and build connections</li>
              <li style={liStyle}>Earn achievements and collect badges</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>4. Prohibited Conduct</h2>
            <p style={pStyle}>You may NOT use Newsify to:</p>
            <ul style={ulStyle}>
              <li style={liStyle}>Post hate speech, discriminatory, or offensive content</li>
              <li style={liStyle}>Harass, bully, or threaten other users</li>
              <li style={liStyle}>Spread misinformation, fake news, or misleading content</li>
              <li style={liStyle}>Spam or post repetitive, irrelevant content</li>
              <li style={liStyle}>Share inappropriate, explicit, or illegal content</li>
              <li style={liStyle}>Impersonate other users, staff, or institutions</li>
              <li style={liStyle}>Attempt to hack, disrupt, or damage the platform</li>
              <li style={liStyle}>Use the platform for any commercial or advertising purposes without prior consent</li>
            </ul>
            <p style={pStyle}>
              Violation of these rules may result in immediate suspension or permanent banning of your account.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>5. Content Ownership</h2>
            <p style={pStyle}>
              You retain ownership of the content you post on Newsify. However, by posting content, you grant Newsify a non-exclusive, royalty-free licence to display, distribute, and promote your content within the platform.
            </p>
            <p style={pStyle}>
              You are solely responsible for the content you post. Newsify does not endorse any user-generated content and is not liable for any content posted by users.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>6. Account Suspension and Termination</h2>
            <p style={pStyle}>
              Newsify reserves the right to suspend or permanently ban any account that violates these Terms of Service, without prior notice. Reasons for suspension include but are not limited to:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}>Violation of the prohibited conduct policy</li>
              <li style={liStyle}>Repeated reports from other users</li>
              <li style={liStyle}>Fraudulent or deceptive activity</li>
              <li style={liStyle}>Any activity that threatens the safety or integrity of the platform</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>7. Disclaimer of Warranties</h2>
            <p style={pStyle}>
              Newsify is provided on an "as is" and "as available" basis. We do not guarantee that the platform will be uninterrupted, error-free, or free of viruses. We make no warranties, express or implied, regarding the reliability or accuracy of the platform.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>8. Limitation of Liability</h2>
            <p style={pStyle}>
              To the fullest extent permitted by law, Newsify shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to loss of data, reputation, or revenue.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>9. Governing Law</h2>
            <p style={pStyle}>
              These Terms of Service are governed by and construed in accordance with the laws of <strong style={{ color: "#fff" }}>Singapore</strong>. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Singapore.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>10. Changes to These Terms</h2>
            <p style={pStyle}>
              We may update these Terms of Service from time to time. We will notify users of any significant changes by updating the effective date at the top of this page. Continued use of the platform after changes are made constitutes acceptance of the new terms.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>11. Contact Us</h2>
            <p style={pStyle}>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 24px" }}>
              <p style={{ ...pStyle, marginBottom: 4 }}><strong style={{ color: "#fff" }}>Newsify</strong></p>
              <p style={{ ...pStyle, marginBottom: 4 }}>Email: <a href="mailto:newsify.fyp@gmail.com" style={{ color: "#3B82F6", textDecoration: "none" }}>newsify.fyp@gmail.com</a></p>
              <p style={{ ...pStyle, marginBottom: 0 }}>Location: Singapore</p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#000000", padding: "28px 60px", textAlign: "center", borderTop: "1px solid #1E293B" }}>
        <span style={{ color: "#475569", fontSize: 13 }}>© 2026 Newsify. All rights reserved.</span>
      </footer>
    </div>
  );
}
