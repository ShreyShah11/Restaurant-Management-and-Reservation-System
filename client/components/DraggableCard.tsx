'use client';

import { DraggableCardBody, DraggableCardContainer } from '@/components/ui/draggable-card';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function DraggableCard() {
    const router = useRouter();

    const items = [
        {
            title: 'Butter Chicken',
            image: '/ButterChicken.avif',
            className:
                'absolute top-[40%] left-[40%] -translate-x-[90%] -translate-y-[60%] rotate-[-50deg]',
        },
        {
            title: 'Biryani',
            image: '/Biryani.avif',
            className:
                'absolute top-[50%] left-[40%] -translate-x-[85%] -translate-y-[40%] rotate-[-7deg]',
        },
        {
            title: 'Masala Dosa',
            image: '/MasalaDosa.avif',
            className:
                'absolute top-[45%] left-[50%] -translate-x-[50%] -translate-y-[80%] rotate-[8deg]',
        },
        {
            title: 'Paneer Tikka',
            image: '/PaneerTikka.avif',
            className:
                'absolute top-[55%] left-[60%] -translate-x-[30%] -translate-y-[50%] rotate-[10deg]',
        },
        {
            title: 'Samosa',
            image: '/Samosa.avif',
            className:
                'absolute top-[50%] left-[70%] -translate-x-[30%] -translate-y-[60%] rotate-[2deg]',
        },
        {
            title: 'Tandoori Chicken',
            image: '/TandooriChicken.avif',
            className:
                'absolute top-[55%] left-[45%] -translate-x-[70%] -translate-y-[20%] rotate-[-7deg]',
        },
        {
            title: 'Chole Bhature',
            image: '/CholeBhature.avif',
            className:
                'absolute top-[60%] left-[50%] -translate-x-[50%] -translate-y-[40%] rotate-[4deg]',
        },
    ];

    return (
        <DraggableCardContainer className="bg-background relative flex flex-col items-center justify-center h-[95vh] py-16 overflow-hidden ">
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Center text BEHIND the images */}
                <div className="absolute text-center space-y-3 px-4 z-0 opacity-90">
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                        Hungry for More?
                    </p>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                        Don&apos;t just scroll through delicious dishes — taste them.
                        <br />
                        Reserve your spot and experience authentic flavors
                        <br />
                        that&apos;ll keep you coming back.
                    </p>
                    <Button
                        onClick={() => router.push('/login')}
                        className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                        Reserve Your Table
                    </Button>
                </div>

                {/* Draggable images ABOVE text */}
                {items.map((item) => (
                    <DraggableCardBody
                        className={`${item.className + ' border border-primary/20'} z-20`}
                        key={item.title}
                    >
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={200}
                            height={200}
                            className="pointer-events-none relative z-20 h-40 w-40 sm:h-56 sm:w-56 md:h-64 md:w-64 object-cover rounded-xl shadow-xl"
                        />
                        <h3 className="mt-2 text-center text-base sm:text-lg md:text-xl font-bold text-primary drop-shadow-md">
                            {item.title}
                        </h3>
                    </DraggableCardBody>
                ))}
            </div>
        </DraggableCardContainer>
    );
}
