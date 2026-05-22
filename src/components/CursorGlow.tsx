import { useEffect, useRef, useCallback } from 'react';

type CursorState = 'default' | 'hover' | 'button' | 'card' | 'text';

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -200, y: -200 });
  const dot = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const rafId = useRef<number>(0);
  const cursorState = useRef<CursorState>('default');
  const isVisible = useRef(false);
  const isClicking = useRef(false);

  const applyState = useCallback((state: CursorState, clicking: boolean) => {
    const d = dotRef.current;
    const r = ringRef.current;
    const a = auraRef.current;
    if (!d || !r || !a) return;

    // Reset
    d.style.transform = `translate(-50%, -50%) scale(${clicking ? 0.6 : 1})`;

    if (state === 'button') {
      r.style.width = '52px';
      r.style.height = '52px';
      r.style.borderColor = 'rgba(139,47,224,0.9)';
      r.style.boxShadow = '0 0 20px rgba(139,47,224,0.5), 0 0 40px rgba(37,99,235,0.2)';
      r.style.background = 'rgba(139,47,224,0.06)';
      d.style.background = 'radial-gradient(circle, #c084fc, #a78bfa)';
      d.style.boxShadow = '0 0 10px rgba(139,47,224,0.8)';
      a.style.opacity = '0.6';
      a.style.transform = 'translate(-50%, -50%) scale(1.4)';
    } else if (state === 'card') {
      r.style.width = '64px';
      r.style.height = '64px';
      r.style.borderColor = 'rgba(6,182,212,0.6)';
      r.style.boxShadow = '0 0 24px rgba(6,182,212,0.3), 0 0 48px rgba(37,99,235,0.15)';
      r.style.background = 'rgba(6,182,212,0.04)';
      d.style.background = 'radial-gradient(circle, #67e8f9, #38bdf8)';
      d.style.boxShadow = '0 0 10px rgba(6,182,212,0.8)';
      a.style.opacity = '0.5';
      a.style.transform = 'translate(-50%, -50%) scale(1.6)';
    } else if (state === 'text') {
      r.style.width = '2px';
      r.style.height = '28px';
      r.style.borderRadius = '1px';
      r.style.borderColor = 'rgba(255,255,255,0.7)';
      r.style.boxShadow = 'none';
      r.style.background = 'rgba(255,255,255,0.7)';
      d.style.opacity = '0';
      a.style.opacity = '0';
      a.style.transform = 'translate(-50%, -50%) scale(0)';
    } else {
      // default / hover
      r.style.width = state === 'hover' ? '44px' : '36px';
      r.style.height = state === 'hover' ? '44px' : '36px';
      r.style.borderRadius = '50%';
      r.style.borderColor = state === 'hover' ? 'rgba(99,179,237,0.7)' : 'rgba(139,47,224,0.5)';
      r.style.boxShadow = state === 'hover'
        ? '0 0 16px rgba(37,99,235,0.4), 0 0 32px rgba(6,182,212,0.15)'
        : '0 0 12px rgba(139,47,224,0.3)';
      r.style.background = 'transparent';
      d.style.opacity = '1';
      d.style.background = 'radial-gradient(circle, #e879f9, #818cf8, #38bdf8)';
      d.style.boxShadow = '0 0 8px rgba(139,47,224,0.6), 0 0 16px rgba(37,99,235,0.3)';
      a.style.opacity = state === 'hover' ? '0.35' : '0.2';
      a.style.transform = `translate(-50%, -50%) scale(${state === 'hover' ? 1.1 : 1})`;
    }
  }, []);

  useEffect(() => {
    // Desktop only
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.body.style.cursor = 'none';

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      const DOT_SPEED = 0.45;
      const RING_SPEED = 0.12;

      dot.current.x = lerp(dot.current.x, mouse.current.x, DOT_SPEED);
      dot.current.y = lerp(dot.current.y, mouse.current.y, DOT_SPEED);
      ring.current.x = lerp(ring.current.x, mouse.current.x, RING_SPEED);
      ring.current.y = lerp(ring.current.y, mouse.current.y, RING_SPEED);

      if (dotRef.current) {
        dotRef.current.style.left = `${dot.current.x}px`;
        dotRef.current.style.top = `${dot.current.y}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      if (auraRef.current) {
        auraRef.current.style.left = `${ring.current.x}px`;
        auraRef.current.style.top = `${ring.current.y}px`;
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!isVisible.current) {
        dot.current = { ...mouse.current };
        ring.current = { ...mouse.current };
        isVisible.current = true;
        [dotRef.current, ringRef.current, auraRef.current].forEach(el => {
          if (el) el.style.opacity = '1';
        });
      }
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      [dotRef.current, ringRef.current, auraRef.current].forEach(el => {
        if (el) el.style.opacity = '0';
      });
    };

    const onMouseDown = () => {
      isClicking.current = true;
      applyState(cursorState.current, true);
    };

    const onMouseUp = () => {
      isClicking.current = false;
      applyState(cursorState.current, false);
    };

    const getState = (el: Element): CursorState => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable) return 'text';
      if (el.closest('button, a, [role="button"], [data-cursor="button"]')) return 'button';
      if (el.closest('[data-cursor="card"]')) return 'card';
      if (el.closest('[data-cursor="hover"]')) return 'hover';
      return 'default';
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const state = getState(target);
      if (state !== cursorState.current) {
        cursorState.current = state;
        applyState(state, isClicking.current);
        // Restore border-radius if was in text mode
        if (state !== 'text' && ringRef.current) {
          ringRef.current.style.borderRadius = '50%';
        }
      }
      // Hide default cursor on interactive elements too
      (target as HTMLElement).style?.setProperty && (target as HTMLElement).style.setProperty('cursor', 'none', 'important');
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    return () => {
      document.body.style.cursor = '';
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [applyState]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      {/* Aura — large soft ambient glow */}
      <div
        ref={auraRef}
        className="cursor-aura"
        style={{ opacity: 0 }}
        aria-hidden
      />
      {/* Ring — outer trailing circle */}
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{ opacity: 0 }}
        aria-hidden
      />
      {/* Dot — fast-following inner point */}
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{ opacity: 0 }}
        aria-hidden
      />
    </>
  );
}
