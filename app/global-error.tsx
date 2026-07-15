"use client";

/**
 * Root error boundary — the last resort, fired only when the root layout itself
 * throws. It replaces <html>/<body> entirely, so the design system (globals.css,
 * theme provider, fonts) is NOT available here. Everything is therefore inline
 * styled with the brand palette, and a small <style> block handles dark mode
 * since inline styles can't express media queries.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: "#faf8f2",
          color: "#2b2721",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
        }}
      >
        <style>{`
          @media (prefers-color-scheme: dark) {
            body { background:#1c1a17 !important; color:#f0ece3 !important; }
            .ge-card { background:#232019 !important; border-color:#3a352d !important; }
            .ge-muted { color:#a9a294 !important; }
          }
        `}</style>
        <div
          className="ge-card"
          style={{
            width: "100%",
            maxWidth: 400,
            textAlign: "center",
            background: "#fffdf9",
            border: "1px solid #e8e2d6",
            borderRadius: 20,
            padding: 32,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 20,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                width: 34,
                height: 34,
                alignItems: "center",
                justifyContent: "center",
                background: "#11926a",
                borderRadius: 10,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
            </span>
            <span
              style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              Splitza
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p
            className="ge-muted"
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "#7c7568",
              margin: "0 0 24px",
            }}
          >
            A critical error interrupted the app. Please try again — if it keeps
            happening, reload the page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-block",
              background: "#11926a",
              color: "#fff",
              border: 0,
              borderRadius: 11,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p
              className="ge-muted"
              style={{
                fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
                fontSize: 11,
                color: "#a49b8b",
                margin: "16px 0 0",
              }}
            >
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
