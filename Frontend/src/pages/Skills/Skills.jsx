import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import SkillConstellation from './SkillConstellation';
import './Skills.css';

function Skills() {
  const dispatch = useDispatch();
  const { items: skills, loading, error } = useSelector((s) => s.skills);

  useEffect(() => {
    if (skills.length === 0) dispatch(fetchSkills());
  }, [dispatch, skills.length]);

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
            Hover a skill to explore proficiency.
          </p>
        </div>

        {loading && (
          <div className="skills__skeleton">
            <div className="skeleton skills__skeleton-circle" />
          </div>
        )}

        {error && (
          <p style={{ textAlign: 'center', color: 'var(--color-error)' }}>
            Failed to load skills. Please try again.
          </p>
        )}

        {!loading && !error && skills.length > 0 && (
          <SkillConstellation skills={skills} />
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
