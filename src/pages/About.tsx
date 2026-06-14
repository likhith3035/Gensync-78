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
    <div className="min-h-screen bg-background">
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <span className="inline-flex items-center gap-2 text-[11px] font-extrabold text-primary bg-primary/8 px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" /> About StudentHub
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">
              Built by <span className="gradient-text">GenSync</span>,
              <br />for Students Everywhere
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              StudentHub is the free campus collaboration platform that brings together resource sharing, opportunity discovery, project collaboration, messaging, and events — all in one beautiful, modern app.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="h-12 px-7 font-bold rounded-2xl gap-2">
                  Join StudentHub <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="h-12 px-7 font-bold rounded-2xl">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About GenSync */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="card-campus p-8 md:p-12 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl gradient-primary flex items-center justify-center shadow-xl shrink-0">
                <span className="text-3xl md:text-4xl font-extrabold text-primary-foreground">LK</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">Meet GenSync</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  GenSync is a passionate student developer and the creator of StudentHub. Driven by the belief that students learn better when they collaborate, GenSync built StudentHub as a free platform to bridge the gap between academic life and career readiness.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From sharing study notes to discovering internships, every feature of StudentHub was designed with the student experience in mind. The mission: make campus collaboration effortless, accessible, and free for every student.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/8 px-3 py-1.5 rounded-full">
                    <Code2 className="w-3 h-3" /> Developer
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full">
                    <Heart className="w-3 h-3" /> Student Advocate
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning/10 px-3 py-1.5 rounded-full">
                    <GraduationCap className="w-3 h-3" /> Creator
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What StudentHub Offers */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">What StudentHub Offers</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Six powerful features, one free platform — designed for students by GenSync.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <article key={title} className="card-campus p-6 animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                <div className="w-11 h-11 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about StudentHub by GenSync.</p>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }, i) => (
              <details key={i} className="card-campus group animate-fade-in" style={{ animationDelay: `${0.04 * i}s` }}>
                <summary className="p-5 cursor-pointer font-bold text-foreground text-sm flex items-center justify-between list-none">
                  {q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform duration-200 text-lg">+</span>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-3xl gradient-primary p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/3" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-primary-foreground mb-4">Join StudentHub Today</h2>
            <p className="text-primary-foreground/70 mb-6 max-w-md mx-auto">Created by GenSync for students who want to share, collaborate, and grow together. 100% free.</p>
            <Link to="/auth">
              <Button variant="secondary" size="lg" className="h-12 px-8 font-bold rounded-2xl">
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
