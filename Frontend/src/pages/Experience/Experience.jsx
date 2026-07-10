import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExperiences } from '../../redux/slices/experiencesSlice';
import './Experience.css';

function Experience() {
  const dispatch = useDispatch();
  const { items: experiences, loading } = useSelector((s) => s.experiences);

  useEffect(() => {
    dispatch(fetchExperiences());
  }, [dispatch]);

  const renderDescriptionPoints = (desc) => {
    if (!desc) return null;
    const points = desc.split(/\n|•|;/).map((p) => p.trim()).filter((p) => p.length > 0);
    return (
      <ul className="timeline__desc-list">
        {points.map((pt, i) => (
          <li key={i}>{pt}</li>
        ))}
      </ul>
    );
  };

  return (
    <section className="experience section" id="experience">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <h2 className="section-title">
            Work &amp; <span>Education</span>
          </h2>
          <p className="section-desc">
            My professional journey, academic background, and technical milestones.
          </p>
        </div>

        <div className="timeline">
          <div className="timeline__line" />

          {loading && experiences.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              Loading timeline entries...
            </div>
          ) : (
            experiences.map((exp, index) => {
              const isLeft = index % 2 === 0;
              const hasLogo = exp.iconUrl && exp.iconUrl.trim().length > 0;

              return (
                <div key={exp._id || index} className={`timeline__item ${isLeft ? 'timeline__item--left' : 'timeline__item--right'} animate-fadeInUp`} style={{ animationDelay: `${index * 0.12}s` }}>
                  <div className="timeline__node">
                    {hasLogo ? (
                      <img src={exp.iconUrl} alt={exp.company} className="timeline__node-img" />
                    ) : (
                      <div className="timeline__node-placeholder">
                        {exp.type === 'work' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        )}
                        {exp.type === 'education' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                        )}
                        {exp.type === 'learning' && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="timeline__content card">
                    <div className="timeline__header">
                      {hasLogo ? (
                        <div className="timeline__card-logo">
                          <img src={exp.iconUrl} alt={exp.company} />
                        </div>
                      ) : (
                        <div className="timeline__card-logo timeline__card-logo--placeholder">
                          {exp.company.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="timeline__titles">
                        <h3 className="timeline__role">{exp.role}</h3>
                        <h4 className="timeline__company">{exp.company}</h4>
                        <span className="timeline__meta">{exp.period} &nbsp;•&nbsp; {exp.location}</span>
                      </div>
                    </div>
                    <div className="timeline__desc-wrapper">
                      {renderDescriptionPoints(exp.description)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default Experience;
