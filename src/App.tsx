import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Cpu, 
  Target, 
  Zap, 
  Settings, 
  ChevronRight, 
  RefreshCw, 
  Info,
  CheckCircle2,
  AlertCircle,
  Flame,
  ShieldCheck,
  Star,
  Send
} from 'lucide-react';
import { generateSensitivity } from './services/geminiService';
import { SensitivitySettings, DeviceOS } from './types';
import { cn } from './lib/utils';
import { submitFeedback } from './firebase';

const DEVICE_DATA: Record<DeviceOS, Record<string, string[]>> = {
  Android: {
    Samsung: ['S24 Ultra', 'S23 Ultra', 'S22 Ultra', 'A54', 'A34', 'M54', 'Note 20 Ultra'],
    Xiaomi: ['Redmi Note 13 Pro', 'Redmi Note 12', 'Xiaomi 14', 'Poco F5', 'Poco X6 Pro', 'Mi 11'],
    Realme: ['GT Neo 5', 'Realme 12 Pro+', 'Realme 11', 'Narzo 60', 'C55'],
    Vivo: ['V30 Pro', 'V29', 'Y200', 'T2 Pro', 'X100 Pro'],
    Oppo: ['Reno 11', 'Reno 10 Pro', 'F25 Pro', 'A78', 'Find X7'],
    OnePlus: ['12', '12R', '11', 'Nord CE 4', 'Nord 3'],
    Infinix: ['Note 40 Pro', 'Hot 40', 'Zero 30', 'Smart 8'],
    Tecno: ['Camon 30', 'Pova 6 Pro', 'Spark 20 Pro', 'Phantom X2'],
    Other: ['Generic Android']
  },
  iOS: {
    Apple: ['iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone SE (2022)', 'iPad Pro', 'iPad Air'],
    Other: ['Generic iOS']
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [os, setOs] = useState<DeviceOS>('Android');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SensitivitySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Reset brand/model when OS changes
  useEffect(() => {
    setBrand('');
    setModel('');
  }, [os]);

  // Reset model when brand changes
  useEffect(() => {
    setModel('');
  }, [brand]);

  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand === 'Custom' ? customBrand : brand;
    const finalModel = model === 'Custom' ? customModel : model;

    if (!finalBrand || !finalModel) {
      setError('Please select or enter both brand and model.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateSensitivity(os, finalBrand, finalModel);
      setResult(data);
    } catch (err) {
      setError('Failed to generate settings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setBrand('');
    setModel('');
    setCustomBrand('');
    setCustomModel('');
    setRating(0);
    setComment('');
    setFeedbackSuccess(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmittingFeedback(true);
    try {
      await submitFeedback({
        rating,
        comment,
        device: `${brand === 'Custom' ? customBrand : brand} ${model === 'Custom' ? customModel : model}`,
        os
      });
      setFeedbackSuccess(true);
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a15] text-white font-sans selection:bg-blue-500/30">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050a15] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 mb-6">
                <Target className="text-white" size={48} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter">
                AI <span className="text-blue-500">SENSI</span>
              </h1>
              <div className="mt-8 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <ShieldCheck size={14} />
            Verified AI Algorithm
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-blue-400 bg-clip-text text-transparent"
          >
            AI <span className="text-blue-500">SENSI</span> GENERATOR
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200/60 text-lg max-w-xl mx-auto"
          >
            Get deterministic, professional sensitivity settings and DPI tailored to your specific device model.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-5"
          >
            <div className="bg-[#0d1525] border border-blue-500/10 rounded-2xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Smartphone className="text-blue-500" size={20} />
                Device Selection
              </h2>

              <form onSubmit={handleGenerate} className="space-y-6">
                {/* OS Toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400/50 uppercase tracking-widest">Platform</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                    {(['Android', 'iOS'] as DeviceOS[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setOs(option)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-bold transition-all duration-200",
                          os === option 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400/50 uppercase tracking-widest">Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Brand</option>
                    {Object.keys(DEVICE_DATA[os]).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="Custom">Other (Manual Entry)</option>
                  </select>
                </div>

                {brand === 'Custom' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-bold text-blue-400/50 uppercase tracking-widest">Enter Brand Name</label>
                    <input
                      type="text"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      placeholder="e.g. Asus, Motorola"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </motion.div>
                )}

                {/* Model Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-400/50 uppercase tracking-widest">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!brand}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled>Select Model</option>
                    {brand && brand !== 'Custom' && DEVICE_DATA[os][brand].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Custom">Other (Manual Entry)</option>
                  </select>
                </div>

                {model === 'Custom' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-bold text-blue-400/50 uppercase tracking-widest">Enter Model Name</label>
                    <input
                      type="text"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder="e.g. ROG Phone 8, Moto Edge 40"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </motion.div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-red-400 text-xs font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                    >
                      <AlertCircle size={14} />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                    loading 
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                  )}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Calculating...
                    </>
                  ) : (
                    <>
                      Generate Sensi
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.section>

          {/* Results Section */}
          <section className="md:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-[#0d1525]/50 border border-dashed border-blue-500/10 rounded-2xl"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500/5 flex items-center justify-center mb-6">
                    <Target className="text-blue-900" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-blue-400/60 mb-2">Ready to Dominate?</h3>
                  <p className="text-blue-200/30 max-w-xs">Select your device to generate AI-optimized sensitivity settings.</p>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-[#0d1525] border border-blue-500/10 rounded-2xl"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Processing</h3>
                  <p className="text-blue-200/40 max-w-xs">Optimizing for {brand === 'Custom' ? customBrand : brand} {model === 'Custom' ? customModel : model}...</p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Main Result Card */}
                  <div className="bg-[#0d1525] border border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        <span className="font-black uppercase tracking-widest text-sm">AI Generated Result</span>
                      </div>
                      <button 
                        onClick={reset}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        <SensiItem label="General" value={result!.general} icon={<Settings size={14} />} />
                        <SensiItem label="Red Dot" value={result!.redDot} icon={<Target size={14} />} />
                        <SensiItem label="2x Scope" value={result!.scope2x} />
                        <SensiItem label="4x Scope" value={result!.scope4x} />
                        <SensiItem label="Sniper" value={result!.sniperScope} />
                        <SensiItem label="Free Look" value={result!.freeLook} />
                      </div>

                      {/* Fire Button & DPI Highlight */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex items-center justify-between">
                          <div>
                            <h4 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Fire Button</h4>
                            <p className="text-blue-200/40 text-[10px]">Best for {model === 'Custom' ? customModel : model}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Flame className="text-blue-500 animate-pulse" size={24} />
                            <span className="text-3xl font-black text-white">{result!.fireButtonSize}%</span>
                          </div>
                        </div>
                        {os === 'Android' && (
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-6 flex items-center justify-between">
                            <div>
                              <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">DPI Value</h4>
                              <p className="text-cyan-200/40 text-[10px]">Recommended DPI</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Zap className="text-cyan-500" size={24} />
                              <span className="text-3xl font-black text-white">{result!.dpi}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-black/40 px-6 py-4 border-t border-white/5 flex gap-3">
                      <Info className="text-blue-400/40 shrink-0 mt-1" size={16} />
                      <p className="text-blue-200/30 text-xs leading-relaxed italic">
                        {result!.deviceInfo}
                      </p>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0d1525] border border-blue-500/10 rounded-2xl p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Star className="text-yellow-500" size={16} />
                        Rate these settings
                      </h4>
                      {feedbackSuccess && (
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Feedback Sent!
                        </span>
                      )}
                    </div>

                    {!feedbackSuccess ? (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none transition-transform active:scale-90"
                            >
                              <Star 
                                size={24} 
                                className={cn(
                                  "transition-colors",
                                  rating >= star ? "fill-yellow-500 text-yellow-500" : "text-gray-700"
                                )} 
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Any comments or suggestions? (Optional)"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-500/50 transition-colors min-h-[80px] resize-none"
                        />
                        <button
                          type="submit"
                          disabled={rating === 0 || submittingFeedback}
                          className={cn(
                            "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
                            rating === 0 || submittingFeedback
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                              : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20"
                          )}
                        >
                          {submittingFeedback ? (
                            <RefreshCw className="animate-spin" size={14} />
                          ) : (
                            <>
                              Submit Feedback
                              <Send size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-blue-200/40 italic">
                        Thank you for your feedback! We use this data to improve our AI models for everyone.
                      </p>
                    )}
                  </motion.div>

                  {/* Tips Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0d1525]/50 border border-blue-500/10 rounded-2xl p-6"
                  >
                    <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                      <Zap className="text-blue-500" size={16} />
                      Pro Tips
                    </h4>
                    <ul className="space-y-3">
                      <li className="text-xs text-blue-200/40 flex gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        Deterministic generation: Same model always gets same results.
                      </li>
                      <li className="text-xs text-blue-200/40 flex gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        Adjust "General" if you feel the screen rotation is too slow.
                      </li>
                      <li className="text-xs text-blue-200/40 flex gap-2">
                        <span className="text-orange-500 font-bold">•</span>
                        Clean your screen regularly for better touch response.
                      </li>
                    </ul>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-blue-200/20 text-xs">
            &copy; {new Date().getFullYear()} AI SENSI. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

function SensiItem({ label, value, icon }: { label: string, value: number, icon?: React.ReactNode }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-colors group">
      <div className="flex items-center gap-1.5 mb-2">
        {icon && <span className="text-blue-400/40 group-hover:text-blue-500 transition-colors">{icon}</span>}
        <span className="text-[10px] font-bold text-blue-400/40 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-black text-white">{value}</span>
        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error && parsed.error.includes("Missing or insufficient permissions")) {
          errorMessage = "Security error: You don't have permission to perform this action.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#050a15] flex items-center justify-center p-4">
          <div className="bg-[#0d1525] border border-red-500/20 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Application Error</h2>
            <p className="text-blue-200/40 text-sm mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
