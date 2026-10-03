"use client";

import { useEffect } from "react";

export default function Footer() {
  useEffect(() => {
    function fitWatermark() {
      const svg = document.getElementById('watermarkSvg');
      const text = document.getElementById('watermarkText') as any;
      if (!svg || !text) return;
      try {
        const bbox = text.getBBox();
        svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      } catch (e) {}
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitWatermark);
    } else {
      window.addEventListener('load', fitWatermark);
    }
    window.addEventListener('resize', fitWatermark);

    return () => {
      window.removeEventListener('load', fitWatermark);
      window.removeEventListener('resize', fitWatermark);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-section {
          background: #ffffff;
          padding: 48px 24px;
          font-family: 'DM Sans', sans-serif;
          color: #2d3148;
          width: 100%;
        }
        .footer-section *, .footer-section *::before, .footer-section *::after {
          box-sizing: border-box; 
        }

        .footer-wrapper {
          max-width: 1150px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 16px;
          align-items: stretch;
        }

        /* Left Card */
        .footer-left {
          position: relative;
          min-height: 340px;
          border-radius: 28px;
          padding: 32px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(21, 76, 189, 0.25);
          background: #1e4fc0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .footer-left-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
        }
        .footer-logo {
          display: flex;
          flex-direction: row;
          gap: 10px;
          position: relative;
          z-index: 1;
          align-items: center;
        }
        .footer-logo-mark {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.15);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .footer-logo-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .footer-tagline-container {
          margin-top: auto;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }
        .footer-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 19px;
          font-weight: 400;
          color: #ffffff;
          line-height: 1.45;
        }
        .footer-tagline span {
          color: rgba(255, 255, 255, 0.65);
        }

        .footer-social-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .footer-social-label {
          font-family: 'Caveat', cursive;
          font-size: 17px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.3px;
        }
        .footer-social-icons {
          display: flex;
          flex-direction: row;
          gap: 7px;
        }
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #0e1014;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          cursor: pointer;
        }
        .social-icon:hover {
          background: #000000;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        .social-icon svg {
          width: 15px;
          height: 15px;
          fill: #ffffff;
        }

        /* Right Card */
        .footer-right {
          background: #f0f1f5;
          border-radius: 28px;
          padding: 40px;
          overflow: visible;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .footer-lucky-graphic {
          position: absolute;
          top: -36px;
          right: 40px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
        .lucky-cube {
          width: 96px;
          height: 96px;
          border-radius: 22px;
          transform: rotate(-10deg);
          background: linear-gradient(135deg, #5b9ffb 0%, #1e5dd7 55%, #1448be 100%);
          box-shadow: inset 3px 3px 8px rgba(255, 255, 255, 0.35),
                      inset -3px -3px 12px rgba(0, 0, 0, 0.18),
                      8px 14px 28px rgba(20, 72, 200, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lucky-cube-mark {
          font-family: 'DM Sans', sans-serif;
          font-size: 42px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.04em;
          transform: rotate(10deg);
          text-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
          line-height: 1;
        }
        .lucky-text-row {
          display: flex;
          flex-direction: row;
          gap: 6px;
          align-items: center;
          transform: rotate(-4deg);
          margin-top: 4px;
        }
        .lucky-arrow {
          width: 22px;
          height: 22px;
          color: #9ca3af;
        }
        .lucky-text {
          font-family: 'Caveat', cursive;
          font-size: 20px;
          font-weight: 600;
          color: #9ca3af;
          white-space: nowrap;
        }

        .footer-right-top {
          display: flex;
          flex-direction: row;
          gap: 72px;
          padding-top: 8px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
        }
        .footer-col-title {
          font-family: 'Caveat', cursive;
          font-size: 24px;
          font-weight: 600;
          font-style: italic;
          color: #9ca3af;
          margin-bottom: 18px;
        }
        .footer-col a {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 14px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-col a:hover {
          color: #1f65d6;
        }

        .footer-bottom {
          display: flex;
          flex-direction: row;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 48px;
        }
        .footer-copyright {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          color: #9ca3af;
        }

        .footer-cta-mini {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-cta-mini h4 {
          font-size: 15px;
          font-weight: 400;
          color: #6b7280;
          line-height: 1.45;
          margin: 0;
        }
        .footer-cta-mini h4 strong {
          display: block;
          font-size: 19px;
          font-weight: 700;
          color: #111827;
        }

        .footer-subscribe-row {
          display: flex;
          flex-direction: row;
          width: 310px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }
        .footer-subscribe-row input {
          flex: 1;
          padding: 11px 14px;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #111827;
        }
        .footer-subscribe-row input::placeholder {
          color: #9ca3af;
        }
        .footer-subscribe-row button {
          padding: 11px 22px;
          background: #111214;
          color: #ffffff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .footer-subscribe-row button:hover {
          background: #000000;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }

        /* Watermark */
        .footer-watermark {
          max-width: 1150px;
          margin: -60px auto 0;
          pointer-events: none;
          user-select: none;
          position: relative;
          z-index: 0;
          line-height: 0;
        }
        .footer-watermark svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .footer-watermark text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          fill: rgba(0, 0, 0, 0.04);
        }

        /* Responsive */
        @media (max-width: 860px) {
          .footer-wrapper {
            grid-template-columns: 1fr;
          }
          .footer-left {
            min-height: auto;
            gap: 40px;
          }
        }
        @media (max-width: 560px) {
          .footer-right {
            padding: 24px;
          }
          .footer-right-top {
            gap: 40px;
          }
          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
          }
          .footer-subscribe-row {
            width: 100%;
          }
          .footer-lucky-graphic {
            right: 12px;
            top: -28px;
          }
          .lucky-cube {
            width: 72px;
            height: 72px;
          }
          .lucky-cube-mark {
            font-size: 32px;
          }
        }
      `}} />

      <section className="footer-section">
        <div className="footer-wrapper">
          {/* Left Card */}
          <div className="footer-left">
            <video className="footer-left-video" autoPlay muted loop playsInline preload="auto">
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4" type="video/mp4" />
            </video>
            <div className="footer-logo">
              <div className="footer-logo-mark">R</div>
              <span className="footer-logo-name">Ratchet</span>
            </div>
            <div className="footer-tagline-container">
              <div className="footer-tagline">
                Smarter bug verification,<br />
                <span>powered by AI.</span>
              </div>
            </div>
            <div className="footer-social-row">
              <div className="footer-social-label">Stay in touch!</div>
              <div className="footer-social-icons">
                {/* Discord */}
                <div className="social-icon">
                  <svg viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </div>
                {/* X (Twitter) */}
                <div className="social-icon">
                  <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                {/* LinkedIn */}
                <div className="social-icon">
                  <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </div>
                {/* GitHub */}
                <div className="social-icon">
                  <svg viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="footer-right">
            <div className="footer-lucky-graphic">
              <div className="lucky-cube">
                <span className="lucky-cube-mark">R</span>
              </div>
              <div className="lucky-text-row">
                <svg className="lucky-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 20 C 6 14, 10 9, 18 5" />
                  <path stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 5 L 12 5" />
                  <path stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 5 L 18 11" />
                </svg>
                <span className="lucky-text">Feeling lucky?</span>
              </div>
            </div>

            <div className="footer-right-top">
              <div className="footer-col">
                <div className="footer-col-title">Navigation</div>
                <a href="#">AST Navigation</a>
                <a href="#">Unprivileged Sandbox</a>
                <a href="#">PR Integration</a>
                <a href="#">Recursive Repair</a>
                <a href="#">Dashboard</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Company</div>
                <a href="#">Blog</a>
                <a href="#">About</a>
                <a href="#">Terms and Condition</a>
                <a href="#">Privacy Policy</a>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="footer-copyright">© 2025 Ratchet. All rights reserved.</div>
              <div className="footer-cta-mini">
                <h4>
                  AI moves fast.<br /><strong>Stay ahead with Ratchet.</strong>
                </h4>
                <div className="footer-subscribe-row">
                  <input type="email" placeholder="Enter email address" />
                  <button type="button">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="footer-watermark" aria-hidden="true">
          <svg id="watermarkSvg" viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <text id="watermarkText" x="500" y="240" textAnchor="middle" fontSize="320">Ratchet</text>
          </svg>
        </div>
      </section>
    </>
  );
}
