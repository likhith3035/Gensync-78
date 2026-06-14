import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_DISMISSED_KEY = "pwa-install-dismissed";
const SHOW_DELAY_MS = 5000; // 5 seconds
const RE_SHOW_DELAY_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if dismissed recently
    const dismissed = localStorage.getItem(PWA_DISMISSED_KEY);
    if (dismissed && Date.now() - parseInt(dismissed) < RE_SHOW_DELAY_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing the prompt
      setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
    setInstalling(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm animate-fade-in" onClick={dismiss} />

      {/* Prompt Card */}
      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[380px] z-[9999] animate-slide-up">
        <div className="bg-card rounded-3xl p-6 relative" style={{ boxShadow: "0 24px 80px -16px hsl(210 30% 15% / 0.2)" }}>
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-[1.25rem] gradient-primary flex items-center justify-center shadow-lg">
              <img src="/pwa-icon-192.png" alt="StudentHub" className="w-10 h-10 object-contain" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-5">
            <h3 className="text-lg font-bold text-foreground mb-1.5">Install StudentHub</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add this app to your home screen for quick access and a faster, better experience.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-muted-foreground bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {installing ? "Installing..." : "Install"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PwaInstallPrompt;
