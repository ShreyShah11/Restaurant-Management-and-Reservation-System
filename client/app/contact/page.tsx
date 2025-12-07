import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Scale, Twitter, Github, Linkedin, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
    return (
        <main className="container my-16 mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">
                    Get In Touch
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Contact Us
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Have questions or need assistance? We&apos;re here to help. Reach out to us through
                    any of the channels below.
                </p>
            </div>

            {/* Contact Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {/* Location Card */}
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Our Location</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium mb-1">Head Office</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Dharmsinh Desai University<br />
                                College Road, Nadiad<br />
                                Gujarat 387001, India
                            </p>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-muted-foreground">
                                Visit us during business hours: Monday - Friday, 9:00 AM - 6:00 PM IST
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Phone Card */}
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                                <Phone className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Phone</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium mb-1">Customer Support</p>
                            <a
                                href="tel:+911234567890"
                                className="text-sm text-primary hover:underline"
                            >
                                +91 (123) 456-7890
                            </a>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Restaurant Partners</p>
                            <a
                                href="tel:+911234567891"
                                className="text-sm text-primary hover:underline"
                            >
                                +91 (123) 456-7891
                            </a>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-muted-foreground">
                                Available Monday - Saturday, 9:00 AM - 8:00 PM IST
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Card */}
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Email</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium mb-1">General Inquiries</p>
                            <a
                                href="mailto:info@restaurantreservation.com"
                                className="text-sm text-primary hover:underline break-all"
                            >
                                info@restaurantreservation.com
                            </a>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Customer Support</p>
                            <a
                                href="mailto:support@restaurantreservation.com"
                                className="text-sm text-primary hover:underline break-all"
                            >
                                support@restaurantreservation.com
                            </a>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Restaurant Partners</p>
                            <a
                                href="mailto:partners@restaurantreservation.com"
                                className="text-sm text-primary hover:underline break-all"
                            >
                                partners@restaurantreservation.com
                            </a>
                        </div>
                        <div className="pt-2">
                            <p className="text-xs text-muted-foreground">
                                We typically respond within 24-48 hours
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Legal Card */}
                <Card className="hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center">
                                <Scale className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Legal & Privacy</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium mb-1">Privacy Policy</p>
                            <p className="text-sm text-muted-foreground mb-2">
                                Learn how we protect and handle your data
                            </p>
                            <Link
                                href="/privacy"
                                className="text-sm text-primary hover:underline inline-block"
                            >
                                Read Privacy Policy →
                            </Link>
                        </div>
                        <div className="pt-2">
                            <p className="text-sm font-medium mb-1">Terms of Service</p>
                            <p className="text-sm text-muted-foreground mb-2">
                                Review our terms and conditions
                            </p>
                            <Link
                                href="/terms"
                                className="text-sm text-primary hover:underline inline-block"
                            >
                                View Terms →
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-12" />

            {/* Social Media Section */}
            <section className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold mb-3">Connect With Us</h2>
                    <p className="text-muted-foreground">
                        Follow us on social media for updates, tips, and restaurant highlights
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Twitter */}
                    <Card className="hover:shadow-lg transition-all group cursor-pointer">
                        <CardContent className="pt-6 pb-6">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="rounded-lg bg-primary/10 w-14 h-14 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Twitter className="w-7 h-7 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">Twitter</p>
                                    <p className="text-xs text-muted-foreground">@restaurant_res</p>
                                </div>
                            </a>
                        </CardContent>
                    </Card>

                    {/* Facebook */}
                    <Card className="hover:shadow-lg transition-all group cursor-pointer">
                        <CardContent className="pt-6 pb-6">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="rounded-lg bg-primary/10 w-14 h-14 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Facebook className="w-7 h-7 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">Facebook</p>
                                    <p className="text-xs text-muted-foreground">/restaurantres</p>
                                </div>
                            </a>
                        </CardContent>
                    </Card>

                    {/* LinkedIn */}
                    <Card className="hover:shadow-lg transition-all group cursor-pointer">
                        <CardContent className="pt-6 pb-6">
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="rounded-lg bg-primary/10 w-14 h-14 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Linkedin className="w-7 h-7 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">LinkedIn</p>
                                    <p className="text-xs text-muted-foreground">/restaurant-res</p>
                                </div>
                            </a>
                        </CardContent>
                    </Card>

                    {/* GitHub */}
                    <Card className="hover:shadow-lg transition-all group cursor-pointer">
                        <CardContent className="pt-6 pb-6">
                            <a
                                href="https://github.com/IamDevTrivedi/Resturant-Management-System"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="rounded-lg bg-primary/10 w-14 h-14 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Github className="w-7 h-7 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">GitHub</p>
                                    <p className="text-xs text-muted-foreground">View Project</p>
                                </div>
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="my-12" />

            {/* Footer Note */}
            <div className="text-center my-12">
                <strong className="text-sm text-muted-foreground">
                    We&apos;re committed to providing excellent service and support to all our users.
                    <br />
                    Thank you for choosing our Restaurant Reservation System!
                </strong>
            </div>
        </main>
    );
}
