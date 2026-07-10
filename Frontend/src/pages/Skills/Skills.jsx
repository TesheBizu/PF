import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CATEGORIES, CATEGORY_COLORS } from '../../utils/skillCategories';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { trackInteraction } from '../../services/analytics';
import SkillsCarousel from '../../components/ThreeD/SkillsCarousel';
import './Skills.css';

function Skills() {
  const dispatch = useDispatch();
  const { items: skills, loading, error } = useSelector((s) => s.skills);
  const sections = useSelector((s) => s.sections?.items || {});
  const skillsSection = sections.skills || {};
  const [activeCat, setActiveCat] = useState('All');

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
  const filtered = activeCat === 'All'
    ? skills
    : skills.filter((s) => s.category === activeCat);

  return (
    <section className="skills section" id="skills">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <h2 className="section-title"
            dangerouslySetInnerHTML={{ __html: skillsSection.title || 'Technical <span>Skills</span>' }}
          />
          <p className="section-desc">
            {skillsSection.description || 'My toolkit for building full-stack web applications.'}
          </p>
        </div>

        {!loading && skills.length > 0 && (
          <div className="skills__controls animate-fadeInUp delay-100">
            <div className="skills__filter">
              <button
                className={`skills__filter-btn${activeCat === 'All' ? ' skills__filter-btn--active' : ''}`}
                onClick={() => { setActiveCat('All'); trackInteraction('skill_filter', { category: 'All' }); }}
              >
                All
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  className={`skills__filter-btn${activeCat === cat ? ' skills__filter-btn--active' : ''}`}
                  onClick={() => { setActiveCat(cat); trackInteraction('skill_filter', { category: cat }); }}
                >
                  <span className="skills__filter-dot" style={{ background: CATEGORY_COLORS[cat] }} />
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="skeleton" style={{ height: 400, borderRadius: 16, marginBottom: 'var(--space-xl)' }} />
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>
            Failed to load skills. Please try again.
          </p>
        )}

        {!loading && !error && skills.length > 0 && (
          <div className="skills__scene animate-fadeInUp delay-200">
            <SkillsCarousel skills={filtered} />
          </div>
        )}

        {!loading && !error && skills.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No skills added yet.
          </p>
        )}

        <div className="skills__legend animate-fadeInUp delay-300">
          {activeCategories.map((cat) => (
            <span key={cat} className="skills__legend-item">
              <span className="skills__legend-dot" style={{ background: CATEGORY_COLORS[cat] }} />
              {cat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Skills;
