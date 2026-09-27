import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudioPage } from './pages/StudioPage';
import './App.css';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Studio', href: '/studio' },
  { label: 'Explore', href: '#inspiration' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#community' },
];

const stats = [
  { value: '150K+', label: 'creators' },
  { value: '4.9/5', label: 'average rating' },
  { value: '2.3M', label: 'campaigns created' },
];

const galleryCards = [
  {
    title: 'Skyline Drift',
    subtitle: 'Luxury motion campaign',
    className: 'portrait',
    tone: 'dark',
  },
  {
    title: 'Velvet Echo',
    subtitle: 'Character cinematic ad',
    className: 'square',
    tone: 'amber',
  },
  {
    title: 'Chrome Tide',
    subtitle: 'Streetwear launch sequence',
    className: 'landscape',
    tone: 'warm',
  },
];

const studioPillars = ['Creative direction', 'Performance planning', 'Storyboarding', 'Campaign analysis'];

const featureTiles = [
  {
    label: 'Brand stories',
    title: 'Turn products into living scenes.',
    copy: 'Craft cinematic product narratives that feel premium, immersive, and tailored to your audience.',
  },
  {
    label: 'Creator loops',
    title: 'Scale authentic content at speed.',
    copy: 'Generate campaign variations, concept packs, and creator-ready edits from a single visual direction.',
  },
  {
    label: 'Live testing',
    title: 'Optimise every shot before publish.',
    copy: 'Use predictive scoring, A/B framing, and post-campaign insight loops to refine what actually converts.',
  },
];

const communityItems = [
  { title: 'Behind the lens', meta: 'Creator notes', accent: 'rose' },
  { title: 'Studio moodboards', meta: 'Campaign ideas', accent: 'gold' },
  { title: 'Launch rituals', meta: 'Community stories', accent: 'blue' },
];

const footerLinks = {
  Product: ['Studio', 'Campaigns', 'Creators', 'Pricing'],
  Company: ['About', 'Careers', 'Partners', 'Newsroom'],
  Explore: ['Templates', 'Case studies', 'Resources', 'Community'],
};

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand-wrap" aria-label="Higgsfield home">
        <span className="brand-mark">H</span>
        <span className="brand-name">Higgsfield</span>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          if (item.href.startsWith('#')) {
            return (
              <a key={item.label} href={item.href} className="nav-link">
                {item.label}
              </a>
            );
          }

          return (
            <Link key={item.label} to={item.href} className="nav-link">
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/studio" className="ghost-button nav-button-link">
              Studio
            </Link>
            <button type="button" className="primary-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="ghost-button nav-button-link">
              Log in
            </Link>
            <Link to="/register" className="primary-button nav-button-link">
              Create
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

function SectionHeading({ eyebrow, title, action, actionLabel }) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      {action ? <a href="#" className="text-link">{actionLabel}</a> : null}
    </div>
  );
}

function GalleryCard({ title, subtitle, className, tone }) {
  return (
    <article className={`gallery-card ${className} ${tone}`}>
      <div className="card-image" aria-hidden="true">
        <div className="grain" />
      </div>
      <div className="card-content">
        <p>{subtitle}</p>
        <h4>{title}</h4>
      </div>
    </article>
  );
}

function FeatureTile({ label, title, copy }) {
  return (
    <article className="feature-tile">
      <span className="feature-label">{label}</span>
      <h4>{title}</h4>
      <p>{copy}</p>
    </article>
  );
}

function FooterColumn({ heading, links }) {
  return (
    <div className="footer-column">
      <h5>{heading}</h5>
      <ul>
        {links.map((link) => (
          <li key={link}>
            <a href="#">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="page-shell">
      <NavBar />

      <main className="page-content">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Cinematic campaign engine</p>
            <h1>Design the next iconic brand story.</h1>
            <p className="hero-description">
              Transform product launches into immersive, high-converting cinematic experiences built for modern brands and creators.
            </p>

            <div className="cta-row">
              <Link to="/register" className="primary-button large nav-button-link">
                Book a demo
              </Link>
              <button type="button" className="secondary-button">
                Watch reel
              </button>
            </div>

            <div className="stats-row" aria-label="Platform stats">
              {stats.map((stat) => (
                <div key={stat.label} className="stat-block">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Featured campaign visual">
            <div className="visual-card main-visual">
              <div className="visual-overlay" />
              <div className="visual-badge">Featured campaign</div>
              <div className="visual-copy">
                <span>Summer / 2026</span>
                <h2>Afterglow</h2>
              </div>
            </div>
            <div className="mini-stack">
              <div className="mini-card mini-top" />
              <div className="mini-card mini-bottom" />
            </div>
          </div>
        </section>

        <section id="inspiration" className="inspiration-section">
          <SectionHeading
            eyebrow="Inspiration gallery"
            title="Campaigns that feel shot on a dream."
            action
            actionLabel="View all work"
          />

          <div className="gallery-grid">
            {galleryCards.map((card) => (
              <GalleryCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                className={card.className}
                tone={card.tone}
              />
            ))}
          </div>
        </section>

        <section className="studio-section">
          <div className="studio-header">
            <div>
              <p className="eyebrow">Marketing Studio</p>
              <h3>Concept, produce, and optimise campaigns in one studio.</h3>
            </div>
            <button type="button" className="secondary-button">
              Explore workflow
            </button>
          </div>

          <div className="studio-layout">
            <div className="studio-feature">
              <div className="feature-visual">
                <div className="feature-glow" />
                <div className="feature-window" />
              </div>
            </div>

            <div className="studio-copy">
              <div className="studio-pills">
                {studioPillars.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <div className="feature-grid">
                {featureTiles.map((tile) => (
                  <FeatureTile
                    key={tile.label}
                    label={tile.label}
                    title={tile.title}
                    copy={tile.copy}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="pricing-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pricing</p>
              <h3>Choose the creative plan that matches your pace.</h3>
            </div>
          </div>

          <div className="pricing-grid">
            <article className="pricing-card">
              <span className="pricing-tier">Starter</span>
              <h4>$29<span>/mo</span></h4>
              <p>For solo creators shipping fast product motion.</p>
              <ul>
                <li>200 AI renders</li>
                <li>5 active projects</li>
                <li>Prompt presets</li>
              </ul>
              <button type="button" className="secondary-button full-width">Get started</button>
            </article>

            <article className="pricing-card popular">
              <span className="pricing-tier">Growth</span>
              <h4>$79<span>/mo</span></h4>
              <p>For marketing teams building launch campaigns weekly.</p>
              <ul>
                <li>Unlimited concept boards</li>
                <li>Brand kit sync</li>
                <li>Faster iterative renders</li>
              </ul>
              <button type="button" className="primary-button full-width">Start trial</button>
            </article>

            <article className="pricing-card">
              <span className="pricing-tier">Studio</span>
              <h4>$199<span>/mo</span></h4>
              <p>For agencies and product orgs shipping cinematic creative at scale.</p>
              <ul>
                <li>Custom workflows</li>
                <li>Priority support</li>
                <li>Advanced team sharing</li>
              </ul>
              <button type="button" className="secondary-button full-width">Talk to sales</button>
            </article>
          </div>
        </section>

        <section className="cinema-section">
          <div className="cinema-intro">
            <div>
              <p className="eyebrow">Soul Cinema</p>
              <h3>Stories with atmosphere, rhythm, and emotional pull.</h3>
            </div>
            <a href="#" className="text-link">Learn more</a>
          </div>

          <div className="cinema-split">
            <div className="cinema-panel left-panel">
              <div className="panel-gradient" />
              <div className="panel-copy">
                <p>Editorial direction</p>
                <h4>Frame each launch like a film still.</h4>
              </div>
            </div>

            <div className="cinema-panel right-panel">
              <div className="panel-copy small-copy">
                <p>Creator-led storytelling</p>
                <h4>Capture identity in motion.</h4>
              </div>
            </div>
          </div>
        </section>

        <section id="community" className="community-section">
          <div className="community-heading">
            <div>
              <p className="eyebrow">Community</p>
              <h3>Built for creators, studios, and ambitious brands.</h3>
            </div>
            <button type="button" className="primary-button">
              Join the community
            </button>
          </div>

          <div className="community-grid">
            {communityItems.map((item) => (
              <article key={item.title} className={`community-card ${item.accent}`}>
                <div className="community-top">
                  <span>{item.meta}</span>
                  <div className="community-icon" aria-hidden="true" />
                </div>
                <h4>{item.title}</h4>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand-block">
            <div className="brand-wrap footer-brand" aria-label="Higgsfield footer brand">
              <span className="brand-mark">H</span>
              <span className="brand-name">Higgsfield</span>
            </div>
            <p>
              High-impact storytelling tools for brands that want every frame to feel unforgettable.
            </p>
          </div>

          <div className="footer-links-wrap">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <FooterColumn key={heading} heading={heading} links={links} />
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Higgsfield</span>
          <div className="legal-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={location.pathname === '/studio' ? '/login' : '/'} replace />} />
    </Routes>
  );
}

export default App;
