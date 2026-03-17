import { ImageResponse } from "next/og";

export const alt = "SwapStandard — Local Exchange Network";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#18181b",
          padding: "0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Emerald accent bar — top */}
        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#047857",
            flexShrink: 0,
          }}
        />

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 80px",
          }}
        >
          {/* Eyebrow label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "#047857",
              }}
            />
            <span
              style={{
                fontFamily: "sans-serif",
                fontWeight: 900,
                fontSize: "18px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#6ee7b7",
              }}
            >
              Local Exchange Network
            </span>
          </div>

          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0px",
            }}
          >
            <span
              style={{
                fontFamily: "sans-serif",
                fontWeight: 900,
                fontSize: "120px",
                lineHeight: "0.9",
                textTransform: "uppercase",
                fontStyle: "italic",
                color: "#f4f4f5",
                letterSpacing: "-0.02em",
              }}
            >
              Swap
            </span>
            <span
              style={{
                fontFamily: "sans-serif",
                fontWeight: 900,
                fontSize: "120px",
                lineHeight: "0.9",
                textTransform: "uppercase",
                fontStyle: "italic",
                color: "#047857",
                letterSpacing: "-0.02em",
              }}
            >
              Standard
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
            }}
          >
            <span
              style={{
                fontFamily: "sans-serif",
                fontWeight: 700,
                fontSize: "22px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#a1a1aa",
              }}
            >
              Goods · Skills · Services
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 80px",
            borderTop: "2px solid #3f3f46",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#52525b",
            }}
          >
            swapstandard.com
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#3f3f46",
            }}
          >
            Community. No Cash.
          </span>
        </div>

        {/* Decorative grid lines */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "60px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            opacity: 0.08,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: `${240 - i * 16}px`,
                height: "2px",
                backgroundColor: "#f4f4f5",
                alignSelf: "flex-end",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
