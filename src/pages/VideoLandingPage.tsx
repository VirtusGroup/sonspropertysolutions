import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, Briefcase, ClipboardList, User, Calendar, 
  MapPin, Phone, Camera, Check, Building2, Zap, Shield,
  ChevronRight, Play, RotateCcw
} from 'lucide-react';
import sonsLogo from '@/assets/sons-logo.png';
import roofRepairImg from '@/assets/roof-repair.jpg';
import roofInspectionImg from '@/assets/roof-inspection.jpg';
import gutterCleaningImg from '@/assets/gutter-cleaning.jpg';

const SCENE_DURATIONS = [4000, 4000, 4000, 3000, 7000, 3000, 3000, 0]; // Last scene stays
const TOTAL_DURATION = SCENE_DURATIONS.slice(0, -1).reduce((a, b) => a + b, 0);

export default function VideoLandingPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showReplay, setShowReplay] = useState(false);

  useEffect(() => {
    if (!isPlaying || currentScene >= 7) {
      if (currentScene >= 7) setShowReplay(true);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentScene(prev => prev + 1);
    }, SCENE_DURATIONS[currentScene]);

    return () => clearTimeout(timer);
  }, [currentScene, isPlaying]);

  const handleReplay = () => {
    setCurrentScene(0);
    setShowReplay(false);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-primary overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary-foreground/20 z-50">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentScene + 1) / 8) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene1BrandIntro key="scene1" />}
        {currentScene === 1 && <Scene2HomeScreen key="scene2" />}
        {currentScene === 2 && <Scene3Services key="scene3" />}
        {currentScene === 3 && <Scene4ServiceDetail key="scene4" />}
        {currentScene === 4 && <Scene5BookingMontage key="scene5" />}
        {currentScene === 5 && <Scene6Confirmation key="scene6" />}
        {currentScene === 6 && <Scene7ValueProps key="scene7" />}
        {currentScene === 7 && <Scene8CTA key="scene8" onReplay={handleReplay} showReplay={showReplay} />}
      </AnimatePresence>
    </div>
  );
}

// Scene 1: Brand Intro
function Scene1BrandIntro() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.img
        src={sonsLogo}
        alt="Sons Property Solutions"
        className="w-24 h-24 mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      />
      <motion.h1 
        className="text-3xl font-bold text-primary-foreground text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        Sons Property Solutions
      </motion.h1>
      <motion.p 
        className="text-primary-foreground/80 text-lg mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Your Home Service Partner
      </motion.p>
      
      {/* Animated rings */}
      <motion.div 
        className="absolute w-64 h-64 rounded-full border-2 border-accent/30"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 2, opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
    </motion.div>
  );
}

// Scene 2: Home Screen Preview
function Scene2HomeScreen() {
  const tiles = [
    { icon: Calendar, label: 'Book Service', highlight: true },
    { icon: ClipboardList, label: 'My Orders' },
    { icon: Briefcase, label: 'Services' },
    { icon: User, label: 'Account' },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-secondary to-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
    >
      {/* Phone Mockup */}
      <motion.div 
        className="relative w-full max-w-[280px] bg-background rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-foreground/10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {/* Status Bar */}
        <div className="h-8 bg-primary flex items-center justify-center">
          <div className="w-20 h-5 bg-foreground/20 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="p-4 flex items-center gap-2 border-b">
          <img src={sonsLogo} alt="" className="w-6 h-6" />
          <span className="font-semibold text-sm">Sons Property Solutions</span>
        </div>

        {/* Dashboard Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {tiles.map((tile, i) => (
            <motion.div
              key={tile.label}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 ${
                tile.highlight ? 'bg-accent text-accent-foreground' : 'bg-secondary'
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15, type: 'spring' }}
            >
              <tile.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tile.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tap Animation on Book Service */}
        <motion.div
          className="absolute top-[140px] left-[45px] w-10 h-10 rounded-full bg-foreground/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 1.2], 
            opacity: [0, 0.5, 0] 
          }}
          transition={{ delay: 2, duration: 0.8 }}
        />
      </motion.div>
    </motion.div>
  );
}

// Scene 3: Services Selection
function Scene3Services() {
  const services = [
    { title: 'Small Roof Repair', image: roofRepairImg, highlight: true },
    { title: 'Roof Inspection', image: roofInspectionImg },
    { title: 'Gutter Cleaning', image: gutterCleaningImg },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-secondary to-background p-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="relative w-full max-w-[280px] bg-background rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-foreground/10"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        {/* Header */}
        <div className="p-4 bg-primary text-primary-foreground">
          <h2 className="font-semibold">Our Services</h2>
        </div>

        {/* Service Cards */}
        <div className="p-4 space-y-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                service.highlight 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border bg-card'
              }`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden">
                  <img 
                    src={service.image} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-medium text-sm">{service.title}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        {/* Tap Animation */}
        {services[0].highlight && (
          <motion.div
            className="absolute top-[100px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-accent/50"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 0.6, 0] }}
            transition={{ delay: 2.5, duration: 0.6 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// Scene 4: Service Detail
function Scene4ServiceDetail() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-secondary to-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <motion.div 
        className="relative w-full max-w-[280px] bg-background rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-foreground/10"
      >
        {/* Hero Image */}
        <motion.div 
          className="h-32 relative overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: 128 }}
          transition={{ duration: 0.5 }}
        >
          <img src={roofRepairImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </motion.div>

        {/* Content */}
        <div className="p-4 -mt-4 relative">
          <motion.h2 
            className="font-bold text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Small Roof Repair
          </motion.h2>
          <motion.p 
            className="text-sm text-muted-foreground mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Professional repair for minor damage, leaks, and wear.
          </motion.p>
          
          <motion.button
            className="w-full mt-4 py-3 bg-accent text-accent-foreground rounded-xl font-semibold text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Service Request
          </motion.button>
        </div>

        {/* Tap Animation */}
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-accent-foreground/30"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 0.5, 0] }}
          transition={{ delay: 1.8, duration: 0.6 }}
        />
      </motion.div>
    </motion.div>
  );
}

// Scene 5: Booking Flow Montage
function Scene5BookingMontage() {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Building2, label: 'Property Type', detail: 'Residential' },
    { icon: MapPin, label: 'Address', detail: '123 Main St' },
    { icon: Phone, label: 'Contact', detail: 'john@email.com' },
    { icon: Camera, label: 'Photo', detail: 'Uploaded' },
    { icon: Calendar, label: 'Schedule', detail: 'Dec 15, Morning' },
    { icon: Check, label: 'Review', detail: 'Confirm Details' },
  ];

  useEffect(() => {
    if (step < 5) {
      const timer = setTimeout(() => setStep(s => s + 1), 1100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-primary to-primary/90 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-[300px]">
        {/* Step Progress */}
        <motion.div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${i <= step ? 'bg-accent' : 'bg-primary-foreground/30'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </motion.div>

        {/* Current Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="bg-background rounded-2xl p-6 shadow-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                {(() => {
                  const Icon = steps[step].icon;
                  return <Icon className="w-7 h-7 text-accent" />;
                })()}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{steps[step].label}</p>
                <p className="font-semibold text-lg">{steps[step].detail}</p>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>

        <motion.p 
          className="text-center text-primary-foreground/70 mt-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Quick & Easy Booking
        </motion.p>
      </div>
    </motion.div>
  );
}

// Scene 6: Confirmation
function Scene6Confirmation() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-success/20 to-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        {/* Success Checkmark */}
        <motion.div
          className="w-24 h-24 mx-auto rounded-full bg-success flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }}
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Check className="w-12 h-12 text-success-foreground" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <motion.h2 
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Request Received!
        </motion.h2>
        
        <motion.div
          className="mt-4 px-6 py-3 bg-secondary rounded-xl inline-block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-sm text-muted-foreground">Job Reference</p>
          <p className="font-mono font-bold text-lg text-primary">#SR-10001</p>
        </motion.div>

        {/* Confetti particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: i % 2 === 0 ? 'hsl(var(--accent))' : 'hsl(var(--success))',
              left: `${20 + Math.random() * 60}%`,
              top: '30%',
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ 
              y: 200 + Math.random() * 100, 
              x: (Math.random() - 0.5) * 100,
              opacity: 0,
              rotate: Math.random() * 360
            }}
            transition={{ duration: 1.5, delay: 0.3 + i * 0.05 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Scene 7: Value Props
function Scene7ValueProps() {
  const props = [
    { icon: Home, label: 'Residential & Commercial', color: 'bg-accent' },
    { icon: Zap, label: 'Fast Response', color: 'bg-warning' },
    { icon: Shield, label: 'Professional Service', color: 'bg-success' },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-secondary to-background p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="space-y-6 w-full max-w-[280px]">
        {props.map((prop, i) => (
          <motion.div
            key={prop.label}
            className="flex items-center gap-4 bg-card p-4 rounded-2xl shadow-lg"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.3, type: 'spring', stiffness: 150 }}
          >
            <div className={`w-12 h-12 rounded-xl ${prop.color} flex items-center justify-center`}>
              <prop.icon className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold">{prop.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Scene 8: Call to Action
function Scene8CTA({ onReplay, showReplay }: { onReplay: () => void; showReplay: boolean }) {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary to-primary/80 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.img
        src={sonsLogo}
        alt="Sons Property Solutions"
        className="w-20 h-20 mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      />
      
      <motion.h2 
        className="text-2xl font-bold text-primary-foreground text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Ready to Get Started?
      </motion.h2>
      
      <motion.p 
        className="text-primary-foreground/70 text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Book your service in under a minute
      </motion.p>

      <motion.div
        className="flex flex-col gap-3 w-full max-w-[240px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Link 
          to="/"
          className="w-full py-4 bg-accent text-accent-foreground rounded-xl font-semibold text-center flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Play className="w-5 h-5" />
          Get Started
        </Link>

        {showReplay && (
          <motion.button
            onClick={onReplay}
            className="w-full py-3 bg-primary-foreground/10 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <RotateCcw className="w-4 h-4" />
            Watch Again
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
