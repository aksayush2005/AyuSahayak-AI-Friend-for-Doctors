import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { useEffect, useState, useRef } from 'react';
import { Heart, Stethoscope, Shield, Zap, Users, Brain, Clock, Award } from 'lucide-react';
import './App.css';

function ModernHomePage() {
  const [displayText, setDisplayText] = useState('AyuSahayak');
  const [showSecond, setShowSecond] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    observerRef.current = observer;

    setTimeout(() => {
      document.querySelectorAll('[data-animate]').forEach(section => {
        observer.observe(section);
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowSecond(true);
      setDisplayText('AI Friend For Doctors');
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: <Brain className="w-8 h-8" />, title: "AI-Powered Diagnostics", description: "Advanced machine learning algorithms assist in accurate diagnosis and treatment recommendations.", gradient: "from-purple-500 to-pink-500" },
    { icon: <Stethoscope className="w-8 h-8" />, title: "Smart Health Monitoring", description: "Real-time patient monitoring with intelligent alerts and comprehensive health tracking.", gradient: "from-blue-500 to-cyan-500" },
    { icon: <Shield className="w-8 h-8" />, title: "Secure & Compliant", description: "HIPAA compliant platform ensuring complete privacy and security of medical data.", gradient: "from-green-500 to-emerald-500" },
    { icon: <Zap className="w-8 h-8" />, title: "Lightning Fast", description: "Instant access to patient records, prescriptions, and medical history with zero delays.", gradient: "from-yellow-500 to-orange-500" },
    { icon: <Users className="w-8 h-8" />, title: "Collaborative Care", description: "Seamless communication between healthcare providers for coordinated patient care.", gradient: "from-indigo-500 to-purple-500" },
    { icon: <Clock className="w-8 h-8" />, title: "24/7 Availability", description: "Round-the-clock access to essential healthcare tools and emergency support systems.", gradient: "from-red-500 to-pink-500" }
  ];

  const stats = [
    { number: "10K+", label: "Active Doctors", icon: <Stethoscope className="w-6 h-6" /> },
    { number: "50K+", label: "Patients Served", icon: <Heart className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Shield className="w-6 h-6" /> },
    { number: "4.9★", label: "Rating", icon: <Award className="w-6 h-6" /> }
  ];

  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  return (
    <div className="bg-gray-900 text-white overflow-hidden">
    {/* Animated Background */}
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at ${50 + scrollY * 0.1}% ${50 + scrollY * 0.05}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
        }}
      ></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>

    {/* Floating Navigation */}
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20 shadow-2xl w-max mx-auto">
      <div className="flex items-center space-x-8">
        <div className="text-xl font-bold text-white" style={{textShadow: '0 1px 8px rgba(0,0,0,0.25)'}}>
          AyuSahayak
        </div>
        <div className="hidden md:flex space-x-6 text-sm">
          <a href="#features" className="hover:text-purple-300 transition-colors cursor-pointer">Features</a>
          <a href="#stats" className="hover:text-purple-300 transition-colors cursor-pointer">Stats</a>
          <a href="#about" className="hover:text-purple-300 transition-colors cursor-pointer">About</a>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <section className="relative min-h-screen flex items-center justify-center px-6 z-10">
      <div className="text-center max-w-4xl mx-auto">
        <div 
          className="mb-6"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
            {displayText}
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
        </div>
        
        <p 
          className={`text-xl md:text-2xl text-gray-300 mb-8 transition-all duration-1000 ${showSecond ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        >
          Your trusted AI-powered assistant for modern healthcare and prescription management.
        </p>
        
        <div 
          className={`transition-all duration-1000 delay-500 ${showSecond ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <button
            onClick={handleGetStarted}
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
        <Stethoscope className="w-8 h-8 text-white/50 animate-pulse" />
      </div>
    </section>

    {/* Stats Section */}
    <section 
      id="stats" 
      data-animate
      className={`py-20 px-6 relative z-10 transition-all duration-1000 ${isVisible.stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: isVisible.stats ? `fadeInUp 0.8s ease-out forwards` : 'none'
              }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="text-purple-400 mb-3 flex justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section 
      id="features" 
      data-animate
      className={`py-20 px-6 relative z-10 transition-all duration-1000 ${isVisible.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Revolutionary Features
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of healthcare with our cutting-edge AI technology and intuitive design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animation: isVisible.features ? `fadeInUp 0.8s ease-out forwards` : 'none'
              }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* About Section */}
    <section 
      id="about" 
      data-animate
      className={`py-20 px-6 relative z-10 transition-all duration-1000 ${isVisible.about ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          The Future is Here
        </h2>
        <p className="text-xl text-gray-300 leading-relaxed mb-8">
          AyuSahayak represents the next generation of healthcare technology, where artificial intelligence meets human compassion. Our platform empowers healthcare professionals with intelligent tools while ensuring patients receive personalized, efficient care.
        </p>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
          <p className="text-lg text-gray-400 italic">
            "Bridging the gap between technology and healthcare, one patient at a time."
          </p>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 px-6 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of healthcare professionals who trust AyuSahayak for their daily practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
            >
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full text-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="relative z-10 py-12 px-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              AyuSahayak
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Revolutionizing healthcare through AI innovation. Empowering doctors, caring for patients.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors cursor-pointer">
                <Heart className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors cursor-pointer">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors cursor-pointer">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Features</li>
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Pricing</li>
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Security</li>
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Integrations</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Documentation</li>
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-purple-300 cursor-pointer transition-colors">Status</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} AyuSahayak. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

    {/* Custom Styles */}
    {/* @ts-ignore */}
    <style jsx>{`
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #8b5cf6, #ec4899);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #7c3aed, #db2777);
      }
    `}</style>
  </div>

  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ width: '100%', height: '100vh' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/" element={<ModernHomePage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
