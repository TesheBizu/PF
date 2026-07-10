import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { CATEGORIES, CATEGORY_COLORS } from '../../utils/skillCategories';
import { getSkillIcon } from '../../utils/skillIcons';
import './Skills.css';

function Skills() {
  const dispatch = useDispatch();
  const { items: skills, loading, error } = useSelector((s) => s.skills);

  useEffect(() => {
    if (skills.length === 0) dispatch(fetchSkills());
  }, [dispatch, skills.length]);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = skills
      .filter((s) => s.category === cat)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (items.length) acc[cat] = items;
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
          <div className="skills__skeleton">
            <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
          </div>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>
            Failed to load skills. Please try again.
          </p>
        )}

        {!loading && !error && skills.length > 0 && (
          <div className="skills-grid">
            {CATEGORIES.map((category) => {
              const items = grouped[category];
              if (!items?.length) return null;
              const color = CATEGORY_COLORS[category] || 'var(--color-primary)';
              return (
                <div key={category} className="skills-card card">
                  <div className="skills-card__header" style={{ color }}>
                    {category}
                  </div>
                  <div className="skills-card__list">
                    {items.map((skill) => {
                      const Icon = getSkillIcon(skill.name);
                      return (
                        <div key={skill._id} className="skills-card__item">
                          <div className="skills-card__item-top">
                            <span className="skills-card__icon"><Icon size={16} /></span>
                            <span className="skills-card__name">{skill.name}</span>
                            <span className="skills-card__percent">{skill.proficiency}%</span>
                          </div>
                          <div className="skills-card__bar">
                            <div className="skills-card__bar-fill" style={{ width: `${skill.proficiency}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && skills.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No skills added yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default Skills;
