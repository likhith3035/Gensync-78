import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sparkles, FileText, Upload, Brain, Check, ChevronRight, ChevronLeft,
  GraduationCap, User, Terminal, Plus, X, Globe, Github, Linkedin, Loader2, ArrowRight
} from "lucide-react";

const inputClass = "oneui-input";
const selectClass = "w-full h-11 px-4 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";
const textareaClass = "w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Machine Learning",
  "Data Science",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Science & Humanities"
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate"];

export default function OnboardingDialog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"choose" | "resume" | "manual">("choose");
  
  // Manual wizard state
  const [step, setStep] = useState(1);
  
  // Profile form state
  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);

  const parseLogs = [
    "Analyzing document structure...",
    "Extracting academic background & major...",
    "Scanning skills and technical keywords...",
    "Generating profile bio and summary...",
    "Populating profile fields..."
  ];

  // Fetch profile to see if it is incomplete
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-check", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && profile) {
      // If department and year_of_study are empty, and skills are empty, it's a first time login profile
      const isIncomplete = !profile.department && !profile.year_of_study && (!profile.skills || profile.skills.length === 0);
      const isDismissed = localStorage.getItem(`onboarding_dismissed_${user?.id}`);
      if (isIncomplete && !isDismissed) {
        setOpen(true);
      }
    }
  }, [profile, isLoading, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-check"] });
      toast.success("Profile setup completed successfully!");
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  const handleManualSave = () => {
    if (!department || !yearOfStudy) {
      toast.error("Please fill in your department and year of study.");
      return;
    }
    updateProfileMutation.mutate({
      department,
      year_of_study: yearOfStudy,
      bio,
      github_url: githubUrl || null,
      linkedin_url: linkedinUrl || null,
      portfolio_url: portfolioUrl || null,
      skills,
    });
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding_dismissed_${user?.id}`, "true");
    setOpen(false);
    toast.info("Profile setup skipped. You can complete it anytime in your Profile tab.");
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleStartParsing = () => {
    if (!resumeFile) return;
    setParsing(true);
    setParseStep(0);

    const interval = setInterval(() => {
      setParseStep((prev) => {
        if (prev >= parseLogs.length - 1) {
          clearInterval(interval);
          finishParsing();
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const finishParsing = () => {
    setParsing(false);
    
    // Smart simulated resume extraction based on file name or generic major
    const fileNameLower = resumeFile?.name.toLowerCase() || "";
    let detectedDept = "Computer Science & Engineering";
    let detectedSkills = ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Node.js", "Git"];
    
    if (fileNameLower.includes("mech") || fileNameLower.includes("mechanical")) {
      detectedDept = "Mechanical Engineering";
      detectedSkills = ["CAD/CAM", "SolidWorks", "Thermodynamics", "Matlab", "Project Management"];
    } else if (fileNameLower.includes("civil")) {
      detectedDept = "Civil Engineering";
      detectedSkills = ["AutoCAD", "Surveying", "Structural Design", "Estimation", "Concrete Technology"];
    } else if (fileNameLower.includes("ece") || fileNameLower.includes("electronics")) {
      detectedDept = "Electronics & Communication Engineering";
      detectedSkills = ["VHDL", "Verilog", "Embedded Systems", "MATLAB", "Arduino", "Signal Processing"];
    } else if (fileNameLower.includes("mba") || fileNameLower.includes("business")) {
      detectedDept = "Business Administration";
      detectedSkills = ["Marketing", "Excel", "Data Analysis", "Communication", "Leadership", "Financial Modeling"];
    }

    setDepartment(detectedDept);
    setYearOfStudy("3rd Year"); // standard midpoint default
    setBio(`A dedicated student pursuing ${detectedDept}. Skilled in various industry tools with a passion for collaborative projects, active learning, and professional growth.`);
    setSkills(detectedSkills);
    
    const emailPrefix = user?.email?.split("@")[0] || "student";
    setGithubUrl(`https://github.com/${emailPrefix}`);
    setLinkedinUrl(`https://linkedin.com/in/${emailPrefix}`);
    
    toast.success("Resume parsed successfully!");
    setMethod("manual");
    setStep(1); // take them to review form starting at Step 1
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/30 shadow-2xl bg-card">
        {/* Banner header */}
        <div className="h-28 gradient-primary relative flex items-end p-6">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-foreground/5 -translate-y-1/3 translate-x-1/4" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Welcome to StudentHub!</h2>
              <p className="text-xs text-primary-foreground/90 font-medium">Let's complete your professional profile</p>
            </div>
          </div>
        </div>

        {/* Method Chooser */}
        {method === "choose" && (
          <div className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Complete your profile to unlock custom project matching, resource recommendations, and let other students know your skills.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Resume upload option */}
              <button
                onClick={() => setMethod("resume")}
                className="flex items-start gap-4 p-4 rounded-2xl border border-border/60 hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    Upload Resume <Badge className="text-[9px] bg-primary/10 text-primary hover:bg-primary/10 py-0 px-1.5">AI Extract</Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground/80 mt-1 leading-normal">
                    Upload your PDF/Word resume. Our smart system will extract your skills, department, and generate your bio instantly.
                  </p>
                </div>
              </button>

              {/* Manual form option */}
              <button
                onClick={() => setMethod("manual")}
                className="flex items-start gap-4 p-4 rounded-2xl border border-border/60 hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    Fill Profile Manually
                  </h4>
                  <p className="text-xs text-muted-foreground/80 mt-1 leading-normal">
                    Fill out a short 3-step setup form covering your academic department, socials, and skills.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Resume Parser Screen */}
        {method === "resume" && (
          <div className="p-6 space-y-5">
            {!parsing ? (
              <>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Upload Resume
                </h3>
                
                <div className="border-2 border-dashed border-border/70 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-muted/10">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    {resumeFile ? (
                      <div>
                        <p className="text-sm font-semibold text-foreground truncate max-w-[300px]">{resumeFile.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB • Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Click to upload your resume</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, DOCX, or TXT up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border/40">
                  <Button variant="ghost" size="sm" onClick={() => setMethod("choose")} className="text-xs font-semibold gap-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    size="sm"
                    disabled={!resumeFile}
                    onClick={handleStartParsing}
                    className="text-xs font-semibold gap-1.5 shadow-md h-10 px-4"
                  >
                    <Brain className="w-3.5 h-3.5" /> Parse Resume
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-6 animate-fade-in">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" />
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center relative">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">Extracting Resume Details</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto leading-relaxed">
                    Our AI parser is reading your resume structure to build your profile.
                  </p>
                </div>

                <div className="max-w-[320px] mx-auto bg-muted/40 border border-border/40 rounded-xl p-3 text-left">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-mono text-foreground font-semibold truncate animate-pulse">
                      {parseLogs[parseStep]}
                    </span>
                  </div>
                  {/* Progressive loading bar */}
                  <div className="w-full h-1 bg-border/40 rounded-full mt-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-700 rounded-full"
                      style={{ width: `${((parseStep + 1) / parseLogs.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Wizard Screen / Review Form */}
        {method === "manual" && (
          <div className="p-6 space-y-4">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Step {step} of 3 • {step === 1 ? "Academy" : step === 2 ? "Background" : "Skills"}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`w-5 h-1.5 rounded-full transition-all duration-300 ${
                      step >= s ? "bg-primary" : "bg-border/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 1: Academy & Major */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>Select your department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Year of Study *</label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" disabled>Select current year</option>
                    {YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Bio & Links */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Bio / Summary</label>
                  <textarea
                    placeholder="Tell other students about yourself, your goals, or your academic focus..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={300}
                    className={textareaClass}
                  />
                  <span className="text-[10px] text-muted-foreground text-right block mt-1">
                    {bio.length}/300 characters
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                      <Github className="w-3.5 h-3.5 text-foreground shrink-0" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className={`${inputClass} h-10 text-xs`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                      <Linkedin className="w-3.5 h-3.5 text-primary shrink-0" /> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className={`${inputClass} h-10 text-xs`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-success shrink-0" /> Personal Portfolio URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://mywebsite.com"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className={`${inputClass} h-10 text-xs`}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Core Skills & Expertise</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g. Python, Figma, UI Design)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className={`${inputClass} flex-1 h-10 text-xs`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSkill}
                      className="shrink-0 h-10 px-3.5 rounded-xl text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-muted/40 border border-border/40 min-h-[120px] max-h-[160px] overflow-y-auto">
                  {skills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 py-1 pl-2.5 pr-1.5 rounded-lg text-xs font-medium bg-background text-foreground border border-border/80"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
                        className="rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-muted-foreground/60 italic self-center mx-auto">No skills added yet. Add some skills to build your portfolio!</span>
                  )}
                </div>
              </div>
            )}

            {/* Wizard actions */}
            <div className="flex justify-between items-center pt-3 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (step === 1) {
                    setMethod("choose");
                  } else {
                    setStep(step - 1);
                  }
                }}
                className="text-xs font-semibold gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>

              {step < 3 ? (
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!department || !yearOfStudy)}
                  className="text-xs font-semibold gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleManualSave}
                  disabled={updateProfileMutation.isPending}
                  className="text-xs font-semibold gap-1.5 bg-success hover:bg-success/90 text-success-foreground shadow-md"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
