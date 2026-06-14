import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="notfound animate-fadeInUp">
      <div className="notfound__code">404</div>
      <h1 className="notfound__title">Page Not Found</h1>
      <p className="notfound__desc">
        Looks like this page has drifted into the void. Let's get you back on track.
      </p>
      <Link to="/" className="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
