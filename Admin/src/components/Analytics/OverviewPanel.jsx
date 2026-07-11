import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users, Eye, MessageSquare, BarChart3, Activity, Bell, Mail, Star,
  Briefcase, Zap, History, Plus, ArrowUp, ArrowDown, TrendingUp, Clock,
  RefreshCw, LayoutDashboard, TrendingDown, MousePointerClick,
  ExternalLink, Share2, Settings, Download, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import api from '../../services/api';
import './AnalyticsPanels.css';

const QUICK_ACTIONS = [
  { id: 'projects', label: 'New Project', icon: Plus, color: '#6366f1' },
  { id: 'skills', label: 'New Skill', icon: Zap, color: '#10b981' },
  { id: 'testimonials', label: 'Testimonial', icon: Star, color: '#f59e0b' },
  { id: 'messages', label: 'View Inbox', icon: MessageSquare, color: '#ec4899' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: '#a855f7' },
  { id: 'social-links', label: 'Social Links', icon: Share2, color: '#06b6d4' },
];

function AnimatedCounter({ value, suffix = '', duration = 1200, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (value == null) return;
    fromRef.current = display;
    startRef.current = performance.now();
    let raf;

    const step = (now) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;
      setDisplay(current);
      if (t < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}{suffix}</>;
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

export default function OverviewPanel({ onNavigate }) {
  const dispatch = useDispatch();
  const { summary, entries, loading, trends } = useSelector((s) => s.analytics);
  const { items: messages } = useSelector((s) => s.messages);
  const { items: notifications } = useSelector((s) => s.notifications);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const chartData = useMemo(() => {
    if (!entries?.length) return [];
    return entries.map((e) => ({
      date: e.date?.slice(5) || e.date,
      fullDate: e.date,
      visitors: e.visitors || 0,
      pageViews: e.pageViews || 0,
    }));
  }, [entries]);

  const conversionRate = useMemo(() => {
    if (!summary?.visitors || summary.visitors === 0) return 0;
    return (summary.contactSubmissions || 0) / summary.visitors * 100;
  }, [summary]);

  const unreadMessages = useMemo(() =>
    (messages || []).filter((m) => !m.isRead).length,
  [messages]);

  const recentActivity = useMemo(() => {
    const items = [];
    (notifications || []).slice(0, 3).forEach((n) => {
      items.push({ id: n._id, title: n.title, body: n.body, time: n.createdAt, type: n.type || 'notification', icon: Bell });
    });
    (messages || []).slice(0, 3).forEach((m) => {
      items.push({ id: m._id, title: m.subject || 'New Message', body: `From ${m.name}`, time: m.createdAt, type: 'message', icon: Mail });
    });
    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    return items.slice(0, 6);
  }, [notifications, messages]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const handleSeed = useCallback(async () => {
    setSeeding(true);
    try {
      await api.post('/analytics/seed');
      dispatch(fetchAnalytics());
    } catch (e) {
      console.error('Seeding failed:', e);
    }
    setSeeding(false);
  }, [dispatch]);

  const KPI_CONFIG = [
    {
      key: 'visitors',
      label: 'Visitors',
      value: summary?.visitors || 0,
      icon: Users,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bg: 'rgba(99,102,241,0.08)',
    },
    {
      key: 'pageViews',
      label: 'Page Views',
      value: summary?.pageViews || 0,
      icon: Eye,
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      bg: 'rgba(6,182,212,0.08)',
    },
    {
      key: 'messages',
      label: 'Messages',
      value: unreadMessages,
      icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #ec4899, #a855f7)',
      bg: 'rgba(236,72,153,0.08)',
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      value: conversionRate,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      bg: 'rgba(16,185,129,0.08)',
      suffix: '%',
      decimals: 1,
    },
  ];

  const visitorDelta = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    const last = chartData[chartData.length - 1]?.visitors || 0;
    const prev = chartData[chartData.length - 2]?.visitors || 0;
    if (prev === 0) return null;
    return ((last - prev) / prev * 100).toFixed(1);
  }, [chartData]);

  const pageViewDelta = useMemo(() => {
    if (!chartData || chartData.length < 2) return null;
    const last = chartData[chartData.length - 1]?.pageViews || 0;
    const prev = chartData[chartData.length - 2]?.pageViews || 0;
    if (prev === 0) return null;
    return ((last - prev) / prev * 100).toFixed(1);
  }, [chartData]);

  return (
    <div className="exec-dashboard animate-fadeInUp">
      {/* Header */}
      <div className="exec-header">
        <div className="exec-header__left">
          <div className="exec-header__brand">
            <div className="exec-header__icon">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h2 className="exec-header__title">Executive Dashboard</h2>
              <p className="exec-header__subtitle">
                Real-time overview of your portfolio performance
                {trends && (
                  <span className="exec-header__trend">
                    &nbsp;· Trend: <strong>{trends.label}</strong>
                    {trends.direction === 'up' ? <ArrowUp size={11} style={{ color: '#10b981', marginLeft: 2 }} />
                    : trends.direction === 'down' ? <ArrowDown size={11} style={{ color: '#ef4444', marginLeft: 2 }} />
                    : <Clock size={11} style={{ marginLeft: 2 }} />}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="exec-header__right">
          <button className="exec-btn exec-btn--ghost" onClick={handleSeed} disabled={seeding}>
            <BarChart3 size={13} /> {seeding ? 'Seeding...' : 'Seed Data'}
          </button>
          <button className="exec-btn exec-btn--ghost" onClick={handleRefresh}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="exec-kpi-grid">
        {KPI_CONFIG.map((kpi) => {
          const Icon = kpi.icon;
          const isVisitors = kpi.key === 'visitors';
          const isPageViews = kpi.key === 'pageViews';
          const delta = isVisitors ? visitorDelta : isPageViews ? pageViewDelta : null;
          const isUp = delta && parseFloat(delta) >= 0;

          return (
            <div key={kpi.key} className="exec-kpi-card" style={{ '--kpi-bg': kpi.bg, '--kpi-gradient': kpi.gradient }}>
              <div className="exec-kpi-card__top">
                <div className="exec-kpi-card__icon-wrap">
                  <Icon size={16} />
                </div>
                {delta != null && (
                  <span className={`exec-kpi-card__delta exec-kpi-card__delta--${isUp ? 'up' : 'down'}`}>
                    {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                    {Math.abs(parseFloat(delta))}%
                  </span>
                )}
              </div>
              <div className="exec-kpi-card__value">
                {kpi.key === 'conversionRate' ? (
                  <AnimatedCounter value={kpi.value} suffix="%" duration={1400} decimals={1} />
                ) : (
                  <AnimatedCounter value={kpi.value} duration={1200} />
                )}
              </div>
              <div className="exec-kpi-card__label">{kpi.label}</div>
              {kpi.key === 'visitors' && summary?.growthRate != null && (
                <div className="exec-kpi-card__trend">
                  <span style={{ color: summary.growthRate >= 0 ? '#10b981' : '#ef4444' }}>
                    {summary.growthRate >= 0 ? '+' : ''}{summary.growthRate}% MoM
                  </span>
                </div>
              )}
              {kpi.key === 'pageViews' && (
                <div className="exec-kpi-card__trend">
                  <span style={{ color: 'var(--color-text-dim)' }}>
                    Avg {summary?.avgPageViewsPerVisitor || '0'} / visitor
                  </span>
                </div>
              )}
              {kpi.key === 'messages' && messages && (
                <div className="exec-kpi-card__trend">
                  <span style={{ color: 'var(--color-text-dim)' }}>
                    {messages.length} total
                  </span>
                </div>
              )}
              {kpi.key === 'conversionRate' && (
                <div className="exec-kpi-card__trend">
                  <span style={{ color: 'var(--color-text-dim)' }}>
                    {summary?.contactSubmissions || 0} submissions
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Traffic Trend Chart */}
      <div className="exec-chart-card">
        <div className="exec-chart-card__header">
          <div className="exec-chart-card__title">
            <TrendingUp size={15} />
            <span>Traffic Trend</span>
          </div>
        </div>
        <div className="exec-chart-card__body">
          {loading ? (
            <div className="skeleton" style={{ height: 280, borderRadius: 10 }} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="execVisitorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="execPageViewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} interval="preserveStartEnd" minTickGap={30} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <ReTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2.5} fill="url(#execVisitorGrad)" name="Visitors" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
                <Area type="monotone" dataKey="pageViews" stroke="#06b6d4" strokeWidth={2} fill="url(#execPageViewGrad)" name="Page Views" dot={false} activeDot={{ r: 4, fill: '#06b6d4' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-panel" style={{ minHeight: 260 }}>
              <BarChart3 size={28} />
              <h3>No data yet</h3>
              <p>Visit the public site or seed data to generate analytics.</p>
            </div>
          )}
        </div>
        {chartData.length > 0 && (
          <div className="exec-chart-card__footer">
            <div className="exec-chart-legend">
              <span className="exec-chart-legend__item">
                <span className="exec-chart-legend__dot" style={{ background: '#6366f1' }} />
                Visitors
              </span>
              <span className="exec-chart-legend__item">
                <span className="exec-chart-legend__dot" style={{ background: '#06b6d4' }} />
                Page Views
              </span>
            </div>
            {trends && (
              <span className="exec-chart-legend__trend">
                <TrendingUp size={11} />
                {trends.label} ({trends.strength})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="exec-bottom-grid">
        {/* Recent Activity */}
        <div className="exec-card">
          <div className="exec-card__header">
            <span className="exec-card__title"><Activity size={14} /> Recent Activity</span>
            <button className="exec-card__action" onClick={() => onNavigate?.('notifications-center')}>
              View All
            </button>
          </div>
          <div className="exec-activity-feed">
            {recentActivity.length > 0 ? recentActivity.map((item) => {
              const Icon = item.icon;
              const isMsg = item.type === 'message';
              return (
                <div key={item.id} className="exec-activity-item">
                  <div className={`exec-activity-item__icon ${isMsg ? 'exec-activity-item__icon--msg' : 'exec-activity-item__icon--notif'}`}>
                    <Icon size={12} />
                  </div>
                  <div className="exec-activity-item__content">
                    <div className="exec-activity-item__title">{item.title}</div>
                    {item.body && <div className="exec-activity-item__desc">{item.body}</div>}
                  </div>
                  <div className="exec-activity-item__time">
                    {new Date(item.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            }) : (
              <p className="empty-muted">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="exec-card">
          <div className="exec-card__header">
            <span className="exec-card__title"><Zap size={14} /> Quick Actions</span>
          </div>
          <div className="exec-actions-grid">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  className="exec-action-btn"
                  onClick={() => onNavigate?.(a.id)}
                  style={{ '--action-color': a.color }}
                >
                  <div className="exec-action-btn__icon" style={{ background: `${a.color}14`, color: a.color }}>
                    <Icon size={15} />
                  </div>
                  <span className="exec-action-btn__label">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
