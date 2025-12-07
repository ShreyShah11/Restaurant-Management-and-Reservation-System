'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';

interface InfiniteSliderProps {
    children: React.ReactNode[];
    speed?: number;
    speedOnHover?: number;
    gap?: number;
}

export const InfiniteSlider: React.FC<InfiniteSliderProps> = ({
    children,
    speed = 50,
    // speedOnHover = 20.
    gap = 100,
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const scrollerContent = Array.from(scroller.children);
        scrollerContent.forEach((child) => {
            const duplicatedChild = child.cloneNode(true);
            scroller.appendChild(duplicatedChild);
        });
    }, []);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        // const currentSpeed = isHovering ? speedOnHover : speed;
        scroller.style.animation = `scroll ${100 / speed}s linear infinite`;
    }, [isHovering, speed]);

    return (
        <div
            ref={sliderRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative w-full overflow-hidden"
        >
            <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - ${gap}px));
          }
        }
      `}</style>
            <div ref={scrollerRef} className="flex gap-8 w-max" style={{ gap: `${gap}px` }}>
                {children}
            </div>
        </div>
    );
};
