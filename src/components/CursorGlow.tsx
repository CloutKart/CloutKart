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

    d.style.transform = `translate(-50%, -50%) scale(${clicking ? 0.6 : 1})`;

    if (state === 'button') {
      r.style.width = '48px';
      r.style.height = '48px';
      r.style.borderColor = 'rgba(168,85,247,0.6)';
      r.style.boxShadow = '0 0 16px rgba(168,85,247,0.2)';
      r.style.background = 'rgba(168,85,247,0.06)';
      d.style.background = 'linear-gradient(135deg, #A855F7, #3B82F6, #06B6D4)';
      d.style.boxShadow = '0 0 12px rgba(168,85,247,0.6)';
      a.style.opacity = '0.4';
      a.style.transform = 'translate(-50%, -50%) scale(1.3)';
    } else if (state === 'card') {
      r.style.width = '56px';
      r.style.height = '56px';
      r.style.borderColor = 'rgba(168,85,247,0.4)';
      r.style.boxShadow = '0 0 20px rgba(168,85,247,0.15)';
      r.style.background = 'rgba(168,85,247,0.03)';
      d.style.background = 'linear-gradient(135deg, #A855F7, #3B82F6, #06B6D4)';
      d.style.boxShadow = '0 0 10px rgba(168,85,247,0.5)';
      a.style.opacity = '0.3';
      a.style.transform = 'translate(-50%, -50%) scale(1.5)';
    } else if (state === 'text') {
      r.style.width = '2px';
      r.style.height = '24px';
      r.style.borderRadius = '1px';
      r.style.borderColor = 'rgba(168,85,247,0.7)';
      r.style.boxShadow = 'none';
      r.style.background = 'rgba(168,85,247,0.7)';
      d.style.opacity = '0';
      a.style.opacity = '0';
      a.style.transform = 'translate(-50%, -50%) scale(0)';
    } else {
      r.style.width = state === 'hover' ? '40px' : '32px';
      r.style.height = state === 'hover' ? '40px' : '32px';
      r.style.borderRadius = '50%';
      r.style.borderColor = state === 'hover' ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.4)';
      r.style.boxShadow = 'none';
      r.style.background = 'transparent';
      d.style.opacity = '1';
      d.style.background = 'linear-gradient(135deg, #A855F7, #3B82F6, #06B6D4)';
      d.style.boxShadow = '0 0 12px rgba(168,85,247,0.6)';
      a.style.opacity = state === 'hover' ? '0.25' : '0.15';
      a.style.transform = `translate(-50%, -50%) scale(${state === 'hover' ? 1.1 : 1})`;
    }
  }, []);

  useEffect(() => {
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
        if (state !== 'text' && ringRef.current) {
          ringRef.current.style.borderRadius = '50%';
        }
      }
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

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      <div ref={auraRef} className="cursor-aura" style={{ opacity: 0 }} aria-hidden />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} aria-hidden />
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} aria-hidden />
    </>
  );
}
