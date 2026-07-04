export const CATEGORIES = ['Programming', 'Frontend', 'Backend', 'Database', 'Tools', 'Other'];

export const CATEGORY_COLORS = {
  Programming: '#6378ff',
  Frontend: '#00e5ff',
  Backend: '#a78bfa',
  Database: '#00c896',
  Tools: '#ffcc00',
  Other: '#ff5370',
};

/**
 * Compute polar → % positions for constellation layout.
 * Groups skills by category into sectors around a center hub.
 */
export function computeConstellationNodes(skills) {
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = skills
      .filter((s) => s.category === cat)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const activeCategories = CATEGORIES.filter((cat) => grouped[cat]?.length);
  const sectorSize = 360 / Math.max(activeCategories.length, 1);
  const nodes = [];

  activeCategories.forEach((category, catIndex) => {
    const items = grouped[category];
    const baseAngle = -90 + catIndex * sectorSize + sectorSize / 2;

    items.forEach((skill, skillIndex) => {
      const ring = Math.floor(skillIndex / 2) + 1;
      const spread = (skillIndex - (items.length - 1) / 2) * (sectorSize * 0.18);
      const radius = 20 + ring * 11;
      const angleRad = ((baseAngle + spread) * Math.PI) / 180;

      nodes.push({
        skill,
        category,
        x: 50 + radius * Math.cos(angleRad),
        y: 50 + radius * Math.sin(angleRad),
        color: CATEGORY_COLORS[category],
      });
    });
  });

  const lines = [];
  activeCategories.forEach((category) => {
    const catNodes = nodes.filter((n) => n.category === category);
    if (!catNodes.length) return;

    lines.push({
      x1: 50, y1: 50,
      x2: catNodes[0].x, y2: catNodes[0].y,
      color: CATEGORY_COLORS[category],
      category,
    });

    for (let i = 0; i < catNodes.length - 1; i += 1) {
      lines.push({
        x1: catNodes[i].x, y1: catNodes[i].y,
        x2: catNodes[i + 1].x, y2: catNodes[i + 1].y,
        color: CATEGORY_COLORS[category],
        category,
      });
    }
  });

  return { nodes, lines, grouped, activeCategories };
}
