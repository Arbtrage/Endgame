"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type BoardSizeContainerProps = {
  children: ReactNode;
};

const MOBILE_MAX_WIDTH = 1023;

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
}

export function BoardSizeContainer({ children }: BoardSizeContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const padX =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const innerWidth = Math.max(0, width - padX);
      const innerHeight = Math.max(0, height - padY);

      if (isMobileViewport()) {
        setSize(Math.floor(innerWidth));
      } else {
        setSize(Math.floor(Math.min(innerWidth, innerHeight)));
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    mq.addEventListener("change", update);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="flex min-h-0 flex-1 items-center justify-center p-2 sm:p-3"
    >
      {size > 0 ? (
        <div
          className="shrink-0 overflow-hidden rounded-sm"
          style={{ width: size, height: size }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
