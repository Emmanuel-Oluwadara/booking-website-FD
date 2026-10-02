import { useState } from 'react'
import StudioApp from './StudioApp.jsx'
import './App.css'

const SESSION_KEY = 'heritage-hair-studio-session'

function getSavedUser() {
  try {
    const savedUser = JSON.parse(window.localStorage.getItem(SESSION_KEY))
    return savedUser?.email && savedUser?.name ? savedUser : null
  } catch {
    return null
  }
}

function App() {
  const [user, setUser] = useState(getSavedUser)
  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function changeMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setShowPassword(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email').trim().toLowerCase()
    const name = formData.get('name')?.trim() || email.split('@')[0]

    if (mode === 'signup' && formData.get('password') !== formData.get('confirmPassword')) {
      setMessage('Those passwords do not match. Please try again.')
      return
    }

    const signedInUser = { name, email }
    setUser(signedInUser)
    setMessage('')

    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(signedInUser))
    } catch {
      // The session still works until this page is closed if storage is unavailable.
    }
  }

  function handleLogout() {
    setUser(null)
    setMode('signin')
    setMessage('')

    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch {
      // Nothing else is needed when browser storage is unavailable.
    }
  }

  function handleProfileUpdate(updatedUser) {
    setUser(updatedUser)
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
    } catch {
      // The updated profile remains available until this page is closed.
    }
  }

  function handlePasswordHelp() {
    setMessage('Password reset will be available once secure account services are connected.')
  }

  if (user) {
    return <StudioApp user={user} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />
  }

  return (
    <main className="page-shell" id="home">
      <aside className="studio-panel" aria-label="Heritage Hair Studio">
        <img
          className="studio-photo"
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85"
          alt="A warmly lit, thoughtfully styled hair studio"
        />
        <div className="photo-wash" />

        <a className="brand" href="#home" aria-label="Heritage Hair Studio home">
          <span className="brand-mark" aria-hidden="true">h.</span>
          <span className="brand-name">HERITAGE <span>HAIR STUDIO</span></span>
        </a>

        <div className="studio-story">
          <p className="eyebrow"><span /> WELCOME TO HERITAGE HAIR STUDIO</p>
          <h1>Your Crown.<br />Your Style.<br /><em>Your Confidence.</em></h1>
          <p className="story-copy">Discover beautiful, personalized hairstyles designed to make every moment unforgettable.</p>
        </div>

        <p className="photo-caption">YOUR NEIGHBOURHOOD HAIR STUDIO</p>
      </aside>

      <section className="account-panel" aria-label="Your studio account">
        <header className="panel-topline">
          <span className="topline-label">THE HERITAGE EDIT</span>
          <span className="topline-index">01 <span>/</span> 02</span>
        </header>

        <section className="account-content" aria-labelledby="account-title">
            <p className="eyebrow account-eyebrow"><span /> YOUR STUDIO, YOUR WAY</p>
            <h2 id="account-title">
              {mode === 'signin' ? <>Your studio.<br /><em>Your time.</em></> : <>Make yourself<br /><em>at home.</em></>}
            </h2>
            <p className="form-intro">
              {mode === 'signin'
                ? 'Sign in to keep your hair routine feeling like you.'
                : 'Create an account for a more personal studio experience.'}
            </p>

            <div className="mode-switch" role="tablist" aria-label="Choose account action">
              <button
                className={mode === 'signin' ? 'mode-tab active' : 'mode-tab'}
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => changeMode('signin')}
              >
                Sign in
              </button>
              <button
                className={mode === 'signup' ? 'mode-tab active' : 'mode-tab'}
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => changeMode('signup')}
              >
                Create account
              </button>
            </div>

            <form className="account-form" onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <label className="field-label" htmlFor="name">
                  Your name
                  <input id="name" name="name" type="text" placeholder="Alex Morgan" autoComplete="name" required />
                </label>
              )}

              <label className="field-label" htmlFor="email">
                Email address
                <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
              </label>

              <label className="field-label" htmlFor="password">
                Password
                <span className="password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    minLength={8}
                    required
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>

              {mode === 'signup' && (
                <label className="field-label" htmlFor="confirmPassword">
                  Confirm password
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
              )}

              {message && <p className="form-message" role="status">{message}</p>}

              <button className="submit-button" type="submit">
                {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
                <span aria-hidden="true">↗</span>
              </button>
            </form>

            {mode === 'signin' ? (
              <button className="text-action" type="button" onClick={handlePasswordHelp}>
                Forgot your password?
              </button>
            ) : (
              <p className="switch-prompt">Already have an account? <button type="button" onClick={() => changeMode('signin')}>Sign in</button></p>
            )}
        </section>

        <footer className="panel-footer">
          <span className="footer-flower" aria-hidden="true">✳</span>
          <p>Good hair days start with feeling at home.</p>
          <small>FRONT-END PREVIEW · ACCOUNT DETAILS ARE NOT SECURELY VERIFIED OR STORED</small>
        </footer>
      </section>
    </main>
  )
}

export default App
