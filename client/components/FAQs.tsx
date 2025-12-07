import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const questions = [
    {
        q: 'How do I reserve a table?',
        a: 'You can book a table instantly through our platform by selecting your preferred restaurant, date, time, and number of guests. You’ll receive an instant confirmation once the reservation is complete.',
    },
    {
        q: 'How will I know if my reservation is confirmed?',
        a: 'Once your booking is confirmed, you’ll receive a confirmation email and SMS with all reservation details. You can also view it anytime in your dashboard.',
    },
    {
        q: 'Do I need to create an account to book a table?',
        a: 'Yes, an account is required to confirm and manage reservations securely.',
    },
    {
        q: 'What happens if I’m running late?',
        a: 'Most restaurants hold your table for 15–20 minutes past your reservation time. We recommend calling the restaurant directly if you expect to be late.',
    },
    {
        q: 'How do I contact customer support?',
        a: 'You can reach our support team anytime through the “Contacts” section or by emailing support@reservebeta.com.',
    }
];

export function FAQs() {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:py-16">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                    Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">Find answers to common questions below</p>
            </div>

            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                {questions.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index + 1}`}>
                        <AccordionTrigger className="text-left hover:no-underline text-md">
                            <span className="font-medium">{item.q}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
