import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Activity, Globe, Monitor, Smartphone, Tablet, RefreshCw,
  Users, Eye, Zap, Clock, Radio, Wifi, WifiOff,
} from 'lucide-react';
import { fetchRealtime } from '../../redux/slices/analyticsSlice';
import './AnalyticsPanels.css';

const POLL_INTERVAL = 60000;

export default function RealtimePanel() {
  const dispatch = useDispatch();
  const { realtime, realtimeLoading, liveStats } = useSelector((s) => s.analytics);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = useCallback(() => {
    dispatch(fetchRealtime()).then(() => {
      setLastUpdated(new Date());
    });
  }, [dispatch]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  useEffect(() => {
    if (liveStats) {
      setSocketConnected(true);
      setLastUpdated(new Date());
    }
  }, [liveStats]);

  const liveActiveUsers = liveStats?.activeUsers ?? realtime?.activeUsers ?? 0;
  const liveDevices = liveStats?.devices?.length > 0 ? liveStats.devices : (realtime?.devices || []);
  const pages = realtime?.pages || [];
  const countries = realtime?.countries || [];
  const events = realtime?.events || [];

  const currentPage = pages.length > 0 ? pages[0] : null;

  return (
    <div className="rt-panel animate-fadeInUp">
      <div className="rt-header">
        <div className="rt-header__left">
          <div className="rt-header__brand">
            <div className="rt-header__live-dot" />
            <div>
              <h2 className="rt-header__title">Real-Time Dashboard</h2>
              <p className="rt-header__subtitle">
                {socketConnected ? 'Live visitor activity via Socket.io + GA4' : 'Visitor activity from Google Analytics 4'}
              </p>
            </div>
          </div>
        </div>
        <div className="rt-header__right">
          <span className={`rt-connection-badge ${socketConnected ? 'rt-connection-badge--live' : 'rt-connection-badge--polling'}`}>
            {socketConnected ? <><Wifi size={11} /> Live</> : <><Clock size={11} /> Polling</>}
          </span>
          {lastUpdated && (
            <span className="rt-header__timestamp">
              <Clock size={12} />
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button className="exec-btn exec-btn--ghost" onClick={fetchData} disabled={realtimeLoading}>
            <RefreshCw size={13} className={realtimeLoading ? 'spinning' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="rt-hero-grid">
        <div className="rt-hero-card rt-hero-card--primary">
          <div className="rt-hero-card__icon">
            <Users size={24} />
          </div>
          <div className="rt-hero-card__content">
            <div className="rt-hero-card__value">{liveActiveUsers}</div>
            <div className="rt-hero-card__label">Active Users Right Now</div>
          </div>
          <div className="rt-hero-card__pulse" />
        </div>

        <div className="rt-hero-card rt-hero-card--accent">
          <div className="rt-hero-card__icon">
            <Eye size={24} />
          </div>
          <div className="rt-hero-card__content">
            <div className="rt-hero-card__value">{currentPage?.path || '/'}</div>
            <div className="rt-hero-card__label">Most Active Page</div>
          </div>
        </div>

        <div className="rt-hero-card rt-hero-card--success">
          <div className="rt-hero-card__icon">
            <Globe size={24} />
          </div>
          <div className="rt-hero-card__content">
            <div className="rt-hero-card__value">{countries.length}</div>
            <div className="rt-hero-card__label">Active Countries</div>
          </div>
        </div>
      </div>

      {realtimeLoading && !realtime && !liveStats ? (
        <div className="analytics-loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 12, marginBottom: 16 }} />
          ))}
        </div>
      ) : (
        <>
          <div className="chart-grid-3col">
            {/* Live Pages */}
            <div className="rt-card">
              <div className="rt-card__header">
                <span className="rt-card__title"><Eye size={14} /> Live Pages</span>
                <Radio size={14} className="rt-card__live-icon" />
              </div>
              <div className="rt-card__body">
                {pages.length > 0 ? pages.map((p, i) => (
                  <div key={p.path} className="rt-list-item">
                    <span className="rt-list-item__rank">#{i + 1}</span>
                    <span className="rt-list-item__name">{p.path}</span>
                    <span className="rt-list-item__value">{p.views}</span>
                  </div>
                )) : (
                  <div className="empty-panel" style={{ padding: 24 }}><Eye size={20} /><p>No active pages</p></div>
                )}
              </div>
            </div>

            {/* Live Countries */}
            <div className="rt-card">
              <div className="rt-card__header">
                <span className="rt-card__title"><Globe size={14} /> Live Countries</span>
                <Radio size={14} className="rt-card__live-icon" />
              </div>
              <div className="rt-card__body">
                {countries.length > 0 ? countries.map((c, i) => (
                  <div key={c.country} className="rt-list-item">
                    <span className="rt-list-item__rank">#{i + 1}</span>
                    <span className="rt-list-item__name">{c.country}</span>
                    <span className="rt-list-item__value">{c.users}</span>
                  </div>
                )) : (
                  <div className="empty-panel" style={{ padding: 24 }}><Globe size={20} /><p>No country data</p></div>
                )}
              </div>
            </div>

            {/* Live Devices */}
            <div className="rt-card">
              <div className="rt-card__header">
                <span className="rt-card__title"><Monitor size={14} /> Active Devices</span>
                <Radio size={14} className="rt-card__live-icon" />
              </div>
              <div className="rt-card__body">
                {liveDevices.length > 0 ? liveDevices.map((d, i) => {
                  const deviceName = d.device || d.name || 'unknown';
                  const icon = deviceName.toLowerCase() === 'desktop' ? Monitor :
                               deviceName.toLowerCase() === 'mobile' ? Smartphone : Tablet;
                  const Icon = icon;
                  return (
                    <div key={deviceName + i} className="rt-list-item">
                      <span className="rt-list-item__rank">
                        <Icon size={13} />
                      </span>
                      <span className="rt-list-item__name">{deviceName}</span>
                      <span className="rt-list-item__value">{d.users}</span>
                    </div>
                  );
                }) : (
                  <div className="empty-panel" style={{ padding: 24 }}><Monitor size={20} /><p>No device data</p></div>
                )}
              </div>
            </div>
          </div>

          {/* Latest Events */}
          {events.length > 0 && (
            <div className="rt-card" style={{ marginTop: 16 }}>
              <div className="rt-card__header">
                <span className="rt-card__title"><Zap size={14} /> Latest Events</span>
                <Radio size={14} className="rt-card__live-icon" />
              </div>
              <div className="rt-card__body">
                <div className="rt-events-grid">
                  {events.map((e, i) => (
                    <div key={e.name + i} className="rt-event-chip">
                      <span className="rt-event-chip__name">{e.name}</span>
                      <span className="rt-event-chip__count">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="rt-footer-note">
        <Activity size={12} />
        {socketConnected
          ? 'Real-time updates via Socket.io. GA4 historical data updated every 60 seconds.'
          : 'Auto-refreshes every 60 seconds via GA4 API. Open the public site to generate real-time data.'}
      </div>
    </div>
  );
}
