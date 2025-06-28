import React, { useState } from 'react';
import { useAuth, useDarkMode } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Layout from './Layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'doctor' | 'patient'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { login, signup } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      if (userType === 'doctor') {
        // For doctors, we'll use predefined credentials
        if (email === 'doctor1@hospital.com' && password === 'doctor123') {
          // Simulate login for doctor
          localStorage.setItem('userType', 'doctor');
          localStorage.setItem('doctorId', 'doctor1');
          navigate('/doctor-dashboard');
        } else if (email === 'doctor2@hospital.com' && password === 'doctor456') {
          localStorage.setItem('userType', 'doctor');
          localStorage.setItem('doctorId', 'doctor2');
          navigate('/doctor-dashboard');
        } else {
          setError('Invalid doctor credentials');
        }
      } else {
        // For patients, use Firebase authentication
        if (!email || !password) {
          setError('Please enter a valid email and password.');
          setLoading(false);
          return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await login(email, password);
        localStorage.setItem('userType', 'patient');
        navigate('/patient-dashboard');
      }
    } catch (error) {
      setError('Failed to log in');
    }

    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    // Validation for sign up
    if (!name) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    if (!email || !password) {
      setError('Please enter a valid email and password.');
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      localStorage.setItem('userType', 'patient');
      localStorage.setItem('patientName', name);
      // Save patient info to backend
      const user = auth.currentUser;
      if (user) {
        await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.uid,
            name,
            email,
            age: 0,
            diagnosis: '',
            history: [],
            selectedDoctor: ''
          })
        });
      }
      navigate('/patient-dashboard');
    } catch (error) {
      setError('Failed to create an account');
    }

    setLoading(false);
  }

  // Reset fields when switching between login and signup
  function handleShowSignup(val: boolean) {
    setShowSignup(val);
    setError('');
    setLoading(false);
    setName('');
    setEmail('');
    setPassword('');
  }

  return (
    <Layout title="Login">
      <Card className={`w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isDarkMode 
          ? 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-800/60' 
          : 'bg-white/50 border-gray-200 text-gray-900 hover:bg-white/70'
      }`}>
        <div className="text-center">
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Welcome Back</h1>
          <p className={`text-sm sm:text-base mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Sign in to your account</p>
        </div>

        <div className={`flex space-x-1 p-1 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <button
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              userType === 'patient'
                ? isDarkMode 
                  ? 'bg-gray-600 text-white shadow-sm' 
                  : 'bg-white text-gray-900 shadow-sm'
                : isDarkMode 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setUserType('patient')}
            disabled={showSignup}
          >
            Patient
          </button>
          <button
            className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              userType === 'doctor'
                ? isDarkMode 
                  ? 'bg-gray-600 text-white shadow-sm' 
                  : 'bg-white text-gray-900 shadow-sm'
                : isDarkMode 
                  ? 'text-gray-300 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setUserType('doctor')}
            disabled={showSignup}
          >
            Doctor
          </button>
        </div>

        {error && (
          <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm ${
            isDarkMode 
              ? 'bg-red-900/50 border border-red-700 text-red-300' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {error}
          </div>
        )}

        {/* Login Form */}
        {!showSignup && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Sign Up Form for Patient */}
        {showSignup && userType === 'patient' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !name || !email || !password}
              className="w-full"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => handleShowSignup(false)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Sign up link for patient */}
        {!showSignup && userType === 'patient' && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => handleShowSignup(true)}
                disabled={loading}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        )}

        {userType === 'doctor' && !showSignup && (
          <div className={`p-3 sm:p-4 rounded-md ${
            isDarkMode 
              ? 'bg-blue-900/50 border border-blue-700' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <h3 className={`font-medium mb-2 text-sm sm:text-base ${
              isDarkMode ? 'text-blue-200' : 'text-blue-900'
            }`}>Doctor Credentials:</h3>
            <div className={`text-xs sm:text-sm space-y-1 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <p>Doctor 1: doctor1@hospital.com / doctor123</p>
              <p>Doctor 2: doctor2@hospital.com / doctor456</p>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
} 