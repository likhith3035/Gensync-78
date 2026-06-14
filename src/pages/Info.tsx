import SEO from "@/components/SEO";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Briefcase, FolderKanban, BookOpen, Calendar,
  MessageCircle, Share2, User, Bell, Search, ArrowRight,
  Sparkles, MousePointerClick, LogIn, PenLine, Eye, Upload,
  UserPlus, Heart, Send, Link2, Download, Plus, Filter, Code2
} from "lucide-react";
import guideDashboard from "@/assets/guide-dashboard.jpg";
import { Link } from "react-router-dom";
import guideSharing from "@/assets/guide-sharing.jpg";
import guideOpportunities from "@/assets/guide-opportunities.jpg";

const Info = () => {
  return (
    <AppLayout>
      <SEO title="Help & Guide" description="Learn how to use StudentHub — step-by-step guides for resources, projects, messaging, events, and sharing features." canonical="/info" noindex />
      <div className="max-w-4xl mx-auto space-y-14 pb-12">

        {/* Hero */}
        <div className="text-center space-y-4 pt-4">
          <div className="text-5xl">👋</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Welcome to <span className="text-primary">StudentHub</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            This guide will help you understand <strong>everything</strong> about the app in the <strong>simplest way possible</strong>. No tech knowledge needed! 😊
          </p>
        </div>

        {/* What is this app? */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤔</span>
            <h2 className="text-2xl font-bold text-foreground">What is StudentHub?</h2>
          </div>
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 space-y-4 flex flex-col justify-center">
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    Think of StudentHub as a <strong>one-stop app for students</strong> where you can:
                  </p>
                  <div className="space-y-3">
                    {[
                      { emoji: "📋", text: "Find internships, jobs & scholarships" },
                      { emoji: "📚", text: "Share & download study notes" },
                      { emoji: "👥", text: "Work on group projects together" },
                      { emoji: "🎉", text: "Discover campus events & RSVP" },
                      { emoji: "💬", text: "Chat with other students" },
                      { emoji: "🔗", text: "Share your work with anyone via a link" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-[15px]">
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/20">
                  <img src={guideDashboard} alt="App overview" className="w-full h-full object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How to Start */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <h2 className="text-2xl font-bold text-foreground">How to Get Started</h2>
          </div>
          <p className="text-muted-foreground">Just 4 simple steps and you're ready to go!</p>

          <div className="space-y-4">
            {[
              {
                step: 1,
                emoji: "✍️",
                icon: LogIn,
                title: "Create Your Account",
                desc: "Click \"Get Started\" on the home page → Enter your email & password → Check your email for verification → Click the link → Done!",
                color: "bg-primary/10 text-primary",
              },
              {
                step: 2,
                emoji: "👤",
                icon: PenLine,
                title: "Fill Your Profile",
                desc: "Go to Profile (from the left menu) → Add your name, department, year, skills, and a short bio. This helps others find and know you.",
                color: "bg-emerald-500/10 text-emerald-600",
              },
              {
                step: 3,
                emoji: "👀",
                icon: Eye,
                title: "Explore the App",
                desc: "Use the menu on the left (or bottom on phone) to visit different pages like Opportunities, Resources, Events, and more.",
                color: "bg-amber-500/10 text-amber-600",
              },
              {
                step: 4,
                emoji: "🤝",
                icon: Heart,
                title: "Start Using!",
                desc: "Post opportunities, upload notes, join projects, RSVP to events, chat with students — the app is yours to explore!",
                color: "bg-rose-500/10 text-rose-600",
              },
            ].map((s) => (
              <Card key={s.step} className="border-0 shadow-md">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shrink-0 text-xl font-bold`}>
                    {s.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <span>{s.emoji}</span> {s.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Each Feature Explained Simply */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📱</span>
            <h2 className="text-2xl font-bold text-foreground">What Each Page Does</h2>
          </div>
          <p className="text-muted-foreground">Here's a simple explanation of every section in the app:</p>

          <div className="space-y-4">
            {/* Dashboard */}
            <FeatureCard
              emoji="🏠"
              icon={LayoutDashboard}
              title="Dashboard"
              where="First page after login"
              what="Shows you a quick summary of everything — today's tip, upcoming events, your stats, and shortcuts to all pages."
              howTo="Just log in and you'll see it! No action needed."
              bg="bg-primary/10"
              iconColor="text-primary"
            />

            {/* Opportunities */}
            <FeatureCard
              emoji="💼"
              icon={Briefcase}
              title="Opportunities"
              where="Left menu → Opportunities"
              what="A list of internships, jobs, scholarships, competitions posted by students and admins."
              howTo={`Click "Add Opportunity" → Fill the form (title, company, category, deadline) → Submit. Others can now see it!`}
              bg="bg-amber-500/10"
              iconColor="text-amber-500"
            />

            {/* Projects */}
            <FeatureCard
              emoji="📁"
              icon={FolderKanban}
              title="Projects"
              where="Left menu → Projects"
              what="Create group projects, add team members, and track what stage the project is in."
              howTo={`Click "New Project" → Give it a name & description → Add tags → Invite members to join.`}
              bg="bg-emerald-500/10"
              iconColor="text-emerald-500"
            />

            {/* Resources */}
            <FeatureCard
              emoji="📚"
              icon={BookOpen}
              title="Resources"
              where="Left menu → Resources"
              what="Upload and download study materials like notes, papers, assignments, and more."
              howTo={`Click "Upload Resource" → Choose your file → Add title, subject, and category → Submit. Others can download it!`}
              bg="bg-blue-500/10"
              iconColor="text-blue-500"
            />

            {/* Events */}
            <FeatureCard
              emoji="🎉"
              icon={Calendar}
              title="Events"
              where="Left menu → Events"
              what="See upcoming campus events. You can RSVP (say you'll attend) and get reminders before they start."
              howTo={`Browse events → Click "RSVP" on any event → You'll see reminders on Dashboard when it's close!`}
              bg="bg-rose-500/10"
              iconColor="text-rose-500"
            />

            {/* Messages */}
            <FeatureCard
              emoji="💬"
              icon={MessageCircle}
              title="Messages"
              where="Left menu → Messages"
              what="Chat with other students one-on-one or in group conversations."
              howTo={`Click "New Conversation" → Search for a student → Start typing your message → Hit send!`}
              bg="bg-violet-500/10"
              iconColor="text-violet-500"
            />

            {/* Sharing Hub */}
            <FeatureCard
              emoji="🔗"
              icon={Share2}
              title="Sharing Hub"
              where="Left menu → Sharing Hub"
              what="Create special links to share your profile, projects, or custom content with anyone — even people who don't have an account."
              howTo={`Click "Create Share" → Choose what to share → Get a link → Send it to anyone!`}
              bg="bg-cyan-500/10"
              iconColor="text-cyan-500"
            />

            {/* Profile */}
            <FeatureCard
              emoji="👤"
              icon={User}
              title="Profile"
              where="Left menu → Profile"
              what="Your personal page where you add your info — skills, bio, social links, department, and year."
              howTo="Click on each field → Type your info → Click Save. That's it!"
              bg="bg-orange-500/10"
              iconColor="text-orange-500"
            />
          </div>
        </section>

        {/* Visual Guides */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🖼️</span>
            <h2 className="text-2xl font-bold text-foreground">See It in Action</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg overflow-hidden">
              <img src={guideSharing} alt="Collaborate with peers" className="w-full h-48 object-cover" />
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-foreground">💬 Chat & Collaborate</h3>
                <p className="text-sm text-muted-foreground">Talk with classmates, share ideas, and work together on projects — all inside the app.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg overflow-hidden">
              <img src={guideOpportunities} alt="Find opportunities" className="w-full h-48 object-cover" />
              <CardContent className="p-5 space-y-2">
                <h3 className="font-bold text-foreground">💼 Find Opportunities</h3>
                <p className="text-sm text-muted-foreground">Discover internships, hackathons, and scholarships posted by your peers and admins.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <h2 className="text-2xl font-bold text-foreground">Helpful Tips</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { emoji: "🔍", tip: "Use the search bar at the top to quickly find anything — pages, events, resources, opportunities." },
              { emoji: "🔔", tip: "Click the bell icon (top right) to see notifications and announcements from admins." },
              { emoji: "ℹ️", tip: "Click the info icon (ℹ) next to the bell to come back to this guide anytime!" },
              { emoji: "📱", tip: "On your phone, use the bottom menu to navigate between pages." },
              { emoji: "🔗", tip: "Want to show your profile to someone? Go to Sharing Hub and create a shareable link!" },
              { emoji: "⏰", tip: "RSVP to events and the app will remind you before they start." },
            ].map((t, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-2xl shrink-0">{t.emoji}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.tip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Common Questions */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❓</span>
            <h2 className="text-2xl font-bold text-foreground">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "Is it free?", a: "Yes! 100% free for all students. No hidden charges." },
              { q: "Do I need to download anything?", a: "Nope! Just open the website in your browser. You can also install it as an app on your phone (it will ask you)." },
              { q: "Can I use it on my phone?", a: "Yes! The app works perfectly on phones, tablets, and computers." },
              { q: "How do I upload my notes?", a: "Go to Resources → Click 'Upload Resource' → Choose your file → Fill in the details → Done!" },
              { q: "How do I chat with someone?", a: "Go to Messages → Click 'New Conversation' → Find the person → Start chatting!" },
              { q: "How do I know about upcoming events?", a: "Go to Events page and RSVP. You'll get reminders on your Dashboard before the event starts." },
              { q: "Is my data safe?", a: "Yes! Only logged-in users can access the platform. Your data is linked to your account and protected." },
              { q: "I'm confused, where do I get help?", a: "You're on the right page! 😄 Read through this guide, or message a friend through the Messages feature." },
            ].map((faq, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span className="text-primary">Q:</span> {faq.q}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                    <span className="text-primary font-semibold">A:</span> {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Navigation Map */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <h2 className="text-2xl font-bold text-foreground">Where to Find Things</h2>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-3">
                {[
                  { icon: "🖥️", label: "On Computer", desc: "Use the left sidebar menu to go to any page" },
                  { icon: "📱", label: "On Phone", desc: "Use the bottom bar to navigate between main pages" },
                  { icon: "🔍", label: "Search Bar", desc: "Top of the screen — type anything to find it fast" },
                  { icon: "🔔", label: "Notifications", desc: "Top right — bell icon shows announcements" },
                  { icon: "ℹ️", label: "This Guide", desc: "Top right — info icon (ℹ) brings you back here" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Developer */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-2xl">🎉</p>
          <p className="font-bold text-foreground">You're all set!</p>
          <p className="text-sm text-muted-foreground">
            Go explore StudentHub and make the most of your student life. Happy learning! 🚀
          </p>
          <Link to="/developer">
            <Button variant="outline" className="mt-4 rounded-2xl gap-2 font-semibold">
              <Code2 className="w-4 h-4" />
              Meet the Developer
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

/* Reusable feature explanation card */
const FeatureCard = ({
  emoji, icon: Icon, title, where, what, howTo, bg, iconColor,
}: {
  emoji: string; icon: any; title: string; where: string; what: string; howTo: string; bg: string; iconColor: string;
}) => (
  <Card className="border-0 shadow-md">
    <CardContent className="p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-foreground text-base">
          {emoji} {title}
        </h3>
      </div>
      <div className="pl-[52px] space-y-2 text-sm">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">📍 Where:</span> {where}
        </p>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">✨ What it does:</span> {what}
        </p>
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">👆 How to use:</span> {howTo}
        </p>
      </div>
    </CardContent>
  </Card>
);

export default Info;
