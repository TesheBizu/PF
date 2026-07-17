import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users, Eye, Clock, MessageSquare, TrendingUp, TrendingDown,
  Download, Search, ArrowUpDown, Star, BarChart3, RefreshCw,
  Monitor, Smartphone, Globe, Link, ArrowUp,
} from 'lucide-react';
import { fetchDevices, fetchCountries, fetchPages, fetchTraffic, fetchEvents, setDatePreset, setCustomDateRange } from '../../redux/slices/analyticsSlice';
import './AnalyticsPanels.css';

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: '90 Days', value: '90days' },
  { label: '12 Months', value: '12months' },
];

function buildDateParams(datePreset, customStartDate, customEndDate) {
  if (datePreset === 'custom' && customStartDate && customEndDate) {
    return { preset: 'custom', startDate: customStartDate, endDate: customEndDate };
  }
  return { preset: datePreset };
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function MetricsPanel() {
  const dispatch = useDispatch();
  const { devices, countries, pages, traffic, events, datePreset, customStartDate, customEndDate } = useSelector((s) => s.analytics);
  const [sortField, setSortField] = useState('views');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  const dateParams = useMemo(() => buildDateParams(datePreset, customStartDate, customEndDate), [datePreset, customStartDate, customEndDate]);

  useEffect(() => {
    dispatch(fetchPages(dateParams));
    dispatch(fetchDevices(dateParams));
    dispatch(fetchCountries(dateParams));
    dispatch(fetchTraffic(dateParams));
    dispatch(fetchEvents(dateParams));
  }, [dispatch, datePreset, customStartDate, customEndDate]);

  const handlePresetChange = (value) => {
    dispatch(setDatePreset(value));
  };

  const deviceMetrics = useMemo(() => {
    if (!devices?.devices?.length) return { desktop: 0, mobile: 0, tablet: 0, total: 0 };
    const d = { desktop: 0, mobile: 0, tablet: 0, total: 0 };
    devices.devices.forEach((item) => {
      const key = item.name?.toLowerCase();
      if (key === 'desktop') d.desktop = item.users;
      else if (key === 'mobile') d.mobile = item.users;
      else if (key === 'tablet') d.tablet = item.users;
      d.total += item.users;
    });
    return d;
  }, [devices]);

  const trafficChannels = useMemo(() => {
    if (!traffic?.channels?.length) return [];
    return traffic.channels.map((c) => ({ name: c.name, sessions: c.sessions, users: c.users }));
  }, [traffic]);

  const countryData = useMemo(() => {
    if (!countries?.countries?.length) return [];
    return countries.countries.slice(0, 15);
  }, [countries]);

  const cityData = useMemo(() => {
    if (!countries?.cities?.length) return [];
    return countries.cities.slice(0, 15);
  }, [countries]);

  const browserData = useMemo(() => {
    if (!devices?.browsers?.length) return [];
    return devices.browsers;
  }, [devices]);

  const osData = useMemo(() => {
    if (!devices?.operatingSystems?.length) return [];
    return devices.operatingSystems;
  }, [devices]);

  const screenData = useMemo(() => {
    if (!devices?.screenResolutions?.length) return [];
    return devices.screenResolutions;
  }, [devices]);

  const referralSources = useMemo(() => {
    if (!traffic?.sources?.length) return [];
    return traffic.sources;
  }, [traffic]);

  const pageViewsList = useMemo(() => {
    if (!pages?.length) return [];
    return pages.map((p) => ({
      path: p.path,
      title: p.title,
      views: p.views,
      users: p.users,
      avgDuration: p.avgDuration,
      bounceRate: p.bounceRate,
    }));
  }, [pages]);

  const sortedPages = useMemo(() => {
    let list = [...pageViewsList];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.path?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'path') cmp = (a.path || '').localeCompare(b.path || '');
      else if (sortField === 'views') cmp = a.views - b.views;
      else if (sortField === 'users') cmp = a.users - b.users;
      else if (sortField === 'bounceRate') cmp = (a.bounceRate || 0) - (b.bounceRate || 0);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [pageViewsList, search, sortField, sortDir]);

  const customEvents = useMemo(() => {
    if (!events?.allEvents?.length) return [];
    const customNames = [
      'hero_cta_click', 'project_click', 'project_demo_click', 'github_link_click',
      'contact_form_submit', 'resume_download', 'email_click', 'phone_click',
      'whatsapp_click', 'linkedin_click', 'github_profile_click', 'theme_toggle',
      'scroll_depth_25', 'scroll_depth_50', 'scroll_depth_75', 'scroll_depth_100',
      'section_view_hero', 'section_view_about', 'section_view_skills',
      'section_view_projects', 'section_view_experience', 'section_view_testimonials',
      'section_view_contact',
    ];
    return events.allEvents.filter((e) => customNames.includes(e.name));
  }, [events]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Page Path', 'Title', 'Views', 'Users', 'Avg Duration (s)', 'Bounce Rate (%)'],
    ];
    sortedPages.forEach((p) => {
      rows.push([p.path, `"${(p.title || '').replace(/"/g, '""')}"`, p.views, p.users, (p.avgDuration || 0).toFixed(1), ((p.bounceRate || 0) * 100).toFixed(1)]);
    });
    rows.push([]);
    rows.push(['Device', 'Users']);
    if (deviceMetrics.desktop) rows.push(['Desktop', deviceMetrics.desktop]);
    if (deviceMetrics.mobile) rows.push(['Mobile', deviceMetrics.mobile]);
    if (deviceMetrics.tablet) rows.push(['Tablet', deviceMetrics.tablet]);
    rows.push([]);
    rows.push(['Country', 'Users']);
    countryData.forEach((c) => rows.push([c.name, c.users]));
    rows.push([]);
    rows.push(['Traffic Channel', 'Sessions']);
    trafficChannels.forEach((c) => rows.push([c.name, c.sessions]));
    rows.push([]);
    rows.push(['Custom Event', 'Count']);
    customEvents.forEach((e) => rows.push([e.name, e.count]));
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'metrics-export.csv'; a.click();
    window.URL.revokeObjectURL(url);
  }, [sortedPages, deviceMetrics, countryData, trafficChannels, customEvents]);

  return (
    <div className="mt-panel animate-fadeInUp">
      <div className="mt-header">
        <div className="mt-header__left">
          <div className="mt-header__brand">
            <div className="mt-header__icon">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="mt-header__title">Metrics Dashboard</h2>
              <p className="mt-header__subtitle">Comprehensive GA4 analytics metrics</p>
            </div>
          </div>
        </div>
        <div className="mt-header__right">
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
          <button className="mt-btn mt-btn--primary" onClick={handleExportCSV} title="Export to CSV">
            <Download size={14} /> Export CSV
          </button>
          <button className="mt-btn" onClick={() => { dispatch(fetchPages(dateParams)); dispatch(fetchDevices(dateParams)); dispatch(fetchCountries(dateParams)); dispatch(fetchTraffic(dateParams)); dispatch(fetchEvents(dateParams)); }} title="Refresh data">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="mt-kpi-grid">
        <div className="mt-kpi-card" style={{ '--mt-gradient': 'linear-gradient(135deg, #6366f1, #4f46e5)', '--mt-bg': 'rgba(99,102,241,0.08)' }}>
          <div className="mt-kpi-card__top">
            <div className="mt-kpi-card__icon" style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              <Monitor size={16} />
            </div>
          </div>
          <div className="mt-kpi-card__value">{deviceMetrics.desktop.toLocaleString()}</div>
          <div className="mt-kpi-card__label">Desktop Users</div>
        </div>
        <div className="mt-kpi-card" style={{ '--mt-gradient': 'linear-gradient(135deg, #10b981, #059669)', '--mt-bg': 'rgba(16,185,129,0.08)' }}>
          <div className="mt-kpi-card__top">
            <div className="mt-kpi-card__icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
              <Smartphone size={16} />
            </div>
          </div>
          <div className="mt-kpi-card__value">{deviceMetrics.mobile.toLocaleString()}</div>
          <div className="mt-kpi-card__label">Mobile Users</div>
        </div>
        <div className="mt-kpi-card" style={{ '--mt-gradient': 'linear-gradient(135deg, #f59e0b, #d97706)', '--mt-bg': 'rgba(245,158,11,0.08)' }}>
          <div className="mt-kpi-card__top">
            <div className="mt-kpi-card__icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              <Globe size={16} />
            </div>
          </div>
          <div className="mt-kpi-card__value">{countryData.length}</div>
          <div className="mt-kpi-card__label">Countries</div>
        </div>
        <div className="mt-kpi-card" style={{ '--mt-gradient': 'linear-gradient(135deg, #ec4899, #db2777)', '--mt-bg': 'rgba(236,72,153,0.08)' }}>
          <div className="mt-kpi-card__top">
            <div className="mt-kpi-card__icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
              <Link size={16} />
            </div>
          </div>
          <div className="mt-kpi-card__value">{trafficChannels.length}</div>
          <div className="mt-kpi-card__label">Traffic Channels</div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="mt-table-card">
        <div className="mt-table-card__header">
          <div className="mt-table-card__title">
            <Eye size={15} />
            Top Viewed Pages
          </div>
          <div className="mt-table-card__search">
            <Search size={13} />
            <input type="text" placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        {sortedPages.length > 0 ? (
          <>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead>
                  <tr>
                    <th className="mt-table__rank">#</th>
                    <th className="mt-table__sortable" onClick={() => handleSort('path')}>Page <ArrowUpDown size={11} /></th>
                    <th className="mt-table__sortable" onClick={() => handleSort('views')}>Views <ArrowUpDown size={11} /></th>
                    <th className="mt-table__sortable" onClick={() => handleSort('users')}>Users <ArrowUpDown size={11} /></th>
                    <th>Avg Duration</th>
                    <th className="mt-table__sortable" onClick={() => handleSort('bounceRate')}>Bounce Rate <ArrowUpDown size={11} /></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPages.map((p, i) => (
                    <tr key={p.path} className="mt-table__row">
                      <td className="mt-table__rank">{i + 1}</td>
                      <td>
                        <div className="mt-table__name">{p.path}</div>
                        {p.title && <div className="mt-table__slug">{p.title}</div>}
                      </td>
                      <td className="mt-table__value">{p.views.toLocaleString()}</td>
                      <td className="mt-table__value">{p.users.toLocaleString()}</td>
                      <td className="mt-table__value">{formatDuration(p.avgDuration)}</td>
                      <td className="mt-table__value">{((p.bounceRate || 0) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-table-footer">
              Showing {sortedPages.length} of {pageViewsList.length} pages
            </div>
          </>
        ) : (
          <div className="empty-panel">
            <BarChart3 size={28} />
            <h3>No page data yet</h3>
            <p>GA4 will populate this once visitors view your portfolio pages.</p>
          </div>
        )}
      </div>

      {/* Traffic Channels */}
      {trafficChannels.length > 0 && (
        <div className="mt-table-card" style={{ marginTop: 16 }}>
          <div className="mt-table-card__header">
            <div className="mt-table-card__title"><Globe size={15} /> Traffic Channels</div>
          </div>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead>
                <tr>
                  <th className="mt-table__rank">#</th>
                  <th>Channel</th>
                  <th>Sessions</th>
                  <th>Users</th>
                </tr>
              </thead>
              <tbody>
                {trafficChannels.map((c, i) => (
                  <tr key={c.name} className="mt-table__row">
                    <td className="mt-table__rank">{i + 1}</td>
                    <td><div className="mt-table__name">{c.name}</div></td>
                    <td className="mt-table__value">{c.sessions.toLocaleString()}</td>
                    <td className="mt-table__value">{c.users.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Devices & Browsers */}
      <div className="chart-grid-2col" style={{ marginTop: 16 }}>
        {browserData.length > 0 && (
          <div className="mt-table-card">
            <div className="mt-table-card__header">
              <div className="mt-table-card__title"><Monitor size={15} /> Browsers</div>
            </div>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th className="mt-table__rank">#</th><th>Browser</th><th>Users</th></tr></thead>
                <tbody>
                  {browserData.map((b, i) => (
                    <tr key={b.name} className="mt-table__row">
                      <td className="mt-table__rank">{i + 1}</td>
                      <td><div className="mt-table__name">{b.name}</div></td>
                      <td className="mt-table__value">{b.users.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {osData.length > 0 && (
          <div className="mt-table-card">
            <div className="mt-table-card__header">
              <div className="mt-table-card__title"><Monitor size={15} /> Operating Systems</div>
            </div>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th className="mt-table__rank">#</th><th>OS</th><th>Users</th></tr></thead>
                <tbody>
                  {osData.map((o, i) => (
                    <tr key={o.name} className="mt-table__row">
                      <td className="mt-table__rank">{i + 1}</td>
                      <td><div className="mt-table__name">{o.name}</div></td>
                      <td className="mt-table__value">{o.users.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Countries & Cities */}
      <div className="chart-grid-2col" style={{ marginTop: 16 }}>
        {countryData.length > 0 && (
          <div className="mt-table-card">
            <div className="mt-table-card__header">
              <div className="mt-table-card__title"><Globe size={15} /> Countries</div>
            </div>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th className="mt-table__rank">#</th><th>Country</th><th>Users</th><th>Sessions</th></tr></thead>
                <tbody>
                  {countryData.map((c, i) => (
                    <tr key={c.name} className="mt-table__row">
                      <td className="mt-table__rank">{i + 1}</td>
                      <td><div className="mt-table__name">{c.name}</div></td>
                      <td className="mt-table__value">{c.users.toLocaleString()}</td>
                      <td className="mt-table__value">{c.sessions.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {cityData.length > 0 && (
          <div className="mt-table-card">
            <div className="mt-table-card__header">
              <div className="mt-table-card__title"><Globe size={15} /> Top Cities</div>
            </div>
            <div className="mt-table-wrap">
              <table className="mt-table">
                <thead><tr><th className="mt-table__rank">#</th><th>City</th><th>Country</th><th>Users</th></tr></thead>
                <tbody>
                  {cityData.map((c, i) => (
                    <tr key={`${c.name}-${c.country}`} className="mt-table__row">
                      <td className="mt-table__rank">{i + 1}</td>
                      <td><div className="mt-table__name">{c.name}</div></td>
                      <td className="mt-table__value">{c.country}</td>
                      <td className="mt-table__value">{c.users.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Referral Sources */}
      {referralSources.length > 0 && (
        <div className="mt-table-card" style={{ marginTop: 16 }}>
          <div className="mt-table-card__header">
            <div className="mt-table-card__title"><Link size={15} /> Referral Sources</div>
          </div>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead><tr><th className="mt-table__rank">#</th><th>Source</th><th>Sessions</th></tr></thead>
              <tbody>
                {referralSources.map((s, i) => (
                  <tr key={s.name} className="mt-table__row">
                    <td className="mt-table__rank">{i + 1}</td>
                    <td><div className="mt-table__name">{s.name}</div></td>
                    <td className="mt-table__value">{s.sessions.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screen Resolutions */}
      {screenData.length > 0 && (
        <div className="mt-table-card" style={{ marginTop: 16 }}>
          <div className="mt-table-card__header">
            <div className="mt-table-card__title"><Monitor size={15} /> Screen Resolutions</div>
          </div>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead><tr><th className="mt-table__rank">#</th><th>Resolution</th><th>Users</th></tr></thead>
              <tbody>
                {screenData.map((s, i) => (
                  <tr key={s.name} className="mt-table__row">
                    <td className="mt-table__rank">{i + 1}</td>
                    <td><div className="mt-table__name">{s.name}</div></td>
                    <td className="mt-table__value">{s.users.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Events */}
      {customEvents.length > 0 && (
        <div className="mt-table-card" style={{ marginTop: 16 }}>
          <div className="mt-table-card__header">
            <div className="mt-table-card__title"><ArrowUp size={15} /> Custom Events</div>
          </div>
          <div className="mt-table-wrap">
            <table className="mt-table">
              <thead><tr><th className="mt-table__rank">#</th><th>Event Name</th><th>Count</th><th>Per User</th></tr></thead>
              <tbody>
                {customEvents.map((e, i) => (
                  <tr key={e.name} className="mt-table__row">
                    <td className="mt-table__rank">{i + 1}</td>
                    <td><div className="mt-table__name">{e.name}</div></td>
                    <td className="mt-table__value">{e.count.toLocaleString()}</td>
                    <td className="mt-table__value">{(e.countPerUser || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
