import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, AlertTriangle, Users, CreditCard, Ban, Scale, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
    return (
        <main className="container mx-auto px-4 my-16 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">
                    Legal
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Terms of Service
                </h1>
                <p className="text-muted-foreground">
                    Last updated: November 11, 2025
                </p>
            </div>

            {/* Introduction */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        Welcome to our Restaurant Reservation System. These Terms of Service (&quot;Terms&quot;)
                        govern your access to and use of our platform, services, and features. By accessing or
                        using our service, you agree to be bound by these Terms.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Please read these Terms carefully before using our platform. If you do not agree with
                        any part of these Terms, you may not access or use our service.
                    </p>
                </CardContent>
            </Card>

            {/* Acceptance of Terms */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            By creating an account, making a reservation, or otherwise using our platform, you
                            acknowledge that you have read, understood, and agree to be bound by these Terms and
                            our Privacy Policy. These Terms constitute a legally binding agreement between you and
                            our Restaurant Reservation System.
                        </p>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                If you are using our service on behalf of an organization, you represent that you
                                have the authority to bind that organization to these Terms.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* User Accounts */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">User Accounts and Registration</h2>
                </div>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Account Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            To use certain features of our service, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Be at least 18 years of age</li>
                            <li>Provide accurate, current, and complete information during registration</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>Keep your password secure and confidential</li>
                            <li>Be responsible for all activities under your account</li>
                            <li>Notify us immediately of any unauthorized access</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Account Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-4">
                            <div className="border-l-2 border-primary pl-4">
                                <h3 className="font-semibold text-sm mb-1">Customer Accounts</h3>
                                <p className="text-sm text-muted-foreground">
                                    Browse restaurants, make reservations, manage bookings, and leave reviews
                                </p>
                            </div>
                            <div className="border-l-2 border-primary pl-4">
                                <h3 className="font-semibold text-sm mb-1">Restaurant Owner Accounts</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage restaurant profiles, handle reservations, configure tables, and view analytics
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Service Usage */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Service Usage and Conduct</h2>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Acceptable Use</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground mb-4">
                            You agree to use our platform only for lawful purposes and in accordance with these Terms.
                            You agree not to:
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Make false or fraudulent reservations
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Provide false, inaccurate, or misleading information
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Impersonate any person or entity
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Harass, abuse, or harm other users or restaurant staff
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Attempt to gain unauthorized access to our systems
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Use automated systems or bots to access the service
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Post or transmit viruses or malicious code
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    Violate any applicable laws or regulations
                                </p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Restaurant Owner Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            If you are a restaurant owner, you additionally agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Provide accurate and up-to-date restaurant information</li>
                            <li>Honor confirmed reservations to the best of your ability</li>
                            <li>Update availability and table configurations accurately</li>
                            <li>Respond to customer inquiries in a timely manner</li>
                            <li>Comply with all applicable health and safety regulations</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Reservations */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Reservations and Bookings</h2>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Making Reservations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            When you make a reservation through our platform:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>You enter into a direct agreement with the restaurant</li>
                            <li>We act as an intermediary to facilitate the booking</li>
                            <li>Availability is subject to confirmation by the restaurant</li>
                            <li>You must provide accurate information about your party size and timing</li>
                            <li>Special requests are not guaranteed and depend on restaurant availability</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Cancellations and Modifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Cancellation and modification policies vary by restaurant:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Check the specific restaurant&apos;s cancellation policy before booking</li>
                            <li>Cancellations may be subject to fees or forfeiture of deposits</li>
                            <li>Late arrivals may result in table release to other guests</li>
                            <li>No-shows may affect your ability to make future reservations</li>
                        </ul>
                        <div className="bg-muted/50 p-4 rounded-lg mt-4">
                            <p className="text-sm text-muted-foreground">
                                We recommend canceling as early as possible if you cannot honor your reservation to
                                allow others to book the table.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Payments */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Payment and Fees</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Token Payments</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                Some reservations require a token payment to confirm your booking. This payment:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                                <li>Secures your reservation</li>
                                <li>May be refundable based on the restaurant&apos;s cancellation policy</li>
                                <li>Is processed through secure third-party payment providers</li>
                                <li>Does not constitute payment for your meal</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Service Fees</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We may charge service fees for certain features or services. All fees will be clearly
                                displayed before you complete any transaction. Payment of fees is non-refundable
                                except as required by law.
                            </p>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                All payments are processed in accordance with our Privacy Policy and applicable
                                payment card industry standards.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Intellectual Property */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Our Content</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All content, features, and functionality of our platform, including but not limited
                                to text, graphics, logos, icons, images, audio, video, software, and design, are owned
                                by us or our licensors and are protected by copyright, trademark, and other intellectual
                                property laws.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">User Content</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                When you post reviews, photos, or other content on our platform, you grant us a
                                worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display
                                that content. You represent that:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                                <li>You own or have rights to the content you submit</li>
                                <li>Your content does not violate any third-party rights</li>
                                <li>Your content is accurate and not misleading</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Disclaimers */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Disclaimers and Limitations</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Service &quot;As Is&quot;</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Our platform is provided &quot;as is&quot; and &quot;as available&quot; without
                                warranties of any kind, either express or implied. We do not guarantee that the
                                service will be uninterrupted, secure, or error-free.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Third-Party Venues</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We are not responsible for the quality, safety, or legality of restaurants listed on
                                our platform, the accuracy of restaurant information, or the ability of restaurants
                                to honor reservations. Your relationship is directly with the restaurant.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                To the maximum extent permitted by law, we shall not be liable for any indirect,
                                incidental, special, consequential, or punitive damages, or any loss of profits or
                                revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill,
                                or other intangible losses.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Termination */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Ban className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Termination</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We reserve the right to suspend or terminate your account and access to our service at
                            any time, without notice, for conduct that we believe:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Violates these Terms or our policies</li>
                            <li>Harms other users, restaurants, or our business</li>
                            <li>Exposes us to legal liability</li>
                            <li>Is otherwise inappropriate</li>
                        </ul>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            You may also terminate your account at any time by contacting us or using the account
                            deletion feature. Upon termination, your right to use the service will immediately cease.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Dispute Resolution */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Dispute Resolution</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Governing Law</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                These Terms shall be governed by and construed in accordance with applicable laws,
                                without regard to conflict of law principles.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Resolution Process</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                In the event of any dispute arising from these Terms or your use of our service:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                                <li>Contact us first to attempt to resolve the matter informally</li>
                                <li>We will work in good faith to reach a mutually satisfactory resolution</li>
                                <li>Unresolved disputes may be subject to binding arbitration or litigation as applicable</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Changes to Terms */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Changes to These Terms</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We reserve the right to modify these Terms at any time. We will notify you of material
                            changes by:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Posting the updated Terms on this page with a new &quot;Last updated&quot; date</li>
                            <li>Sending an email notification to your registered email address</li>
                            <li>Displaying a prominent notice on our platform</li>
                        </ul>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Your continued use of the service after changes become effective constitutes your
                                acceptance of the revised Terms.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* General Provisions */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">General Provisions</h2>

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Entire Agreement</h3>
                                <p className="text-sm text-muted-foreground">
                                    These Terms, together with our Privacy Policy, constitute the entire agreement
                                    between you and us regarding the service.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Severability</h3>
                                <p className="text-sm text-muted-foreground">
                                    If any provision of these Terms is found to be invalid or unenforceable, the remaining
                                    provisions will remain in full force and effect.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Waiver</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our failure to enforce any right or provision of these Terms will not be considered a
                                    waiver of those rights.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Assignment</h3>
                                <p className="text-sm text-muted-foreground">
                                    You may not assign or transfer these Terms without our prior written consent. We may
                                    assign our rights and obligations without restriction.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Contact */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>

                <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            If you have any questions or concerns about these Terms, please contact us:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">Email:</span> legal@restaurantreservation.com
                            </p>
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">About Page:</span>{' '}
                                <Link href="/contact" className="text-primary hover:underline">
                                    Visit our Contact page
                                </Link>
                            </p>
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">Privacy Policy:</span>{' '}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    View our Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Footer Note */}
            <div className="text-center my-8">
                <strong className="text-sm text-muted-foreground">
                    By using our Restaurant Reservation System, you acknowledge that you have read, understood,
                    and agree to be bound by these Terms of Service.
                </strong>
            </div>
        </main>
    );
}
