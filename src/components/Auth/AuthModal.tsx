'use client'

import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  if (!isOpen) return null

  return (
    <>
      {mode === 'login' ? (
        <LoginForm
          onSwitchToSignUp={() => setMode('signup')}
          onClose={onClose}
        />
      ) : (
        <SignUpForm
          onSwitchToLogin={() => setMode('login')}
          onClose={onClose}
        />
      )}
    </>
  )
} 