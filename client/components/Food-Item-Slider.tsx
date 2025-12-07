'use client';

import Marquee from '@/components/ui/marquee';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function FoodItemSlider() {
  const router = useRouter();

  const dishes = [
    { title: 'Butter Chicken', image: '/ButterChicken.avif' },
    { title: 'Biryani', image: '/Biryani.avif' },
    { title: 'Masala Dosa', image: '/MasalaDosa.avif' },
    { title: 'Paneer Tikka', image: '/PaneerTikka.avif' },
    { title: 'Samosa', image: '/Samosa.avif' },
    { title: 'Tandoori Chicken', image: '/TandooriChicken.avif' },
    { title: 'Chicken Lolipop', image: '/ChickenLolipop.avif' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center  py-16">
      {/* Title */}
     <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-tight mb-8 text-primary">
  🍽️ Explore Restaurants Near You
</h2>
<p className="text-center text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
  Don&apos;t just scroll through delicious dishes — discover where to find them.
  <br />
  Browse all available restaurants and explore authentic flavors
  <br />
  that&apos;ll make every meal unforgettable.
</p>

      {/* Marquee animation */}
      <Marquee speed={150} pauseOnHover className="py-12 w-full">
        <div className="flex items-center gap-12">
          {dishes.map((dish) => (
            <div
              key={dish.title}
              className="flex flex-col items-center justify-center text-center"
            >
            
              <div className="relative w-[250px] h-[250px] flex items-center justify-center overflow-hidden rounded-2xl  shadow-lg">
                <Image
                  src={dish.image}
                  alt={dish.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105 "
                    onClick={() => router.push('/login')}
                />
              </div>

              {/* Title below image */}
              <h3 className="mt-3 text-lg font-semibold text-primary drop-shadow-md">
                {dish.title}
              </h3>
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
