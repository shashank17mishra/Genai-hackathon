import React, { useState } from 'react';
import Card from './common/Card';
import { supabase } from '../services/supabaseService';
import { useMockData } from '../services/geminiService';

const StartPage: React.FC = () => {
  const isMock = useMockData;
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Success! Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // The onAuthStateChange listener in App.tsx will handle the redirect
      }
    } catch (err: any) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {isMock && (
        <div className="absolute top-4 px-4 py-2 text-center text-black border-2 border-white bg-[var(--secondary-color)]">
          <p className="font-bold uppercase" style={{fontFamily: 'var(--font-header)'}}>Demo Mode</p>
          <p className="text-xs" style={{fontFamily: 'var(--font-body)'}}>
            No Gemini API key found. Running with mock data.
          </p>
        </div>
      )}
      <div className="mb-8">
          <h1 className="text-7xl md:text-8xl text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-header)' }}>
              Quester
          </h1>
          <p className="text-xl text-white/80" style={{fontFamily: 'var(--font-body)'}}>Your personalized cognitive growth companion.</p>
      </div>

      <Card className="max-w-md w-full">
        <h2 className="text-3xl mb-6 uppercase" style={{ fontFamily: 'var(--font-header)', color: 'var(--text-color)' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="neo-input"
            required
          />
          <input
            type="password"
            placeholder="password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="neo-input"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="neo-button w-full"
          >
            {loading ? (isSignUp ? 'Creating...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        {error && <p className="text-[var(--secondary-color)] font-bold mt-4">{error}</p>}
        {message && <p className="text-green-500 font-bold mt-4">{message}</p>}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setMessage('');
          }}
          className="mt-6 text-sm hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </Card>
    </div>
  );
};

export default StartPage;