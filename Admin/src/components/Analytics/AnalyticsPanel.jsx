import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart3, TrendingUp, Globe, Monitor, Smartphone, Tablet,
  Download, RefreshCw, Users, Eye, MousePointerClick,
  ArrowUp, ArrowDown, Activity, Bell, ExternalLink, FileText,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Sector,
} from 'recharts';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import api from '../../services/api';
import './AnalyticsPanels.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#f43f5e', '#06b6d4', '#84cc16'];

const GRANULARITY_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

function getWeekId(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - start) / 86400000) + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="chart-tooltip__item">
          <span className="chart-tooltip__dot" style={{ background: p.color }} />
          <span>{p.name}: <strong>{p.value?.toLocaleString()}</strong></span>
        </div>
      ))}
    </div>
  );
}

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--color-text)" fontSize={13} fontWeight={700}>
        {payload?.name}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--color-text-dim)" fontSize={11}>
        {value} ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 4} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
    </g>
  );
}

export default function AnalyticsPanel() {
  const dispatch = useDispatch();
  const { summary, entries, pageViewsByPage, trafficSources, devices, browsers, geo, trends, spikes, loading } = useSelector((s) => s.analytics);
  const { items: projects } = useSelector((s) => s.projects);
  const [granularity, setGranularity] = useState('daily');
  const [activePie, setActivePie] = useState(null);
  const [exporting, setExporting] = useState(null);

  const chartData = useMemo(() => {
    if (!entries?.length) return [];
    if (granularity === 'daily') {
      return entries.map((e) => ({
        date: e.date?.slice(5) || e.date,
        fullDate: e.date,
        visitors: e.visitors || 0,
        pageViews: e.pageViews || 0,
        interactions: e.interactions || 0,
      }));
    }
    const getId = granularity === 'weekly' ? getWeekId : (d) => d.slice(0, 7);
    const groups = {};
    for (const e of entries) {
      const id = getId(e.date);
      if (!groups[id]) groups[id] = { date: id, fullDate: id, visitors: 0, pageViews: 0, interactions: 0 };
      groups[id].visitors += e.visitors || 0;
      groups[id].pageViews += e.pageViews || 0;
      groups[id].interactions += e.interactions || 0;
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [entries, granularity]);

  const trafficData = useMemo(() => {
    if (!trafficSources || !Object.keys(trafficSources).length) return [];
    return Object.entries(trafficSources).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));
  }, [trafficSources]);

  const deviceData = useMemo(() => {
    if (!devices || !Object.keys(devices).length) return [];
    return Object.entries(devices).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));
  }, [devices]);

  const browserData = useMemo(() => {
    if (!browsers || !Object.keys(browsers).length) return [];
    return Object.entries(browsers).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));
  }, [browsers]);

  const geoData = useMemo(() => {
    if (!geo || !Object.keys(geo).length) return [];
    return Object.entries(geo)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [geo]);

  const pageData = useMemo(() => {
    if (!pageViewsByPage || !Object.keys(pageViewsByPage).length) return [];
    return Object.entries(pageViewsByPage)
      .map(([k, v]) => ({ name: k, views: v }))
      .sort((a, b) => b.views - a.views);
  }, [pageViewsByPage]);

  const funnelData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Visitors', value: summary.visitors || 0 },
      { name: 'Page Views', value: summary.pageViews || 0 },
      { name: 'Interactions', value: summary.interactions || 0 },
      { name: 'Social Clicks', value: summary.socialLinkClicks || 0 },
      { name: 'Contact Sub.', value: summary.contactSubmissions || 0 },
    ];
  }, [summary]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const handleExport = useCallback(async (format) => {
    setExporting(format);
    try {
      if (format === 'csv') {
        const res = await api.get('/analytics/export?days=365&format=csv', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analytics-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const res = await api.get('/analytics/export?days=365&format=json');
        const dataStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analytics-export.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed:', e);
    }
    setExporting(null);
  }, []);

  return (
    <div className="analytics-panel animate-fadeInUp">
      {/* Toolbar */}
      <div className="analytics-toolbar">
        <div className="analytics-toolbar__left">
          <h3>Analytics Dashboard</h3>
        </div>
        <div className="analytics-toolbar__right">
          <div className="granularity-selector">
            {GRANULARITY_OPTIONS.map((g) => (
              <button
                key={g.value}
                className={`granularity-btn${granularity === g.value ? ' granularity-btn--active' : ''}`}
                onClick={() => setGranularity(g.value)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <button className="btn btn-ghost" onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="export-group">
            <button className="btn btn-primary" onClick={() => handleExport('csv')} disabled={exporting === 'csv'} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <Download size={13} /> {exporting === 'csv' ? 'Exporting...' : 'CSV'}
            </button>
            <button className="btn btn-ghost" onClick={() => handleExport('json')} disabled={exporting === 'json'} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
              <FileText size={13} /> {exporting === 'json' ? 'Exporting...' : 'JSON'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12, marginBottom: 16 }} />
          ))}
        </div>
      ) : summary ? (
        <>
          {/* Summary KPI Row */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-card__icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><Users size={18} /></div>
              <div><div className="kpi-card__value">{summary.visitors?.toLocaleString() || 0}</div><div className="kpi-card__label">Total Visitors</div></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Eye size={18} /></div>
              <div><div className="kpi-card__value">{summary.uniqueUsers?.toLocaleString() || 0}</div><div className="kpi-card__label">Unique Users</div></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><BarChart3 size={18} /></div>
              <div><div className="kpi-card__value">{summary.pageViews?.toLocaleString() || 0}</div><div className="kpi-card__label">Page Views</div></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}><MousePointerClick size={18} /></div>
              <div><div className="kpi-card__value">{summary.interactions?.toLocaleString() || 0}</div><div className="kpi-card__label">Interactions</div></div>
            </div>
          </div>

          {/* Insights Strip */}
          {trends && (
            <div className="overview-insights-strip">
              <div className="insight-chip">
                <TrendingUp size={14} />
                <span>Trend: <strong>{trends.label}</strong> ({trends.strength})</span>
              </div>
              <div className="insight-chip">
                <Activity size={14} />
                <span>MoM Growth: <strong style={{ color: (summary.growthRate || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                  {(summary.growthRate || 0) >= 0 ? '+' : ''}{summary.growthRate || 0}%
                </strong></span>
              </div>
              <div className="insight-chip">
                <Users size={14} />
                <span>Avg <strong>{summary.avgVisitorsPerDay || 0}</strong> visitors/day</span>
              </div>
              {spikes?.length > 0 && (
                <div className="insight-chip insight-chip--alert">
                  <Bell size={14} />
                  <span>{spikes.length} unusual {spikes.length === 1 ? 'activity' : 'activities'} detected</span>
                </div>
              )}
            </div>
          )}

          {/* Charts Grid */}
          <div className="chart-grid-2col">
            {/* Visitor Trend */}
            <div className="chart-card">
              <div className="chart-card__header">
                <span className="chart-card__title"><TrendingUp size={14} /> Visitor Trend ({granularity})</span>
              </div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="visitorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} fill="url(#visitorGrad)" name="Visitors" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Page Views Trend */}
            <div className="chart-card">
              <div className="chart-card__header">
                <span className="chart-card__title"><BarChart3 size={14} /> Page Views & Interactions ({granularity})</span>
              </div>
              <div className="chart-card__body">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="pageViews" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Page Views" />
                    <Bar dataKey="interactions" fill="#10b981" radius={[3, 3, 0, 0]} name="Interactions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Spikes Alert */}
          {spikes?.length > 0 && (
            <div className="spikes-panel">
              <div className="spikes-panel__header">
                <Bell size={14} /> Anomaly Detection
              </div>
              <div className="spikes-panel__body">
                {spikes.map((s, i) => (
                  <div key={i} className={`spike-item spike-item--${s.type}`}>
                    <span className="spike-item__date">{s.date}</span>
                    <span className="spike-item__value">{s.visitors} visitors</span>
                    <span className="spike-item__deviation">
                      {s.type === 'spike' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {s.deviation}% from avg
                    </span>
                    <span className={`spike-item__badge spike-item__badge--${s.type}`}>
                      {s.type === 'spike' ? 'Spike' : 'Drop'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Funnel */}
          <div className="chart-card">
            <div className="chart-card__header">
              <span className="chart-card__title"><Activity size={14} /> Engagement Funnel</span>
            </div>
            <div className="chart-card__body">
              <div className="funnel-chart">
                {funnelData.map((step, i) => {
                  const maxVal = funnelData[0]?.value || 1;
                  const pct = maxVal > 0 ? ((step.value / maxVal) * 100).toFixed(0) : '0';
                  const prevPct = i > 0 && funnelData[i - 1]?.value > 0
                    ? ((step.value / funnelData[i - 1].value) * 100).toFixed(0) : null;
                  return (
                    <div key={step.name} className="funnel-step">
                      <div className="funnel-step__label">
                        <span>{step.name}</span>
                        <span className="funnel-step__value">{step.value.toLocaleString()}</span>
                      </div>
                      <div className="funnel-step__bar-track">
                        <div
                          className="funnel-step__bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: COLORS[i % COLORS.length],
                            opacity: 0.6 + (1 - i / funnelData.length) * 0.4,
                          }}
                        />
                      </div>
                      {prevPct && <span className="funnel-step__conv">{prevPct}% conversion</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Breakdown Charts Row */}
          <div className="chart-grid-3col">
            {/* Traffic Sources */}
            {trafficData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title"><Globe size={14} /> Traffic Sources</span>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={trafficData}
                        cx="50%" cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        activeIndex={activePie}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, idx) => setActivePie(idx)}
                        onMouseLeave={() => setActivePie(null)}
                      >
                        {trafficData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Devices */}
            {deviceData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title">
                    {deviceData.find((d) => d.name === 'Desktop') ? <Monitor size={14} /> :
                     deviceData.find((d) => d.name === 'Mobile') ? <Smartphone size={14} /> : <Tablet size={14} />}
                    Devices
                  </span>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%" cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {deviceData.map((entry, idx) => (
                          <Cell key={idx} fill={
                            entry.name === 'Desktop' ? '#6366f1' :
                            entry.name === 'Mobile' ? '#10b981' :
                            entry.name === 'Tablet' ? '#f59e0b' : COLORS[idx % COLORS.length]
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Browsers */}
            {browserData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title"><Monitor size={14} /> Browsers</span>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={browserData}
                        cx="50%" cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {browserData.map((entry, idx) => (
                          <Cell key={idx} fill={
                            entry.name === 'Chrome' ? '#6366f1' :
                            entry.name === 'Firefox' ? '#f59e0b' :
                            entry.name === 'Safari' ? '#10b981' :
                            entry.name === 'Edge' ? '#06b6d4' : COLORS[idx % COLORS.length]
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Geo & Top Pages */}
          <div className="chart-grid-2col">
            {geoData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title"><Globe size={14} /> Geographic Distribution</span>
                </div>
                <div className="chart-card__body">
                  <div className="geo-list">
                    {geoData.map((g, i) => {
                      const maxGeo = geoData[0]?.value || 1;
                      return (
                        <div key={g.name} className="geo-item">
                          <span className="geo-item__rank">#{i + 1}</span>
                          <span className="geo-item__name">{g.name}</span>
                          <div className="geo-item__bar-track">
                            <div className="geo-item__bar-fill" style={{ width: `${(g.value / maxGeo) * 100}%` }} />
                          </div>
                          <span className="geo-item__value">{g.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {pageData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title"><ExternalLink size={14} /> Top Performing Pages</span>
                </div>
                <div className="chart-card__body">
                  <div className="page-rank-list">
                    {pageData.slice(0, 8).map((p, i) => {
                      const maxPage = pageData[0]?.views || 1;
                      return (
                        <div key={p.name} className="page-rank-item">
                          <span className="page-rank-item__rank">#{i + 1}</span>
                          <span className="page-rank-item__name">{p.name}</span>
                          <div className="page-rank-item__bar-track">
                            <div className="page-rank-item__bar-fill" style={{ width: `${(p.views / maxPage) * 100}%` }} />
                          </div>
                          <span className="page-rank-item__value">{p.views}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
