'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export const AnimatedReservation = () => {
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prev) => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const foodImages = [
        {
            src: '/food-pasta.jpg',
            title: 'Pasta',
        },
        {
            src: '/food-steak.jpg',
            title: 'Steak',
        },
        {
            src: '/food-sushi.jpg',
            title: 'Sushi',
        },
        {
            src: '/food-dessert.jpg',
            title: 'Dessert',
        },
    ];

    return (
        <div className="relative h-96 w-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
                {foodImages.map((food, index) => (
                    <div
                        key={index}
                        className={`absolute transition-all duration-1000 ease-out ${
                            imageIndex === index
                                ? 'opacity-100 scale-100 z-10'
                                : 'opacity-0 scale-75 z-0'
                        }`}
                        style={{
                            animation:
                                imageIndex === index
                                    ? 'slideInRotate 1s ease-out forwards, float 4s ease-in-out infinite 1s'
                                    : 'none',
                        }}
                    >
                        <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={food.src || '/placeholder.svg'}
                                alt={food.title}
                                fill
                                className="object-cover"
                                priority={imageIndex === index}
                            />

                            <div className="absolute inset-0" />
                        </div>
                    </div>
                ))}

                <style>{`
          @keyframes slideInRotate {
            from {
              opacity: 0;
              transform: translateX(100px) rotateY(-30deg) scale(0.8);
            }
            to {
              opacity: 1;
              transform: translateX(0) rotateY(0) scale(1);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            25% {
              transform: translateY(-20px);
            }
            50% {
              transform: translateY(-30px);
            }
            75% {
              transform: translateY(-15px);
            }
          }
        `}</style>
            </div>

            <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full blur-2xl pointer-events-none" />
        </div>
    );
};
