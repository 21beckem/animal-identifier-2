import './style.css';

export const Card = (props) => (
  <article className="card">
    <div className="card__icon" aria-hidden="true">{props.icon}</div>
    <h3 className="card__title">{props.title}</h3>
    <p className="card__text">
      {props.children}
    </p>
  </article>
);
