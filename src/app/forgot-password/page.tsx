'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CodeInput, { EMPTY_CODE } from '@/components/CodeInput'

type Step = 'email' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(EMPTY_CODE)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const requestCode = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('reset')
        setResendCooldown(60)
        setCode(EMPTY_CODE)
      } else {
        setError(data.error || 'Failed to send reset code')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestCode()
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const fullCode = code.join('')
    if (fullCode.length !== 6) { setError('Please enter the full 6-digit code'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, password }),
      })
      const data = await res.json()
      if (data.success) {
        setStep('done')
      } else {
        setError(data.error || 'Could not reset password')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const ErrorBox = error ? (
    <div className="alert alert-error mb-6">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {error}
    </div>
  ) : null

  const Spinner = (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

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
            <h1 className="text-2xl font-bold text-[#00274C] mb-2">Password updated</h1>
            <p className="text-gray-600 mb-6">Your new password is set. Sign in to pick up where you left off.</p>
            <Link href="/login" className="btn btn-primary w-full">Sign In</Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'reset') {
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
                If an account exists for <strong>{email}</strong>, we sent it a 6-digit code.
              </p>
            </div>

            {ErrorBox}

            <form onSubmit={handleReset} className="space-y-5">
              <CodeInput value={code} onChange={setCode} disabled={loading} />

              <div>
                <label className="label">New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} className="input" autoComplete="new-password" />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required className="input" autoComplete="new-password" />
              </div>

              <button type="submit" disabled={loading || code.join('').length !== 6} className="btn btn-primary w-full py-3">
                {loading ? <span className="flex items-center gap-2">{Spinner} Updating...</span> : 'Set New Password'}
              </button>
            </form>

            <div className="text-center text-sm text-gray-500 mt-4">
              Didn&apos;t get the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button onClick={requestCode} disabled={loading} className="font-semibold text-[#00274C] hover:underline">
                  Resend code
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <button onClick={() => { setStep('email'); setError(''); setCode(EMPTY_CODE) }} className="text-sm text-gray-500 hover:text-[#00274C]">
                ← Use a different email
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

          <h1 className="text-3xl font-bold text-[#00274C] mb-2">Reset your password</h1>
          <p className="text-gray-600 mb-8">
            Enter the email on your account and we&apos;ll send a code to set a new password.
          </p>

          {ErrorBox}

          <form onSubmit={handleRequest} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@umich.edu" required className="input" autoComplete="email" />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
              {loading ? <span className="flex items-center gap-2">{Spinner} Sending code...</span> : 'Send Reset Code'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Remembered it?{' '}
            <Link href="/login" className="font-semibold text-[#00274C] hover:underline">Back to sign in</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#00274C] p-12 items-center justify-center relative">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-[#FFCB05] flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-[#00274C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Locked out? No problem.</h2>
          <p className="text-white/70 text-lg">A quick code to your inbox and you&apos;re back to your listings.</p>
        </div>
      </div>
    </div>
  )
}
