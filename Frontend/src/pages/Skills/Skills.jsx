import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { CATEGORIES, CATEGORY_COLORS } from '../../utils/skillCategories';
import { getSkillIcon } from '../../utils/skillIcons';
import './Skills.css';

function SkillCard3D({ category, items, color, index }) {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -10;
    const tiltY = (x - 0.5) * 10;
    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
  };

  const handleLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = '';
    }
  };

  return (
    <div
      ref={cardRef}
      className="skills-card card"
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
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
}

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

  const activeCategories = CATEGORIES.filter((cat) => grouped[cat]?.length);

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
            {activeCategories.map((category, catIndex) => {
              const items = grouped[category];
              const color = CATEGORY_COLORS[category] || 'var(--color-primary)';
              return (
                <SkillCard3D
                  key={category}
                  category={category}
                  items={items}
                  color={color}
                  index={catIndex}
                />
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
