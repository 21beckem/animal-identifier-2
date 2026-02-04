import './style.css';

export const Navbar = () => (
  <header className="nav">
    <div className="container nav__inner">
      <a className="nav__brand" href="/">
        Animal Identifier
      </a>

      <nav className="nav__actions" aria-label="Primary">
        <a className="btn btn--ghost" href="#login">
          Log in
        </a>
        <a className="btn btn--ghost" href="#signup">
          Sign up
        </a>
      </nav>
    </div>
  </header>
);