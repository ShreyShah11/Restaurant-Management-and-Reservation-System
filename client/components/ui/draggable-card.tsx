'use client';
import { cn } from '@/lib/utils';
import React, { useRef, useState, useEffect } from 'react';
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    animate,
    useVelocity,
    useAnimationControls,
} from 'motion/react';

export const DraggableCardBody = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const cardRef = useRef<HTMLDivElement>(null);
    const controls = useAnimationControls();
    const [constraints, setConstraints] = useState({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    });

    // physics biatch
    const velocityX = useVelocity(mouseX);
    const velocityY = useVelocity(mouseY);

    const springConfig = {
        stiffness: 100,
        damping: 20,
        mass: 0.5,
    };

    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [25, -25]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-25, 25]), springConfig);

    const opacity = useSpring(useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]), springConfig);

    const glareOpacity = useSpring(
        useTransform(mouseX, [-300, 0, 300], [0.2, 0, 0.2]),
        springConfig,
    );

    useEffect(() => {
        // Update constraints when component mounts or window resizes
        const updateConstraints = () => {
            if (typeof window !== 'undefined') {
                setConstraints({
                    top: -window.innerHeight / 2,
                    left: -window.innerWidth / 2,
                    right: window.innerWidth / 2,
                    bottom: window.innerHeight / 2,
                });
            }
        };

        updateConstraints();

        // Add resize listener
        window.addEventListener('resize', updateConstraints);

        // Clean up
        return () => {
            window.removeEventListener('resize', updateConstraints);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e;
        const { width, height, left, top } = cardRef.current?.getBoundingClientRect() ?? {
            width: 0,
            height: 0,
            left: 0,
            top: 0,
        };
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        mouseX.set(deltaX);
        mouseY.set(deltaY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            drag
            dragConstraints={constraints}
            onDragStart={() => {
                document.body.style.cursor = 'grabbing';
            }}
            onDragEnd={(event, info) => {
                document.body.style.cursor = 'default';

                controls.start({
                    rotateX: 0,
                    rotateY: 0,
                    transition: {
                        type: 'spring',
                        stiffness: 120,
                        damping: 15,
                    },
                });

                const currentVelocityX = velocityX.get();
                const currentVelocityY = velocityY.get();

                // 🚀 make drag feel faster
                const speedMultiplier = 1.2; // big boost from 0.3 → 1.2
                const velocityMagnitude = Math.sqrt(
                    currentVelocityX * currentVelocityX + currentVelocityY * currentVelocityY,
                );

                const bounce = Math.min(1, velocityMagnitude / 800);

                // ✨ faster inertia-like animation
                animate(info.point.x, info.point.x + currentVelocityX * speedMultiplier, {
                    duration: 0.4, // very snappy
                    ease: [0.16, 1, 0.3, 1], // easeOutQuint-like
                    bounce,
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                    mass: 0.5,
                });

                animate(info.point.y, info.point.y + currentVelocityY * speedMultiplier, {
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                    bounce,
                    type: 'spring',
                    stiffness: 100,
                    damping: 10,
                    mass: 0.5,
                });
            }}
            style={{
                rotateX,
                rotateY,
                opacity,
                willChange: 'transform',
            }}
            animate={controls}
            whileHover={{ scale: 1.02 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'relative w-44 sm:w-56 md:w-64 lg:w-72 xl:w-80 min-h-[14rem] sm:min-h-[18rem] md:min-h-[20rem] lg:min-h-[22rem] xl:min-h-[24rem] overflow-hidden rounded-xl bg-background p-3 sm:p-4 md:p-6 shadow-2xl transform-3d transition-all duration-300',
                className,
            )}
        >
            {children}
            <motion.div
                style={{
                    opacity: glareOpacity,
                }}
                className="pointer-events-none absolute inset-0 select-none"
            />
        </motion.div>
    );
};

export const DraggableCardContainer = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return <div className={cn('perspective-[3000px]', className)}>{children}</div>;
};
