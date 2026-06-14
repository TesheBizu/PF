import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../redux/slices/projectsSlice';
import './Projects.css';

/* Default project icon banner */
function ProjectDefaultBanner() {
  return (
    <div className="project-card__img-default">
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <path d="M6 8h.01M9 8h3" strokeWidth="1.5"/>
        <path d="M6 11h12" strokeWidth="1.5"/>
      </svg>
      <div className="project-card__img-code">
        <span style={{color:'var(--color-accent)'}}>const</span>
        <span style={{color:'var(--color-primary)'}}> project</span>
        <span style={{color:'var(--color-text-muted)'}}> = {'{}'}</span>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <div
      className="project-card card animate-fadeInUp"
      style={{ animationDelay: `${index * 0.12}s`, padding: 0, overflow: 'hidden' }}
    >
      {/* Image or default banner */}
      {project.imageUrl ? (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="project-card__img"
        />
      ) : (
        <ProjectDefaultBanner />
      )}

      <div className="project-card__body">
        {/* Top bar */}
        <div className="project-card__top">
          <div className="project-card__dots">
            <span /><span /><span />
          </div>
          {project.featured && (
            <span className="project-card__featured">⭐ Featured</span>
          )}
        </div>

        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__desc">{project.description}</p>

        {/* Tech stack */}
        <div className="project-card__stack">
          {project.techStack.map((tech) => (
            <span key={tech} className="badge">{tech}</span>
          ))}
        </div>

        {/* Links */}
        <div className="project-card__links">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost project-card__btn"
              aria-label={`View ${project.title} on GitHub`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary project-card__btn"
              aria-label={`View ${project.title} live`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}


function Projects() {
  const dispatch = useDispatch();
  const { items: projects, loading, error } = useSelector((s) => s.projects);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchProjects());
  }, [dispatch, projects.length]);

  // Collect unique techs for filter
  const allTechs = ['All', ...new Set(projects.flatMap((p) => p.techStack))];

  const filtered =
    filter === 'All' ? projects : projects.filter((p) => p.techStack.includes(filter));

  return (
    <section className="projects section" id="projects">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <span className="section-tag">// projects</span>
          <h2 className="section-title">
            My <span>Projects</span>
          </h2>
          <p className="section-desc">
            A selection of projects I've built, showcasing my full-stack development skills.
          </p>
        </div>

        {/* Filter */}
        {!loading && projects.length > 0 && (
          <div className="projects__filter animate-fadeInUp">
            {allTechs.map((tech) => (
              <button
                key={tech}
                className={`projects__filter-btn${filter === tech ? ' projects__filter-btn--active' : ''}`}
                onClick={() => setFilter(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="projects__grid">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 20 }} />
            ))}
          </div>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>
            Failed to load projects. Please try again.
          </p>
        )}

        {!loading && !error && (
          <div className="projects__grid">
            {filtered.length > 0
              ? filtered.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)
              : <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1/-1' }}>No projects match this filter.</p>
            }
          </div>
        )}

        {/* GitHub CTA */}
        <div className="projects__cta animate-fadeInUp">
          <p>Want to see more? Visit my GitHub for all repositories.</p>
          <a
            href="https://github.com/TesheBizu"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            View All on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

export default Projects;
