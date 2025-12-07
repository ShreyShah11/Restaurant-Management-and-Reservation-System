import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export function Team() {
  const members = [
    { name: 'Dev Trivedi', role: 'Team Leader', email: 'devtrivedi@example.com' },
    { name: 'Heet Bhuva', role: 'Frontend Developer', email: 'heetbhuva@example.com' },
    { name: 'Jenish Macwan', role: 'Frontend Developer', email: 'jenishmacwan230@gmail.com' },
    { name: 'Anushka Rawat', role: 'Frontend Developer', email: 'anushkarawat@example.com' },
    { name: 'Dhara Jogadiya', role: 'Frontend Developer', email: 'dharajogadiya@example.com' },
    { name: 'Hardik Rathva', role: 'Frontend Developer', email: 'hardikrathva@example.com' },
    { name: 'Rudra Chauhan', role: 'Frontend Developer', email: 'rudrachauhan@example.com' },
    { name: 'Nihar Nadia', role: 'Backend Developer', email: 'niharnadia@example.com' },
    { name: 'Krish Dhola', role: 'Backend Developer', email: 'krishdhola@example.com' },
    { name: 'Shrey Shah', role: 'Backend Developer', email: 'shreyshah@example.com' },
  ];

  const leader = members.filter((m) => m.role === 'Team Leader');
  const frontend = members.filter((m) => m.role === 'Frontend Developer');
  const backend = members.filter((m) => m.role === 'Backend Developer');

  return (
    <main className="container mx-auto px-4 w-full max-w-4xl my-4">
      {/* Header Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Meet The Team
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          The People Behind The Platform
        </h1>
        <p className="text-lg text-muted-foreground">
          A dedicated team of 10 students working together to build an exceptional
          restaurant reservation experience.
        </p>
      </section>

      {/* Team Leader */}
      <section className="max-w-5xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Team Leader</h2>
          <p className="text-sm text-muted-foreground">Leading the vision and execution</p>
        </div>
        {leader.map((m, i) => (
          <Card key={i} className="max-w-sm mx-auto hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">
                  {m.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-center">{m.name}</h3>
              <p className="text-sm text-muted-foreground text-center">{m.role}</p>
            </CardHeader>
            <CardContent>
              <Link
                href={`mailto:${m.email}`}
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <Mail className="w-4 h-4" />
                Contact
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Frontend Developers */}
      <section className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Frontend Developers</h2>
          <p className="text-sm text-muted-foreground">Crafting the user interface and experience</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frontend.map((m, i) => (
            <Card key={i} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <span className="text-lg font-bold text-primary">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </CardHeader>
              <CardContent>
                <Link
                  href={`mailto:${m.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Backend Developers */}
      <section className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Backend Developers</h2>
          <p className="text-sm text-muted-foreground">Building the robust server infrastructure</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backend.map((m, i) => (
            <Card key={i} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <span className="text-lg font-bold text-primary">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </CardHeader>
              <CardContent>
                <Link
                  href={`mailto:${m.email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="mx-auto max-w-4xl w-full bg-muted/50 flex items-center justify-center border-border">
          <CardContent >
            <p className="text-muted-foreground">
              This project is developed as part of our academic curriculum, combining our skills
              and passion for creating practical, real-world applications.
            </p>
          </CardContent>
        </Card>
      </section>

    </main>
  );
}

