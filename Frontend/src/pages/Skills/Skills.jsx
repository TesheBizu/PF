import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { Code2, Layout, Server, Database as DbIcon, Wrench, Sparkles } from 'lucide-react';
import './Skills.css';

const CATEGORIES = ['Programming', 'Frontend', 'Backend', 'Database', 'Tools', 'Other'];

const CATEGORY_ICONS = {
  Programming: Code2,
  Frontend: Layout,
  Backend: Server,
  Database: DbIcon,
  Tools: Wrench,
  Other: Sparkles,
};

function SkillItem({ skill, index, showPercent }) {
  return (
    <div className="skill-item animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="skill-item__info">
        <span className="skill-item__name">{skill.name}</span>
        {showPercent && <span className="skill-item__percent">{skill.proficiency}%</span>}
      </div>
      <div className="skill-item__progress-bar">
        <div className="skill-item__progress-fill" style={{ width: `${skill.proficiency}%` }} />
      </div>
    </div>
  );
}

function Skills() {
  const dispatch = useDispatch();
  const { items: skills, loading, error } = useSelector((s) => s.skills);
  const [showPercent, setShowPercent] = useState(false);

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
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />
            ))}
          </div>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>
            Failed to load skills. Please try again.
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="skills__controls animate-fadeInUp">
              <label className="skills__toggle-label">
                <input
                  type="checkbox"
                  checked={showPercent}
                  onChange={() => setShowPercent(!showPercent)}
                  className="skills__toggle-input"
                />
                <span className="skills__toggle-custom" />
                <span className="skills__toggle-text">Show Proficiency Percentages</span>
              </label>
            </div>

            <div className="skills__grid">
              {CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat];
                return grouped[cat]?.length > 0 ? (
                  <div key={cat} className="skills__category card animate-fadeInUp">
                    <div className="skills__cat-header">
                      <span className="skills__cat-icon">
                        {IconComponent && <IconComponent size={20} className="skills__cat-lucide" />}
                      </span>
                      <h3 className="skills__cat-title">{cat}</h3>
                      <span className="badge">{grouped[cat].length} skills</span>
                    </div>
                    <div className="skills__list">
                      {grouped[cat].map((skill, idx) => (
                        <SkillItem key={skill._id} skill={skill} index={idx} showPercent={showPercent} />
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Skills;
