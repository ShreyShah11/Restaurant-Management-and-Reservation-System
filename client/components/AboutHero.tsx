'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Users, Calendar, TrendingUp, Shield, Clock } from 'lucide-react';

export function AboutHero() {
  const features = [
    {
      icon: Calendar,
      title: 'Instant Reservations',
      description: 'Book tables in seconds with real-time availability and instant confirmation.',
    },
    {
      icon: Users,
      title: 'For Everyone',
      description: 'Whether you\'re a diner or restaurant owner, our platform serves your needs.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Restaurant owners get insights into bookings, trends, and customer preferences.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data and payments are protected with industry-standard security.',
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'No more phone calls or waiting — manage everything from one dashboard.',
    },
    {
      icon: CheckCircle2,
      title: 'User-Friendly Interface',
      description: 'An intuitive design that makes booking and managing reservations a breeze.',
    }
  ];

  const benefits = [
    'Search and discover restaurants by cuisine and location',
    'Check real-time table availability',
    'Make secure reservations with token payment',
    'Manage your booking history and upcoming reservations',
    'Restaurant owners can easily manage their profiles and bookings',
    'Track reservation status and get instant notifications',
  ];

  return (
    <main className="container mx-auto px-4 w-full max-w-4xl my-4">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          About Our Platform
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Connecting Diners with Their Perfect Dining Experience
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Welcome to our Restaurant Reservation System — a modern platform that bridges the gap
          between hungry diners and exceptional restaurants. We make table bookings effortless,
          efficient, and accessible for everyone.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-5xl mx-auto mb-16">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              We believe that dining out should be stress-free from start to finish. Our mission is to
              transform the restaurant reservation experience by providing a seamless, intuitive platform
              that benefits both customers and restaurant owners.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you&apos;re planning a romantic dinner, celebrating with family, or hosting a business
              lunch, our system ensures you get the table you want, when you want it — without the hassle
              of endless phone calls or uncertainty.
            </p>
            <div className="pt-4">
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                &ldquo;Good food brings people together — we just make it easier to find your seat at the table.&rdquo;
              </blockquote>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Choose Us</h2>
          <p className="text-muted-foreground">
            Built with modern technology to deliver exceptional user experience
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border transition-all hover:shadow-md">
              <CardContent className="pt-6">
                <div className="rounded-lg bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-4xl mx-auto mb-16">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl">What You Can Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Technology Section */}
      <section className="max-w-5xl mx-auto">
        <Card className="border-border bg-muted/50">
          <CardHeader>
            <CardTitle className="text-2xl">Built with Modern Technology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Our platform is built using cutting-edge web technologies including Next.js for the frontend,
              Node.js with Express for the backend, and MongoDB for reliable data storage. We leverage
              real-time updates, secure JWT authentication, and responsive design to ensure the best
              experience across all devices.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you&apos;re browsing on your phone during your commute or managing reservations from your
              desktop, our system adapts seamlessly to provide a consistent and powerful experience.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
