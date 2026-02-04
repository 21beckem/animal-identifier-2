import mount from '/mount';
import '/styles.css';
import { Page } from '/components/Page/comp';
import { Navbar } from '/components/Navbar/comp';
import { Cards } from '/components/Cards/comp';
import { Card } from '/components/Card/comp';
import { Footer } from '/components/Footer/comp';

const Hero = () => (
  <section className="hero">
    <div className="container hero__content">
      <h1>Document Wildlife, Share Discoveries</h1>
      <p>
        Join a community of nature enthusiasts recording animal sightings
      </p>
      <div className="hero__actions">
        <a className="btn btn--primary" href="#get-started">
          Get Started
        </a>
        <a className="btn btn--secondary" href="#login">
          Log in
        </a>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="section section--muted" aria-labelledby="features-title">
    <div className="container">
      <h2 id="features-title" className="section__title">Features</h2>

      <Cards>
        <Card icon="📷" title="Photo Upload">
          Capture wildlife moments with drag-and-drop photo upload. Support for
            JPEG, PNG, and WebP formats.
        </Card>

        <Card icon="📍" title="Location Tracking">
          Automatically GPS coordinates capture or manual location entry for
            precise wildlife documentation.
        </Card>

        <Card icon="📊" title="Personal Dashboard">
          Track all your sightings in one place with detailed views and easy
            management.
        </Card>
      </Cards>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="section" aria-labelledby="how-title">
    <div className="container">
      <h2 id="how-title" className="section__title">How It Works</h2>

      <div className="steps">
        <article className="step">
          <div className="step__num" aria-hidden="true">1</div>
          <h3 className="step__title">Sign Up</h3>
          <p className="step__text">Create your free account in seconds</p>
        </article>

        <article className="step">
          <div className="step__num" aria-hidden="true">2</div>
          <h3 className="step__title">Record a Sighting</h3>
          <p className="step__text">Add animal details, photos, and location</p>
        </article>

        <article className="step">
          <div className="step__num" aria-hidden="true">3</div>
          <h3 className="step__title">Build Your Journal</h3>
          <p className="step__text">Track your wildlife observations over time</p>
        </article>
      </div>
    </div>
  </section>
);

mount(() => (
  <Page>
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <Footer />
  </Page>
));