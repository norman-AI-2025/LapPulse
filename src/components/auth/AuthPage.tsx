import React, { useState } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { InteractiveDotBackground } from '../common/InteractiveDotBackground';

export const AuthPage: React.FC = () => {
  const { login, signup, addToast } = useLabPulse();

  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Role: 'student' | 'lecturer' | 'admin'
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('Department of Software Engineering, FCSIT');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize department defaults when role changes
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'student') {
      setSignupDepartment('Department of Software Engineering, FCSIT');
    } else if (role === 'lecturer') {
      setSignupDepartment('Department of Artificial Intelligence, FCSIT');
    } else {
      setSignupDepartment('FCSIT Central Laboratory Operations Office');
    }
  };

  // Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setErrorMessage('Please enter your Matric Number, Staff ID, or Institutional Email.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = login({
        identifier,
        password: loginPassword,
        role: selectedRole
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 350);
  };

  // Sign up submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full official name.');
      return;
    }

    if (!signupId.trim()) {
      setErrorMessage(
        selectedRole === 'student'
          ? 'Please enter your 8-digit Siswa Matric Number.'
          : 'Please enter your Staff or Officer Directory ID.'
      );
      return;
    }

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    if (signupPassword.length > 0 && signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the FCSIT Laboratory Safety & Equipment Care policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = signup({
        name: signupName,
        role: selectedRole,
        matricOrStaffId: signupId,
        email: signupEmail,
        department: signupDepartment,
        password: signupPassword
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleForgotPassword = () => {
    addToast(
      'Password Reset Protocol',
      'Please consult the FCSIT IT Helpdesk at helpdesk.fcsit@um.edu.my or visit Block A Level 2.',
      'info'
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-slate-900 selection:text-white relative overflow-hidden">
      {/* Interactive Cursor-Tracking Dot Background */}
      <InteractiveDotBackground />

      {/* Main Container */}
      <div className="relative w-full max-w-xl z-10">
        
        {/* Institutional Header & Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-mono tracking-wider uppercase mb-3 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>UNIVERSITI MALAYA • FCSIT IDENTITY GATEWAY</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            LabPulse
          </h1>
        </div>

        {/* Bento Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-6 sm:p-8 backdrop-blur-xs">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              [SIGN IN]
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              [CREATE ACCOUNT]
            </button>
          </div>

          {/* Role Segment Selector Pills */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Identity Role
              </label>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                {selectedRole === 'student' && 'STUDENT PORTAL'}
                {selectedRole === 'lecturer' && 'ACADEMIC SUPERVISOR'}
                {selectedRole === 'admin' && 'TECHNICAL OFFICER'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                className={`py-2 px-2.5 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                [STUDENT]
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('lecturer')}
                className={`py-2 px-2.5 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
                  selectedRole === 'lecturer'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                [STAFF]
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-2.5 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                [OFFICER]
              </button>
            </div>

            {/* Context Notice for Role */}
            <div className="mt-2.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-700 shrink-0 mt-0.5" />
              <span>
                {selectedRole === 'student' &&
                  'Undergraduate & Postgraduate Siswa: Reserve 23 FCSIT computer labs, borrow hardware equipment, and generate digital check-in passes.'}
                {selectedRole === 'lecturer' &&
                  'Academic Staff & FYP Supervisors: Endorse high-resource compute allocations, sign off final year project reservations, and monitor student lab safety.'}
                {selectedRole === 'admin' &&
                  'Laboratory Technical Officers: Scanner Station hardware issuance, defect report maintenance triage, audit ledger, and lab occupancy matrix.'}
              </span>
            </div>
          </div>

          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. SIGN IN FORM */}
          {/* ========================================================= */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Identifier Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {selectedRole === 'student'
                    ? 'Siswa Matric Number or Email'
                    : selectedRole === 'lecturer'
                    ? 'Staff ID or Institutional Email'
                    : 'Technical Officer ID or Email'}
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === 'student'
                        ? 'e.g., student, 25005870, or student@siswa.um.edu.my'
                        : selectedRole === 'lecturer'
                        ? 'e.g., staff, UM-STAFF-19842, or staff@um.edu.my'
                        : 'e.g., officer, UM-OFFICER-0419, or officer@um.edu.my'
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Password / Passcode
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-medium text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Workstation Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember this session on this workstation
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <span>[SIGN IN TO LABPULSE]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* ========================================================= */
            /* 2. CREATE ACCOUNT FORM (SIGN UP) */
            /* ========================================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Full Official Name (as in UM Identity Card)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g., Sarah Tan Jia Ying"
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Matric or Staff ID */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  {selectedRole === 'student'
                    ? 'Siswa Matric Number (8 Digits)'
                    : selectedRole === 'lecturer'
                    ? 'Staff Directory ID'
                    : 'Technical Staff ID'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signupId}
                    onChange={(e) => setSignupId(e.target.value)}
                    placeholder={
                      selectedRole === 'student'
                        ? 'e.g., 25009184'
                        : selectedRole === 'lecturer'
                        ? 'e.g., UM-STAFF-20412'
                        : 'e.g., UM-TECH-0881'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'student'
                        ? 'name@siswa.um.edu.my'
                        : 'name@um.edu.my'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  FCSIT Academic Department / Division
                </label>
                <select
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900"
                >
                  <option value="Department of Software Engineering, FCSIT">
                    Department of Software Engineering
                  </option>
                  <option value="Department of Artificial Intelligence, FCSIT">
                    Department of Artificial Intelligence
                  </option>
                  <option value="Department of Computer Systems & Networking, FCSIT">
                    Department of Computer Systems & Networking
                  </option>
                  <option value="Department of Information Systems, FCSIT">
                    Department of Information Systems
                  </option>
                  <option value="FCSIT Central Laboratory Operations Office">
                    FCSIT Central Laboratory Operations Office
                  </option>
                </select>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Create Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-500 text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-slate-900 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-slate-600 leading-tight">
                    I agree to comply with Universiti Malaya FCSIT Laboratory Rules, Equipment Care, and Asset Security Policies.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] mt-2"
              >
                <span>[CREATE ACCOUNT & ENTER LABPULSE]</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>

        {/* Institutional Footer Tag */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Faculty of Computer Science & Information Technology • Universiti Malaya (UM)
          </p>
          <div className="mt-1 flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400">
            <span>[FCSIT SECURE GATEWAY]</span>
            <span>•</span>
            <span>[SSO 256-BIT ENCRYPTION]</span>
          </div>
        </div>

      </div>
    </div>
  );
};

