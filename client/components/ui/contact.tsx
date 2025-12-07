'use client';

import React from 'react';

export default function Contact() {
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

//   modify you email 
  const leader = members.filter((m) => m.role === 'Team Leader');
  const frontend = members.filter((m) => m.role === 'Frontend Developer');
  const backend = members.filter((m) => m.role === 'Backend Developer');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-10">
      <section className="max-w-5xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-[#f4b968]">Our Team</h1>
        <p className="text-lg text-gray-300">
          Meet the passionate and dedicated team behind the{' '}
          <span className="font-semibold text-white">Restaurant Reservation System</span> project.
        </p>
      </section>

      {/* Team Leader */}
      <section className="max-w-5xl w-full mb-10 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Team Leader</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {leader.map((m, i) => (
            <a
              key={i}
              href={`mailto:${m.email}`}
              className="p-3 rounded-2xl w-60 hover:shadow-lg transition border border-[#f4b968] hover:bg-[#f4b968]/10"
            >
              <h3 className="text-xl font-semibold text-white hover:text-[#f4b968] transition">
                {m.name}
              </h3>
              <p className="text-gray-400">{m.role}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Frontend Developers */}
      <section className="max-w-5xl w-full mb-10 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Frontend Developers</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {frontend.map((m, i) => (
            <a
              key={i}
              href={`mailto:${m.email}`}
              className="p-3 rounded-2xl w-60 hover:shadow-lg transition border border-[#f4b968] hover:bg-[#f4b968]/10"
            >
              <h3 className="text-xl font-semibold text-white hover:text-[#f4b968] transition">
                {m.name}
              </h3>
              <p className="text-gray-400">{m.role}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Backend Developers */}
      <section className="max-w-5xl w-full mb-10 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-white">Backend Developers</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {backend.map((m, i) => (
            <a
              key={i}
              href={`mailto:${m.email}`}
              className="p-3 rounded-2xl w-60 hover:shadow-lg transition border border-[#f4b968] hover:bg-[#f4b968]/10"
            >
              <h3 className="text-xl font-semibold text-white hover:text-[#f4b968] transition">
                {m.name}
              </h3>
              <p className="text-gray-400">{m.role}</p>
            </a>
          ))}
        </div>
      </section>

     
    </main>
  );
}
