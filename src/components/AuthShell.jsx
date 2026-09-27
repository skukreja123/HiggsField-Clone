import { Link } from 'react-router-dom';

export function AuthShell({ title, subtitle, children, footerText, footerLink, footerHref }) {
  return (
    <div className="auth-page-shell">
      <div className="auth-panel">
        <div className="auth-brand-row">
          <div className="brand-wrap" aria-label="Higgsfield home">
            <span className="brand-mark">H</span>
            <span className="brand-name">Higgsfield</span>
          </div>
        </div>

        <div className="auth-header">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        {children}

        {footerText ? (
          <div className="auth-footer">
            <span>{footerText}</span>
            <Link to={footerHref}>{footerLink}</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
