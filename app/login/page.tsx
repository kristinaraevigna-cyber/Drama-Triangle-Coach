'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        })

        if (error) {
          setError(error.message)
        } else if (data.user) {
          if (data.user.identities?.length === 0) {
            setError('This email is already registered. Please sign in instead.')
          } else if (data.session) {
            router.push('/dashboard')
          } else {
            setSuccess('Account created! Check your email to confirm your account.')
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else if (data.session) {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', display: 'flex' }}>
      {/* Left Side - Steve's Photo Background */}
      <div style={{
        width: '50%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Steve's Photo as Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:'url(/steves-art.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} />
        
        {/* Dark Overlay for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(61, 90, 76, 0.75)'
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4vw',
          textAlign: 'center'
        }}>
          {/* Triangle - Point Facing Down */}
          <div style={{ width: '8vw', height: '8vw', margin: '0 auto 2vw auto' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <polygon points="50,90 90,15 10,15" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
              <circle cx="50" cy="85" r="6" fill="#ffffff" />
              <circle cx="85" cy="20" r="6" fill="#ffffff" />
              <circle cx="15" cy="20" r="6" fill="#ffffff" />
              <polygon points="50,65 70,30 30,30" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            </svg>
          </div>

          <h1 style={{ fontSize: '2.5vw', fontWeight: 400, color: '#ffffff', fontFamily: 'Georgia, serif', marginBottom: '1vw' }}>
            Drama Triangle Coach
          </h1>
          
          <p style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.9)', maxWidth: '25vw', lineHeight: 1.6, marginBottom: '2vw' }}>
            Transform conflict into compassion with Dr. Stephen Karpman's proven frameworks
          </p>

          {/* Dr. Karpman Credit */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            padding: '1vw 2vw',
            borderRadius: '0.5vw',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ color: '#ffffff', fontSize: '1vw', fontWeight: 500, margin: 0 }}>Dr. Stephen Karpman</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85vw', margin: '0.3vw 0 0 0' }}>Creator of the Drama Triangle</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4vw',
        position: 'relative'
      }}>
        <div style={{ width: '100%', maxWidth: '24vw' }}>
          <h2 style={{ fontSize: '1.8vw', fontWeight: 500, color: '#1a1a1a', fontFamily: 'Georgia, serif', marginBottom: '0.5vw' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '1vw', color: '#666', marginBottom: '2vw' }}>
            {isSignUp ? 'Start your journey from drama to compassion' : 'Continue your journey to compassionate relationships'}
          </p>

          {error && (
            <div style={{ padding: '1vw', backgroundColor: '#FFF5F5', border: '1px solid #FFCCCC', borderRadius: '0.5vw', marginBottom: '1.5vw' }}>
              <p style={{ color: '#A85454', fontSize: '0.9vw', margin: 0 }}>{error}</p>
            </div>
          )}

          {success && (
            <div style={{ padding: '1vw', backgroundColor: '#F0F7F4', border: '1px solid #3D5A4C', borderRadius: '0.5vw', marginBottom: '1.5vw' }}>
              <p style={{ color: '#3D5A4C', fontSize: '0.9vw', margin: 0 }}>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div style={{ marginBottom: '1.5vw' }}>
                <label style={{ display: 'block', fontSize: '0.9vw', fontWeight: 500, color: '#333', marginBottom: '0.5vw' }}>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                  required={isSignUp}
                  style={{ width: '100%', padding: '1vw', fontSize: '1vw', border: '1px solid #e0e0e0', borderRadius: '0.5vw', fontFamily: 'inherit' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1.5vw' }}>
              <label style={{ display: 'block', fontSize: '0.9vw', fontWeight: 500, color: '#333', marginBottom: '0.5vw' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '1vw', fontSize: '1vw', border: '1px solid #e0e0e0', borderRadius: '0.5vw', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '2vw' }}>
              <label style={{ display: 'block', fontSize: '0.9vw', fontWeight: 500, color: '#333', marginBottom: '0.5vw' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                required
                minLength={6}
                style={{ width: '100%', padding: '1vw', fontSize: '1vw', border: '1px solid #e0e0e0', borderRadius: '0.5vw', fontFamily: 'inherit' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1vw',
                fontSize: '1vw',
                fontWeight: 500,
                backgroundColor: isLoading ? '#ccc' : '#3D5A4C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5vw',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '1.5vw'
              }}
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ fontSize: '0.9vw', color: '#666', textAlign: 'center' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }} 
              style={{ color: '#3D5A4C', fontWeight: 500, cursor: 'pointer' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2vw 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
            <span style={{ padding: '0 1vw', color: '#999', fontSize: '0.85vw' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          </div>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              width: '100%',
              padding: '1vw',
              fontSize: '0.95vw',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #e0e0e0',
              borderRadius: '0.5vw',
              cursor: 'pointer'
            }}
          >
            Try Demo Mode
          </button>
        </div>

        <p style={{ position: 'absolute', bottom: '2vw', fontSize: '0.8vw', color: '#999' }}>
          Based on the work of Dr. Stephen Karpman
        </p>
      </div>
    </div>
  )
}