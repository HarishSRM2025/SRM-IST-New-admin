import { useMemo, useState } from "react";
import "../styles/Auth.css";

export default function SignUp({ onSignUp, onNavigateToSignIn }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    const value = field === "agree" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const passwordScore = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  }, [formData.password]);

  const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][passwordScore];
  const strengthClass = ["", "active-weak", "active-fair", "active-strong", "active-strong"][passwordScore];

  const validate = () => {
    const next = {};
    if (!formData.fullName.trim()) {
      next.fullName = "Enter your full name.";
    }
    if (!formData.email.trim()) {
      next.email = "Enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      next.email = "Enter a valid email address.";
    }
    if (!formData.password) {
      next.password = "Create a password.";
    } else if (formData.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (formData.confirmPassword !== formData.password) {
      next.confirmPassword = "Passwords don't match.";
    }
    if (!formData.agree) {
      next.agree = "You must accept the terms to continue.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (onSignUp) {
        await onSignUp(formData);
      }
    } catch (err) {
      setErrors({ form: err.message || "Couldn't create your account. Please try again." });
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
            <span className="auth-brand-pill">New admin account</span>
            <h1>Start managing with confidence.</h1>
            <p>Create your admin account and keep SRM IST content organized, current, and easy to maintain.</p>
          </div>

          <div className="auth-brand-bottom">
            <div>
              <strong>Role ready</strong>
              <span>Designed for internal admin workflows.</span>
            </div>
            <div>
              <strong>Simple setup</strong>
              <span>Use your official email and a secure password.</span>
            </div>
          </div>
        </section>

        <main className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-eyebrow">
              <UserIcon /> Admin Portal
            </span>
            <h2>Create account</h2>
            <p>Set up your access to SRM Admin.</p>
          </div>

          {errors.form && (
            <div className="auth-banner">
              <AlertIcon />
              <span>{errors.form}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="fullName">Full name</label>
              <div className={`auth-input-wrap ${errors.fullName ? "error" : ""}`}>
                <UserIcon />
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Aravind Kumar"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  autoComplete="name"
                />
              </div>
              {errors.fullName && <span className="auth-field-error">{errors.fullName}</span>}
            </div>

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
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  autoComplete="new-password"
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
              {formData.password && (
                <>
                  <div className="auth-strength">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`auth-strength-bar ${i < passwordScore ? strengthClass : ""}`} />
                    ))}
                  </div>
                  <span className="auth-strength-label">{strengthLabel}</span>
                </>
              )}
              {errors.password && <span className="auth-field-error">{errors.password}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className={`auth-input-wrap has-toggle ${errors.confirmPassword ? "error" : ""}`}>
                <LockIcon />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-checkbox" htmlFor="agree">
                <input
                  id="agree"
                  type="checkbox"
                  checked={formData.agree}
                  onChange={handleChange("agree")}
                />
                I agree to the Terms of Service and Privacy Policy
              </label>
              {errors.agree && <span className="auth-field-error">{errors.agree}</span>}
            </div>

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting && <span className="auth-spinner" />}
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <button type="button" className="auth-link" onClick={onNavigateToSignIn}>
              Sign in
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

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
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
