import { AboutHero } from '@/components/AboutHero';
import { Team } from '@/components/Team';
import { Separator } from '@/components/ui/separator';

export default function Page() {
    return (
        <div className="space-y-8 my-16">
            <AboutHero />
            <Separator />
            <Team />
        </div>
    );
}
