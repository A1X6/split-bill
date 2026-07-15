import { ImageResponse } from "next/og";

/**
 * The 1200x630 social-share card, reused by both the Open Graph and Twitter
 * image routes. It's the Splitza brand in a frame: warm rice-paper backdrop,
 * the receipt lockup and headline on the left, and a tilted "receipt" with a
 * monospace total on the right — the same subject the product is about.
 *
 * Written for Satori (next/og): flexbox only, inline styles, and every element
 * with more than one child sets display:flex.
 */
export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "Splitza — split any bill in seconds";
export const ogContentType = "image/png";

export function ogImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#faf8f2",
          color: "#2b2721",
          fontFamily: "sans-serif",
          padding: 72,
          overflow: "hidden",
        }}
      >
        {/* Left: brand + headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 660,
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                background: "#11926a",
                borderRadius: 16,
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
            </div>
            <div
              style={{
                marginLeft: 18,
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Splitza
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 66,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                maxWidth: 560,
              }}
            >
              Split any bill in seconds
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 27,
                lineHeight: 1.4,
                color: "#6f685c",
                maxWidth: 540,
              }}
            >
              Scan the receipt, assign items to friends, and everyone knows
              exactly what they owe — tax included.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 600,
              color: "#11926a",
            }}
          >
            splitza.app
          </div>
        </div>

        {/* Right: tilted receipt */}
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 128,
            display: "flex",
            flexDirection: "column",
            width: 344,
            background: "#fffdf9",
            border: "1px solid #e8e2d6",
            borderRadius: 24,
            padding: "34px 32px",
            transform: "rotate(4deg)",
            boxShadow: "0 30px 60px rgba(43,39,33,0.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#a49b8b",
            }}
          >
            RECEIPT
          </div>
          {[
            ["Dinner", "320.00"],
            ["Drinks", "145.00"],
            ["Dessert", "90.00"],
          ].map(([name, price]) => (
            <div
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 20,
                fontSize: 24,
              }}
            >
              <div style={{ display: "flex" }}>{name}</div>
              <div style={{ display: "flex", fontFamily: "monospace" }}>
                {price}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              marginTop: 24,
              height: 0,
              borderTop: "2px dashed #e8e2d6",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#a49b8b",
              }}
            >
              YOUR SHARE
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: 800,
                color: "#11926a",
                fontFamily: "monospace",
              }}
            >
              185.00
            </div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
