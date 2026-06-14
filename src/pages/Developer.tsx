import { Link, useLocation } from "react-router-dom";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

import {
  Code2, GraduationCap, Sparkles, ExternalLink, Github, Linkedin, Instagram,
  ArrowLeft, Brain, Rocket, Heart, Terminal, Cpu, Database, Globe,
  Lightbulb, Zap, Star, MessageCircle, Trophy, Target, Coffee,
  ChevronRight, MapPin, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    title: "StudentHub",
    desc: "Free campus collaboration platform — resource sharing, real-time messaging, events, projects & career opportunities for students.",
    url: "/",
    tags: ["React", "TypeScript", "Supabase", "PWA"],
    emoji: "🚀",
    highlight: true,
  },
  {
    title: "NBK R.I.S.T Hostel Portal",
    desc: "Complete hostel management system — room allocation, complaint tracking, admin dashboard & student management.",
    url: "https://nbkristhostelportal.netlify.app",
    tags: ["Web App", "Netlify", "Full Stack"],
    emoji: "🏠",
    highlight: false,
  },
];

const skills = [
  { name: "React", icon: Code2, level: 90 },
  { name: "TypeScript", icon: Terminal, level: 85 },
  { name: "Vibe Coding", icon: Zap, level: 95 },
  { name: "AI / ML", icon: Cpu, level: 80 },
  { name: "Data Science", icon: Database, level: 78 },
  { name: "Python", icon: Terminal, level: 85 },
  { name: "Tailwind CSS", icon: Code2, level: 92 },
  { name: "Web Dev", icon: Globe, level: 90 },
  { name: "PWA", icon: Sparkles, level: 82 },
  { name: "Problem Solving", icon: Lightbulb, level: 88 },
];

const timeline = [
  { year: "Present", title: "Building StudentHub", desc: "Creating a free campus collaboration platform used by students for sharing resources, messaging, and events.", icon: Rocket, color: "bg-primary" },
  { year: "2024", title: "NBK Hostel Portal", desc: "Built a full hostel management system for NBK R.I.S.T college — room allocation, complaints, and admin dashboard.", icon: Target, color: "bg-success" },
  { year: "Ongoing", title: "B.Tech in AI & Data Science", desc: "Studying Artificial Intelligence and Data Science, exploring ML models, data pipelines, and intelligent systems.", icon: GraduationCap, color: "bg-warning" },
  { year: "Always", title: "Vibe Coding ⚡", desc: "Passionate about turning ideas into reality fast — using modern tools, AI-assisted development, and creative energy.", icon: Zap, color: "bg-destructive" },
];

const stats = [
  { num: "2+", label: "Projects Built", icon: Trophy },
  { num: "10+", label: "Technologies", icon: Code2 },
  { num: "∞", label: "Ideas to Build", icon: Lightbulb },
  { num: "24/7", label: "Vibe Coding", icon: Coffee },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const Developer = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="GenSync — Developer & Creator"
        description="Meet GenSync — B.Tech AI & Data Science student, creator of StudentHub. Passionate vibe coder building real-world apps for students. View projects, skills, and journey."
        canonical="/developer"
        keywords="GenSync, GenSync developer, studenthub creator, student developer india, vibe coder, AI data science student, gensync projects, gensync portfolio"
        ogType="profile"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "GenSync",
          "alternateName": "GenSync",
          "url": typeof window !== "undefined" ? window.location.origin + "/developer" : "/developer",
          "jobTitle": "Student Developer & Creator",
          "knowsAbout": ["React", "TypeScript", "AI", "Data Science", "Vibe Coding"],
          "sameAs": [
            "https://github.com",
            "https://linkedin.com"
          ]
        }}
      />
      {/* Floating Back Button */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-5 left-5 z-50 group inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary px-4 py-2.5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/60 hover:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/6 via-transparent to-background" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/6 blur-[80px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative shrink-0"
              >
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2rem] gradient-primary flex items-center justify-center shadow-2xl ring-4 ring-primary/10">
                  <span className="text-5xl md:text-6xl font-extrabold text-primary-foreground">GS</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-success flex items-center justify-center shadow-lg">
                  <span className="text-lg">✨</span>
                </div>
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center md:text-left"
              >
                <span className="inline-flex items-center gap-2 text-[11px] font-extrabold text-primary bg-primary/8 px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
                  <Code2 className="w-3.5 h-3.5" /> Developer Team
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-[1.05] mb-4 tracking-tight">
                  GenSync <span className="gradient-text">Team</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-2">
                  Student <strong className="text-foreground">Innovators & Engineers</strong>
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
                  A dynamic team composed of Likhith.K, Manogna.u, and udaya lakshmi.Z, building high-impact platforms at lightning speed ⚡
                </p>

                <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> India
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-success font-semibold">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Ready for Collaboration
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 px-5 font-bold rounded-2xl gap-2 hover:bg-foreground hover:text-background transition-all">
                      <Github className="w-4 h-4" /> GitHub
                    </Button>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 px-5 font-bold rounded-2xl gap-2 hover:bg-primary hover:text-primary-foreground transition-all">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </Button>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 px-5 font-bold rounded-2xl gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all">
                      <Instagram className="w-4 h-4" /> Instagram
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/40 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40">
            {stats.map(({ num, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="py-8 md:py-10 text-center"
              >
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-extrabold text-foreground">{num}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-3">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 tracking-tight">
                  About <span className="gradient-text">GenSync</span>
                </h2>
                <div className="space-y-6 text-muted-foreground leading-relaxed text-[15px]">
                  <p>
                    Hey! 👋 We are <strong className="text-foreground">GenSync</strong> — a dedicated developer team combining engineering, interface design, and database planning to build powerful college collaboration tools.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    {/* Likhith.K */}
                    <div className="p-4 rounded-2xl border border-primary/20 bg-primary/3 hover:bg-primary/5 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-extrabold text-foreground">Likhith.K</span>
                        <span className="text-[9px] font-extrabold text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">Lead Builder</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The core architect and overall killer website builder behind the platform. Orchestrated the repository setup, integrated state flows, and built the overall website with unmatched speed and engineering execution.
                      </p>
                    </div>

                    {/* Manogna.u */}
                    <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/3 hover:bg-rose-500/5 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-extrabold text-foreground">Manogna.u</span>
                        <span className="text-[9px] font-extrabold text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">UI/UX & Frontend</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The visual mastermind who crafted the gorgeous interface aesthetics. Hyped up the visual elements, custom glassmorphism panels, and smooth mobile-first layout flows.
                      </p>
                    </div>

                    {/* udaya lakshmi.Z */}
                    <div className="p-4 rounded-2xl border border-teal-500/20 bg-teal-500/3 hover:bg-teal-500/5 transition-all duration-300">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-extrabold text-foreground">udaya lakshmi.Z</span>
                        <span className="text-[9px] font-extrabold text-teal-500 bg-teal-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Database & Backend</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The backend powerhouse. Designed the high-performance PostgreSQL tables, triggers, and secure database Row-Level Security policies to keep user data safe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="card-campus p-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Focus Areas</p>
                  <div className="space-y-2">
                    {[
                      { icon: Brain, label: "AI & Data Science", color: "text-primary" },
                      { icon: Rocket, label: "Vibe Coding", color: "text-success" },
                      { icon: Globe, label: "Full-Stack Web", color: "text-warning" },
                      { icon: Heart, label: "Student Tools", color: "text-destructive" },
                      { icon: MessageCircle, label: "Open Source", color: "text-info" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex items-center gap-3 py-1.5">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-sm font-semibold text-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              Skills & <span className="gradient-text">Technologies</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Tools and domains we work with every day.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {skills.map(({ name, icon: Icon, level }, i) => (
              <motion.div
                key={name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="card-campus p-4 text-center hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-foreground block mb-2">{name}</span>
                {/* Skill bar */}
                <div className="h-1 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 group-hover:bg-primary transition-all duration-500"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Real projects solving real problems for real people.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {projects.map(({ title, desc, url, tags, emoji, highlight }, i) => (
            <motion.a
              key={title}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`card-campus p-6 group hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                highlight ? "border-primary/20 ring-1 ring-primary/10" : "hover:border-primary/30"
              }`}
            >
              {highlight && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-extrabold text-primary-foreground bg-primary px-2.5 py-1 rounded-full">FEATURED</span>
                </div>
              )}
              <span className="text-3xl mb-3 block">{emoji}</span>
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(tag => (
                  <span key={tag} className="text-[11px] font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all">
                Visit Project <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
              Our <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Key milestones in our developer journey so far.</p>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            {timeline.map(({ year, title, desc, icon: Icon, color }, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex gap-5"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-md shrink-0`}>
                    <Icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border my-1" />}
                </div>
                {/* Content */}
                <div className="pb-10">
                  <span className="text-[11px] font-extrabold text-primary bg-primary/8 px-2.5 py-1 rounded-full">{year}</span>
                  <h3 className="text-base font-bold text-foreground mt-2.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Me */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
            What <span className="gradient-text">Drives</span> Us
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[
            { icon: Lightbulb, title: "Solve Real Problems", desc: "We build tools that students actually use daily — not just toy projects or assignments.", color: "bg-warning/10", iconColor: "text-warning" },
            { icon: Zap, title: "Vibe Coding", desc: "Fast iteration, creative energy, and AI-assisted development to ship products quickly.", color: "bg-primary/8", iconColor: "text-primary" },
            { icon: Heart, title: "Help Others Succeed", desc: "Making education and campus life better, one tool at a time. Free, for everyone.", color: "bg-destructive/10", iconColor: "text-destructive" },
          ].map(({ icon: Icon, title, desc, color, iconColor }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card-campus p-7 text-center hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="rounded-3xl gradient-primary p-10 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary-foreground/5 translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4">Let's Build Together 🤝</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto text-lg">Got an idea? Want to collaborate on something cool? We're always excited to connect with fellow builders.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="h-12 px-6 font-bold rounded-2xl gap-2 shadow-lg">
                  <Github className="w-4 h-4" /> GitHub
                </Button>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="h-12 px-6 font-bold rounded-2xl gap-2 shadow-lg">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </Button>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="lg" className="h-12 px-6 font-bold rounded-2xl gap-2 shadow-lg">
                  <Instagram className="w-4 h-4" /> Instagram
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {!user && <Footer />}
    </div>
  );
};

export default Developer;
