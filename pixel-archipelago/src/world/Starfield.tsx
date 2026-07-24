import { useEffect, useRef } from "react";

/**
 * Procedural starfield layer (canvas). Replaces the baked star specks so the
 * background is an independent, animatable parallax layer.
 */
export default function Starfield({
  density = 0.00022,
  reducedMotion = false,
  className,
  style,
}: {
  density?: number;
  reducedMotion?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const parent = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];

    const build = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(rect.width * rect.height * density);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() < 0.85 ? 0.6 : 1.2,
        p: Math.random() * Math.PI * 2,
        s: 0.5 + Math.random() * 1.5,
      }));
    };
    const ro = new ResizeObserver(build);
    ro.observe(parent);
    build();

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const a = reducedMotion ? 0.6 : 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.001 * st.s + st.p));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }
      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    if (reducedMotion) draw(0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, reducedMotion]);

  return <canvas ref={ref} className={className} style={style} aria-hidden="true" />;
}
