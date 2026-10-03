"use client";

import { useEffect } from "react";
import Link from "next/link";
import FreedomSection from "@/components/FreedomSection";
import Footer from "@/components/Footer";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn } = useAuth();
  
  useEffect(() => {
    // Animation script
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('intro');
      (window as any).__introFallback = setTimeout(() => {
        document.documentElement.classList.remove('intro', 'intro-play');
      }, 5000);
    }

    const ctaBtn = document.querySelector('.cta .btn:nth-child(2)');
    function start() {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.add('intro-play');
        });
      });
    }

    function cleanup() {
      document.documentElement.classList.remove('intro', 'intro-play');
      if (ctaBtn) ctaBtn.removeEventListener('animationend', endAnim);
      if ((window as any).__introFallback) clearTimeout((window as any).__introFallback);
    }

    function endAnim(e: Event) {
      if (e.target === ctaBtn) cleanup();
    }

    if (ctaBtn) ctaBtn.addEventListener('animationend', endAnim);
    setTimeout(cleanup, 3000);

    if (document.fonts && document.fonts.ready) {
      const fontTimer = setTimeout(start, 700);
      document.fonts.ready.then(() => {
        clearTimeout(fontTimer);
        start();
      });
    } else {
      start();
    }

    // Mobile menu script
    const bar = document.getElementById('bar');
    const btn = document.getElementById('menu-btn');
    function setMenu(open: boolean) {
      if (!bar || !btn) return;
      bar.dataset.open = open ? 'true' : 'false';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    }
    setMenu(false);

    const toggleMenu = (e: Event) => {
      e.stopPropagation();
      setMenu(bar?.dataset.open !== 'true');
    };
    
    const clickOutside = (e: Event) => {
      if (bar && !bar.contains(e.target as Node)) setMenu(false);
    };
    
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };

    btn?.addEventListener('click', toggleMenu);
    document.addEventListener('click', clickOutside);
    document.addEventListener('keydown', onEsc);

    // Video script
    const v = document.querySelector('video.sky') as HTMLVideoElement;
    if (v) {
      v.muted = true;
      const playVideo = () => {
        if (v.paused) {
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        }
      };
      playVideo();
      v.addEventListener('canplay', playVideo, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) playVideo();
      }, { passive: true });

      const events = ['pointerdown', 'touchstart', 'scroll'];
      const onInteract = () => {
        playVideo();
        events.forEach(e => document.removeEventListener(e, onInteract));
      };
      events.forEach(e => document.addEventListener(e, onInteract, { passive: true }));
    }

    return () => {
      cleanup();
      btn?.removeEventListener('click', toggleMenu);
      document.removeEventListener('click', clickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div className="relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face { 
          font-family: "InterVar"; 
          font-style: normal; 
          font-weight: 100 900; 
          font-display: block; 
          src: url(assets/fonts/inter-var.woff2) format("woff2"); 
        }
        
        :root {
          --u: max( min(calc(100vw / 1563), calc(100vh / 460)), 0.80px );
          --ink: #ffffff; 
          --ink-mark: rgba(255,255,255,.98); 
          --ink-nav: rgba(255,255,255,.91);
          --ink-sub: rgba(255,255,255,.50); 
          --ink-pill: rgba(255,255,255,.88); 
          --ink-dark: #000000;
          --hairline: rgba(255,255,255,.98); 
          --glass-bg: rgba(255,255,255,.12); 
          --glass-line: rgba(255,255,255,.15);
          --r-btn: calc(10 * var(--u));
        }
        @supports (height:100dvh) { :root { --u: max( min(calc(100vw / 1563), calc(100dvh / 460)), 0.80px ); } }
        @supports not (width: max(1px,1vw)) { :root { --u: calc(100vw / 1563); } }

        *, *::before, *::after { box-sizing: border-box; }
        
        body {
          margin: 0 !important;
          background: #000 !important;
          color: #fff;
          font-optical-sizing: none;
          font-feature-settings: "kern" 1, "calt" 1;
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
          font-family: "InterVar", "Inter", "Helvetica Neue", Arial, system-ui, sans-serif;
        }
        
        .sr {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); border: 0;
        }

        .frame a:focus-visible, .frame button:focus-visible { 
          outline: 2px solid #6b3fd4; /* Ratchet Violet */
          outline-offset: 3px; 
          border-radius: 4px; 
        }

        div.frame { position: relative; width: 100%; height: 100vh; overflow: hidden; background: #000; isolation: isolate; }
        video.sky {
          position: absolute;
          top: calc(-1.5 * var(--u));
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: auto;
          min-height: calc(100% + calc(1.5 * var(--u)));
          object-fit: cover;
          object-position: center top;
          z-index: 0;
          pointer-events: none;
          user-select: none;
        }
        div.veil {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,.15);
          z-index: 1;
          pointer-events: none;
        }
        header.bar {
          position: absolute;
          left: calc(50% - calc(495.5 * var(--u)));
          top: calc(7.5 * var(--u));
          width: calc(983.5 * var(--u));
          height: calc(36.2 * var(--u));
          z-index: 3;
        }
        div.screen {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: calc(1563 * var(--u));
          height: calc(1006 * var(--u));
          z-index: 2;
        }
        main.hero {
          position: absolute;
          left: calc(0.9 * var(--u));
          right: calc(-0.9 * var(--u));
          top: 0;
          text-align: center;
        }

        a.brand {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: row;
          gap: calc(11.4 * var(--u));
          color: var(--ink-mark);
          text-decoration: none;
          align-items: center;
        }
        a.brand > svg {
          width: calc(26.9 * var(--u));
          height: calc(16.6 * var(--u));
          overflow: visible;
          fill: none;
        }
        .brand-text {
          font-size: calc(17.5 * var(--u));
          font-weight: 550;
          font-variation-settings: 'opsz' 22;
          letter-spacing: 0;
          line-height: 1;
        }
        nav.links {
          position: absolute;
          left: calc(353.8 * var(--u));
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: calc(25.2 * var(--u));
        }
        nav.links a {
          font-size: calc(11.9 * var(--u));
          font-weight: 450;
          font-variation-settings: 'opsz' 15;
          letter-spacing: calc(-0.30 * var(--u));
          color: var(--ink-nav);
          white-space: nowrap;
          transition: color .18s ease;
          text-decoration: none;
        }
        nav.links a:hover { color: #fff; }
        
        div.actions {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          gap: calc(7.8 * var(--u));
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--r-btn);
          text-decoration: none;
          white-space: nowrap;
          line-height: 1;
          border: 0;
          transition: background-color .18s ease, color .18s ease, border-color .18s ease;
          cursor: pointer;
        }
        .ghost {
          background: transparent;
          color: #fff;
          border: calc(1 * var(--u)) solid rgba(255,255,255,.98);
        }
        .ghost:hover { background: rgba(255,255,255,.10); }
        .solid { background: #fff; color: #000; }
        .solid:hover { background: #e9e9ea; }
        
        .bar .btn {
          height: calc(36.2 * var(--u));
          line-height: calc(36.2 * var(--u));
          font-size: calc(11.9 * var(--u));
          font-weight: 500;
          font-variation-settings: 'opsz' 15;
          letter-spacing: calc(-0.38 * var(--u));
        }
        .bar .ghost { width: calc(85.5 * var(--u)); }
        .bar .solid { 
          width: calc(88.2 * var(--u)); 
          font-size: calc(12.15 * var(--u)); 
          font-weight: 550; 
          letter-spacing: calc(-0.35 * var(--u));
        }
        
        button.menu {
          display: none;
          width: calc(36.2 * var(--u));
          height: calc(36.2 * var(--u));
          border-radius: var(--r-btn);
          border: calc(1 * var(--u)) solid rgba(255,255,255,.35);
          background: transparent;
          color: #fff;
          cursor: pointer;
          padding: 0;
          align-items: center;
          justify-content: center;
          transition: background-color .18s ease;
        }
        button.menu:hover { background: rgba(255,255,255,.10); }

        nav.sheet {
          display: none;
          position: absolute;
          top: calc(100% + calc(9 * var(--u)));
          right: 0;
          min-width: calc(210 * var(--u));
          padding: calc(10 * var(--u));
          border-radius: calc(14 * var(--u));
          background: rgba(18,18,20,.88);
          border: calc(1 * var(--u)) solid rgba(255,255,255,.15);
          -webkit-backdrop-filter: blur(calc(18 * var(--u))) saturate(140%);
          backdrop-filter: blur(calc(18 * var(--u))) saturate(140%);
          box-shadow: 0 calc(18 * var(--u)) calc(44 * var(--u)) rgba(0,0,0,.55);
        }
        header.bar[data-open="true"] nav.sheet { display: block; }
        nav.sheet a:not(.btn) {
          display: block;
          padding: calc(9 * var(--u)) calc(10 * var(--u));
          border-radius: calc(9 * var(--u));
          color: var(--ink-nav);
          font-size: calc(14 * var(--u));
          font-weight: 450;
          font-variation-settings: 'opsz' 15;
          letter-spacing: calc(-0.30 * var(--u));
          text-decoration: none;
          transition: background-color .18s ease, color .18s ease;
        }
        nav.sheet a:not(.btn):hover { background: rgba(255,255,255,.08); color: #fff; }
        nav.sheet .solid {
          display: flex;
          width: 100%;
          height: calc(38 * var(--u));
          margin-top: calc(8 * var(--u));
          font-size: calc(14 * var(--u));
          font-weight: 500;
          font-variation-settings: 'opsz' 15;
          letter-spacing: calc(-0.30 * var(--u));
          color: #000;
        }

        a.pill {
          position: absolute;
          top: calc(129.6 * var(--u));
          left: 50%;
          transform: translateX(-50%);
          display: inline-flex;
          align-items: center;
          width: calc(194.5 * var(--u));
          height: calc(22.4 * var(--u));
          padding-left: calc(4.0 * var(--u));
          padding-right: calc(8.6 * var(--u));
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          border: calc(1 * var(--u)) solid rgba(255,255,255,.15);
          -webkit-backdrop-filter: blur(calc(10 * var(--u)));
          backdrop-filter: blur(calc(10 * var(--u)));
          white-space: nowrap;
          transition: background-color .18s ease;
          text-decoration: none;
        }
        a.pill:hover { background: rgba(255,255,255,.17); }
        span.chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: calc(33.3 * var(--u));
          height: calc(14 * var(--u));
          border-radius: 999px;
          background: #fff;
          color: #000;
          font-size: calc(10.2 * var(--u));
          font-weight: 600;
          font-variation-settings: 'opsz' 14;
          padding-top: calc(1.7 * var(--u));
          letter-spacing: calc(-0.1 * var(--u));
          line-height: 1;
        }
        span.pill-label {
          margin-left: calc(3.4 * var(--u));
          position: relative;
          top: calc(1 * var(--u));
          color: rgba(255,255,255,.88);
          font-size: calc(12.4 * var(--u));
          font-weight: 450;
          font-variation-settings: 'opsz' 15;
          letter-spacing: calc(-0.48 * var(--u));
          height: calc(22.4 * var(--u));
          line-height: calc(22.4 * var(--u));
        }
        
        .hero h1 {
          position: absolute;
          left: calc(0.6 * var(--u));
          right: calc(-0.6 * var(--u));
          top: calc(168.5 * var(--u));
          margin: 0;
          font-size: calc(55 * var(--u));
          font-weight: 545;
          font-variation-settings: 'opsz' 32;
          line-height: calc(56 * var(--u));
          letter-spacing: calc(-0.76 * var(--u));
          color: #fff;
        }
        .ln { display: block; overflow: hidden; padding-bottom: calc(7 * var(--u)); margin-bottom: calc(-7 * var(--u)); }
        .ln-i { display: block; }
        
        main.hero p {
          position: absolute;
          left: 50%;
          transform: translateX(calc(-50% + calc(0.25 * var(--u))));
          top: calc(292.6 * var(--u));
          margin: 0;
          width: calc(700 * var(--u));
          font-size: calc(15.7 * var(--u));
          font-weight: 400;
          font-variation-settings: 'opsz' 20;
          line-height: calc(24 * var(--u));
          letter-spacing: calc(-0.05 * var(--u));
          color: rgba(255,255,255,.50);
        }
        
        div.cta {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: calc(342.8 * var(--u));
          display: flex;
          gap: calc(9.9 * var(--u));
        }
        .cta .btn {
          height: calc(36.4 * var(--u));
          line-height: calc(36.4 * var(--u));
          padding-top: calc(2 * var(--u));
          font-size: calc(13.3 * var(--u));
          font-weight: 480;
          font-variation-settings: 'opsz' 16;
          letter-spacing: calc(-0.34 * var(--u));
        }
        .cta .ghost { width: calc(99.6 * var(--u)); }
        .cta .solid { width: calc(96.4 * var(--u)); }

        @media (max-width: 1023px) {
          :root { --u: calc(100vw / 900); }
          header.bar { left: 4.2vw; width: 91.6vw; }
          nav.links, .bar .solid { display: none; }
          button.menu { display: inline-flex; }
        }
        @media (max-width: 640px) {
          :root { --u: calc(100vw / 486); }
          header.bar { left: 5.2vw; width: 89.6vw; }
          main.hero p { width: min(calc(560 * var(--u)), 88vw); line-height: calc(23 * var(--u)); }
          a.pill { padding-right: calc(8 * var(--u)); }
        }
        @media (max-width: 380px) {
          :root { --u: calc(100vw / 470); }
        }
        @media (max-width: 1023px) and (max-height: 520px) {
          :root { --u: min(calc(100vw / 900), calc(100vh / 470)); }
        }
        @media (min-aspect-ratio: 3/1) {
          video.sky { top: auto; bottom: 0; height: auto; min-height: 0; width: 100%; min-width: 100%; }
          div.veil { background: linear-gradient(to bottom, rgba(0,0,0,.82) 0%, rgba(0,0,0,.72) 55%, rgba(0,0,0,.18) 100%); }
        }

        @media (prefers-reduced-motion: no-preference) {
          :root {
            --e-reveal: cubic-bezier(.18,.85,.26,1);
            --e-soft: cubic-bezier(.22,1,.36,1);
            --e-nav: cubic-bezier(.33,1,.68,1);
            --rise: calc(10 * var(--u));
            --rise-lg: calc(13 * var(--u));
          }
          html.intro .brand, html.intro .links a, html.intro .actions > .btn, html.intro .actions > .menu, html.intro .pill, html.intro .hero p, html.intro .cta .btn {
            opacity: 0;
          }
          html.intro .ln-i {
            transform: translate3d(0,115%,0);
          }
          html.intro .brand, html.intro .pill, html.intro .hero p, html.intro .ln-i, html.intro .cta .btn {
            will-change: transform, opacity;
          }

          @keyframes i-rise { from { opacity: 0; transform: translate3d(0,var(--rise),0); } to { opacity: 1; transform: none; } }
          @keyframes i-rise-cy { from { opacity: 0; transform: translateY(-50%) translate3d(0,var(--rise),0); } to { opacity: 1; transform: translateY(-50%); } }
          @keyframes i-pill { from { opacity: 0; transform: translateX(-50%) translate3d(0,var(--rise-lg),0) scale(.972); } to { opacity: 1; transform: translateX(-50%); } }
          @keyframes i-sub { from { opacity: 0; transform: translateX(calc(-50% + calc(0.25 * var(--u)))) translate3d(0,var(--rise-lg),0); } to { opacity: 1; transform: translateX(calc(-50% + calc(0.25 * var(--u)))); } }
          @keyframes i-btn { from { opacity: 0; transform: translate3d(0,var(--rise-lg),0) scale(.986); } to { opacity: 1; transform: none; } }
          @keyframes i-line { from { transform: translate3d(0,115%,0); } to { transform: none; } }

          html.intro-play .brand { animation: i-rise-cy .62s var(--e-nav) 0s both; }
          html.intro-play .links a:nth-child(1) { animation: i-rise .55s var(--e-nav) .070s both; }
          html.intro-play .links a:nth-child(2) { animation: i-rise .55s var(--e-nav) .115s both; }
          html.intro-play .links a:nth-child(3) { animation: i-rise .55s var(--e-nav) .160s both; }
          html.intro-play .links a:nth-child(4) { animation: i-rise .55s var(--e-nav) .205s both; }
          html.intro-play .links a:nth-child(5) { animation: i-rise .55s var(--e-nav) .250s both; }
          html.intro-play .actions > .menu { animation: i-rise .55s var(--e-nav) .215s both; }
          html.intro-play .actions > .ghost { animation: i-rise .55s var(--e-nav) .160s both; }
          html.intro-play .actions > .solid { animation: i-rise .55s var(--e-nav) .215s both; }
          html.intro-play .pill { animation: i-pill .62s var(--e-soft) .26s both; }
          html.intro-play h1 .ln:nth-child(1) .ln-i { animation: i-line .95s var(--e-reveal) .34s both; }
          html.intro-play h1 .ln:nth-child(2) .ln-i { animation: i-line .95s var(--e-reveal) .48s both; }
          html.intro-play .hero p { animation: i-sub .70s var(--e-soft) .86s both; }
          html.intro-play .cta .btn:nth-child(1) { animation: i-btn .62s var(--e-soft) 1.00s both; }
          html.intro-play .cta .btn:nth-child(2) { animation: i-btn .62s var(--e-soft) 1.07s both; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}} />

      {/* Hero Section (100vh) */}
      <div className="frame">
        <video className="sky" aria-hidden="true" autoPlay muted loop playsInline preload="auto" poster="assets/images/sky.webp" src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4b73c700-3112-4c07-bd48-0af2893dff7c.mp4"></video>
        <div className="veil"></div>
        <header className="bar" id="bar" data-open="false">
          <Link href="/" className="brand" aria-label="Ratchet — home">
            <svg viewBox="0 0 24 24" style={{ width: 'calc(24 * var(--u))', height: 'calc(24 * var(--u))', overflow: 'visible', fill: 'none' }}>
              <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 8h5a3 3 0 010 6H8v-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M11 14l3.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="brand-text">Ratchet</span>
          </Link>
          <nav className="links" aria-label="Primary">
            <Link href="/runs">Dashboard</Link>
            <Link href="/runs/new">New Run</Link>
            <Link href="/benchmark">Benchmarks</Link>
            <a href="#docs">Docs</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="actions" style={{ display: 'flex', alignItems: 'center', gap: 'calc(8 * var(--u))' }}>
            {isSignedIn ? (
              <>
                <Link href="/runs" className="btn ghost">View runs</Link>
                <Link href="/runs/new" className="btn solid">Start building</Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="btn ghost">Sign in</button>
                </SignInButton>
                <SignInButton mode="modal" fallbackRedirectUrl="/runs/new">
                  <button className="btn solid">Start building</button>
                </SignInButton>
              </>
            )}
            <button className="menu" id="menu-btn" aria-label="Menu" aria-expanded="false" aria-controls="menu-sheet">
              <svg viewBox="0 0 20 14" style={{ width: '55%', height: '55%' }}>
                <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            <nav className="sheet" id="menu-sheet" aria-label="Menu">
              <Link href="/runs">Dashboard</Link>
              <Link href="/runs/new">New Run</Link>
              <Link href="/benchmark">Benchmarks</Link>
              <a href="#docs">Docs</a>
              <a href="#pricing">Pricing</a>
              <Link href="/runs/new" className="btn solid">Start building</Link>
            </nav>
          </div>
        </header>
        <div className="screen">
          <main className="hero">
            <a href="#new" className="pill">
              <span className="chip">v1.0</span>
              <span className="pill-label">Verification pipeline live</span>
              <svg viewBox="0 0 9.5 8" style={{ marginLeft: 'auto', width: 'calc(9.5 * var(--u))', height: 'calc(8 * var(--u))', color: 'rgba(255,255,255,.95)' }}>
                <path d="M0.7 4H8.8M5.6 0.75 8.85 4 5.6 7.25" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </a>
            <h1>
              <span className="ln"><span className="ln-i">Turn incidents into</span></span>
              <span className="ln"><span className="ln-i">verified test suites</span></span>
            </h1>
            <p>Ratchet orchestrates an unprivileged Docker sandbox, synthesizes tests via LLM, and proves your fix works.</p>
            <div className="cta">
              {isSignedIn ? (
                <>
                  <Link href="/runs" className="btn ghost">View runs</Link>
                  <Link href="/runs/new" className="btn solid">Start building</Link>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="btn ghost">Sign in</button>
                  </SignInButton>
                  <SignInButton mode="modal" fallbackRedirectUrl="/runs/new">
                    <button className="btn solid">Start building</button>
                  </SignInButton>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Ratchet Specific Content Flow Below Hero */}
      <div className="relative z-10 bg-[#060606] text-bone py-24 px-8 border-t border-line font-sans" style={{ minHeight: '100vh' }}>
        <div className="max-w-[1120px] mx-auto space-y-24">
          
          {/* Titles & Lead */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-semibold tracking-tight">
              The end-to-end verification engine.
            </h2>
            <p className="text-xl text-mute">
              Don't just write tests, mathematically prove they work against the exact commit boundary using our sandboxed gate strip.
            </p>
          </div>

          {/* Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tile 1 */}
            <div className="bg-panel rounded-panel border border-line p-8 flex flex-col items-start hover:border-violet transition-colors">
              <div className="w-12 h-12 rounded bg-violet/10 flex items-center justify-center text-violet mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AST Navigation</h3>
              <p className="text-mute flex-1">
                Ratchet parses your repo using `tree-sitter` to map Git diff hunks directly to syntax blocks, feeding the LLM only what matters.
              </p>
              <Link href="/runs/new">
                <button className="mt-6 text-violet font-semibold hover:text-white transition-colors flex items-center">
                  Trigger an AST parse <span className="ml-2">→</span>
                </button>
              </Link>
            </div>

            {/* Tile 2 */}
            <div className="bg-panel rounded-panel border border-line p-8 flex flex-col items-start hover:border-magenta transition-colors">
              <div className="w-12 h-12 rounded bg-magenta/10 flex items-center justify-center text-magenta mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Sandbox</h3>
              <p className="text-mute flex-1">
                A native unprivileged Docker orchestration with strict resource limits, dropped capabilities, and zero network access.
              </p>
              <button className="mt-6 text-magenta font-semibold hover:text-white transition-colors flex items-center">
                Read isolation docs <span className="ml-2">→</span>
              </button>
            </div>

            {/* Tile 3 */}
            <div className="bg-panel rounded-panel border border-line p-8 flex flex-col items-start hover:border-teal transition-colors">
              <div className="w-12 h-12 rounded bg-teal/10 flex items-center justify-center text-teal mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Repair Loops</h3>
              <p className="text-mute flex-1">
                If a test fails a gate, Ratchet injects the structured traceback back into Claude to repair the test recursively up to 4 times.
              </p>
              <Link href="/benchmark">
                <button className="mt-6 text-teal font-semibold hover:text-white transition-colors flex items-center">
                  View benchmark yield <span className="ml-2">→</span>
                </button>
              </Link>
            </div>

          </div>

          {/* Action Row */}
          <div className="bg-ink border-2 border-line rounded-panel p-12 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet/10 blur-[100px] pointer-events-none"></div>
            <h3 className="text-2xl font-display font-bold mb-4 z-10">Ready to stop shipping regressions?</h3>
            <p className="text-mute mb-8 z-10 max-w-lg">
              Connect your GitHub repository, drop in a PR, and watch the pipeline build a test in seconds.
            </p>
            <div className="flex gap-4 z-10">
              <Link href="/runs">
                <button className="bg-raised border border-line hover:bg-panel rounded-control px-6 py-3 font-semibold transition-colors">
                  Open Dashboard
                </button>
              </Link>
              <Link href="/runs/new">
                <button className="bg-bone text-ink hover:bg-white rounded-control px-6 py-3 font-bold shadow-lg transition-colors">
                  Create a New Run
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <FreedomSection />
      <Footer />
    </div>
  );
}
