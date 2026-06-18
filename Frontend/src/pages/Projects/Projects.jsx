import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../redux/slices/projectsSlice';
import { Monitor, ExternalLink } from 'lucide-react';
import { Github } from '../../components/Icons';
import './Projects.css';

/* Default project icon banner */
function ProjectDefaultBanner() {
  return (
    <div className="project-card__img-default">
      <Monitor size={52} strokeWidth={1} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
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
              <Github size={16} />
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
              <ExternalLink size={16} />
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
            <Github size={18} />
            View All on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

export default Projects;
