import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Share, Plus, CheckCircle2, Apple } from 'lucide-react';

export default function InstallPage() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <CardTitle>App Installed!</CardTitle>
            <CardDescription>
              Sons Property Solutions is ready to use from your home screen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/">Go to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <Smartphone className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Install Our App</h1>
          <p className="text-lg opacity-90">
            Get quick access to book services and track orders
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Why Install?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Quick Access</p>
                  <p className="text-sm text-muted-foreground">
                    Launch directly from your home screen
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Offline Access</p>
                  <p className="text-sm text-muted-foreground">
                    View your orders even without internet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Fast & Lightweight</p>
                  <p className="text-sm text-muted-foreground">
                    No app store downloads, instant updates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installation Instructions */}
          {isIOS ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  <CardTitle>iOS Installation</CardTitle>
                </div>
                <CardDescription>Follow these steps to install on iPhone/iPad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                    1
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Tap the Share button</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Share className="h-4 w-4" />
                      <span>Look for the share icon in Safari toolbar</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                    2
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Select "Add to Home Screen"</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Plus className="h-4 w-4" />
                      <span>Scroll down and tap the add option</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                    3
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">
                      The app icon will appear on your home screen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : deferredPrompt ? (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Install</CardTitle>
                <CardDescription>
                  Click the button below to add to your home screen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleInstall} size="lg" className="w-full">
                  <Plus className="h-5 w-5 mr-2" />
                  Install App
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Android Installation</CardTitle>
                <CardDescription>Follow these steps to install on Android</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                    1
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Open browser menu</p>
                    <p className="text-sm text-muted-foreground">
                      Tap the three dots in the top right
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                    2
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Select "Add to Home screen"</p>
                    <p className="text-sm text-muted-foreground">
                      Or "Install app" depending on your browser
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="rounded-full h-6 w-6 flex items-center justify-center p-0">
                    3
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Confirm installation</p>
                    <p className="text-sm text-muted-foreground">
                      The app icon will appear on your home screen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
