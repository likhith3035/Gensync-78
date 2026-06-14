import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { GraduationCap, Users, BookOpen, Briefcase, Calendar, MessageCircle, Share2, ArrowRight, Sparkles, Code2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BookOpen, title: "Resource Sharing", desc: "Upload and download study notes, lecture summaries, past papers, and course materials shared by top students." },
  { icon: Briefcase, title: "Opportunity Discovery", desc: "Browse curated internships, hackathons, workshops, and scholarships from leading organizations." },
  { icon: Users, title: "Project Collaboration", desc: "Create or join student-led projects, find teammates, and build your portfolio together." },
  { icon: MessageCircle, title: "Real-Time Messaging", desc: "Chat directly with classmates, project teams, and mentors — all within the platform." },
  { icon: Calendar, title: "Campus Events", desc: "Discover upcoming events, workshops, and career fairs. RSVP and never miss what matters." },
  { icon: Share2, title: "Secure Sharing", desc: "Share content via unique links or access codes. Control who sees your shared resources." },
];

const faqs = [
  { q: "What is StudentHub?", a: "StudentHub is a free, all-in-one campus collaboration platform created by GenSync. It helps students share study resources, discover internships, collaborate on projects, message peers, and attend campus events — all in one place." },
  { q: "Who created StudentHub?", a: "StudentHub was created by GenSync, a student developer passionate about building tools that empower fellow students to succeed academically and professionally." },
  { q: "Is StudentHub free?", a: "Yes! StudentHub is 100% free for all college students. No credit card, no hidden fees. Just sign up and start using all features immediately." },
  { q: "What can I do on StudentHub?", a: "You can share and download study notes, find internships and scholarships, create or join projects, chat with classmates in real-time, RSVP to campus events, and securely share content via links or access codes." },
  { q: "How do I install StudentHub on my phone?", a: "StudentHub is a Progressive Web App (PWA). Visit this website on your phone, and you'll see an install prompt. On Android, tap 'Install'. On iPhone, tap Share → Add to Home Screen." },
  { q: "Can I use StudentHub on desktop?", a: "Absolutely! StudentHub works on any modern browser — Chrome, Edge, Firefox, Safari — on both desktop and mobile devices." },
];

const About = () => {
  return (
    <div className="min-h-screen bg-sarvam-ambient">
      <SEO
        title="About StudentHub"
        description="Learn about StudentHub — the free campus collaboration platform created by GenSync. Discover features like resource sharing, internship discovery, project collaboration, real-time messaging, and campus events."
        canonical="/about"
        keywords="about studenthub, GenSync, campus collaboration platform, student resources, free student app, studenthub features"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About StudentHub",
          "url": typeof window !== "undefined" ? window.location.origin + "/about" : "/about",
          "description": "About StudentHub — the free campus platform by GenSync.",
          "mainEntity": {
            "@type": "Person",
            "name": "GenSync",
            "jobTitle": "Student Developer",
            "description": "Creator of StudentHub"
          }
        }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-800 bg-orange-50 border border-orange-100/80 px-4 py-2 rounded-full mb-6 tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> About StudentHub
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-elegant text-slate-900 leading-[1.15] mb-6 tracking-tight">
              Built by <span className="gradient-text">GenSync</span>,
              <br />for Students Everywhere
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              StudentHub is the free campus collaboration platform that brings together resource sharing, opportunity discovery, project collaboration, messaging, and events — all in one beautiful, modern app.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-7 font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-md">
                  Join StudentHub <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="h-12 px-7 font-semibold rounded-full bg-white/50 border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About GenSync */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="card-premium-light p-8 md:p-12 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-lg shrink-0">
                <span className="text-3xl md:text-4xl font-extrabold text-primary-foreground font-serif-elegant">GS</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold font-serif-elegant text-slate-900 mb-3">Meet GenSync</h2>
                <p className="text-slate-600 leading-relaxed mb-4 text-[14px]">
                  GenSync is a passionate student developer and the creator of StudentHub. Driven by the belief that students learn better when they collaborate, GenSync built StudentHub as a free platform to bridge the gap between academic life and career readiness.
                </p>
                <p className="text-slate-600 leading-relaxed text-[14px]">
                  From sharing study notes to discovering internships, every feature of StudentHub was designed with the student experience in mind. The mission: make campus collaboration effortless, accessible, and free for every student.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200/50">
                    <Code2 className="w-3 h-3 text-slate-600" /> Developer
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-100/50">
                    <Heart className="w-3 h-3 text-rose-500" /> Student Advocate
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-100/50">
                    <GraduationCap className="w-3 h-3 text-amber-500" /> Creator
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What StudentHub Offers */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-3 tracking-tight">What StudentHub Offers</h2>
            <p className="text-slate-600 max-w-lg mx-auto">Six powerful features, one free platform — designed for students by GenSync.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <article key={title} className="card-premium-light p-6 animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-600">Everything you need to know about StudentHub by GenSync.</p>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <details key={i} className="card-premium-light group animate-fade-in" style={{ animationDelay: `${0.04 * i}s` }}>
                <summary className="p-5 cursor-pointer font-bold text-slate-800 text-sm flex items-center justify-between list-none focus:outline-none">
                  {q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform duration-200 text-lg w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center shadow-sm border border-slate-100">+</span>
                </summary>
                <div className="px-5 pb-5 -mt-1 border-t border-slate-50 pt-3">
                  <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="rounded-3xl card-premium-light p-10 md:p-14 text-center relative overflow-hidden bg-sarvam-card-glow border-orange-100/60 shadow-[0_20px_50px_-12px_rgba(251,146,60,0.08)]">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/40 -translate-y-1/3 translate-x-1/3 blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-4">Join StudentHub Today</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm">Created by GenSync for students who want to share, collaborate, and grow together. 100% free.</p>
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md">
                Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
