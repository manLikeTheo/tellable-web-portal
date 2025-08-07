// src/pages/index.tsx - Simple homepage
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>VoiceVault - Preserve Family Memories</title>
        <meta
          name="description"
          content="Create and share family memory books with voice recordings"
        />
      </Head>

      <div style={styles.container}>
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <h1 style={styles.title}>📖 VoiceVault</h1>
            <p style={styles.subtitle}>
              Preserve family memories through voice recordings
            </p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>🎤</span>
                <span>Record Stories</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>📚</span>
                <span>Create Memory Books</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>👥</span>
                <span>Collaborate with Family</span>
              </div>
            </div>
          </div>
        </div>

        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Have an invitation link? Visit it directly to contribute to a memory
            book.
          </p>
        </footer>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    flexDirection: "column",
  },

  hero: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },

  heroContent: {
    textAlign: "center" as const,
    maxWidth: "600px",
    color: "white",
  },

  title: {
    fontSize: "3.5rem",
    fontWeight: "700",
    marginBottom: "1rem",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  subtitle: {
    fontSize: "1.25rem",
    marginBottom: "3rem",
    color: "rgba(255,255,255,0.9)",
    lineHeight: "1.6",
  },

  features: {
    display: "flex",
    gap: "2rem",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },

  feature: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(255,255,255,0.1)",
    padding: "1.5rem 1rem",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.2)",
    minWidth: "120px",
  },

  featureIcon: {
    fontSize: "2rem",
  },

  footer: {
    padding: "2rem",
    textAlign: "center" as const,
  },

  footerText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
  },
};
