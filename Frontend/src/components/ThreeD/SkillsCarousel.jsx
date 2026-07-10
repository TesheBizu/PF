import { useState, useRef, useEffect, createElement } from 'react';
import { getSkillIcon } from '../../utils/skillIcons';
import { CATEGORY_COLORS } from '../../utils/skillCategories';

export default function SkillsCarousel({ skills }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const total = skills.length;
  if (!total) return null;

  useEffect(() => {
    if (!isHovered) {
      const id = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % total);
      }, 2500);
      return () => clearInterval(id);
    }
  }, [isHovered, total]);

  const visible = [];
  for (let i = -2; i <= 2; i++) {
    visible.push((activeIndex + i + total) % total);
  }

  return (
    <div
      className="skills__carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="skills__carousel-stage">
        {visible.map((idx) => {
          const skill = skills[idx];
          const Icon = getSkillIcon(skill.name);
          const color = CATEGORY_COLORS[skill.category] || '#3B82F6';
          const offset = ((idx - activeIndex + total) % total);
          const relOffset = offset > 2 ? offset - total : offset;
          const absOff = Math.abs(relOffset);
          const isCenter = relOffset === 0;

          const x = relOffset * 220;
          const z = isCenter ? 60 : relOffset > 0 ? -20 : -40;
          const s = 1 - absOff * 0.12;
          const o = 1 - absOff * 0.35;
          const b = absOff * 1.5;

          return (
            <div
              key={skill._id}
              className={`skills__carousel-card${isCenter ? ' skills__carousel-card--center' : ''}`}
              style={{
                transform: `translateX(${x}px) translateZ(${z}px) scale(${s})`,
                opacity: o,
                filter: `blur(${b}px)`,
                zIndex: isCenter ? 10 : 5 - absOff,
                '--card-color': color,
              }}
              onClick={() => setActiveIndex(idx)}
            >
              <div className="skills__carousel-badge">
                {createElement(Icon, { size: 28 })}
              </div>
              <div className="skills__carousel-name">{skill.name}</div>
              <div className="skills__carousel-cat" style={{ color }}>{skill.category}</div>
              <div className="skills__carousel-bar">
                <div
                  className="skills__carousel-bar-fill"
                  style={{
                    width: isCenter ? `${skill.proficiency}%` : '0%',
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="skills__carousel-dots">
        {skills.map((_, idx) => (
          <button
            key={idx}
            className={`skills__carousel-dot${idx === activeIndex ? ' skills__carousel-dot--active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to skill ${idx + 1}`}
          />
        ))}
      </div>

      <div className="skills__carousel-glow" aria-hidden="true" />
    </div>
  );
}
