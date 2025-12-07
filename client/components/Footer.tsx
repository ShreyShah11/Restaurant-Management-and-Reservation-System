import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/Logo';
import { ModeToggle } from './ModeToggle';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { name: 'About', href: '/about' },
            { name: 'Contact', href: '/contact' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
        ],
        account: [
            { name: 'Login', href: '/login' },
            { name: 'Create Account', href: '/create-account' },
            { name: 'Reset Password', href: '/reset-password' },
        ],
    };

    const socialLinks = [
        { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/' },
        { name: 'GitHub', icon: Github, href: 'https://github.com/' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/' },
    ];

    return (
        <footer className="border-t max-w-6xl mx-auto bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Logo and Description */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Logo />
                            <span className="text-xl font-bold">Reserve Beta</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Building innovative solutions for tomorrow&apos;s challenges. Join us on
                            our journey to transform the digital landscape.
                        </p>
                    </div>

                    {/* Company Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Account</h3>
                        <ul className="space-y-3">
                            {footerLinks.account.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Connect</h3>
                        <p className="text-sm text-muted-foreground">
                            Follow us on social media to stay updated with our latest news and
                            updates.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
                                        aria-label={social.name}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground">
                        © {currentYear} , Inc. All rights reserved.
                    </p>
                    <ModeToggle />
                </div>
            </div>
        </footer>
    );
};
