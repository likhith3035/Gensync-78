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
    <div className="min-h-screen bg-sarvam-ambient">
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
        className="fixed top-5 left-5 z-50 group inline-flex items-center gap-2 text-sm font-semibold text-slate-700 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
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
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl gradient-primary flex items-center justify-center shadow-md">
                  <span className="text-5xl md:text-6xl font-extrabold text-primary-foreground font-serif-elegant">GS</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow-md">
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
                <span className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-800 bg-orange-50 border border-orange-100/80 px-4 py-2 rounded-full mb-4 tracking-widest uppercase shadow-sm">
                  <Code2 className="w-3.5 h-3.5 text-orange-500" /> Developer Team
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif-elegant text-slate-900 leading-[1.1] mb-4 tracking-tight">
                  GenSync <span className="gradient-text">Team</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-2">
                  Student <strong className="text-slate-800">Innovators & Engineers</strong>
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-md">
                  A dynamic team composed of Likhith.K, Manogna.u, and udaya lakshmi.Z, building high-impact platforms at lightning speed ⚡
                </p>

                <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" /> India
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ready for Collaboration
                  </span>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 px-5 font-semibold rounded-full gap-2 border-slate-200 hover:bg-slate-900 hover:text-white bg-white/50 transition-all shadow-sm">
                      <Github className="w-4 h-4" /> GitHub
                    </Button>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 px-5 font-semibold rounded-full gap-2 border-slate-200 hover:bg-slate-900 hover:text-white bg-white/50 transition-all shadow-sm">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </Button>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 px-5 font-semibold rounded-full gap-2 border-slate-200 hover:bg-slate-900 hover:text-white bg-white/50 transition-all shadow-sm">
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
      <section className="border-y border-slate-100 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
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
                <Icon className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                <p className="text-3xl font-bold font-serif-elegant text-slate-900">{num}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
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
                <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-6 tracking-tight">
                  About <span className="gradient-text">GenSync</span>
                </h2>
                <div className="space-y-6 text-slate-600 leading-relaxed text-[14px]">
                  <p>
                    Hey! 👋 We are <strong className="text-slate-800">GenSync</strong> — a dedicated developer team combining engineering, interface design, and database planning to build powerful college collaboration tools.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    {/* Likhith.K */}
                    <div className="p-5 rounded-3xl border border-blue-100 bg-blue-50/10 hover:bg-blue-50/30 transition-all duration-300 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-850">Likhith.K</span>
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Lead Builder</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        The core architect and overall website builder behind the platform. Orchestrated the repository setup, integrated state flows, and built the overall website with execution and speed.
                      </p>
                    </div>

                    {/* Manogna.u */}
                    <div className="p-5 rounded-3xl border border-rose-100 bg-rose-50/10 hover:bg-rose-50/30 transition-all duration-300 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-850">Manogna.u</span>
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">UI/UX & Frontend</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        The visual mastermind who crafted the interface aesthetics. Hyped up the visual elements, custom glassmorphism panels, and smooth mobile-first layout flows.
                      </p>
                    </div>

                    {/* udaya lakshmi.Z */}
                    <div className="p-5 rounded-3xl border border-emerald-100 bg-emerald-50/10 hover:bg-emerald-50/30 transition-all duration-300 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-850">udaya lakshmi.Z</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Database & Backend</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        The backend powerhouse. Designed the high-performance PostgreSQL tables, triggers, and secure database Row-Level Security policies to keep user data safe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="card-premium-light p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Focus Areas</p>
                  <div className="space-y-3">
                    {[
                      { icon: Brain, label: "AI & Data Science", color: "text-blue-500" },
                      { icon: Rocket, label: "Vibe Coding", color: "text-emerald-500" },
                      { icon: Globe, label: "Full-Stack Web", color: "text-amber-500" },
                      { icon: Heart, label: "Student Tools", color: "text-rose-500" },
                      { icon: MessageCircle, label: "Open Source", color: "text-violet-500" },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex items-center gap-3 py-1">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-xs font-semibold text-slate-700">{label}</span>
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
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-3 tracking-tight">
              Skills & <span className="gradient-text">Technologies</span>
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">Tools and domains we work with every day.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {skills.map(({ name, icon: Icon, level }, i) => (
              <motion.div
                key={name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="card-premium-light p-5 text-center hover:border-slate-350 hover:bg-slate-50/20 transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-white transition-colors shadow-sm">
                  <Icon className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-800 block mb-2">{name}</span>
                {/* Skill bar */}
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-700 group-hover:bg-slate-900 transition-all duration-500"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-3 tracking-tight">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">Real projects solving real problems for real people.</p>
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
              className={`card-premium-light p-6 group transition-all duration-300 relative overflow-hidden ${
                highlight ? "border-orange-200 bg-orange-50/15" : "hover:border-slate-200/80"
              }`}
            >
              {highlight && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full uppercase shadow-sm">FEATURED</span>
                </div>
              )}
              <span className="text-3xl mb-3 block">{emoji}</span>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(tag => (
                  <span key={tag} className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 group-hover:gap-2.5 transition-all">
                Visit Project <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-3 tracking-tight">
              Our <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">Key milestones in our developer journey so far.</p>
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
                  <div className={`w-10 h-10 rounded-full border border-slate-100 bg-white flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>
                {/* Content */}
                <div className="pb-10 pt-1">
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">{year}</span>
                  <h3 className="text-sm font-bold text-slate-800 mt-3">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Us */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-3 tracking-tight">
            What <span className="gradient-text">Drives</span> Us
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[
            { icon: Lightbulb, title: "Solve Real Problems", desc: "We build tools that students actually use daily — not just toy projects or assignments.", color: "bg-amber-50 border-amber-100/50", iconColor: "text-amber-500" },
            { icon: Zap, title: "Vibe Coding", desc: "Fast iteration, creative energy, and AI-assisted development to ship products quickly.", color: "bg-blue-50 border-blue-100/50", iconColor: "text-blue-500" },
            { icon: Heart, title: "Help Others Succeed", desc: "Making education and campus life better, one tool at a time. Free, for everyone.", color: "bg-rose-50 border-rose-100/50", iconColor: "text-rose-500" },
          ].map(({ icon: Icon, title, desc, color, iconColor }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card-premium-light p-7 text-center group"
            >
              <div className={`w-14 h-14 rounded-full border ${color} flex items-center justify-center mx-auto mb-5 shadow-sm group-hover:scale-105 transition-transform`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
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
          className="rounded-3xl card-premium-light p-10 md:p-16 text-center relative overflow-hidden bg-sarvam-card-glow border-orange-100/60 shadow-[0_20px_50px_-12px_rgba(251,146,60,0.08)]"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/40 -translate-y-1/3 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/40 translate-y-1/3 -translate-x-1/3 blur-2xl" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Mail className="w-6 h-6 text-slate-700" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif-elegant text-slate-900 mb-4">Let's Build Together 🤝</h2>
            <p className="text-slate-655 mb-8 max-w-md mx-auto text-sm">Got an idea? Want to collaborate on something cool? We're always excited to connect with fellow builders.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-6 font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-md">
                  <Github className="w-4 h-4" /> GitHub
                </Button>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-6 font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-md">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </Button>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-12 px-6 font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-md">
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
