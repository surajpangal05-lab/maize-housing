'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CodeInput, { EMPTY_CODE } from '@/components/CodeInput'

type Step = 'form' | 'verify' | 'done'

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'STUDENT' as 'STUDENT' | 'LANDLORD',
  })
  const [code, setCode] = useState<string[]>(EMPTY_CODE)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const lastAttemptedCode = useRef('')

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (formData.userType === 'STUDENT' && !formData.email.toLowerCase().endsWith('@umich.edu')) {
      setError('Students must register with a @umich.edu email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, userType: formData.userType }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('verify')
        setResendCooldown(60)
      } else {
        setError(data.error || 'Failed to send verification code')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, userType: formData.userType }),
      })
      const data = await res.json()
      if (data.success) {
        setResendCooldown(60)
        setCode(EMPTY_CODE)
        lastAttemptedCode.current = ''
      } else {
        setError(data.error || 'Failed to resend code')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndRegister = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code')
      return
    }
    if (loading || lastAttemptedCode.current === fullCode) return
    lastAttemptedCode.current = fullCode

    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
          code: fullCode,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('done')
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Auto-submit once all six digits are present. The ref above stops the same
  // code from being sent twice (e.g. effect + button click).
  useEffect(() => {
    if (step === 'verify' && code.every(d => d !== '')) {
      handleVerifyAndRegister()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, step])

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FFCB05] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#00274C] mb-2">You&apos;re all set!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been verified and your account is ready. Sign in to start browsing listings.
            </p>
            <Link href="/login" className="btn btn-primary w-full">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-[#00274C] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#FFCB05]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#00274C] mb-2">Check your email</h1>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to <strong>{formData.email}</strong>
              </p>
            </div>

            {error && (
              <div className="alert alert-error mb-6">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="mb-6">
              <CodeInput value={code} onChange={setCode} disabled={loading} />
            </div>

            <button
              onClick={handleVerifyAndRegister}
              disabled={loading || code.join('').length !== 6}
              className="btn btn-primary w-full py-3 mb-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify & Create Account'}
            </button>

            <div className="text-center text-sm text-gray-500">
              Didn&apos;t get the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button onClick={handleResend} disabled={loading} className="font-semibold text-[#00274C] hover:underline">
                  Resend code
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <button onClick={() => { setStep('form'); setError(''); setCode(EMPTY_CODE); lastAttemptedCode.current = '' }} className="text-sm text-gray-500 hover:text-[#00274C]">
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-8">
            <Image src="/logo.png" alt="MaizeLease" width={160} height={50} className="h-12 w-auto" />
          </Link>

          <h1 className="text-3xl font-bold text-[#00274C] mb-2">Create Account</h1>
          <p className="text-gray-600 mb-8">Join the MaizeLease community</p>

          <div className="mb-6">
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'STUDENT' })}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.userType === 'STUDENT' ? 'border-[#FFCB05] bg-[#FFCB05]/10' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="text-xl mb-1 block">🎓</span>
                <span className="font-medium text-[#00274C]">Student</span>
                <p className="text-xs text-gray-500 mt-1">@umich.edu email</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'LANDLORD' })}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${formData.userType === 'LANDLORD' ? 'border-[#FFCB05] bg-[#FFCB05]/10' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="text-xl mb-1 block">🏠</span>
                <span className="font-medium text-[#00274C]">Landlord</span>
                <p className="text-xs text-gray-500 mt-1">Email + phone</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSendCode} className="space-y-5">
            {error && (
              <div className="alert alert-error">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="label">Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" required className="input" />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder={formData.userType === 'STUDENT' ? 'uniqname@umich.edu' : 'you@email.com'} required className="input" />
              {formData.userType === 'STUDENT' && (
                <p className="mt-1 text-xs text-gray-500">Must be @umich.edu &mdash; we&apos;ll send a verification code</p>
              )}
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" required minLength={8} className="input" />
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" required className="input" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending code...
                </span>
              ) : 'Continue'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#00274C] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#00274C] p-12 items-center justify-center relative">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-[#FFCB05] flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Join the Michigan Housing Community</h2>
          <p className="text-white/70 text-lg">We verify every account with a real email code to keep the platform safe and trusted.</p>
        </div>
      </div>
    </div>
  )
}
