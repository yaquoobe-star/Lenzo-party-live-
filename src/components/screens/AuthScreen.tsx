import React, { useState } from 'react';
import { LonzoLogo } from '../common/LonzoLogo';
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
  onSkip?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onSkip }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 5) {
      setMessage('Please enter a valid mobile number');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setMessage(`Demo OTP sent to ${countryCode} ${phoneNumber}: 123456`);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 700);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setMessage(`Logging in with ${provider}...`);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#090611] overflow-hidden select-none">
      {/* Background neon ambient waves */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#8B20FF]/25 blur-[120px]" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#F328D5]/20 blur-[130px]" />
      </div>

      {/* Skip button for quick demo browsing */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onSuccess}
          className="text-xs text-[#B9AECF] hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-colors"
        >
          Explore as Guest ›
        </button>
      </div>

      <div className="w-full max-w-sm sm:max-w-md bg-[#160C25]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl z-10">
        {step === 'otp' ? (
          /* OTP Entry Step */
          <div className="flex flex-col items-center text-center animate-fade-in">
            <button
              onClick={() => setStep('phone')}
              className="self-start mb-4 text-xs text-[#B9AECF] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B20FF] to-[#F328D5] flex items-center justify-center text-white mb-4 shadow-lg shadow-[#F328D5]/30">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white font-display mb-1">Enter Verification Code</h2>
            <p className="text-xs text-[#B9AECF] mb-6">
              We sent a 6-digit code to <span className="text-white font-mono">{countryCode} {phoneNumber}</span>
            </p>

            {message && (
              <div className="w-full bg-[#8B20FF]/20 border border-[#8B20FF]/40 text-[#c47bf7] text-xs py-2 px-3 rounded-xl mb-4 text-center">
                {message}
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div className="flex items-center justify-center gap-2 mb-6 w-full">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-12 text-center text-lg font-bold font-mono bg-[#211333] border border-white/10 focus:border-[#F328D5] rounded-xl text-white outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#FFC84A] text-white font-bold text-sm shadow-lg shadow-[#F328D5]/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 mb-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Verify & Continue</span>
              )}
            </button>

            <button
              onClick={() => setMessage('Demo code resent: 123456')}
              className="text-xs text-[#FFC84A] hover:underline"
            >
              Didn't receive code? Resend
            </button>
          </div>
        ) : (
          /* Phone Entry & Social Login Step */
          <div className="flex flex-col items-center animate-fade-in">
            {/* Header Brand Logo */}
            <div className="mb-6">
              <LonzoLogo size="md" showTagline={false} />
            </div>

            <h2 className="text-2xl font-extrabold text-white font-display text-center mb-1">
              {isSignUp ? 'Create Account' : 'Welcome back!'}
            </h2>
            <p className="text-xs text-[#B9AECF] text-center mb-6">
              {isSignUp ? 'Join Lonzo Party Live today' : 'Login to continue'}
            </p>

            {message && (
              <div className="w-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs py-2 px-3 rounded-xl mb-4 text-center">
                {message}
              </div>
            )}

            {/* Phone Number Form */}
            <form onSubmit={handleGetOtp} className="w-full space-y-4">
              <div className="flex items-center bg-[#211333] border border-white/10 rounded-xl overflow-hidden focus-within:border-[#F328D5] transition-colors shadow-inner">
                {/* Country Code Selector */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent text-white font-mono text-sm px-3 py-3 border-r border-white/10 outline-none cursor-pointer"
                >
                  <option value="+92" className="bg-[#160C25] text-white">+92 (PK)</option>
                  <option value="+1" className="bg-[#160C25] text-white">+1 (US)</option>
                  <option value="+44" className="bg-[#160C25] text-white">+44 (UK)</option>
                  <option value="+91" className="bg-[#160C25] text-white">+91 (IN)</option>
                  <option value="+971" className="bg-[#160C25] text-white">+971 (UAE)</option>
                  <option value="+966" className="bg-[#160C25] text-white">+966 (KSA)</option>
                </select>

                <input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder-[#B9AECF]/50 outline-none font-mono"
                />
              </div>

              {/* Get OTP Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8B20FF] via-[#F328D5] to-[#FFC84A] text-white font-bold text-sm shadow-lg shadow-[#F328D5]/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Get OTP</span>
                )}
              </button>
            </form>

            {/* 'or' divider */}
            <div className="w-full flex items-center my-5">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-xs text-[#B9AECF] uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            {/* Social Logins */}
            <div className="w-full space-y-2.5">
              {/* Google */}
              <button
                onClick={() => handleSocialLogin('Google')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#211333] hover:bg-[#2c1a44] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-colors active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#211333] hover:bg-[#2c1a44] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-colors active:scale-98"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Continue with Facebook</span>
              </button>

              {/* Apple */}
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#211333] hover:bg-[#2c1a44] border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-colors active:scale-98"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.83c.62-.75 1.04-1.8 0.92-2.83-.9.04-2 .6-2.65 1.36-.57.65-1.07 1.72-.94 2.73 1.01.08 2.05-.51 2.67-1.26z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Toggle Sign Up / Login */}
            <div className="mt-6 text-center text-xs text-[#B9AECF]">
              <span>{isSignUp ? 'Already have an account? ' : 'New User? '}</span>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#F328D5] font-bold hover:underline"
              >
                {isSignUp ? 'Login' : 'Sign Up'}
              </button>
            </div>

            {/* Terms and Privacy notice */}
            <p className="mt-5 text-[10px] text-[#B9AECF]/60 text-center leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="text-[#B9AECF] underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-[#B9AECF] underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
