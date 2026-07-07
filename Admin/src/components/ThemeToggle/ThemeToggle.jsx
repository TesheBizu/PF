import { Sun, Moon } from 'lucide-react';

function ThemeToggle({ theme, onToggle, className = '' }) {
  return (
    <button
      type="button"
      className={`admin-theme-btn${className ? ` ${className}` : ''}`}
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;
