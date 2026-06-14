import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-14">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-[18px] h-[18px] text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold">StudentHub</span>
          </Link>
          <p className="text-sm opacity-60 leading-relaxed">
            StudentHub by GenSync — connecting students with opportunities, resources, and collaboration tools to bridge the gap between classroom and career.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-sm">Platform</h4>
          <ul className="space-y-2.5">
            <li><Link to="/resources" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Resources</Link></li>
            <li><Link to="/opportunities" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Opportunities</Link></li>
            <li><Link to="/projects" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Projects</Link></li>
            <li><Link to="/events" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Events</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-sm">Company</h4>
          <ul className="space-y-2.5">
            <li><Link to="/about" className="text-sm opacity-50 hover:opacity-100 transition-opacity">About Us</Link></li>
            <li><Link to="/developer" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Developer</Link></li>
            <li><Link to="/auth" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-sm">Quick Links</h4>
          <ul className="space-y-2.5">
            <li><Link to="/dashboard" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Dashboard</Link></li>
            <li><Link to="/messages" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Messages</Link></li>
            <li><Link to="/shares" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Shares</Link></li>
            <li><Link to="/info" className="text-sm opacity-50 hover:opacity-100 transition-opacity">Info & Tips</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm opacity-40">
        <p>© 2026 StudentHub by GenSync. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link to="/about">About</Link>
          <Link to="/developer">Developer</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
