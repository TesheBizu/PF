import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart3, TrendingUp, Globe, Monitor, Smartphone, Tablet,
  Download, RefreshCw, Users, Eye, MousePointerClick,
  ArrowUp, ArrowDown, Activity, Bell, ExternalLink, FileText, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { fetchTraffic, fetchDevices, fetchCountries, fetchPages, fetchTrend, setDatePreset, setCustomDateRange } from '../../redux/slices/analyticsSlice';
import api from '../../services/api';
import './AnalyticsPanels.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#f43f5e', '#06b6d4', '#84cc16'];

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: '90 Days', value: '90days' },
  { label: '12 Months', value: '12months' },
  { label: 'Custom', value: 'custom' },
];

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

function buildDateParams(datePreset, customStartDate, customEndDate) {
  if (datePreset === 'custom' && customStartDate && customEndDate) {
    return { preset: 'custom', startDate: customStartDate, endDate: customEndDate };
  }
  return { preset: datePreset };
}

export default function AnalyticsPanel() {
  const dispatch = useDispatch();
  const { traffic, devices, countries, pages, trend, loading, datePreset, customStartDate, customEndDate } = useSelector((s) => s.analytics);
  const [exporting, setExporting] = useState(null);

  const dateParams = useMemo(() => buildDateParams(datePreset, customStartDate, customEndDate), [datePreset, customStartDate, customEndDate]);

  useEffect(() => {
    dispatch(fetchTraffic(dateParams));
    dispatch(fetchDevices(dateParams));
    dispatch(fetchCountries(dateParams));
    dispatch(fetchPages(dateParams));
    dispatch(fetchTrend({ ...dateParams, metric: 'activeUsers' }));
  }, [dispatch, datePreset, customStartDate, customEndDate]);

  const handlePresetChange = (value) => {
    dispatch(setDatePreset(value));
  };

  const handleCustomDateChange = (field, value) => {
    dispatch(setCustomDateRange({
      startDate: field === 'startDate' ? value : customStartDate,
      endDate: field === 'endDate' ? value : customEndDate,
    }));
  };

  const handleRefresh = useCallback(() => {
    dispatch(fetchTraffic(dateParams));
    dispatch(fetchDevices(dateParams));
    dispatch(fetchCountries(dateParams));
    dispatch(fetchPages(dateParams));
    dispatch(fetchTrend({ ...dateParams, metric: 'activeUsers' }));
  }, [dispatch, dateParams]);

  const chartData = useMemo(() => {
    if (!trend?.values?.length) return [];
    return trend.values.map((v) => ({
      date: v.date?.slice(5) || v.date,
      value: v.value || 0,
    }));
  }, [trend]);

  const trafficData = useMemo(() => {
    if (!traffic?.channels?.length) return [];
    return traffic.channels.map((c) => ({ name: c.name, value: c.sessions, users: c.users }));
  }, [traffic]);

  const sourceData = useMemo(() => {
    if (!traffic?.sources?.length) return [];
    return traffic.sources.slice(0, 10).map((s) => ({ name: s.name, value: s.sessions }));
  }, [traffic]);

  const deviceData = useMemo(() => {
    if (!devices?.devices?.length) return [];
    return devices.devices.map((d) => ({ name: d.name, value: d.users, sessions: d.sessions }));
  }, [devices]);

  const browserData = useMemo(() => {
    if (!devices?.browsers?.length) return [];
    return devices.browsers.slice(0, 8).map((b) => ({ name: b.name, value: b.users }));
  }, [devices]);

  const geoData = useMemo(() => {
    if (!countries?.countries?.length) return [];
    return countries.countries.slice(0, 10).map((c) => ({ name: c.name, value: c.users, sessions: c.sessions }));
  }, [countries]);

  const pageData = useMemo(() => {
    if (!pages?.length) return [];
    return pages.slice(0, 15).map((p) => ({ name: p.path, views: p.views, users: p.users, avgDuration: p.avgDuration, bounceRate: p.bounceRate }));
  }, [pages]);

  const handleExport = useCallback(async (format) => {
    setExporting(format);
    try {
      const dateQuery = datePreset === 'custom' && customStartDate && customEndDate
        ? `&startDate=${customStartDate}&endDate=${customEndDate}`
        : '';
      if (format === 'csv') {
        const res = await api.get(`/admin/analytics/pages?preset=${datePreset}${dateQuery}`);
        const rows = [['Path', 'Title', 'Views', 'Users', 'Avg Duration (s)', 'Bounce Rate']];
        (res.data.data || []).forEach((p) => {
          rows.push([p.path, `"${(p.title || '').replace(/"/g, '""')}"`, p.views, p.users, p.avgDuration?.toFixed(1) || 0, (p.bounceRate * 100)?.toFixed(1) || 0]);
        });
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'analytics-export.csv'; a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const res = await api.get(`/admin/analytics/pages?preset=${datePreset}${dateQuery}`);
        const dataStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'analytics-export.json'; a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed:', e);
    }
    setExporting(null);
  }, [datePreset, customStartDate, customEndDate]);

  return (
    <div className="analytics-panel animate-fadeInUp">
      <div className="analytics-toolbar">
        <div className="analytics-toolbar__left">
          <h3>Analytics Dashboard</h3>
        </div>
        <div className="analytics-toolbar__right">
          <div className="date-filter-group">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                className={`granularity-btn${datePreset === p.value ? ' granularity-btn--active' : ''}`}
                onClick={() => handlePresetChange(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {datePreset === 'custom' && (
            <div className="custom-date-range">
              <input type="date" className="form-input" value={customStartDate} onChange={(e) => handleCustomDateChange('startDate', e.target.value)} />
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>to</span>
              <input type="date" className="form-input" value={customEndDate} onChange={(e) => handleCustomDateChange('endDate', e.target.value)} />
            </div>
          )}
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
      ) : (
        <>
          <div className="chart-grid-2col">
            <div className="chart-card">
              <div className="chart-card__header">
                <span className="chart-card__title"><TrendingUp size={14} /> Active Users</span>
              </div>
              <div className="chart-card__body">
                {chartData.length > 0 ? (
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
                      <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#visitorGrad)" name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-panel"><BarChart3 size={24} /><h3>No trend data</h3></div>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card__header">
                <span className="chart-card__title"><BarChart3 size={14} /> Sessions by Channel</span>
              </div>
              <div className="chart-card__body">
                {trafficData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-text-dim)' }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Sessions" radius={[4, 4, 0, 0]}>
                        {trafficData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-panel"><BarChart3 size={24} /><h3>No traffic data</h3></div>
                )}
              </div>
            </div>
          </div>

          <div className="chart-grid-3col">
            {deviceData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title">
                    {deviceData.find((d) => d.name?.toLowerCase() === 'desktop') ? <Monitor size={14} /> :
                     deviceData.find((d) => d.name?.toLowerCase() === 'mobile') ? <Smartphone size={14} /> : <Tablet size={14} />}
                    Devices
                  </span>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {deviceData.map((entry, idx) => (
                          <Cell key={idx} fill={
                            entry.name?.toLowerCase() === 'desktop' ? '#6366f1' :
                            entry.name?.toLowerCase() === 'mobile' ? '#10b981' :
                            entry.name?.toLowerCase() === 'tablet' ? '#f59e0b' : COLORS[idx % COLORS.length]
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

            {browserData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title"><Monitor size={14} /> Browsers</span>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={browserData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {browserData.map((entry, idx) => (
                          <Cell key={idx} fill={
                            entry.name?.toLowerCase() === 'chrome' ? '#6366f1' :
                            entry.name?.toLowerCase() === 'firefox' ? '#f59e0b' :
                            entry.name?.toLowerCase() === 'safari' ? '#10b981' :
                            entry.name?.toLowerCase() === 'edge' ? '#06b6d4' : COLORS[idx % COLORS.length]
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

            {sourceData.length > 0 && (
              <div className="chart-card">
                <div className="chart-card__header">
                  <span className="chart-card__title"><Globe size={14} /> Top Sources</span>
                </div>
                <div className="chart-card__body chart-card__body--pie">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={sourceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-text-dim)' }} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Sessions" radius={[0, 4, 4, 0]} fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

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
                  <span className="chart-card__title"><ExternalLink size={14} /> Top Pages</span>
                </div>
                <div className="chart-card__body">
                  <div className="page-rank-list">
                    {pageData.slice(0, 10).map((p, i) => {
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
      )}
    </div>
  );
}
