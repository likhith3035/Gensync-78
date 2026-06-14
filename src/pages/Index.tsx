import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Briefcase, Users, BookOpen, ArrowRight, GraduationCap, Sparkles,
  Calendar, MessageCircle, Share2, Zap, Shield, Globe, CheckCircle2,
  Bell, Upload, Search, UserPlus, Lock, Smartphone, Code2, Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import heroImg from "@/assets/hero-collaboration.png";
import studentImg from "@/assets/student-journey.png";

const features = [
  {
    icon: BookOpen,
    title: "Resource Sharing",
    desc: "Upload and download study notes, past papers, lecture summaries, and course materials. Filter by subject, course code, or category.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15 group-hover:border-emerald-500/35",
    glow: "group-hover:shadow-emerald-500/8",
    gradient: "from-emerald-50/25 via-white to-emerald-100/5",
    details: ["Upload PDFs, docs & files", "Filter by subject & course", "Download anytime"],
    mockUI: (
      <div className="w-[260px] bg-white rounded-2xl p-4 border border-emerald-500/15 shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-muted">
          <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CS Resources
          </span>
          <span className="text-[9px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-bold">V2.4</span>
        </div>
        <div className="relative">
          <div className="w-full h-8 px-3 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground/60 flex items-center border border-transparent">
            🔍 Search CS-201...
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-500/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center font-extrabold text-[9px] text-emerald-600">PDF</div>
              <div className="text-left">
                <p className="text-[9px] font-extrabold text-foreground leading-none">DBMS_Notes_U1.pdf</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">3.4 MB • Likhith.K</p>
              </div>
            </div>
            <button className="h-6 px-2.5 rounded-lg bg-emerald-500 text-white font-extrabold text-[9px] hover:scale-105 transition-all">
              Get
            </button>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-500/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center font-extrabold text-[9px] text-emerald-600">PDF</div>
              <div className="text-left">
                <p className="text-[9px] font-extrabold text-foreground leading-none">DSA_Notes.pdf</p>
                <p className="text-[8px] text-muted-foreground mt-0.5">1.8 MB • GenSync</p>
              </div>
            </div>
            <button className="h-6 px-2.5 rounded-lg bg-emerald-500 text-white font-extrabold text-[9px] hover:scale-105 transition-all">
              Get
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Briefcase,
    title: "Opportunities",
    desc: "Browse and post internships, hackathons, workshops, and scholarships. Set deadlines and categorize by type and location.",
    color: "text-blue-500",
    bg: "bg-blue-500/8",
    border: "border-blue-500/15 group-hover:border-blue-500/35",
    glow: "group-hover:shadow-blue-500/8",
    gradient: "from-blue-50/25 via-white to-blue-100/5",
    details: ["Post & discover opportunities", "Deadline tracking", "Category & location filters"],
    mockUI: (
      <div className="w-[260px] bg-white rounded-2xl p-4 border border-blue-500/15 shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-muted">
          <span className="text-[10px] font-extrabold text-blue-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Active Roles
          </span>
          <span className="text-[9px] text-blue-600 bg-blue-50 font-bold px-2 py-0.5 rounded-full">6 New</span>
        </div>
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-blue-50/30 border border-blue-500/10 text-left">
            <div className="flex justify-between items-start">
              <h4 className="text-[9px] font-extrabold text-foreground leading-tight">GenSync Summer Dev Intern</h4>
              <span className="text-[7px] bg-blue-500 text-white font-extrabold px-1.5 py-0.5 rounded leading-none">Remote</span>
            </div>
            <p className="text-[8px] text-muted-foreground mt-1">Stipend: $1,200/mo • Apply by: June 30</p>
            <div className="flex gap-1.5 mt-1.5">
              <span className="text-[7px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">React</span>
              <span className="text-[7px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">NodeJS</span>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/30 border border-blue-500/10 text-left">
            <div className="flex justify-between items-start">
              <h4 className="text-[9px] font-extrabold text-foreground leading-tight">Global Hackathon 2026</h4>
              <span className="text-[7px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded leading-none">3d left</span>
            </div>
            <p className="text-[8px] text-muted-foreground mt-1">Prizes: $5,000 cash pool • Built by GenSync</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Users,
    title: "Project Collaboration",
    desc: "Create projects, recruit team members, and track progress. Tag skills and set project status from planning to active.",
    color: "text-violet-500",
    bg: "bg-violet-500/8",
    border: "border-violet-500/15 group-hover:border-violet-500/35",
    glow: "group-hover:shadow-violet-500/8",
    gradient: "from-violet-50/25 via-white to-violet-100/5",
    details: ["Create & join projects", "Recruit teammates", "Track project status"],
    mockUI: (
      <div className="w-[260px] bg-white rounded-2xl p-4 border border-violet-500/15 shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-muted">
          <span className="text-[10px] font-extrabold text-violet-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Projects Board
          </span>
          <span className="text-[9px] text-violet-600 bg-violet-50 font-bold px-2 py-0.5 rounded-full">Recruiting</span>
        </div>
        <div className="p-3 rounded-xl bg-violet-50/20 border border-violet-500/10 text-left space-y-2.5">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-extrabold text-foreground leading-tight">StudentHub Mobile</h4>
            <span className="text-[7px] font-extrabold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-500/10 leading-none">Active</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[7px] text-muted-foreground font-bold">
              <span>Overall Progress</span>
              <span>78%</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <div className="flex -space-x-1">
              <div className="w-4.5 h-4.5 rounded-full bg-primary flex items-center justify-center text-[6px] text-white font-extrabold border border-white">LK</div>
              <div className="w-4.5 h-4.5 rounded-full bg-rose-500 flex items-center justify-center text-[6px] text-white font-extrabold border border-white">MU</div>
              <div className="w-4.5 h-4.5 rounded-full bg-teal-500 flex items-center justify-center text-[6px] text-white font-extrabold border border-white">UL</div>
            </div>
            <span className="text-[8px] text-muted-foreground font-bold">4/5 milestones met</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: MessageCircle,
    title: "Real-Time Messaging",
    desc: "Chat directly with classmates, project teams, and groups. Create conversations, send messages instantly with live updates.",
    color: "text-sky-500",
    bg: "bg-sky-500/8",
    border: "border-sky-500/15 group-hover:border-sky-500/35",
    glow: "group-hover:shadow-sky-500/8",
    gradient: "from-sky-50/25 via-white to-sky-100/5",
    details: ["1-on-1 & group chats", "Real-time message delivery", "Conversation management"],
    mockUI: (
      <div className="w-[260px] bg-white rounded-2xl p-4 border border-sky-500/15 shadow-sm space-y-2.5">
        <div className="flex justify-between items-center pb-2 border-b border-muted">
          <span className="text-[10px] font-extrabold text-sky-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            GenSync Developers
          </span>
          <span className="text-[7px] text-muted-foreground font-bold bg-muted px-1.5 py-0.5 rounded-full">3 Online</span>
        </div>
        <div className="space-y-1.5 text-left">
          <div className="flex gap-1.5">
            <div className="w-4.5 h-4.5 rounded-full bg-primary flex items-center justify-center text-[6px] text-white font-bold shrink-0 mt-0.5">LK</div>
            <div className="bg-sky-500/8 border border-sky-500/10 rounded-xl rounded-tl-none p-1.5 max-w-[85%]">
              <p className="text-[6px] font-extrabold text-sky-600 leading-none">Likhith.K</p>
              <p className="text-[8px] text-foreground mt-0.5 leading-tight font-medium">Zero-lag scroll animations are in! ⚡</p>
            </div>
          </div>
          <div className="flex gap-1.5 justify-end">
            <div className="bg-muted border rounded-xl rounded-tr-none p-1.5 max-w-[85%]">
              <p className="text-[6px] font-extrabold text-rose-500 leading-none text-right">Manogna.u</p>
              <p className="text-[8px] text-foreground mt-0.5 leading-tight font-medium">Stunning UI colors! 🎨</p>
            </div>
            <div className="w-4.5 h-4.5 rounded-full bg-rose-500 flex items-center justify-center text-[6px] text-white font-bold shrink-0 mt-0.5">MU</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Calendar,
    title: "Campus Events",
    desc: "Discover upcoming workshops, hackathons, and career fairs. RSVP to events and never miss what matters on campus.",
    color: "text-amber-500",
    bg: "bg-amber-500/8",
    border: "border-amber-500/15 group-hover:border-amber-500/35",
    glow: "group-hover:shadow-amber-500/8",
    gradient: "from-amber-50/25 via-white to-amber-100/5",
    details: ["Browse & create events", "RSVP tracking", "Category & date filters"],
    mockUI: (
      <div className="w-[260px] bg-white rounded-2xl p-4 border border-amber-500/15 shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-muted">
          <span className="text-[10px] font-extrabold text-amber-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Tech Meetups
          </span>
          <span className="text-[9px] text-amber-600 bg-amber-50 font-bold px-2 py-0.5 rounded-full">Featured</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-50/20 border border-amber-500/10 text-left space-y-1.5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-[9px] font-extrabold text-foreground leading-tight">Web3 Builder Workshop</h4>
              <p className="text-[7px] text-muted-foreground mt-0.5">Seminar Hall A • June 20, 2 PM</p>
            </div>
            <div className="w-5 h-5 rounded bg-amber-500/10 flex flex-col items-center justify-center text-[8px] text-amber-600 font-extrabold leading-none shrink-0">
              <span>20</span>
              <span className="text-[5px] uppercase mt-0.5">Jun</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-dashed border-amber-500/10">
            <span className="text-[7px] text-muted-foreground font-bold">🔥 42 RSVP'd</span>
            <button className="h-5 px-2.5 rounded bg-amber-500 text-white font-extrabold text-[8px]">
              ✓ RSVP'd
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    desc: "Share content via unique links or access codes. Create custom share pages with titles, messages, links, and expiry dates.",
    color: "text-rose-500",
    bg: "bg-rose-500/8",
    border: "border-rose-500/15 group-hover:border-rose-500/35",
    glow: "group-hover:shadow-rose-500/8",
    gradient: "from-rose-50/25 via-white to-rose-100/5",
    details: ["Share via link or code", "Set expiry dates", "Track view counts"],
    mockUI: (
      <div className="w-[260px] bg-white rounded-2xl p-4 border border-rose-500/15 shadow-sm space-y-2.5">
        <div className="flex justify-between items-center pb-2 border-b border-muted">
          <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Secure Share Page
          </span>
          <span className="text-[9px] text-rose-600 bg-rose-50 font-bold px-2 py-0.5 rounded-full">Encrypted</span>
        </div>
        <div className="space-y-2 text-left">
          <div className="space-y-0.5">
            <label className="text-[7px] font-bold text-muted-foreground">Generated Share Link</label>
            <div className="flex gap-1.5">
              <div className="flex-1 h-6 px-2 bg-muted rounded border border-transparent text-[7px] font-mono text-muted-foreground/80 font-bold flex items-center overflow-hidden">
                studenthub.link/share/dsa
              </div>
              <button className="h-6 px-2 rounded bg-rose-500 text-white font-extrabold text-[8px] flex items-center justify-center shrink-0">
                Copied!
              </button>
            </div>
          </div>
          <div className="flex justify-between text-[7px] text-muted-foreground font-bold pt-1 border-t border-muted">
            <span>🔑 Code: 8F2B</span>
            <span>⏳ Expiry: 24h</span>
          </div>
        </div>
      </div>
    )
  },
];

const moreFeatures = [
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Admin, moderator, and user roles with secure permissions.",
    colSpan: "md:col-span-1",
    color: "text-blue-500",
    bg: "bg-blue-500/8",
    gradient: "from-blue-50/15 via-white to-blue-100/5",
    border: "border-blue-500/10 hover:border-blue-500/30",
    mockUI: (
      <div className="flex flex-col gap-2 w-full bg-white/75 p-3.5 rounded-2xl border border-blue-500/10 shadow-sm">
        <div className="flex items-center justify-between text-[10px] bg-blue-500 text-white font-extrabold px-3 py-1 rounded-lg">
          <span>Admin Portal</span>
          <span className="opacity-90 text-[8px] uppercase tracking-wider bg-blue-600 px-1.5 py-0.5 rounded font-mono">Full</span>
        </div>
        <div className="flex items-center justify-between text-[10px] bg-indigo-500 text-white font-extrabold px-3 py-1 rounded-lg">
          <span>Moderator</span>
          <span className="opacity-90 text-[8px] uppercase tracking-wider bg-indigo-600 px-1.5 py-0.5 rounded font-mono">Review</span>
        </div>
        <div className="flex items-center justify-between text-[10px] bg-muted text-muted-foreground font-extrabold px-3 py-1 rounded-lg border">
          <span>Student</span>
          <span className="opacity-90 text-[8px] uppercase tracking-wider bg-border px-1.5 py-0.5 rounded font-mono">Standard</span>
        </div>
      </div>
    )
  },
  {
    icon: Upload,
    title: "File Storage",
    desc: "Securely upload and store files with cloud-powered storage.",
    colSpan: "md:col-span-2",
    color: "text-violet-500",
    bg: "bg-violet-500/8",
    gradient: "from-violet-50/15 via-white to-violet-100/5",
    border: "border-violet-500/10 hover:border-violet-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-violet-500/10 space-y-3 text-left shadow-sm">
        <div className="flex justify-between items-center text-[10px] font-extrabold text-foreground">
          <span>CS_Midsem_ExamPrep.zip</span>
          <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-mono text-[9px]">88%</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: "88%" }} />
        </div>
        <div className="flex justify-between items-center text-[8px] text-muted-foreground font-bold">
          <span>Speed: 12.4 MB/s</span>
          <span>Estimated: 2.1 seconds left</span>
        </div>
      </div>
    )
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Stay updated with platform-wide announcements and alerts.",
    colSpan: "md:col-span-2",
    color: "text-amber-500",
    bg: "bg-amber-500/8",
    gradient: "from-amber-50/15 via-white to-amber-100/5",
    border: "border-amber-500/10 hover:border-amber-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-amber-500/10 space-y-3 text-left shadow-sm">
        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <span className="text-base shrink-0 text-amber-500">🔔</span>
          <div>
            <p className="text-[10px] font-extrabold text-foreground leading-snug">New Resource Posted</p>
            <p className="text-[8px] text-muted-foreground mt-0.5 font-bold">Likhith.K uploaded DSA Lecture 4 Notes</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <span className="text-base shrink-0 text-blue-500">📅</span>
          <div>
            <p className="text-[10px] font-extrabold text-foreground leading-snug">Upcoming Event Reminder</p>
            <p className="text-[8px] text-muted-foreground mt-0.5 font-bold">Web3 Builder Meetup starts in 30 mins</p>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: Lock,
    title: "Email Authentication",
    desc: "Secure sign-up and login with email verification.",
    colSpan: "md:col-span-1",
    color: "text-sky-500",
    bg: "bg-sky-500/8",
    gradient: "from-sky-50/15 via-white to-sky-100/5",
    border: "border-sky-500/10 hover:border-sky-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-sky-500/10 space-y-3.5 text-left shadow-sm">
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Verification OTP</label>
          <div className="flex gap-2">
            {["6", "8", "2", "4"].map((num, i) => (
              <div key={i} className="flex-1 h-9 rounded-xl bg-white border border-sky-500/20 flex items-center justify-center text-xs font-extrabold text-sky-600 shadow-sm font-mono">
                {num}
              </div>
            ))}
          </div>
        </div>
        <span className="text-[8px] font-extrabold text-success flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-success shrink-0" /> One-time passcode sent to student email
        </span>
      </div>
    )
  },
  {
    icon: UserPlus,
    title: "User Profiles",
    desc: "Customizable profiles with bio, skills, social links, and avatar.",
    colSpan: "md:col-span-1",
    color: "text-rose-500",
    bg: "bg-rose-500/8",
    gradient: "from-rose-50/15 via-white to-rose-100/5",
    border: "border-rose-500/10 hover:border-rose-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-rose-500/10 text-center space-y-3 shadow-sm">
        <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center mx-auto text-xs text-white font-extrabold border-2 border-white shadow-md">
          LK
        </div>
        <div>
          <p className="text-[11px] font-extrabold text-foreground">Likhith.K</p>
          <p className="text-[8px] text-muted-foreground font-bold tracking-wide mt-0.5">GenSync Lead Builder</p>
        </div>
        <div className="flex justify-center gap-1.5 pt-2 border-t border-muted">
          <span className="text-[8px] bg-primary/8 text-primary font-bold px-2.5 py-0.5 rounded">React</span>
          <span className="text-[8px] bg-primary/8 text-primary font-bold px-2.5 py-0.5 rounded">NodeJS</span>
          <span className="text-[8px] bg-primary/8 text-primary font-bold px-2.5 py-0.5 rounded">SQL</span>
        </div>
      </div>
    )
  },
  {
    icon: Smartphone,
    title: "PWA Support",
    desc: "Install StudentHub on your phone like a native app.",
    colSpan: "md:col-span-2",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8",
    gradient: "from-emerald-50/15 via-white to-emerald-100/5",
    border: "border-emerald-500/10 hover:border-emerald-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-emerald-500/10 text-left space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-foreground">StudentHub App</span>
          <span className="bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-md text-[8px] uppercase tracking-wider font-mono">PWA</span>
        </div>
        <p className="text-[9px] text-muted-foreground leading-relaxed font-bold">Install StudentHub directly on iOS & Android via Safari or Chrome</p>
        <button className="w-full h-8.5 rounded-xl bg-emerald-500 text-white font-extrabold text-[10px] hover:scale-[1.01] transition-all shadow-sm shadow-emerald-500/15">
          Install App Shortcut
        </button>
      </div>
    )
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    desc: "Works on any device — mobile, tablet, or desktop browser.",
    colSpan: "md:col-span-2",
    color: "text-indigo-500",
    bg: "bg-indigo-500/8",
    gradient: "from-indigo-50/15 via-white to-indigo-100/5",
    border: "border-indigo-500/10 hover:border-indigo-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-indigo-500/10 space-y-3 text-center shadow-sm">
        <div className="flex justify-around items-center pt-1.5">
          <div className="flex flex-col items-center gap-1 hover:scale-105 transition-transform duration-300">
            <span className="text-lg">💻</span>
            <span className="text-[8px] font-extrabold text-muted-foreground">Desktop</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:scale-105 transition-transform duration-300">
            <span className="text-lg">📟</span>
            <span className="text-[8px] font-extrabold text-muted-foreground">Tablet</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:scale-105 transition-transform duration-300">
            <span className="text-lg">📱</span>
            <span className="text-[8px] font-extrabold text-muted-foreground">Mobile</span>
          </div>
        </div>
        <p className="text-[8px] text-success font-extrabold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-success shrink-0" /> Full cross-device layout synchronisation
        </p>
      </div>
    )
  },
  {
    icon: Search,
    title: "Smart Filters",
    desc: "Search and filter resources, opportunities, and events easily.",
    colSpan: "md:col-span-1",
    color: "text-teal-500",
    bg: "bg-teal-500/8",
    gradient: "from-teal-50/15 via-white to-teal-100/5",
    border: "border-teal-500/10 hover:border-teal-500/30",
    mockUI: (
      <div className="w-full bg-white/75 p-4 rounded-2xl border border-teal-500/10 text-left space-y-3 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">Active Search Filters</label>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[8px] bg-teal-500 text-white font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm shadow-teal-500/10">
              Course: CS-201 <span className="opacity-70 leading-none text-[10px] ml-0.5">×</span>
            </span>
            <span className="text-[8px] bg-teal-500 text-white font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm shadow-teal-500/10">
              Type: PDF <span className="opacity-70 leading-none text-[10px] ml-0.5">×</span>
            </span>
          </div>
        </div>
        <div className="text-[8px] text-muted-foreground italic font-extrabold">
          Found 12 matching resources
        </div>
      </div>
    )
  },
];

const steps = [
  { num: 1, title: "Sign up for free", desc: "Create your account with email. Set up your profile with bio, skills, department, and social links." },
  { num: 2, title: "Explore the platform", desc: "Browse resources, discover opportunities, join projects, RSVP to events, and chat with classmates." },
  { num: 3, title: "Share & collaborate", desc: "Upload study materials, post opportunities, create projects, share content via secure links, and grow together." },
];

const Index = () => {
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        // Slide exactly the difference between the track width and viewport width, plus a nice padding offset
        setScrollRange(Math.max(0, trackWidth - viewportWidth + 64));
      }
    };

    handleResize();
    const timer = setTimeout(handleResize, 500); // safety execution after DOM finishes painting

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Track scroll position of features section for sticky horizontal translation
  const { scrollYProgress } = useScroll({
    target: featuresSectionRef,
    offset: ["start start", "end end"]
  });

  // Smooth scroll translation with spring physics (high responsiveness, zero lags)
  const springScroll = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });

  // Map scroll progress to exact measured horizontal pixel range (from 0 to -scrollRange)
  const translateX = useTransform(springScroll, [0, 1], [0, -scrollRange]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50/30 via-background to-indigo-50/20 font-sans">
      <SEO
        canonical="/"
        title="Free Student Sharing & Campus Collaboration Platform"
        description="StudentHub by GenSync is the #1 free campus collaboration platform. Share notes, find internships, join projects, chat with peers, and attend events. Built by GenSync."
        keywords="studenthub, gensync, campus collaboration, student sharing platform, free student app, share notes, internships, hackathons, student projects, campus events"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

        <div className="container mx-auto px-5 py-16 md:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column: Heading */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-left"
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 text-[10px] font-extrabold text-primary bg-primary/8 px-4.5 py-2 rounded-full mb-6 tracking-widest uppercase border border-primary/10 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" /> StudentHub by GenSync
              </motion.span>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-foreground leading-[1.05] mb-6 tracking-tighter">
                Your All-in-One
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-600">Campus Hub</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Share resources, discover opportunities, collaborate on projects, chat with classmates, attend events, and share content securely — all in one free platform.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/auth">
                  <Button size="lg" className="h-14 px-10 font-extrabold shadow-2xl gap-3 text-base rounded-3xl bg-gradient-to-r from-primary via-primary to-primary/80 hover:scale-105 hover:shadow-primary/30 transition-all duration-300 animate-pulse-subtle">
                    <Sparkles className="w-5 h-5" />
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="h-14 px-8 font-bold text-base rounded-3xl border-2 hover:scale-105 transition-all duration-300 hover:bg-muted/30">
                    Learn More
                  </Button>
                </Link>
              </div>

              {/* Real feature highlights */}
              <div className="flex flex-wrap gap-3">
                {["100% Free", "No Ads", "PWA App", "Secure"].map((tag, i) => (
                  <motion.span 
                    key={tag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted/60 px-3.5 py-1.5 rounded-full border border-border/50 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Right Column: Hero Image (Smooth Parallax Zoom) */}
            <motion.div 
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="hidden lg:block relative"
            >
              <motion.div 
                whileHover={{ scale: 1.015, y: -4 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-3xl overflow-hidden shadow-2xl border border-border/20 bg-card"
              >
                <img src={heroImg} alt="StudentHub campus collaboration platform" className="w-full object-cover" />
              </motion.div>

              {/* Floating card - Resources (independent delay animation) */}
              <motion.div 
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="absolute -bottom-5 -left-5 bg-card rounded-2xl p-4 shadow-xl border border-border/30"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Resource Uploaded!</p>
                    <p className="text-[10px] text-muted-foreground">Data Structures Notes.pdf</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card - Events (independent delay animation) */}
              <motion.div 
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="absolute -top-4 -right-4 bg-card rounded-2xl p-3.5 shadow-xl border border-border/30"
              >
                <p className="text-[9px] text-muted-foreground font-bold tracking-wider mb-1.5">CAMPUS EVENT</p>
                <p className="text-xs font-bold text-foreground">Tech Workshop 🚀</p>
                <p className="text-[10px] text-primary font-semibold mt-1">RSVP now</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What StudentHub Offers — quick bar */}
      <section className="border-y border-border/30 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            {[
              { icon: BookOpen, label: "Resources" },
              { icon: Briefcase, label: "Opportunities" },
              { icon: Users, label: "Projects" },
              { icon: MessageCircle, label: "Messaging" },
              { icon: Calendar, label: "Events" },
              { icon: Share2, label: "Sharing" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Section (Scroll-Linked Horizontal Slider on Desktop, Stack on Mobile) */}
      <section id="features" ref={featuresSectionRef} className="relative w-full h-[180vh] md:block hidden">
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center bg-gradient-to-b from-blue-50/10 via-background to-indigo-50/5">
          {/* Section Header */}
          <div className="container mx-auto px-5 mb-10 text-center relative z-10">
            <p className="text-[10px] font-extrabold text-primary tracking-[0.25em] uppercase mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tighter">6 Powerful Tools, One Free Platform</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Everything a student needs to share, collaborate, and grow — built by GenSync. Scroll down to see it move.
            </p>
            
            {/* Scroll progress bar indicator */}
            <div className="w-48 h-1.5 bg-muted rounded-full mx-auto mt-6 overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                style={{ width: useTransform(springScroll, [0, 1], ["0%", "100%"]) }}
              />
            </div>
          </div>

          {/* Horizontal Slider Track */}
          <div className="relative flex items-center overflow-x-hidden no-scrollbar w-full">
            <motion.div 
              ref={trackRef}
              style={{ x: translateX }} 
              className="flex flex-nowrap gap-8 px-12 md:px-24 w-max"
            >
              {features.map((feat) => (
                <div 
                  key={feat.title}
                  className={`w-[580px] h-[340px] md:w-[620px] md:h-[350px] shrink-0 rounded-[2.5rem] p-8 border ${feat.border} hover:shadow-xl ${feat.glow} bg-gradient-to-br ${feat.gradient} flex items-center gap-8 relative overflow-hidden transition-all duration-300 group bg-card`}
                >
                  {/* Left Column: Details */}
                  <div className="flex-1 flex flex-col justify-between h-full text-left">
                    <div>
                      <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                        <feat.icon className={`w-5 h-5 ${feat.color}`} />
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground mb-2">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{feat.desc}</p>
                    </div>
                    
                    <ul className="space-y-1.5">
                      {feat.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Visual Mockup */}
                  <div className="w-[260px] shrink-0 flex items-center justify-center select-none group-hover:scale-[1.02] transition-transform duration-300">
                    {feat.mockUI}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile-Only Features List (Staggered Fade-Up Stack) */}
      <section className="md:hidden py-16 px-5 relative z-10 bg-gradient-to-b from-blue-50/10 via-background to-indigo-50/5">
        <div className="text-center mb-10">
          <p className="text-[10px] font-extrabold text-primary tracking-[0.25em] uppercase mb-2">Platform Features</p>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tighter mb-3">6 Powerful Tools, One Free Platform</h2>
          <p className="text-muted-foreground text-xs px-2">Everything you need to share, collaborate, and grow — built by GenSync.</p>
        </div>
        
        <div className="space-y-6">
          {features.map((feat, idx) => (
            <motion.div 
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className={`rounded-[2rem] p-6 border ${feat.border} bg-gradient-to-br ${feat.gradient} space-y-5 bg-card`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center`}>
                  <feat.icon className={`w-4 h-4 ${feat.color}`} />
                </div>
                <h3 className="text-base font-extrabold text-foreground">{feat.title}</h3>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              
              <div className="w-full flex justify-center py-2">
                {feat.mockUI}
              </div>

              <ul className="grid grid-cols-2 gap-2 pt-3 border-t border-border/30">
                {feat.details.map((d) => (
                  <li key={d} className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* More Features Grid */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-5">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-extrabold text-primary tracking-[0.25em] uppercase mb-3">And More</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tighter">Built with everything you need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">Security, accessibility, and smart features baked into every corner.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {moreFeatures.map(({ icon: Icon, title, desc, colSpan, color, bg, gradient, border, mockUI }, i) => (
              <motion.div 
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className={`card-campus p-6 md:p-8 bg-gradient-to-br ${gradient} border ${border} transition-all duration-300 shadow-md flex flex-col justify-between overflow-hidden relative group min-h-[270px] md:min-h-[290px] ${colSpan} bg-card`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-6 text-left">{desc}</p>
                </div>
                
                {/* Embedded Visual Mockup */}
                <div className="w-full mt-auto flex items-center justify-center select-none group-hover:scale-[1.01] transition-transform duration-300">
                  {mockUI}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="container mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image (Smooth scroll reveal & scale) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <motion.div 
                whileHover={{ scale: 1.015 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto bg-card border border-border/30"
              >
                <img src={studentImg} alt="Student using StudentHub" className="w-full object-cover" />
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute bottom-6 left-6 gradient-primary rounded-2xl p-4 shadow-lg"
              >
                <p className="text-sm font-bold text-primary-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-bounce" /> Start sharing today
                </p>
              </motion.div>
            </motion.div>

            {/* Steps text */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[10px] font-extrabold text-primary tracking-[0.25em] uppercase mb-3">Getting Started</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tighter">Three simple steps</h2>
              <p className="text-muted-foreground mb-10 text-sm">It takes less than a minute to get started. Completely free.</p>
              <div className="space-y-8">
                {steps.map(({ num, title, desc }) => (
                  <div key={num} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-extrabold text-sm shrink-0 shadow-md">
                      {num}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Built By Section (GenSync Premium Profiles) */}
      <section id="testimonials" className="bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-5">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <p className="text-[10px] font-extrabold text-primary tracking-[0.25em] uppercase mb-3">Meet The Team</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tighter">The Minds Behind StudentHub</h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">GenSync — a dynamic developer team passionate about building tools that help students succeed.</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Likhith.K */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ y: -6, boxShadow: "var(--card-shadow-hover)" }}
                className="card-campus p-6 md:col-span-1 border border-primary/20 ring-1 ring-primary/10 relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent flex flex-col justify-between bg-card transition-all duration-300"
              >
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-extrabold text-primary-foreground bg-primary px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">Lead Builder</span>
                </div>
                <div>
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg mb-4 text-primary-foreground font-extrabold text-lg">
                    LK
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">Likhith.K</h3>
                  <p className="text-xs text-primary font-bold mb-3">Overall Killer Website Builder</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The absolute programming beast who orchestrated the architecture, brought the entire vision to life, and built the overall website with unmatched speed and precision.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/40">
                  <span className="text-[10px] font-bold text-primary bg-primary/8 px-2 py-1 rounded-md">⚡ Vibe Coder Beast</span>
                </div>
              </motion.div>

              {/* Manogna.u */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -6, boxShadow: "var(--card-shadow-hover)" }}
                className="card-campus p-6 flex flex-col justify-between bg-card transition-all duration-300 border border-transparent hover:border-rose-500/20"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-md mb-4 text-rose-500 font-extrabold text-lg">
                    MU
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">Manogna.u</h3>
                  <p className="text-xs text-rose-500 font-bold mb-3">UI/UX & Frontend Wizard</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The creative genius behind the gorgeous, pixel-perfect user interface. Crafted the premium visual elements, layout flow, and stunning aesthetic appeal of the platform.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/40">
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md">🎨 Creative Master</span>
                </div>
              </motion.div>

              {/* udaya lakshmi.Z */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ y: -6, boxShadow: "var(--card-shadow-hover)" }}
                className="card-campus p-6 flex flex-col justify-between bg-card transition-all duration-300 border border-transparent hover:border-teal-500/20"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-md mb-4 text-teal-500 font-extrabold text-lg">
                    UL
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">udaya lakshmi.Z</h3>
                  <p className="text-xs text-teal-500 font-bold mb-3">Database & Backend Mastermind</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The structural core of the platform. Designed the database architecture, set up security triggers, and engineered the high-performance backend pipelines.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/40">
                  <span className="text-[10px] font-bold text-teal-500 bg-teal-500/10 px-2 py-1 rounded-md">⚙️ Backend Architect</span>
                </div>
              </motion.div>
            </div>
            
            <div className="text-center mt-8">
              <Link to="/developer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all">
                Learn more about GenSync team <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-5 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl gradient-primary p-10 md:p-16 text-center relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary-foreground/5 translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4 tracking-tighter">Ready to get started?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto text-sm">Join StudentHub — the free platform built by GenSync to help every student share, collaborate, and grow.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/auth">
                <Button variant="secondary" size="lg" className="h-12 px-8 font-bold shadow-sm rounded-2xl hover:scale-105 transition-all duration-300">
                  Sign Up Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" size="lg" className="h-12 px-8 font-bold rounded-2xl text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 hover:scale-105 transition-all duration-300">
                  About StudentHub
                </Button>
              </Link>
            </div>
            <p className="text-[10px] text-primary-foreground/40 mt-5">Free for all students. No credit card. No ads. Ever.</p>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
