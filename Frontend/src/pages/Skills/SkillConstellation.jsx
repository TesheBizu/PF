import { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS, computeConstellationNodes } from '../../utils/skillCategories';
import { getSkillIcon } from '../../utils/skillIcons';
import './SkillConstellation.css';

/** Place tooltip above or below node based on canvas position */
function getTooltipPlacement(y) {
  return y < 32 ? 'below' : 'above';
}

function SkillTooltip({ node }) {
  const { skill, category, color } = node;
  const Icon = getSkillIcon(skill.name);

  return (
    <div className="skill-tooltip" style={{ '--tooltip-color': color }}>
      <div className="skill-tooltip__header">
        <span className="skill-tooltip__icon">
          <Icon size={18} />
        </span>
        <div>
          <div className="skill-tooltip__name">{skill.name}</div>
          <div className="skill-tooltip__category">{category}</div>
        </div>
      </div>
      <div className="skill-tooltip__bar-wrap">
        <div className="skill-tooltip__bar">
          <div
            className="skill-tooltip__bar-fill"
            style={{ width: `${skill.proficiency}%`, background: color }}
          />
        </div>
        <span className="skill-tooltip__percent">{skill.proficiency}%</span>
      </div>
    </div>
  );
}

function SkillNode({ node, isFocused, isDimmed, onHover, onLeave }) {
  const { skill, x, y, color } = node;
  const Icon = getSkillIcon(skill.name);
  const placement = getTooltipPlacement(y);

  return (
    <div
      className={`skill-node-wrap${isFocused ? ' skill-node-wrap--focused' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <button
        type="button"
        className={`skill-node${isFocused ? ' skill-node--focused' : ''}${isDimmed ? ' skill-node--dimmed' : ''}`}
        style={{ '--node-color': color }}
        onMouseEnter={() => onHover(skill._id)}
        onMouseLeave={onLeave}
        onFocus={() => onHover(skill._id)}
        onBlur={onLeave}
        aria-label={`${skill.name}, ${skill.category}, ${skill.proficiency}% proficiency`}
      >
        <Icon size={22} aria-hidden="true" />
      </button>

      {isFocused && (
        <div className={`skill-tooltip-anchor skill-tooltip-anchor--${placement}`}>
          <SkillTooltip node={node} />
        </div>
      )}
    </div>
  );
}

function MobileSkillGrid({ grouped, hoveredId, onHover, onLeave }) {
  return (
    <div className="skills-mobile-grid">
      {CATEGORIES.map((category) => {
        const items = grouped[category];
        if (!items?.length) return null;
        const color = CATEGORY_COLORS[category];

        return (
          <div key={category} className="skills-mobile-grid__group">
            <div className="skills-mobile-grid__label" style={{ color }}>
              {category}
            </div>
            <div className="skills-mobile-grid__nodes">
              {items.map((skill) => {
                const Icon = getSkillIcon(skill.name);
                const isFocused = hoveredId === skill._id;
                const isDimmed = hoveredId && hoveredId !== skill._id;
                const node = { skill, category, color };

                return (
                  <div
                    key={skill._id}
                    className={`skill-node-wrap skill-node-wrap--mobile${isFocused ? ' skill-node-wrap--focused' : ''}`}
                  >
                    <button
                      type="button"
                      className={`skill-node skill-node--mobile${isFocused ? ' skill-node--focused' : ''}${isDimmed ? ' skill-node--dimmed' : ''}`}
                      style={{ '--node-color': color }}
                      onMouseEnter={() => onHover(skill._id)}
                      onMouseLeave={onLeave}
                      onFocus={() => onHover(skill._id)}
                      onBlur={onLeave}
                      aria-label={`${skill.name}, ${skill.proficiency}%`}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </button>
                    {isFocused && (
                      <div className="skill-tooltip-anchor skill-tooltip-anchor--below skill-tooltip-anchor--mobile">
                        <SkillTooltip node={node} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillConstellation({ skills }) {
  const [hoveredId, setHoveredId] = useState(null);
  const { nodes, lines, grouped, activeCategories } = useMemo(
    () => computeConstellationNodes(skills),
    [skills]
  );

  const hoveredNode = nodes.find((n) => n.skill._id === hoveredId) || null;
  const isHovering = Boolean(hoveredId);

  return (
    <div className={`skills-constellation${isHovering ? ' skills-constellation--hovering' : ''}`}>
      {/* Desktop constellation */}
      <div className="skills-constellation__canvas">
        <svg
          className="skills-constellation__lines"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {lines.map((line, i) => {
            const isHighlighted =
              !isHovering || line.category === hoveredNode?.category;

            return (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.color}
                strokeWidth={isHighlighted && isHovering ? 0.35 : 0.2}
                opacity={isHighlighted ? (isHovering ? 0.7 : 0.35) : 0.12}
                className="skills-constellation__line"
              />
            );
          })}
        </svg>

        <div className="skills-constellation__hub" aria-hidden="true">
          <Layers size={22} />
          <span>Full Stack</span>
        </div>

        {nodes.map((node) => (
          <SkillNode
            key={node.skill._id}
            node={node}
            isFocused={hoveredId === node.skill._id}
            isDimmed={isHovering && hoveredId !== node.skill._id}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
          />
        ))}
      </div>

      {/* Mobile fallback */}
      <div className="skills-constellation__mobile">
        <MobileSkillGrid
          grouped={grouped}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onLeave={() => setHoveredId(null)}
        />
      </div>

      {/* Legend */}
      <div className="skills-constellation__legend">
        {activeCategories.map((cat) => (
          <span key={cat} className="skills-constellation__legend-item">
            <span
              className="skills-constellation__legend-dot"
              style={{ background: CATEGORY_COLORS[cat] }}
            />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SkillConstellation;
