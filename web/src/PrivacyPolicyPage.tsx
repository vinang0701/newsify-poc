import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function PrivacyPolicyPage() {
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
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", margin: "0 0 12px 0" }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: 0 }}>Effective Date: May 12, 2026</p>
      </section>

      {/* Content */}
      <section style={{ background: "#0F172A", padding: "80px 60px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          <div style={sectionStyle}>
            <p style={pStyle}>
              Welcome to Newsify. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
            <p style={pStyle}>
              By using Newsify, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our platform.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>1. Information We Collect</h2>
            <p style={pStyle}>We collect the following personal information when you register and use Newsify:</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Name</strong> — used to identify you on the platform</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Email address</strong> — used for account registration and communication</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>School/Institution</strong> — used to associate you with your institution on the platform</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Profile photo</strong> — used to personalise your profile</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Posts and comments</strong> — content you create and share on the platform</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>2. How We Use Your Information</h2>
            <p style={pStyle}>We use the information we collect for the following purposes:</p>
            <ul style={ulStyle}>
              <li style={liStyle}>To create and manage your account</li>
              <li style={liStyle}>To provide and improve our services</li>
              <li style={liStyle}>To personalise your experience on the platform</li>
              <li style={liStyle}>To communicate with you about updates, news, and support</li>
              <li style={liStyle}>To ensure the security and integrity of the platform</li>
              <li style={liStyle}>To process payments for institutional subscriptions</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>3. Data Storage & Third Party Services</h2>
            <p style={pStyle}>
              Your data is stored and processed using the following trusted third-party services:
            </p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Supabase</strong> — used for secure cloud database storage. All data is encrypted at rest and in transit.</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Stripe</strong> — used for processing institutional subscription payments. Stripe is PCI-DSS compliant and we do not store your payment details directly.</li>
            </ul>
            <p style={pStyle}>
              Both services comply with industry-standard security practices to ensure your data remains safe.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>4. Data Sharing</h2>
            <p style={pStyle}>
              We do not sell, trade, rent, or share your personal information with any third parties outside of the services listed above. Your data is used solely for the purpose of operating and improving the Newsify platform.
            </p>
            <p style={pStyle}>
              We may disclose your information if required by law or to protect the rights, property, or safety of Newsify, our users, or others.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>5. Data Retention</h2>
            <p style={pStyle}>
              Your personal data is retained for as long as your account is active. Upon account suspension, your data will be retained for <strong style={{ color: "#fff" }}>30 days</strong> before being permanently deleted. This grace period allows for account recovery if needed.
            </p>
            <p style={pStyle}>
              After 30 days, all personal data associated with your account will be permanently and irreversibly deleted from our systems.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>6. Data Deletion Requests</h2>
            <p style={pStyle}>
              At this time, Newsify does not support individual user requests for data deletion outside of the standard account suspension process. Your data will be automatically deleted 30 days after your account is suspended.
            </p>
            <p style={pStyle}>
              If you have concerns about your data, please contact us at <a href="mailto:newsify.fyp@gmail.com" style={{ color: "#3B82F6", textDecoration: "none" }}>newsify.fyp@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>7. Your Rights</h2>
            <p style={pStyle}>You have the following rights regarding your personal data:</p>
            <ul style={ulStyle}>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Access</strong> — you can request a copy of the data we hold about you</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Correction</strong> — you can update your personal information at any time through your account settings</li>
              <li style={liStyle}><strong style={{ color: "#fff" }}>Portability</strong> — you can request an export of your data in a readable format</li>
            </ul>
            <p style={pStyle}>
              To exercise any of these rights, please contact us at <a href="mailto:newsify.fyp@gmail.com" style={{ color: "#3B82F6", textDecoration: "none" }}>newsify.fyp@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>8. User Eligibility</h2>
            <p style={pStyle}>
              Newsify is intended for university students and staff aged 18 years or older. By using the platform, you confirm that you meet this age requirement and are a registered member of a participating institution. If you believe an underage user is using the platform, please contact us immediately at <a href="mailto:newsify.fyp@gmail.com" style={{ color: "#3B82F6", textDecoration: "none" }}>newsify.fyp@gmail.com</a>.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>9. Cookies</h2>
            <p style={pStyle}>
              Newsify may use cookies and similar tracking technologies to enhance your experience. These are used solely for session management and authentication purposes. You can control cookie settings through your browser.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>10. Changes to This Policy</h2>
            <p style={pStyle}>
              We may update this Privacy Policy from time to time. We will notify users of any significant changes by updating the effective date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={h2Style}>11. Contact Us</h2>
            <p style={pStyle}>
              If you have any questions or concerns about this Privacy Policy, please contact us at:
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
