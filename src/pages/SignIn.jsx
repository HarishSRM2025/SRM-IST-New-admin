import { useState } from "react";
import "../styles/Auth.css";

export default function SignIn({ onSignIn, onNavigateToSignUp }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === "remember" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) {
      next.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      next.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      next.password = "Enter your password.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (onSignIn) {
        await onSignIn(formData);
      }
    } catch (err) {
      setErrors({ form: err.message || "Couldn't sign in. Check your credentials and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand">
          <div className="auth-brand-top">
            <div className="auth-logo-badge">S</div>
            <div>
              <span className="auth-brand-name">SRM Admin</span>
              <span className="auth-brand-subtitle">Content management portal</span>
            </div>
          </div>

          <div className="auth-brand-mid">
            <span className="auth-brand-pill">Secure dashboard</span>
            <h1>Welcome back.</h1>
            <p>Manage institution content, schools, faculty, research, events, and student stories from one clean workspace.</p>
          </div>

          <div className="auth-brand-bottom">
            <div>
              <strong>Fast updates</strong>
              <span>Publish changes across the site in minutes.</span>
            </div>
            <div>
              <strong>Admin access</strong>
              <span>Protected access for your internal team.</span>
            </div>
          </div>
        </section>

        <main className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-eyebrow">
              <LockIcon /> Admin Portal
            </span>
            <h2>Sign in</h2>
            <p>Use your admin credentials to continue.</p>
          </div>

          {errors.form && (
            <div className="auth-banner">
              <AlertIcon />
              <span>{errors.form}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className={`auth-input-wrap ${errors.email ? "error" : ""}`}>
                <MailIcon />
                <input
                  id="email"
                  type="email"
                  placeholder="you@srmist.edu.in"
                  value={formData.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className={`auth-input-wrap has-toggle ${errors.password ? "error" : ""}`}>
                <LockIcon />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <div className="auth-row-between">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange("remember")}
                />
                Remember me
              </label>
              <button type="button" className="auth-link">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting && <span className="auth-spinner" />}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don&apos;t have an account?{" "}
            <button type="button" className="auth-link" onClick={onNavigateToSignUp}>
              Create one
            </button>
          </p>
        </main>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61C3.65 8.42 2 11 2 11s4 8 10 8a9.14 9.14 0 0 0 5-1.5" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
