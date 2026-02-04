import './style.css';

export const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <div className="footer__links">
        <a className="footer__link" href="#login">Log in</a>
        <a className="footer__link" href="#signup">Sign up</a>
      </div>
      <div className="footer__copy">© {new Date().getFullYear()} Animal Identifier</div>
    </div>
  </footer>
);
