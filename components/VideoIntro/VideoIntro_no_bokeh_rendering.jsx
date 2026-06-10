'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './VideoIntro.module.css';

export default function VideoIntro() {
  const heroRef     = useRef(null);
  const videoRef    = useRef(null);
  const bgVideoRef  = useRef(null);
  const taglineRef  = useRef(null);
  const line1Ref    = useRef(null);
  const line2Ref    = useRef(null);
  const line3Ref    = useRef(null);
  const roleRef     = useRef(null);
  const controlsRef = useRef(null);
  const hintRef     = useRef(null);

  const [isMuted,     setIsMuted]     = useState(true);
  const [videoStarted, setVideoStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded,  setHasEnded]  = useState(false);
  const [showHint,  setShowHint]  = useState(false);

  // ── entrance animation — always runs on mount, never gated ───────────
  useEffect(() => {
    const chars = (r) => r.current?.querySelectorAll('span') ?? [];
    gsap.set(heroRef.current,     { opacity: 1 });
    gsap.set(taglineRef.current,  { opacity: 0, y: 18, letterSpacing: '0.42em' });
    gsap.set(chars(line1Ref),     { opacity: 0, filter: 'blur(14px)', y: 44 });
    gsap.set(chars(line2Ref),     { opacity: 0, filter: 'blur(14px)', y: 44 });
    gsap.set(chars(line3Ref),     { opacity: 0, filter: 'blur(14px)', y: 44 });
    gsap.set(roleRef.current,     { opacity: 0, y: 22 });
    gsap.set(controlsRef.current, { opacity: 0, y: 14 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
    tl.to(taglineRef.current,  { opacity:1, y:0, letterSpacing:'0.28em', duration:1 })
      .to(chars(line1Ref),     { opacity:1, filter:'blur(0px)', y:0, duration:1,   stagger:0.03  }, '-=0.6')
      .to(chars(line2Ref),     { opacity:1, filter:'blur(0px)', y:0, duration:1.1, stagger:0.045 }, '-=0.8')
      .to(chars(line3Ref),     { opacity:1, filter:'blur(0px)', y:0, duration:1.1, stagger:0.035 }, '-=0.9')
      .to(roleRef.current,     { opacity:1, y:0, duration:0.9 }, '-=0.7')
      .to(controlsRef.current, { opacity:1, y:0, duration:0.7 }, '-=0.45');
    return () => tl.kill();
  }, []);

  // ── video: autoplay muted, show "tap for sound" hint ─────────────────
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.loop = false;

    const onEnded = () => { setIsPlaying(false); setHasEnded(true); };
    v.addEventListener('ended', onEnded);

    // autoPlay + muted is guaranteed to work in all browsers
    // Show the tap-for-sound hint so user knows audio is available
    setShowHint(true);
    setIsPlaying(true); // autoPlay attribute handles actual playback

    return () => v.removeEventListener('ended', onEnded);
  }, []);

  // ── tap anywhere to unmute ────────────────────────────────────────────
  useEffect(() => {
    if (!showHint) return;

    const unlock = () => {
      const v = videoRef.current;
      if (!v) return;
      v.muted = false;
      setIsMuted(false);
      setShowHint(false);
    };

    window.addEventListener('click',      unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    return () => {
      window.removeEventListener('click',      unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [showHint]);

  // ── sound hint auto-hide after 6s ────────────────────────────────────
  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => {
      if (hintRef.current)
        gsap.to(hintRef.current, {
          opacity: 0, y: -10, duration: 0.9,
          onComplete: () => setShowHint(false),
        });
    }, 6000);
    return () => clearTimeout(t);
  }, [showHint]);

  // ── controls ──────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hasEnded) {
      v.currentTime = 0;
      v.play().then(() => { setIsPlaying(true); setHasEnded(false); }).catch(() => {});
    } else if (v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [hasEnded]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted) setShowHint(false);
  }, []);

  const split = (w) => w.split('').map((c, i) => <span key={i}>{c}</span>);

  return (
    <section ref={heroRef} id="hero" className={styles.hero}>

      {/* blurred ambient bg */}
      <div className={styles.bgLayer}>
        <video ref={bgVideoRef} className={styles.bgVideo}
          src="/hero-video.mp4" autoPlay loop muted playsInline preload="auto" />
      </div>

      <div className={styles.gradientBottom} />
      <div className={styles.gradientTop} />
      <div className={styles.gradientLeft} />
      <div className={styles.vignette} />

      {/* Open to Work badge */}
      <div className={styles.openToWork}>
        <span className={styles.greenDot} />
        <span>Open to Work</span>
      </div>


      {/* foreground video — autoPlay + muted for guaranteed playback */}
      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src="/hero-video.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
        />
        <div className={styles.videoEdge} />
      </div>

      {/* copy */}
      <div className={styles.content}>
        <p ref={taglineRef} className={styles.tagline}>
          ML Engineer · Computer Vision · Edge AI · Autonomous Systems
        </p>
        <h1 className={styles.nameBlock}>
          <span ref={line1Ref} className={`${styles.nameLine} ${styles.nameLineSm}`}>{split('SRI KRISHNA')}</span>
          <span ref={line2Ref} className={`${styles.nameLine} ${styles.nameLineMd}`}>{split('KALYAN')}</span>
          <span ref={line3Ref} className={`${styles.nameLine} ${styles.nameLineLg}`}>{split('BANDARU')}</span>
        </h1>
        <p ref={roleRef} className={styles.role}>
          Building intelligent systems that ship —&nbsp;
          <span className={styles.roleAccent}>computer vision, edge deployment, autonomous navigation.</span>
        </p>
      </div>

      {/* controls */}
      <div ref={controlsRef} className={styles.controls} style={{ opacity: 0 }}>
        <button className={styles.glassBtn} onClick={togglePlay}
          aria-label={hasEnded ? 'Replay' : isPlaying ? 'Pause' : 'Play'}>
          {hasEnded ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          ) : isPlaying ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" rx="1"/>
              <rect x="9" y="2" width="4" height="12" rx="1"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5l10 5.5-10 5.5V2.5z"/>
            </svg>
          )}
        </button>
        <button className={styles.glassBtn} onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L4 5.5H1.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5H4L8 14V2z"/>
              <line x1="11" y1="6" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="15" y1="6" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2L4 5.5H1.5a.5.5 0 00-.5.5v4a.5.5 0 00.5.5H4L8 14V2z"/>
              <path d="M10.5 5.5a4 4 0 010 5M12.5 3.5a7 7 0 010 9"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
            </svg>
          )}
        </button>
      </div>

      {/* tap for sound hint */}
      {showHint && (
        <div ref={hintRef} className={styles.soundHint}>
          <span className={styles.soundPulse} />
          <span>Tap anywhere for sound</span>
        </div>
      )}

      {/* Mobile tap-to-play overlay — iOS Safari blocks autoPlay even when muted */}
      {!videoStarted && (
        <button
          className={styles.tapToPlay}
          onClick={() => {
            const v = videoRef.current;
            if (v) {
              v.play().then(() => {
                setIsPlaying(true);
                setVideoStarted(true);
              }).catch(() => {});
            }
          }}
          aria-label="Tap to play video"
        >
          <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5l10 5.5-10 5.5V2.5z"/>
          </svg>
        </button>
      )}

    </section>
  );
}
