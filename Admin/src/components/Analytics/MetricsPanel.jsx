import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users, Eye, Clock, MessageSquare, TrendingUp, TrendingDown,
  Download, Search, ArrowUpDown, Star, BarChart3, RefreshCw,
  Calendar,
} from 'lucide-react';
import { fetchAnalytics, realtimeAnalyticsUpdate } from '../../redux/slices/analyticsSlice';
import './AnalyticsPanels.css';

const DATE_RANGES = [
  { label: '7d', value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

function TrendBadge({ value }) {
  if (value == null) return null;
  const isUp = value >= 0;
  return (
    <span className={`mt-kpi-trend mt-kpi-trend--${isUp ? 'up' : 'down'}`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isUp ? '+' : ''}{value}%
    </span>
  );
}

function metricCardColor(index) {
  const colors = [
    { gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', bg: 'rgba(99,102,241,0.08)', iconBg: 'linear-gradient(135deg, #6366f1, #818cf8)' },
    { gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', bg: 'rgba(59,130,246,0.08)', iconBg: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', bg: 'rgba(6,182,212,0.08)', iconBg: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
    { gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', bg: 'rgba(139,92,246,0.08)', iconBg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  ];
  return colors[index % colors.length];
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function MetricsPanel() {
  const dispatch = useDispatch();
  const { summary, entries, pageViewsByPage, loading } = useSelector((s) => s.analytics);
  const { items: projects } = useSelector((s) => s.projects);
  const [days, setDays] = useState(30);
  const [sortField, setSortField] = useState('views');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAnalytics(days));
  }, [dispatch, days]);

  const kpis = useMemo(() => {
    const totalVisitors = summary?.visitors || 0;
    const totalUnique = summary?.uniqueUsers || 0;
    const totalPageViews = summary?.pageViews || 0;
    const totalInteractions = summary?.interactions || 0;
    const contactSubs = summary?.contactSubmissions || 0;
    const totalDays = entries?.length || 1;
    const recent = entries?.slice(-Math.max(1, Math.floor(days / 2))) || [];
    const prior = entries?.slice(0, Math.max(0, entries.length - Math.floor(days / 2))) || [];

    const sum = (arr, key) => arr.reduce((s, e) => s + (e[key] || 0), 0);
    const recentVisitors = sum(recent, 'visitors');
    const priorVisitors = sum(prior, 'visitors');
    const recentPageViews = sum(recent, 'pageViews');
    const priorPageViews = sum(prior, 'pageViews');
    const recentInteractions = sum(recent, 'interactions');
    const priorInteractions = sum(prior, 'interactions');
    const recentContact = contactSubs; // contactSubs is total, use overall

    const calcTrend = (recentVal, priorVal) => {
      if (priorVal <= 0) return recentVal > 0 ? 100 : 0;
      return Math.round(((recentVal - priorVal) / priorVal) * 100);
    };

    const avgDuration = totalInteractions > 0
      ? Math.round((totalInteractions * 45) / Math.max(1, totalUnique))
      : 0;

    const convRate = totalVisitors > 0
      ? parseFloat(((contactSubs / totalVisitors) * 100).toFixed(2))
      : 0;

    return {
      uniqueVisitors: {
        value: totalUnique,
        trend: calcTrend(recentVisitors, priorVisitors),
        icon: Users,
        label: 'Unique Visitors',
        format: 'number',
      },
      pageViews: {
        value: totalPageViews,
        trend: calcTrend(recentPageViews, priorPageViews),
        icon: Eye,
        label: 'Page Views',
        format: 'number',
      },
      avgDuration: {
        value: avgDuration,
        trend: calcTrend(recentInteractions, priorInteractions),
        icon: Clock,
        label: 'Avg Session Duration',
        format: 'duration',
      },
      convRate: {
        value: convRate,
        trend: calcTrend(recentContact, priorContact || 1),
        icon: MessageSquare,
        label: 'Contact Conv. Rate',
        format: 'percent',
      },
    };
  }, [summary, entries, days]);

  const projectViews = useMemo(() => {
    if (!pageViewsByPage || !projects?.length) return [];
    const matched = [];
    for (const project of projects) {
      const slug = project.slug?.toLowerCase();
      if (!slug) continue;
      let views = 0;
      for (const [path, count] of Object.entries(pageViewsByPage)) {
        if (path.toLowerCase().includes(slug)) views += count;
      }
      if (views > 0) {
        matched.push({ _id: project._id, title: project.title, slug: project.slug, views, featured: project.featured });
      }
    }
    const totalViews = matched.reduce((s, p) => s + p.views, 0);
    return matched.map((p) => ({ ...p, pct: totalViews > 0 ? parseFloat(((p.views / totalViews) * 100).toFixed(1)) : 0 }));
  }, [pageViewsByPage, projects]);

  const sortedProjects = useMemo(() => {
    let list = [...projectViews];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') cmp = (a.title || '').localeCompare(b.title || '');
      else if (sortField === 'views') cmp = a.views - b.views;
      else if (sortField === 'pct') cmp = a.pct - b.pct;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [projectViews, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const formatValue = (kpi) => {
    const v = kpi.value;
    if (v == null) return '—';
    if (kpi.format === 'percent') return `${v}%`;
    if (kpi.format === 'duration') return formatDuration(v);
    return typeof v === 'number' ? v.toLocaleString() : v;
  };

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Metric', 'Value', 'Trend'],
      ['Unique Visitors', kpis.uniqueVisitors.value, `${kpis.uniqueVisitors.trend}%`],
      ['Page Views', kpis.pageViews.value, `${kpis.pageViews.trend}%`],
      ['Avg Session Duration (s)', kpis.avgDuration.value, `${kpis.avgDuration.trend}%`],
      ['Contact Conv. Rate (%)', kpis.convRate.value, `${kpis.convRate.trend}%`],
      [],
      ['Project', 'Views', '% of Total'],
    ];
    for (const p of sortedProjects) {
      rows.push([p.title, p.views, `${p.pct}%`]);
    }
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-views-${days}d.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [kpis, sortedProjects, days]);

  const totalProjectViews = projectViews.reduce((s, p) => s + p.views, 0);

  return (
    <div className="mt-panel animate-fadeInUp">
      {/* Header */}
      <div className="mt-header">
        <div className="mt-header__left">
          <div className="mt-header__brand">
            <div className="mt-header__icon">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="mt-header__title">Metrics Dashboard</h2>
              <p className="mt-header__subtitle">Real-time project performance & engagement</p>
            </div>
          </div>
        </div>
        <div className="mt-header__right">
          <div className="mt-date-range">
            <Calendar size={13} className="mt-date-range__icon" />
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                className={`mt-date-btn${days === r.value ? ' mt-date-btn--active' : ''}`}
                onClick={() => setDays(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button className="mt-btn mt-btn--primary" onClick={handleExportCSV} title="Export to CSV">
            <Download size={14} /> Export CSV
          </button>
          <button className="mt-btn" onClick={() => dispatch(fetchAnalytics(days))} title="Refresh data">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton mt-kpi-skeleton" />
          ))}
        </div>
      ) : summary ? (
        <>
          {/* KPI Cards */}
          <div className="mt-kpi-grid">
            {Object.values(kpis).map((kpi, idx) => {
              const colors = metricCardColor(idx);
              return (
                <div key={kpi.label} className="mt-kpi-card" style={{ '--mt-gradient': colors.gradient, '--mt-bg': colors.bg }}>
                  <div className="mt-kpi-card__top">
                    <div className="mt-kpi-card__icon" style={{ background: colors.iconBg }}>
                      <kpi.icon size={16} />
                    </div>
                    <TrendBadge value={kpi.trend} />
                  </div>
                  <div className="mt-kpi-card__value">{formatValue(kpi)}</div>
                  <div className="mt-kpi-card__label">{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {/* Most Viewed Projects */}
          <div className="mt-table-card">
            <div className="mt-table-card__header">
              <div className="mt-table-card__title">
                <Star size={15} />
                Most Viewed Projects
              </div>
              <div className="mt-table-card__search">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {sortedProjects.length > 0 ? (
              <>
                <div className="mt-table-wrap">
                  <table className="mt-table">
                    <thead>
                      <tr>
                        <th className="mt-table__rank">#</th>
                        <th className="mt-table__sortable" onClick={() => handleSort('title')}>
                          Project <ArrowUpDown size={11} />
                        </th>
                        <th className="mt-table__sortable" onClick={() => handleSort('views')}>
                          Views <ArrowUpDown size={11} />
                        </th>
                        <th className="mt-table__sortable" onClick={() => handleSort('pct')}>
                          % of Total <ArrowUpDown size={11} />
                        </th>
                        <th>Featured</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProjects.map((proj, i) => (
                        <tr key={proj._id} className="mt-table__row">
                          <td className="mt-table__rank">{i + 1}</td>
                          <td>
                            <div className="mt-table__name">{proj.title}</div>
                            <div className="mt-table__slug">/{proj.slug}</div>
                          </td>
                          <td className="mt-table__value">{proj.views.toLocaleString()}</td>
                          <td>
                            <div className="mt-pct-bar">
                              <div className="mt-pct-bar__fill" style={{ width: `${Math.max(2, proj.pct)}%` }} />
                            </div>
                            <span className="mt-pct-label">{proj.pct}%</span>
                          </td>
                          <td>
                            {proj.featured ? (
                              <span className="mt-badge mt-badge--featured">
                                <Star size={10} /> Featured
                              </span>
                            ) : (
                              <span className="mt-badge mt-badge--standard">Standard</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-table-footer">
                  Showing {sortedProjects.length} of {projectViews.length} projects &middot;{' '}
                  {totalProjectViews.toLocaleString()} total project views
                </div>
              </>
            ) : (
              <div className="empty-panel">
                <BarChart3 size={28} />
                <h3>No project view data yet</h3>
                <p>Visit the public site to generate analytics, then refresh.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-panel">
          <BarChart3 size={32} />
          <h3>No analytics data yet</h3>
          <p>Visit the public site to generate data, then refresh.</p>
        </div>
      )}
    </div>
  );
}
