'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './ScrollNavigator.module.css';

export default function ScrollNavigator({ currentIdx = 0, total = 7, onNavigate }) {
  const downRef  = useRef(null);
  const chevDown = useRef(null);
  const upRef    = useRef(null);

  const atBottom = currentIdx === total - 1;
  const onHero   = currentIdx === 0;

  // down button — fades in once on mount, stays forever
  useEffect(() => {
    if (!downRef.current) return;
    gsap.fromTo(downRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 1, delay: 2.6, ease: 'power3.out' }
    );
  }, []);

  // up button — appears when leaving hero, disappears on hero
  useEffect(() => {
    if (!upRef.current) return;
    if (onHero) {
      gsap.to(upRef.current, { opacity: 0, y: -10, duration: 0.35, ease: 'power2.in' });
    } else {
      gsap.to(upRef.current, { opacity: 1, y: 0,   duration: 0.45, ease: 'power2.out' });
    }
  }, [onHero]);

  // flip down chevron at contact → points up for "Top"
  useEffect(() => {
    if (!chevDown.current) return;
    gsap.to(chevDown.current, {
      rotation: atBottom ? 225 : 45,
      duration: 0.4, ease: 'power2.inOut',
    });
  }, [atBottom]);

  const goDown = () => {
    if (!onNavigate) return;
    if (atBottom) onNavigate(0);
    else onNavigate(Math.min(currentIdx + 1, total - 1));
  };

  const goUp = () => {
    if (!onNavigate) return;
    onNavigate(Math.max(0, currentIdx - 1));
  };

  return (
    <>
      {/* ── UP button — fixed top-centre, identical to down but flipped ── */}
      <button
        ref={upRef}
        className={styles.upNav}
        onClick={goUp}
        aria-label="Previous section"
        style={{ opacity: 0 }}
      >
        <span className={styles.ring}>
          {/* static upward chevron — CSS rotates it */}
          <span className={styles.chevronUp} />
        </span>
        <span className={styles.label}>Back</span>
      </button>

      {/* ── DOWN / SCROLL / TOP button — fixed bottom-centre ─────────── */}
      <button
        ref={downRef}
        className={styles.downNav}
        onClick={goDown}
        aria-label={atBottom ? 'Back to top' : 'Next section'}
        style={{ opacity: 0 }}
      >
        <span className={styles.label}>
          {atBottom ? 'Top' : 'Scroll'}
        </span>
        <span className={styles.ring}>
          <span ref={chevDown} className={styles.chevronDown} />
        </span>
        {/* progress dots only on down button */}
        <span className={styles.dots} aria-hidden="true">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`${styles.dot}${i === currentIdx ? ' ' + styles.dotActive : ''}`}
            />
          ))}
        </span>
      </button>
    </>
  );
}
