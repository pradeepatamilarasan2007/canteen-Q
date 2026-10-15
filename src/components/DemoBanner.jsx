import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, UserCheck, ShieldCheck, Database } from 'lucide-react';

export default function DemoBanner() {
  const { isFirebaseConfigured, currentUser, switchDemoRole } = useAuth();

  return (
    <div className="bg-emerald-900 text-emerald-50 text-xs px-3 sm:px-6 py-2 border-b border-emerald-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Database className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>
            {isFirebaseConfigured ? (
              <span className="font-semibold text-emerald-200">
                Connected to Cloud Firestore & Firebase Auth
              </span>
            ) : (
              <span>
                <strong className="text-emerald-300 font-bold">Demo Mode:</strong> Operating with local storage / demo data. Configure Firebase in <code className="bg-emerald-950/60 px-1 py-0.5 rounded text-[11px]">.env</code> to connect to live Cloud Firestore.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-200 hidden md:inline">
            Active: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role})
          </span>
          <div className="flex items-center bg-emerald-950/80 rounded-lg p-0.5 border border-emerald-700/60">
            <button
              onClick={() => switchDemoRole('student')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                currentUser?.role === 'student'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Test as College Student"
            >
              <UserCheck className="w-3 h-3" />
              <span>Student</span>
            </button>
            <button
              onClick={() => switchDemoRole('staff')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                currentUser?.role === 'staff'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Test as Canteen Staff / Kitchen"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Staff KDS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
