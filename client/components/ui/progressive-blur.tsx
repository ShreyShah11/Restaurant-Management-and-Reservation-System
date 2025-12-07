import type React from 'react';
interface ProgressiveBlurProps {
    className?: string;
    direction?: 'left' | 'right';
    blurIntensity?: number;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
    className = '',
    direction = 'left',
    blurIntensity = 1,
}) => {
    const isLeft = direction === 'left';

    return (
        <div
            className={className}
            style={{
                background: isLeft
                    ? 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)'
                    : 'linear-gradient(to left, rgba(0,0,0,0.5), transparent)',
                filter: `blur(${blurIntensity * 8}px)`,
                opacity: 0.3,
            }}
        />
    );
};
