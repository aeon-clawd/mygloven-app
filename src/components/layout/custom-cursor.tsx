"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor || !label) return;

    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const loop = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      raf = requestAnimationFrame(loop);
    };

    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest(
        "[data-cursor], a, button"
      ) as HTMLElement | null;
      if (t) {
        cursor.classList.add("is-hover");
        label.textContent = t.getAttribute("data-cursor") || "→";
      }
    };

    const onOut = (e: MouseEvent) => {
      const rt = e.relatedTarget as HTMLElement | null;
      if (!rt || !rt.closest?.("[data-cursor], a, button")) {
        cursor.classList.remove("is-hover");
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div id="mg-cursor" ref={cursorRef}>
      <span className="cursor-label" ref={labelRef} />
    </div>
  );
}
