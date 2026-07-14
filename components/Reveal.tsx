"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}

export default function Reveal({ children, as = "div", delay = 0, className }: Props) {
  // @types/react 19.2+ resolves JSX props of a bare ElementType to `never`,
  // so narrow the tag for type-checking. Only plain HTML tags are ever
  // passed here (current callers pass none), and they all accept div props.
  const Tag = as as "div";
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={visible}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={className}
    >
      {children}
    </Tag>
  );
}
