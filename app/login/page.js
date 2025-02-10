'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Loader2 } from 'lucide-react';
import loginBg from './images/login-bg.jpg'

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
        credentials: 'include'
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Successful login
      if (data.user.role === 'ADMIN') {
        router.push('/manage-employees');
      } else {
        router.push('/employee-dashboard');
      }
      
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.4)), 
            url(${loginBg.src})`
        }}
      />

      {/* Content Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[400px]"
        >
          {/* Login Card */}
          <div className="backdrop-blur-md bg-white/10 rounded-3xl overflow-hidden">
            {/* Login Header */}
            <div className="bg-white/20 py-4 px-6 text-center">
              <h1 className="text-2xl font-semibold text-white">Login</h1>
            </div>

            {/* Login Form */}
            <div className="p-6 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-100 
                    px-4 py-3 rounded-xl text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Employee ID Input */}
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-black/20 border border-white/10 rounded-xl 
                      text-white placeholder-white/60
                      focus:outline-none focus:ring-2 focus:ring-white/20
                      transition-all duration-200"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-white/60" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 bg-black/20 border border-white/10 rounded-xl 
                      text-white placeholder-white/60
                      focus:outline-none focus:ring-2 focus:ring-white/20
                      transition-all duration-200"
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm text-white/80">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-black/20" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="hover:text-white transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-white/20 hover:bg-white/30
                    focus:ring-2 focus:ring-white/20 focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    rounded-xl text-white font-medium
                    transition-all duration-300"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center text-white/60 text-sm">
                Need help? <a href="#" className="text-white hover:underline">Contact Support</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 