import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Lock, Phone, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginModal({ isOpen, onClose }) {
  const { login, register, switchDemoRole } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('student'); // 'student' or 'staff'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!phone || phone.length < 10) {
          throw new Error('Please enter a valid 10-digit mobile number.');
        }
        await register({ name, phone, email, password, role });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole) => {
    switchDemoRole(demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-2 font-bold shadow-xs">
            {role === 'staff' ? <ShieldCheck className="w-6 h-6 text-emerald-800" /> : <User className="w-6 h-6 text-emerald-800" />}
          </div>
          <h2 className="text-xl font-black text-emerald-950">
            {mode === 'login' ? 'Sign In to CanteenQ' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Smart queue tokens, order tracking, and meal notifications.
          </p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Instant 1-Click Demo Login
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('student')}
              className="px-3 py-1 bg-emerald-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors shadow-2xs"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('staff')}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-2xs"
            >
              Demo Staff KDS
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Role selector if registering */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  role === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  role === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Canteen Staff
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg('');
            }}
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

      </div>
    </div>
  );
}
