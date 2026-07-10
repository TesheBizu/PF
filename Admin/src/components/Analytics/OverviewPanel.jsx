import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users, Eye, MessageSquare, Star, MousePointerClick, BarChart3, Activity, Bell, Mail,
  Briefcase, Zap, History, Monitor, CreditCard, Plus, X, Calendar as CalendarIcon,
  ArrowUp, ArrowDown, TrendingUp, Clock, RefreshCw, LayoutDashboard, Settings,
} from 'lucide-react';
import { fetchAnalytics } from '../../redux/slices/analyticsSlice';
import './AnalyticsPanels.css';

function Sparkline({ data, color = 'var(--color-primary)', height = 28 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const pts = data.slice(-10).map((v, i) => {
    const x = (i / Math.max(data.slice(-10).length - 1, 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ flexShrink: 0 }}>
      <path d={`M${pts.join(' ')}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendBadge({ value, suffix = '%' }) {
  if (value == null) return null;
  const isUp = value >= 0;
  return (
    <span className={`kpi-trend kpi-trend--${isUp ? 'up' : 'down'}`}>
      {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

const KPI_CARDS = [
  { key: 'visitors', label: 'Visitors', icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { key: 'uniqueUsers', label: 'Unique Users', icon: Eye, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { key: 'pageViews', label: 'Page Views', icon: BarChart3, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { key: 'socialLinkClicks', label: 'Social Clicks', icon: MousePointerClick, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { key: 'contactSubmissions', label: 'Contact Submissions', icon: MessageSquare, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { key: 'testimonialConversions', label: 'Testimonial Conversions', icon: Star, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
];

const CALENDAR_EVENTS = [
  { date: '2026-07-15', title: 'Review portfolio projects', type: 'task' },
  { date: '2026-07-18', title: 'Update social links', type: 'reminder' },
  { date: '2026-07-22', title: 'Monthly analytics report', type: 'task' },
  { date: '2026-07-25', title: 'Backup database', type: 'reminder' },
];

const QUICK_ACTIONS = [
  { id: 'projects', label: 'New Project', icon: Plus },
  { id: 'skills', label: 'New Skill', icon: Plus },
  { id: 'experiences', label: 'New Experience', icon: Plus },
  { id: 'testimonials', label: 'New Testimonial', icon: Star },
  { id: 'messages', label: 'View Inbox', icon: MessageSquare },
  { id: 'analytics', label: 'Full Analytics', icon: BarChart3 },
];

const CONTENT_ITEMS = [
  { key: 'projects', label: 'Projects', icon: Briefcase, color: '#6366f1' },
  { key: 'skills', label: 'Skills', icon: Zap, color: '#10b981' },
  { key: 'experiences', label: 'Timeline', icon: History, color: '#f59e0b' },
  { key: 'testimonials', label: 'Testimonials', icon: Star, color: '#ec4899' },
  { key: 'messages', label: 'Messages', icon: Mail, color: '#a855f7' },
];

function getWeekDates() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function OverviewPanel({ onNavigate }) {
  const dispatch = useDispatch();
  const { summary, entries, loading, trends, spikes } = useSelector((s) => s.analytics);
  const { items: projects } = useSelector((s) => s.projects);
  const { items: skills } = useSelector((s) => s.skills);
  const { items: experiences } = useSelector((s) => s.experiences);
  const { items: testimonials } = useSelector((s) => s.testimonials);
  const { items: messages, loading: mLoading } = useSelector((s) => s.messages);
  const { items: notifications, totalUnread: notifUnread } = useSelector((s) => s.notifications);
  const { items: socialLinks } = useSelector((s) => s.socialLinks);
  const [weekDays] = useState(() => getWeekDates());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const weekDates = weekDays.map((d) => d.toISOString().slice(0, 10));

  const visitorData = useMemo(() => (entries || []).map((e) => e.visitors), [entries]);
  const pageViewData = useMemo(() => (entries || []).map((e) => e.pageViews), [entries]);

  const contentCounts = {
    projects: projects.length,
    skills: skills.length,
    experiences: experiences.length,
    testimonials: testimonials.filter((t) => t.published).length,
    messages: messages.length,
  };

  const unreadMessages = messages.filter((m) => !m.isRead).length;

  return (
    <div className="overview-panel animate-fadeInUp">
      {/* Welcome */}
      <div className="overview-welcome">
        <div className="overview-welcome__text">
          <h2>Dashboard Overview</h2>
          <p>Here&apos;s what&apos;s happening with your portfolio today.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => dispatch(fetchAnalytics())} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="kpi-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="kpi-card kpi-card--skeleton">
              <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '40%', height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="kpi-grid">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            const value = summary[card.key] ?? 0;
            return (
              <div key={card.key} className="kpi-card">
                <div className="kpi-card__icon" style={{ background: card.bg, color: card.color }}>
                  <Icon size={18} />
                </div>
                <div className="kpi-card__info">
                  <div className="kpi-card__value">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                  <div className="kpi-card__label">{card.label}</div>
                  <div className="kpi-card__sparkline">
                    <Sparkline data={card.key === 'visitors' ? visitorData : card.key === 'pageViews' ? pageViewData : undefined} color={card.color} />
                  </div>
                </div>
                {card.key === 'visitors' && <TrendBadge value={summary.growthRate} />}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-panel">
          <BarChart3 size={32} />
          <h3>No analytics data yet</h3>
          <p>Visit the public site to generate data.</p>
        </div>
      )}

      {summary && (
        <div className="overview-insights-strip">
          <div className="insight-chip">
            <TrendingUp size={14} />
            <span>Trend: <strong>{trends?.label || 'Stable'}</strong> ({trends?.strength || '—'})</span>
          </div>
          <div className="insight-chip">
            <Activity size={14} />
            <span>Growth rate: <strong style={{ color: (summary.growthRate || 0) >= 0 ? '#10b981' : '#ef4444' }}>
              {(summary.growthRate || 0) >= 0 ? '+' : ''}{summary.growthRate || 0}%
            </strong> MoM</span>
          </div>
          <div className="insight-chip">
            <Clock size={14} />
            <span>Avg <strong>{summary.avgVisitorsPerDay || 0}</strong> visitors/day</span>
          </div>
          {spikes.length > 0 && (
            <div className="insight-chip insight-chip--alert">
              <Bell size={14} />
              <span>{spikes.length} unusual {spikes.length === 1 ? 'activity' : 'activities'} detected</span>
            </div>
          )}
        </div>
      )}

      <div className="overview-grid-2col">
        {/* Real-time Activity Feed */}
        <div className="panel-card">
          <div className="panel-card__header">
            <span className="panel-card__title"><Activity size={14} /> Recent Activity</span>
            <button className="panel-card__action" onClick={() => onNavigate?.('notifications-center')}>View All</button>
          </div>
          <div className="activity-feed-mini">
            {(notifications.length > 0 ? notifications.slice(0, 5) : messages.slice(0, 5).map((m) => ({
              _id: m._id, title: m.subject || 'New Message', body: `From ${m.name}`,
              createdAt: m.createdAt, type: 'message',
            }))).map((item, i) => (
              <div key={item._id || i} className="activity-item-mini">
                <div className="activity-item-mini__icon" style={{
                  background: item.type === 'message' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)',
                  color: item.type === 'message' ? '#6366f1' : '#10b981',
                }}>
                  {item.type === 'message' ? <Mail size={12} /> : <Bell size={12} />}
                </div>
                <div className="activity-item-mini__content">
                  <div className="activity-item-mini__title">{item.title}</div>
                  {item.body && <div className="activity-item-mini__desc">{item.body}</div>}
                </div>
                <div className="activity-item-mini__time">
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
            {(notifications.length === 0 && messages.length === 0) && (
              <p className="empty-muted">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Calendar Widget */}
        <div className="panel-card">
          <div className="panel-card__header">
            <span className="panel-card__title"><CalendarIcon size={14} /> Upcoming</span>
            <button className="panel-card__action" onClick={() => setCalendarOpen((o) => !o)}>
              {calendarOpen ? 'Hide' : 'Show All'}
            </button>
          </div>
          <div className="calendar-mini">
            <div className="calendar-mini__header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <span key={d} className="calendar-mini__day-header">{d}</span>
              ))}
            </div>
            <div className="calendar-mini__grid">
              {weekDays.map((d) => {
                const ds = d.toISOString().slice(0, 10);
                const events = CALENDAR_EVENTS.filter((e) => e.date === ds);
                return (
                  <div key={ds} className={`calendar-mini__cell${events.length > 0 ? ' calendar-mini__cell--has-event' : ''}${ds === new Date().toISOString().slice(0, 10) ? ' calendar-mini__cell--today' : ''}`}>
                    <span className="calendar-mini__date">{d.getDate()}</span>
                    {events.length > 0 && <span className="calendar-mini__dot" />}
                  </div>
                );
              })}
            </div>
            {calendarOpen && (
              <div className="calendar-mini__events" style={{ marginTop: 8 }}>
                {CALENDAR_EVENTS.map((ev, i) => (
                  <div key={i} className="calendar-mini__event">
                    <span className={`calendar-mini__event-badge calendar-mini__event-badge--${ev.type}`} />
                    <span className="calendar-mini__event-title">{ev.title}</span>
                    <span className="calendar-mini__event-date">{new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overview-grid-3col">
        {/* Quick Actions */}
        <div className="panel-card">
          <div className="panel-card__header">
            <span className="panel-card__title"><Zap size={14} /> Quick Actions</span>
          </div>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.id} className="quick-action-btn" onClick={() => onNavigate?.(a.id)}>
                  <Icon size={14} /> {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Overview */}
        <div className="panel-card">
          <div className="panel-card__header">
            <span className="panel-card__title"><LayoutDashboard size={14} /> Content Overview</span>
            <button className="panel-card__action" onClick={() => onNavigate?.('projects')}>Manage</button>
          </div>
          <div className="content-mini-grid">
            {CONTENT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="content-mini-item">
                  <div className="content-mini-item__icon" style={{ background: `${item.color}18`, color: item.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="content-mini-item__info">
                    <div className="content-mini-item__count">{contentCounts[item.key]}</div>
                    <div className="content-mini-item__label">{item.label}</div>
                  </div>
                </div>
              );
            })}
            <div className="content-mini-item">
              <div className="content-mini-item__icon" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>
                <Bell size={14} />
              </div>
              <div className="content-mini-item__info">
                <div className="content-mini-item__count">{notifUnread}</div>
                <div className="content-mini-item__label">Unread Notifs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Status */}
        <div className="panel-card">
          <div className="panel-card__header">
            <span className="panel-card__title"><Monitor size={14} /> Section Status</span>
            <button className="panel-card__action" onClick={() => onNavigate?.('hero-editor')}>Edit</button>
          </div>
          <div className="section-mini-list">
            {['hero', 'about', 'navbar', 'footer'].map((key) => {
              const hasContent = true;
              return (
                <div key={key} className="section-mini-item">
                  <span className="section-mini-item__name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className={`section-mini-item__badge section-mini-item__badge--${hasContent ? 'active' : 'empty'}`}>
                    {hasContent ? 'Active' : 'Empty'}
                  </span>
                </div>
              );
            })}
            <div className="section-mini-item">
              <span className="section-mini-item__name">Social Links</span>
              <span className={`section-mini-item__badge section-mini-item__badge--${socialLinks.length > 0 ? 'active' : 'empty'}`}>
                {socialLinks.length > 0 ? `${socialLinks.length} links` : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
