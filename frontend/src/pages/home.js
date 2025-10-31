import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
      position: "relative",
      overflow: "hidden"
    },
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 40px",
      position: "relative",
      zIndex: "10"
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px"
    },
    logoIcon: {
      width: "50px",
      height: "50px",
      background: "white",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
    },
    logoText: {
      color: "white",
      fontSize: "24px",
      fontWeight: "bold",
      letterSpacing: "0.5px"
    },
    navButtons: {
      display: "flex",
      gap: "16px"
    },
    loginBtn: {
      padding: "10px 24px",
      background: "transparent",
      color: "white",
      border: "2px solid white",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    signupBtn: {
      padding: "10px 24px",
      background: "white",
      color: "#2563eb",
      border: "2px solid white",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    hero: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "80px 20px",
      position: "relative",
      zIndex: "10"
    },
    heroTitle: {
      fontSize: "56px",
      fontWeight: "bold",
      color: "white",
      marginBottom: "20px",
      lineHeight: "1.2"
    },
    heroSubtitle: {
      fontSize: "20px",
      color: "#bfdbfe",
      marginBottom: "40px",
      maxWidth: "600px",
      lineHeight: "1.6"
    },
    ctaContainer: {
      display: "flex",
      gap: "20px",
      marginBottom: "60px"
    },
    ctaPrimary: {
      padding: "16px 40px",
      background: "white",
      color: "#2563eb",
      border: "none",
      borderRadius: "12px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
    },
    ctaSecondary: {
      padding: "16px 40px",
      background: "transparent",
      color: "white",
      border: "2px solid white",
      borderRadius: "12px",
      fontSize: "18px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    features: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "30px",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px"
    },
    featureCard: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      padding: "30px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      transition: "all 0.3s ease"
    },
    featureIcon: {
      width: "60px",
      height: "60px",
      background: "white",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      fontSize: "30px"
    },
    featureTitle: {
      color: "white",
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "12px"
    },
    featureDesc: {
      color: "#bfdbfe",
      fontSize: "15px",
      lineHeight: "1.6"
    },
    decorCircle1: {
      position: "absolute",
      width: "400px",
      height: "400px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      top: "-100px",
      right: "-100px",
      zIndex: "1"
    },
    decorCircle2: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.05)",
      bottom: "-50px",
      left: "-50px",
      zIndex: "1"
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative circles */}
      <div style={styles.decorCircle1}></div>
      <div style={styles.decorCircle2}></div>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="30" height="30" viewBox="0 0 64 64" fill="none">
              <path d="M16 28L20 20H44L48 28M16 28V44C16 45.1 16.9 46 18 46H20C21.1 46 22 45.1 22 44V42H42V44C42 45.1 42.9 46 44 46H46C47.1 46 48 45.1 48 44V28M16 28H48M22 34H24M40 34H42" stroke="#1e40af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="38" r="2" fill="#1e40af"/>
              <circle cx="40" cy="38" r="2" fill="#1e40af"/>
            </svg>
          </div>
          <span style={styles.logoText}>AutoService Pro</span>
        </div>
        <div style={styles.navButtons}>
          <button
            style={styles.loginBtn}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => {
              e.target.style.background = "white";
              e.target.style.color = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "white";
            }}
          >
            Login
          </button>
          <button
            style={styles.signupBtn}
            onClick={() => navigate("/signup")}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.9)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Vehicle Care Made Easy
        </h1>
        <p style={styles.heroSubtitle}>
          Experience seamless auto service management with our comprehensive platform. 
          Schedule appointments, track repairs, and manage your vehicle maintenance all in one place.
        </p>
        <div style={styles.ctaContainer}>
          <button
            style={styles.ctaPrimary}
            onClick={() => navigate("/signup")}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.2)";
            }}
          >
            Get Started Free
          </button>
          <button
            style={styles.ctaSecondary}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
            }}
          >
            Learn More
          </button>
        </div>

        {/* Features */}
        <div style={styles.features}>
          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.featureIcon}>🔧</div>
            <h3 style={styles.featureTitle}>Easy Scheduling</h3>
            <p style={styles.featureDesc}>
              Book your service appointments online with just a few clicks. Choose your preferred time and date.
            </p>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.featureIcon}>📊</div>
            <h3 style={styles.featureTitle}>Track Progress</h3>
            <p style={styles.featureDesc}>
              Monitor your vehicle's service history and get real-time updates on ongoing repairs.
            </p>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Fast Service</h3>
            <p style={styles.featureDesc}>
              Our expert technicians ensure quick turnaround times without compromising quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
