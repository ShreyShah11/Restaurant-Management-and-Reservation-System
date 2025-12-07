import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye, UserCheck, Database, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
    return (
        <main className="container my-16 mx-auto px-4 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
                <Badge variant="secondary" className="mb-4">
                    Legal
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Privacy Policy
                </h1>
                <p className="text-muted-foreground">
                    Last updated: November 11, 2025
                </p>
            </div>

            {/* Introduction */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                        At Restaurant Reservation System, we take your privacy seriously. This Privacy Policy
                        explains how we collect, use, disclose, and safeguard your information when you use our
                        platform. Please read this policy carefully to understand our practices regarding your
                        personal data.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        By using our service, you agree to the collection and use of information in accordance
                        with this policy. If you do not agree with our policies and practices, please do not use
                        our service.
                    </p>
                </CardContent>
            </Card>

            {/* Information We Collect */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Information We Collect</h2>
                </div>

                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Name and contact information (email address, phone number)</li>
                            <li>Account credentials (username and password)</li>
                            <li>Profile information and preferences</li>
                            <li>Reservation details (date, time, party size)</li>
                            <li>Payment information (processed securely through third-party providers)</li>
                            <li>Communication records with our support team</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Automatically Collected Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            When you access our platform, we automatically collect:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Device information (browser type, operating system)</li>
                            <li>IP address and location data</li>
                            <li>Usage data (pages visited, time spent, features used)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* How We Use Your Information */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            We use the information we collect for the following purposes:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Service Delivery:</span> To process
                                    reservations, manage bookings, and facilitate communication between customers and restaurants
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Account Management:</span> To create
                                    and maintain your account, authenticate your identity, and provide customer support
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Improvements:</span> To analyze usage
                                    patterns, improve our platform, and develop new features
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Communications:</span> To send
                                    reservation confirmations, updates, reminders, and respond to your inquiries
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Security:</span> To protect against
                                    fraud, unauthorized access, and ensure the security of our platform
                                </p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Information Sharing */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Information Sharing and Disclosure</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">We may share your information with:</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                                <li>
                                    <span className="font-medium text-foreground">Restaurants:</span> Your reservation
                                    details and contact information with the restaurant you book
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Service Providers:</span> Third-party
                                    vendors who help us operate our platform (payment processors, hosting services)
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Legal Requirements:</span> When required
                                    by law or to protect our rights and safety
                                </li>
                                <li>
                                    <span className="font-medium text-foreground">Business Transfers:</span> In connection
                                    with a merger, acquisition, or sale of assets
                                </li>
                            </ul>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                We do not sell, rent, or trade your personal information to third parties for their
                                marketing purposes without your explicit consent.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Data Security */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Data Security</h2>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your
                            personal information against unauthorized access, alteration, disclosure, or destruction.
                            These measures include:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure authentication using JWT tokens</li>
                            <li>Regular security audits and updates</li>
                            <li>Access controls and monitoring</li>
                            <li>Secure payment processing through certified providers</li>
                        </ul>
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                However, no method of transmission over the internet is 100% secure. While we strive
                                to protect your data, we cannot guarantee absolute security.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Your Rights */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Your Rights and Choices</h2>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                            You have the following rights regarding your personal information:
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-2 border-primary pl-4">
                                <h3 className="font-semibold text-sm mb-1">Access and Update</h3>
                                <p className="text-sm text-muted-foreground">
                                    View and update your account information at any time through your profile settings
                                </p>
                            </div>
                            <div className="border-l-2 border-primary pl-4">
                                <h3 className="font-semibold text-sm mb-1">Deletion</h3>
                                <p className="text-sm text-muted-foreground">
                                    Request deletion of your account and associated data (subject to legal obligations)
                                </p>
                            </div>
                            <div className="border-l-2 border-primary pl-4">
                                <h3 className="font-semibold text-sm mb-1">Data Portability</h3>
                                <p className="text-sm text-muted-foreground">
                                    Request a copy of your data in a structured, commonly used format
                                </p>
                            </div>
                            <div className="border-l-2 border-primary pl-4">
                                <h3 className="font-semibold text-sm mb-1">Opt-Out</h3>
                                <p className="text-sm text-muted-foreground">
                                    Unsubscribe from marketing communications while still receiving essential service updates
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Cookies */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We use cookies and similar tracking technologies to enhance your experience, analyze
                            usage patterns, and improve our services. You can control cookie preferences through
                            your browser settings, though disabling cookies may affect functionality.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-3 rounded-lg">
                                <h3 className="font-semibold text-sm mb-1">Essential Cookies</h3>
                                <p className="text-xs text-muted-foreground">
                                    Required for core functionality and security
                                </p>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-lg">
                                <h3 className="font-semibold text-sm mb-1">Analytics Cookies</h3>
                                <p className="text-xs text-muted-foreground">
                                    Help us understand how you use our platform
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Data Retention */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We retain your personal information for as long as necessary to provide our services,
                            comply with legal obligations, resolve disputes, and enforce our agreements. When your
                            data is no longer needed, we securely delete or anonymize it.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Children's Privacy */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Our service is not intended for individuals under the age of 18. We do not knowingly
                            collect personal information from children. If you believe we have collected information
                            from a child, please contact us immediately so we can delete it.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Changes to Policy */}
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>

                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            We may update this Privacy Policy from time to time to reflect changes in our practices
                            or legal requirements. We will notify you of any significant changes by:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                            <li>Posting the updated policy on this page with a new &quot;Last updated&quot; date</li>
                            <li>Sending you an email notification for material changes</li>
                            <li>Displaying a prominent notice on our platform</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <Separator className="my-8" />

            {/* Contact */}
            <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Contact Us</h2>
                </div>

                <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our
                            data practices, please contact us:
                        </p>
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">Email:</span> privacy@restaurantreservation.com
                            </p>
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">Contact Page:</span>{' '}
                                <Link href="/contact" className="text-primary hover:underline">
                                    Visit our Contact page
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Footer Note */}
            <div className="text-center my-8">
                <strong className="text-sm text-muted-foreground">
                    By using our Restaurant Reservation System, you acknowledge that you have read and
                    understood this Privacy Policy.
                </strong>
            </div>
        </main>
    );
}
