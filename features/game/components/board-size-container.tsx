"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type BoardSizeContainerProps = {
  children: ReactNode;
};

export function BoardSizeContainer({ children }: BoardSizeContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const { width, height } = node.getBoundingClientRect();
      setSize(Math.floor(Math.min(width, height)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
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
