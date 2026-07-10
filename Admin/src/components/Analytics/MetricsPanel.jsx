import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  TrendingUp, BarChart3, Activity, Users, Eye, MousePointerClick, Star, MessageSquare,
  Briefcase, Zap, History, Plus, X, Save, Download, Search, ArrowUpDown,
  Clock, Calendar, LayoutDashboard, Trash2, Edit3, Check, Filter,
} from 'lucide-react';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import './AnalyticsPanels.css';

const SORTABLE_METRICS = [
  { key: 'total_visitors', label: 'Total Visitors', description: 'Total number of site visits', category: 'traffic' },
  { key: 'unique_users', label: 'Unique Users', description: 'Distinct visitors counted once per day', category: 'traffic' },
  { key: 'total_pageviews', label: 'Total Page Views', description: 'Total pages loaded', category: 'engagement' },
  { key: 'avg_visit_duration', label: 'Avg Visit Duration', description: 'Average time spent per visit', category: 'engagement' },
  { key: 'bounce_rate', label: 'Bounce Rate', description: 'Visitors who left after one page', category: 'engagement' },
  { key: 'engagement_rate', label: 'Engagement Rate', description: 'Visitors who interacted', category: 'engagement' },
  { key: 'social_clicks', label: 'Social Link Clicks', description: 'Total clicks on social links', category: 'conversion' },
  { key: 'contact_submissions', label: 'Contact Submissions', description: 'Messages sent via contact form', category: 'conversion' },
  { key: 'testimonial_conv', label: 'Testimonial Conversions', description: 'Visitors who submitted testimonials', category: 'conversion' },
  { key: 'pages_per_visit', label: 'Pages / Visit', description: 'Average pages viewed per visit', category: 'engagement' },
  { key: 'growth_rate', label: 'Growth Rate (MoM)', description: 'Month-over-month visitor growth percentage', category: 'trends' },
  { key: 'avg_daily_visitors', label: 'Avg Daily Visitors', description: 'Average visitors per day over period', category: 'traffic' },
];

const DEFAULT_SAVED_DASHBOARDS = [
  { id: 'default-1', name: 'Traffic Overview', metrics: ['total_visitors', 'unique_users', 'avg_daily_visitors', 'growth_rate', 'avg_visit_duration'] },
  { id: 'default-2', name: 'Engagement Metrics', metrics: ['total_pageviews', 'pages_per_visit', 'bounce_rate', 'engagement_rate', 'avg_visit_duration'] },
  { id: 'default-3', name: 'Conversion Funnel', metrics: ['total_visitors', 'social_clicks', 'contact_submissions', 'testimonial_conv', 'engagement_rate'] },
];

function loadSavedDashboards() {
  try {
    const stored = localStorage.getItem('analytics_saved_dashboards');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_SAVED_DASHBOARDS;
}

export default function MetricsPanel() {
  const dispatch = useDispatch();
  const { summary, entries, loading } = useSelector((s) => s.analytics);
  const { items: projects } = useSelector((s) => s.projects);
  const { items: skills } = useSelector((s) => s.skills);
  const { items: experiences } = useSelector((s) => s.experiences);
  const { items: testimonials } = useSelector((s) => s.testimonials);
  const { items: messages } = useSelector((s) => s.messages);

  const [savedDashboards, setSavedDashboards] = useState(loadSavedDashboards);
  const [activeDashboard, setActiveDashboard] = useState(savedDashboards[0]?.id || null);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateDashboard, setShowCreateDashboard] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardMetrics, setNewDashboardMetrics] = useState([]);
  const [editingDashboard, setEditingDashboard] = useState(null);
  const [expandedMetric, setExpandedMetric] = useState(null);

  const computedMetrics = useMemo(() => {
    const totalVisitors = summary?.visitors || 0;
    const totalPageViews = summary?.pageViews || 0;
    const totalUnique = summary?.uniqueUsers || 0;
    const totalInteractions = summary?.interactions || 0;
    const totalDays = entries?.length || 1;
    const avgDaily = summary?.avgVisitorsPerDay || Math.round(totalVisitors / totalDays);
    const pagesPerVisit = summary?.avgPageViewsPerVisitor || (totalVisitors > 0 ? (totalPageViews / totalVisitors).toFixed(1) : '0.0');
    const socialClicks = summary?.socialLinkClicks || 0;
    const contactSubs = summary?.contactSubmissions || 0;
    const testimonialConvs = summary?.testimonialConversions || 0;
    const growthRate = summary?.growthRate != null ? summary.growthRate : 0;
    const engagementRate = totalVisitors > 0 ? ((totalInteractions / totalVisitors) * 100).toFixed(1) : '0.0';
    const bounceRate = totalVisitors > 0 ? Math.max(0, Math.min(100, ((totalVisitors - totalInteractions) / totalVisitors) * 100).toFixed(1)) : '0.0';
    const avgDuration = entries?.length > 0
      ? Math.round(entries.reduce((s, e) => s + (e.interactions || 0), 0) / entries.length * 45)
      : 0;

    return {
      total_visitors: { value: totalVisitors, change: growthRate, format: 'number' },
      unique_users: { value: totalUnique, format: 'number' },
      total_pageviews: { value: totalPageViews, format: 'number' },
      avg_visit_duration: { value: avgDuration, format: 'duration' },
      bounce_rate: { value: bounceRate, format: 'percent' },
      engagement_rate: { value: engagementRate, format: 'percent' },
      social_clicks: { value: socialClicks, format: 'number' },
      contact_submissions: { value: contactSubs, format: 'number' },
      testimonial_conv: { value: testimonialConvs, format: 'number' },
      pages_per_visit: { value: pagesPerVisit, format: 'decimal' },
      growth_rate: { value: growthRate, format: 'percent', change: growthRate },
      avg_daily_visitors: { value: avgDaily, format: 'number' },
    };
  }, [summary, entries]);

  const activeMetrics = useMemo(() => {
    const dash = savedDashboards.find((d) => d.id === activeDashboard);
    if (!dash) return [];
    const filtered = SORTABLE_METRICS.filter((m) => dash.metrics.includes(m.key));
    let result = filtered.map((m) => ({ ...m, computed: computedMetrics[m.key] }));
    if (search) {
      result = result.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterCategory !== 'all') {
      result = result.filter((m) => m.category === filterCategory);
    }
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a.computed?.value ?? 0;
        const bVal = b.computed?.value ?? 0;
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }
    return result;
  }, [activeDashboard, savedDashboards, computedMetrics, search, filterCategory, sortField, sortDir]);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(key);
      setSortDir('desc');
    }
  };

  const persistDashboards = useCallback((dashboards) => {
    setSavedDashboards(dashboards);
    localStorage.setItem('analytics_saved_dashboards', JSON.stringify(dashboards));
  }, []);

  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return;
    const id = `custom-${Date.now()}`;
    const dash = { id, name: newDashboardName.trim(), metrics: newDashboardMetrics.length > 0 ? newDashboardMetrics : SORTABLE_METRICS.slice(0, 5).map((m) => m.key) };
    persistDashboards([...savedDashboards, dash]);
    setActiveDashboard(id);
    setNewDashboardName('');
    setNewDashboardMetrics([]);
    setShowCreateDashboard(false);
  };

  const handleDeleteDashboard = (id) => {
    const updated = savedDashboards.filter((d) => d.id !== id);
    persistDashboards(updated);
    if (activeDashboard === id) setActiveDashboard(updated[0]?.id || null);
  };

  const handleToggleMetric = (key) => {
    setNewDashboardMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleEditDashboardMetrics = (dash) => {
    setEditingDashboard(dash.id);
    setNewDashboardName(dash.name);
    setNewDashboardMetrics(dash.metrics);
    setShowCreateDashboard(true);
  };

  const handleSaveEditedDashboard = () => {
    if (!editingDashboard) return;
    const updated = savedDashboards.map((d) =>
      d.id === editingDashboard ? { ...d, name: newDashboardName.trim(), metrics: newDashboardMetrics } : d
    );
    persistDashboards(updated);
    setShowCreateDashboard(false);
    setEditingDashboard(null);
    setNewDashboardName('');
    setNewDashboardMetrics([]);
  };

  const formatValue = (computed) => {
    if (!computed) return '—';
    const v = computed.value;
    if (v == null) return '—';
    switch (computed.format) {
      case 'percent': return `${v}%`;
      case 'decimal': return v;
      case 'duration': {
        const m = Math.floor(v / 60);
        const s = v % 60;
        return `${m}m ${s}s`;
      }
      default: return typeof v === 'number' ? v.toLocaleString() : v;
    }
  };

  return (
    <div className="metrics-panel animate-fadeInUp">
      {/* Header */}
      <div className="analytics-toolbar">
        <div className="analytics-toolbar__left">
          <h3>Key Performance Indicators</h3>
        </div>
        <div className="analytics-toolbar__right">
          <button className="btn btn-primary" onClick={() => { setShowCreateDashboard(true); setEditingDashboard(null); setNewDashboardName(''); setNewDashboardMetrics([]); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            <Plus size={13} /> New Dashboard
          </button>
          <button className="btn btn-ghost" onClick={() => dispatch(fetchAnalytics())} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            <Save size={13} /> Sync
          </button>
        </div>
      </div>

      {/* Saved Dashboards Tabs */}
      <div className="metrics-tabs">
        {savedDashboards.map((dash) => (
          <div key={dash.id} className={`metrics-tab${activeDashboard === dash.id ? ' metrics-tab--active' : ''}${dash.id.startsWith('default-') ? ' metrics-tab--default' : ''}`}>
            <button className="metrics-tab__btn" onClick={() => setActiveDashboard(dash.id)}>
              <LayoutDashboard size={14} />
              {dash.name}
            </button>
            {!dash.id.startsWith('default-') && (
              <button className="metrics-tab__remove" onClick={() => handleDeleteDashboard(dash.id)} title="Delete dashboard">
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="metrics-filters">
        <div className="metrics-filters__search">
          <Search size={13} style={{ color: 'var(--color-text-dim)' }} />
          <input type="text" placeholder="Search metrics..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="metrics-filters__cats">
          {['all', 'traffic', 'engagement', 'conversion', 'trends'].map((cat) => (
            <button
              key={cat}
              className={`metrics-cat-btn${filterCategory === cat ? ' metrics-cat-btn--active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Table */}
      {loading ? (
        <div className="analytics-loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8, marginBottom: 8 }} />
          ))}
        </div>
      ) : (
        <div className="metrics-table-wrap">
          <table className="metrics-table">
            <thead>
              <tr>
                <th className="metrics-table__sortable" onClick={() => handleSort('label')}>
                  Metric <ArrowUpDown size={11} />
                </th>
                <th>Description</th>
                <th className="metrics-table__sortable" onClick={() => handleSort('total_visitors')}>
                  Value <ArrowUpDown size={11} />
                </th>
                <th>Category</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {activeMetrics.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-panel" style={{ padding: '32px' }}>
                      <BarChart3 size={28} />
                      <h3>No metrics found</h3>
                      <p>Add metrics to this dashboard or try a different filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeMetrics.map((metric) => (
                  <tr key={metric.key} className="metrics-table__row">
                    <td>
                      <div className="metrics-table__name" onClick={() => setExpandedMetric(expandedMetric === metric.key ? null : metric.key)}>
                        {metric.label}
                      </div>
                    </td>
                    <td className="metrics-table__desc">{metric.description}</td>
                    <td className="metrics-table__value">{formatValue(metric.computed)}</td>
                    <td>
                      <span className={`metrics-cat-tag metrics-cat-tag--${metric.category}`}>
                        {metric.category}
                      </span>
                    </td>
                    <td>
                      {metric.computed?.change != null && (
                        <span className={`kpi-trend kpi-trend--${metric.computed.change >= 0 ? 'up' : 'down'}`}>
                          {metric.computed.change >= 0 ? '+' : ''}{metric.computed.change}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Expanded Metric Detail */}
      {expandedMetric && computedMetrics[expandedMetric] && (
        <div className="metric-detail-card">
          <div className="metric-detail-card__header">
            <span className="metric-detail-card__title">
              {SORTABLE_METRICS.find((m) => m.key === expandedMetric)?.label || expandedMetric}
            </span>
            <button className="metric-detail-card__close" onClick={() => setExpandedMetric(null)}>
              <X size={14} />
            </button>
          </div>
          <div className="metric-detail-card__body">
            <div className="metric-detail-card__stat">
              <span className="metric-detail-card__value">{formatValue(computedMetrics[expandedMetric])}</span>
              <span className="metric-detail-card__label">Current Value</span>
            </div>
            <div className="metric-detail-card__stat">
              <span className="metric-detail-card__value">{summary?.totalDays || 0} days</span>
              <span className="metric-detail-card__label">Tracking Period</span>
            </div>
            <div className="metric-detail-card__stat">
              <span className="metric-detail-card__value">{summary?.avgVisitorsPerDay || 0}</span>
              <span className="metric-detail-card__label">Avg Visitors/Day</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Grid */}
      {summary && (
        <div className="metrics-stats-grid">
          <div className="panel-card">
            <div className="panel-card__header">
              <span className="panel-card__title"><Briefcase size={14} /> Content Stats</span>
            </div>
            <div className="metrics-stats-list">
              <div className="metrics-stat-item">
                <span>Total Projects</span><span className="metrics-stat-item__value">{projects.length}</span>
              </div>
              <div className="metrics-stat-item">
                <span>Featured Projects</span><span className="metrics-stat-item__value">{projects.filter((p) => p.featured).length}</span>
              </div>
              <div className="metrics-stat-item">
                <span>Published Testimonials</span><span className="metrics-stat-item__value">{testimonials.filter((t) => t.published).length}</span>
              </div>
              <div className="metrics-stat-item">
                <span>Total Skills</span><span className="metrics-stat-item__value">{skills.length}</span>
              </div>
              <div className="metrics-stat-item">
                <span>Timeline Entries</span><span className="metrics-stat-item__value">{experiences.length}</span>
              </div>
              <div className="metrics-stat-item">
                <span>Messages Received</span><span className="metrics-stat-item__value">{messages.length}</span>
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-card__header">
              <span className="panel-card__title"><Activity size={14} /> Engagement Ratios</span>
            </div>
            <div className="metrics-stats-list">
              <div className="metrics-stat-item">
                <span>Pages / Visit</span>
                <span className="metrics-stat-item__value">{computedMetrics.pages_per_visit?.value || '0.0'}</span>
              </div>
              <div className="metrics-stat-item">
                <span>Engagement Rate</span>
                <span className="metrics-stat-item__value">{computedMetrics.engagement_rate?.value || '0'}%</span>
              </div>
              <div className="metrics-stat-item">
                <span>Bounce Rate</span>
                <span className="metrics-stat-item__value">{computedMetrics.bounce_rate?.value || '0'}%</span>
              </div>
              <div className="metrics-stat-item">
                <span>Click-through (Social)</span>
                <span className="metrics-stat-item__value">
                  {summary.visitors > 0 ? ((summary.socialLinkClicks / summary.visitors) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="metrics-stat-item">
                <span>Conversion Rate</span>
                <span className="metrics-stat-item__value">
                  {summary.visitors > 0 ? (((summary.contactSubmissions + summary.testimonialConversions) / summary.visitors) * 100).toFixed(2) : '0'}%
                </span>
              </div>
              <div className="metrics-stat-item">
                <span>Growth Rate (MoM)</span>
                <span className={`metrics-stat-item__value ${(summary.growthRate || 0) >= 0 ? 'metrics-stat-item__value--up' : 'metrics-stat-item__value--down'}`}>
                  {(summary.growthRate || 0) >= 0 ? '+' : ''}{summary.growthRate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Dashboard Modal */}
      {showCreateDashboard && (
        <div className="modal-overlay" onClick={() => { setShowCreateDashboard(false); setEditingDashboard(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3>{editingDashboard ? 'Edit Dashboard' : 'Create Custom Dashboard'}</h3>
              <button className="modal-close" onClick={() => { setShowCreateDashboard(false); setEditingDashboard(null); }}><X size={18} /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Dashboard Name</label>
                <input type="text" className="form-input" placeholder="My Custom Dashboard" value={newDashboardName} onChange={(e) => setNewDashboardName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Select Metrics</label>
                <div className="metrics-select-grid">
                  {SORTABLE_METRICS.map((m) => (
                    <label key={m.key} className="metrics-select-item">
                      <input
                        type="checkbox"
                        checked={newDashboardMetrics.includes(m.key)}
                        onChange={() => handleToggleMetric(m.key)}
                      />
                      <div className="metrics-select-item__info">
                        <span className="metrics-select-item__label">{m.label}</span>
                        <span className="metrics-select-item__cat">{m.category}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => { setShowCreateDashboard(false); setEditingDashboard(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={editingDashboard ? handleSaveEditedDashboard : handleCreateDashboard}>
                  {editingDashboard ? 'Save Changes' : 'Create Dashboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
