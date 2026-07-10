import { useState, useEffect, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { CATEGORIES, CATEGORY_COLORS } from '../../utils/skillCategories';
import './Skills.css';

const SkillsConstellation = lazy(() => import('../../components/ThreeD/SkillsConstellation'));

function Skills() {
  const dispatch = useDispatch();
  const { items: skills, loading, error } = useSelector((s) => s.skills);
  const [viewMode, setViewMode] = useState('3d');
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
  const filteredSkills = activeCat === 'All'
    ? skills
    : skills.filter((s) => s.category === activeCat);

  return (
    <section className="skills section" id="skills">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <h2 className="section-title">
            Technical <span>Skills</span>
          </h2>
          <p className="section-desc">
            My toolkit for building full-stack web applications.
          </p>
        </div>

        {!loading && skills.length > 0 && (
          <div className="skills__controls animate-fadeInUp delay-100">
            <div className="skills__view-toggle">
              <button
                className={`skills__view-btn${viewMode === '3d' ? ' skills__view-btn--active' : ''}`}
                onClick={() => setViewMode('3d')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                3D
              </button>
              <button
                className={`skills__view-btn${viewMode === 'grid' ? ' skills__view-btn--active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Grid
              </button>
            </div>
            <div className="skills__filter">
              <button
                className={`skills__filter-btn${activeCat === 'All' ? ' skills__filter-btn--active' : ''}`}
                onClick={() => setActiveCat('All')}
              >
                All
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  className={`skills__filter-btn${activeCat === cat ? ' skills__filter-btn--active' : ''}`}
                  onClick={() => setActiveCat(cat)}
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
            {viewMode === '3d' ? (
              <Suspense fallback={<div className="skeleton" style={{ height: 440, borderRadius: 16 }} />}>
                <SkillsConstellation skills={filteredSkills} />
              </Suspense>
            ) : (
              <div className="skills-grid">
                {activeCategories.map((category) => {
                  const items = grouped[category];
                  if (activeCat !== 'All' && activeCat !== category) return null;
                  const color = CATEGORY_COLORS[category] || 'var(--color-primary)';
                  return (
                    <div key={category} className="skills-card card">
                      <div className="skills-card__header" style={{ color }}>
                        <span className="skills-card__header-dot" style={{ background: color }} />
                        {category}
                      </div>
                      <div className="skills-card__list">
                        {items.map((skill) => (
                          <div key={skill._id} className="skills-card__item">
                            <div className="skills-card__item-top">
                              <span className="skills-card__name">{skill.name}</span>
                              <span className="skills-card__percent">{skill.proficiency}%</span>
                            </div>
                            <div className="skills-card__bar">
                              <div className="skills-card__bar-fill" style={{ width: `${skill.proficiency}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
