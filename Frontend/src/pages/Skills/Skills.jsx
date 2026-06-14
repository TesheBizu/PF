import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import './Skills.css';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools'];

const CATEGORY_ICONS = {
  Frontend: '🎨',
  Backend:  '⚙️',
  Database: '🗄️',
  Tools:    '🔧',
};

function SkillBar({ skill, index }) {
  return (
    <div className="skill-item" style={{ animationDelay: `${index * 0.07}s` }}>
      <div className="skill-item__header">
        <span className="skill-item__name">{skill.name}</span>
        <span className="skill-item__pct">{skill.proficiency}%</span>
      </div>
      <div className="skill-item__track">
        <div
          className="skill-item__bar"
          style={{ '--target-width': `${skill.proficiency}%` }}
        />
      </div>
    </div>
  );
}

function Skills() {
  const dispatch = useDispatch();
  const { items: skills, loading, error } = useSelector((s) => s.skills);

  useEffect(() => {
    if (skills.length === 0) dispatch(fetchSkills());
  }, [dispatch, skills.length]);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <section className="skills section" id="skills">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <span className="section-tag">// skills</span>
          <h2 className="section-title">
            Technical <span>Skills</span>
          </h2>
          <p className="section-desc">
            My toolkit for building full-stack web applications from idea to deployment.
          </p>
        </div>

        {loading && (
          <div className="skills__skeleton-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            ))}
          </div>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>
            Failed to load skills. Please try again.
          </p>
        )}

        {!loading && !error && (
          <div className="skills__grid">
            {CATEGORIES.map((cat) =>
              grouped[cat]?.length > 0 ? (
                <div key={cat} className="skills__category card animate-fadeInUp">
                  <div className="skills__cat-header">
                    <span className="skills__cat-icon">{CATEGORY_ICONS[cat]}</span>
                    <h3 className="skills__cat-title">{cat}</h3>
                    <span className="badge">{grouped[cat].length} skills</span>
                  </div>
                  <div className="skills__bars">
                    {grouped[cat].map((skill, idx) => (
                      <SkillBar key={skill._id} skill={skill} index={idx} />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Tech badges strip */}
        {!loading && skills.length > 0 && (
          <div className="skills__badges animate-fadeInUp">
            <p className="skills__badges-title">All Technologies</p>
            <div className="skills__badges-list">
              {skills.map((s) => (
                <span key={s._id} className="badge skills__badge">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Skills;
