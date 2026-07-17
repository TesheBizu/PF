import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users, Eye, MessageSquare, BarChart3, Activity, Bell, Mail, Star,
  Briefcase, Zap, Plus, ArrowUp, ArrowDown, TrendingUp, Clock,
  RefreshCw, LayoutDashboard, Download, FileText,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchOverview, fetchTrend } from '../../redux/slices/analyticsSlice';
import api from '../../services/api';
import './AnalyticsPanels.css';

const QUICK_ACTIONS = [
  { id: 'projects', label: 'New Project', icon: Plus, color: '#6366f1' },
  { id: 'skills', label: 'New Skill', icon: Zap, color: '#10b981' },
  { id: 'testimonials', label: 'Testimonial', icon: Star, color: '#f59e0b' },
  { id: 'messages', label: 'View Inbox', icon: MessageSquare, color: '#ec4899' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: '#a855f7' },
  { id: 'social-links', label: 'Social Links', icon: BarChart3, color: '#06b6d4' },
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

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export default function OverviewPanel({ onNavigate }) {
  const dispatch = useDispatch();
  const { overview, trend, loading } = useSelector((s) => s.analytics);
  const { items: messages } = useSelector((s) => s.messages);
  const { items: notifications } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchOverview({ preset: '30days' }));
    dispatch(fetchTrend({ preset: '30days', metric: 'activeUsers' }));
  }, [dispatch]);

  const chartData = useMemo(() => {
    if (!trend?.values?.length) return [];
    return trend.values.map((v) => ({
      date: v.date?.slice(5) || v.date,
      fullDate: v.date,
      value: v.value || 0,
    }));
  }, [trend]);

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
    dispatch(fetchOverview({ preset: '30days' }));
    dispatch(fetchTrend({ preset: '30days', metric: 'activeUsers' }));
  }, [dispatch]);

  const KPI_CONFIG = [
    {
      key: 'totalUsers',
      label: 'Total Users',
      value: overview?.totalUsers || 0,
      icon: Users,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bg: 'rgba(99,102,241,0.08)',
    },
    {
      key: 'activeUsers',
      label: 'Active Users',
      value: overview?.activeUsers || 0,
      icon: Activity,
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      bg: 'rgba(16,185,129,0.08)',
    },
    {
      key: 'newUsers',
      label: 'New Users',
      value: overview?.newUsers || 0,
      icon: Users,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      key: 'sessions',
      label: 'Sessions',
      value: overview?.sessions || 0,
      icon: Eye,
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      bg: 'rgba(6,182,212,0.08)',
    },
    {
      key: 'engagedSessions',
      label: 'Engaged Sessions',
      value: overview?.engagedSessions || 0,
      icon: Zap,
      gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      key: 'pageViews',
      label: 'Page Views',
      value: overview?.pageViews || 0,
      icon: Eye,
      gradient: 'linear-gradient(135deg, #ec4899, #a855f7)',
      bg: 'rgba(236,72,153,0.08)',
    },
    {
      key: 'avgSessionDuration',
      label: 'Avg Session Duration',
      value: overview?.averageSessionDuration || 0,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
      bg: 'rgba(139,92,246,0.08)',
      format: 'duration',
    },
    {
      key: 'bounceRate',
      label: 'Bounce Rate',
      value: overview?.bounceRate ? overview.bounceRate * 100 : 0,
      icon: ArrowDown,
      gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
      bg: 'rgba(239,68,68,0.08)',
      suffix: '%',
      decimals: 1,
    },
    {
      key: 'engagementRate',
      label: 'Engagement Rate',
      value: overview?.engagementRate ? overview.engagementRate * 100 : 0,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      bg: 'rgba(16,185,129,0.08)',
      suffix: '%',
      decimals: 1,
    },
    {
      key: 'contactSubmissions',
      label: 'Contact Submissions',
      value: overview?.contactSubmissions || 0,
      icon: MessageSquare,
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      bg: 'rgba(236,72,153,0.08)',
    },
    {
      key: 'resumeDownloads',
      label: 'Resume Downloads',
      value: overview?.resumeDownloads || 0,
      icon: Download,
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      bg: 'rgba(6,182,212,0.08)',
    },
    {
      key: 'projectClicks',
      label: 'Project Clicks',
      value: overview?.projectClicks || 0,
      icon: Briefcase,
      gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
      bg: 'rgba(168,85,247,0.08)',
    },
  ];

  return (
    <div className="exec-dashboard animate-fadeInUp">
      <div className="exec-header">
        <div className="exec-header__left">
          <div className="exec-header__brand">
            <div className="exec-header__icon">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h2 className="exec-header__title">Executive Dashboard</h2>
              <p className="exec-header__subtitle">
                Real-time overview powered by Google Analytics 4
              </p>
            </div>
          </div>
        </div>
        <div className="exec-header__right">
          <button className="exec-btn exec-btn--ghost" onClick={handleRefresh}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="exec-kpi-grid">
        {KPI_CONFIG.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.key} className="exec-kpi-card" style={{ '--kpi-bg': kpi.bg, '--kpi-gradient': kpi.gradient }}>
              <div className="exec-kpi-card__top">
                <div className="exec-kpi-card__icon-wrap">
                  <Icon size={16} />
                </div>
              </div>
              <div className="exec-kpi-card__value">
                {kpi.format === 'duration' ? (
                  formatDuration(kpi.value)
                ) : kpi.suffix ? (
                  <AnimatedCounter value={kpi.value} suffix={kpi.suffix} duration={1400} decimals={kpi.decimals || 0} />
                ) : (
                  <AnimatedCounter value={kpi.value} duration={1200} />
                )}
              </div>
              <div className="exec-kpi-card__label">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="exec-chart-card">
        <div className="exec-chart-card__header">
          <div className="exec-chart-card__title">
            <TrendingUp size={15} />
            <span>Active Users Trend (30 days)</span>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} interval="preserveStartEnd" minTickGap={30} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <ReTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#execVisitorGrad)" name="Active Users" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-panel" style={{ minHeight: 260 }}>
              <BarChart3 size={28} />
              <h3>No data yet</h3>
              <p>GA4 will populate this chart once visitors arrive at your portfolio.</p>
            </div>
          )}
        </div>
      </div>

      <div className="exec-bottom-grid">
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
