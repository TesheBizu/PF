import { Code2 } from 'lucide-react';
import { TbApi } from 'react-icons/tb';
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiReact,
  SiRedux,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiGit,
  SiGithub,
  SiPostman,
  SiHtml5,
  SiCss,
  SiVite,
  SiDocker,
  SiTailwindcss,
  SiNextdotjs,
  SiGraphql,
  SiFirebase,
  SiMysql,
  SiPostgresql,
  SiNpm,
  SiVercel,
  SiFigma,
} from 'react-icons/si';

/** Exact name → icon component */
export const SKILL_ICONS = {
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  Python: SiPython,
  React: SiReact,
  'Redux Toolkit': SiRedux,
  'Node.js': SiNodedotjs,
  'Express.js': SiExpress,
  'REST APIs': TbApi,
  MongoDB: SiMongodb,
  Git: SiGit,
  GitHub: SiGithub,
  Postman: SiPostman,
  HTML: SiHtml5,
  CSS: SiCss,
  Vite: SiVite,
  Docker: SiDocker,
  Tailwind: SiTailwindcss,
  'Tailwind CSS': SiTailwindcss,
  'Next.js': SiNextdotjs,
  GraphQL: SiGraphql,
  Firebase: SiFirebase,
  MySQL: SiMysql,
  PostgreSQL: SiPostgresql,
  npm: SiNpm,
  Vercel: SiVercel,
  Figma: SiFigma,
};

/** Normalized aliases for flexible DB name matching */
const SKILL_ALIASES = {
  javascript: SiJavascript,
  js: SiJavascript,
  typescript: SiTypescript,
  ts: SiTypescript,
  python: SiPython,
  py: SiPython,
  react: SiReact,
  reactjs: SiReact,
  'react.js': SiReact,
  redux: SiRedux,
  'redux toolkit': SiRedux,
  reduxtoolkit: SiRedux,
  nodejs: SiNodedotjs,
  node: SiNodedotjs,
  express: SiExpress,
  expressjs: SiExpress,
  'express.js': SiExpress,
  'rest apis': TbApi,
  'rest api': TbApi,
  restapis: TbApi,
  restapi: TbApi,
  api: TbApi,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  git: SiGit,
  github: SiGithub,
  postman: SiPostman,
  html: SiHtml5,
  html5: SiHtml5,
  css: SiCss,
  css3: SiCss,
  vite: SiVite,
  docker: SiDocker,
  tailwind: SiTailwindcss,
  'tailwind css': SiTailwindcss,
  tailwindcss: SiTailwindcss,
  nextjs: SiNextdotjs,
  'next.js': SiNextdotjs,
  next: SiNextdotjs,
  graphql: SiGraphql,
  firebase: SiFirebase,
  mysql: SiMysql,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  npm: SiNpm,
  vercel: SiVercel,
  figma: SiFigma,
};

function normalizeSkillName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getSkillIcon(name) {
  if (!name) return Code2;

  if (SKILL_ICONS[name]) return SKILL_ICONS[name];

  const normalized = normalizeSkillName(name);
  if (SKILL_ALIASES[normalized]) return SKILL_ALIASES[normalized];

  const noDots = normalized.replace(/\./g, '');
  if (SKILL_ALIASES[noDots]) return SKILL_ALIASES[noDots];

  const noSpaces = normalized.replace(/\s/g, '');
  if (SKILL_ALIASES[noSpaces]) return SKILL_ALIASES[noSpaces];

  return Code2;
}
