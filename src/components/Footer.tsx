import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Footer = () => (
  <footer className="bg-white/80 backdrop-blur-md border-t border-slate-100/80 text-slate-600">
    <div className="container mx-auto px-4 py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-lg font-extrabold text-[#0F172A]">StudentHub</span>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed">
            StudentHub by GenSync — connecting students with opportunities, resources, and collaboration tools to bridge the gap between classroom and career.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[10px] uppercase tracking-wider text-slate-400">Platform</h4>
          <ul className="space-y-2.5">
            <li><Link to="/resources" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Resources</Link></li>
            <li><Link to="/opportunities" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Opportunities</Link></li>
            <li><Link to="/projects" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Projects</Link></li>
            <li><Link to="/events" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Events</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[10px] uppercase tracking-wider text-slate-400">Company</h4>
          <ul className="space-y-2.5">
            <li><Link to="/about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">About Us</Link></li>
            <li><Link to="/developer" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Developer</Link></li>
            <li><Link to="/auth" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-[10px] uppercase tracking-wider text-slate-400">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Dashboard</Link></li>
            <li><Link to="/messages" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Messages</Link></li>
            <li><Link to="/shares" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Shares</Link></li>
            <li><Link to="/info" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">Info & Tips</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
        <p>© 2026 StudentHub by GenSync. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link to="/about" className="hover:text-slate-600 transition-colors">About</Link>
          <Link to="/developer" className="hover:text-slate-600 transition-colors">Developer</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
