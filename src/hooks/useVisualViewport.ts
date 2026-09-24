import { useEffect, useRef, useState } from "react";

/**
 * Возвращает актуальную высоту visual viewport (px).
 * На iOS Safari при открытии клавиатуры visualViewport.height уменьшается —
 * это единственный надёжный способ не дать контенту уйти под клавиатуру.
 */
export function useVisualViewportHeight(): number | null {
  const [height, setHeight] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setHeight(vv.height);
      });
    };

    setHeight(vv.height);
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return height;
}
