import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../../redux/slices/authSlice';
import { fetchProjects, createProject, updateProject, deleteProject } from '../../redux/slices/projectsSlice';
import { fetchSkills, createSkill, updateSkill, deleteSkill } from '../../redux/slices/skillsSlice';
import { fetchMessages, deleteMessage, markMessageRead } from '../../redux/slices/messagesSlice';
import api from '../../services/api';
import './Admin.css';

// ── Reusable modal ───────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="dash-stat card">
      <div className="dash-stat__icon" style={{ background: color }}>{icon}</div>
      <div>
        <div className="dash-stat__value">{value}</div>
        <div className="dash-stat__label">{label}</div>
      </div>
    </div>
  );
}

// ── Initial form states ──────────────────────────────────────
const initProject = { title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false };
const initSkill   = { name: '', category: 'Frontend', proficiency: 80 };

function Dashboard() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const { items: projects, loading: pLoading } = useSelector((s) => s.projects);
  const { items: skills,   loading: sLoading } = useSelector((s) => s.skills);
  const { items: messages, loading: mLoading } = useSelector((s) => s.messages);

  const [tab, setTab]           = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [pForm, setPForm]       = useState(initProject);
  const [sForm, setSForm]       = useState(initSkill);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchSkills());
    dispatch(fetchMessages());
  }, [dispatch]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    dispatch(logout());
    toast.info('Logged out successfully');
    navigate('/', { replace: true });
  };

  // ── Project handlers ────────────────────────────────────────
  const openAddProject = () => { setPForm(initProject); setModal('addProject'); };
  const openEditProject = (p) => {
    setPForm({ ...p, techStack: p.techStack.join(', ') });
    setSelected(p);
    setModal('editProject');
  };
  const handleSaveProject = async () => {
    const payload = { ...pForm, techStack: pForm.techStack.split(',').map((t) => t.trim()).filter(Boolean) };
    if (modal === 'addProject') {
      await dispatch(createProject(payload));
      toast.success('Project created!');
    } else {
      await dispatch(updateProject({ id: selected._id, projectData: payload }));
      toast.success('Project updated!');
    }
    setModal(null);
  };
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await dispatch(deleteProject(id));
    toast.success('Project deleted');
  };

  // ── Skill handlers ──────────────────────────────────────────
  const openAddSkill   = () => { setSForm(initSkill); setModal('addSkill'); };
  const openEditSkill  = (s) => { setSForm(s); setSelected(s); setModal('editSkill'); };
  const handleSaveSkill = async () => {
    if (modal === 'addSkill') {
      await dispatch(createSkill(sForm));
      toast.success('Skill added!');
    } else {
      await dispatch(updateSkill({ id: selected._id, skillData: sForm }));
      toast.success('Skill updated!');
    }
    setModal(null);
  };
  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await dispatch(deleteSkill(id));
    toast.success('Skill deleted');
  };

  // ── Message handlers ────────────────────────────────────────
  const openMessage = (m) => { setSelected(m); dispatch(markMessageRead(m._id)); setModal('viewMessage'); };
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await dispatch(deleteMessage(id));
    toast.success('Message deleted');
    setModal(null);
  };

  const unread = messages.filter((m) => !m.isRead).length;

  // ── Tabs ─────────────────────────────────────────────────────
  const TABS = [
    { id: 'overview',  label: '📊 Overview' },
    { id: 'projects',  label: '🚀 Projects' },
    { id: 'skills',    label: '⚡ Skills' },
    { id: 'messages',  label: `💬 Messages${unread > 0 ? ` (${unread})` : ''}` },
  ];

  return (
    <div className={`dashboard${sidebarOpen ? '' : ' dashboard--collapsed'}`}>
      {/* Sidebar */}
      <aside className="dash-sidebar">
        {/* Collapse toggle */}
        <button
          className="dash-sidebar__toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen
              ? <><polyline points="15 18 9 12 15 6"/></>  
              : <><polyline points="9 18 15 12 9 6"/></>   
            }
          </svg>
        </button>

        <div className="dash-sidebar__logo">
          <span className="navbar__logo-bracket">&lt;</span>
          {sidebarOpen && <span className="navbar__logo-name">Admin</span>}
          <span className="navbar__logo-bracket"> /&gt;</span>
        </div>

        <nav className="dash-sidebar__nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`dash-sidebar__link${tab === t.id ? ' dash-sidebar__link--active' : ''}`}
              onClick={() => setTab(t.id)}
              title={!sidebarOpen ? t.label : undefined}
            >
              <span className="dash-sidebar__link-icon">{t.label.split(' ')[0]}</span>
              {sidebarOpen && <span>{t.label.slice(t.label.indexOf(' ') + 1)}</span>}
            </button>
          ))}
        </nav>

        <div className="dash-sidebar__bottom">
          <div className="dash-sidebar__user">
            <div className="dash-sidebar__avatar">{user?.name?.[0] ?? 'A'}</div>
            {sidebarOpen && (
              <div>
                <div className="dash-sidebar__name">{user?.name}</div>
                <div className="dash-sidebar__role">Administrator</div>
              </div>
            )}
          </div>
          <button className="btn btn-ghost dash-sidebar__logout" onClick={handleLogout} id="admin-logout" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-topbar">
          <h2 className="dash-topbar__title">
            {TABS.find((t) => t.id === tab)?.label}
          </h2>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-stats">
              <StatCard icon="🚀" label="Total Projects"  value={projects.length}  color="rgba(99,120,255,0.15)" />
              <StatCard icon="⚡" label="Total Skills"    value={skills.length}    color="rgba(0,229,255,0.12)" />
              <StatCard icon="💬" label="Total Messages"  value={messages.length}  color="rgba(0,200,150,0.12)" />
              <StatCard icon="📬" label="Unread Messages" value={unread}           color="rgba(255,204,0,0.12)" />
            </div>
            <div className="dash-welcome card">
              <h3>Welcome back, {user?.name} 👋</h3>
              <p>Manage your portfolio content from the sidebar tabs. All changes are saved to MongoDB in real time.</p>
            </div>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === 'projects' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>All Projects ({projects.length})</h3>
              <button id="add-project-btn" className="btn btn-primary" onClick={openAddProject}>+ Add Project</button>
            </div>
            {pLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Title</th><th>Tech Stack</th><th>Featured</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p._id}>
                        <td><strong>{p.title}</strong></td>
                        <td>{p.techStack.slice(0, 3).join(', ')}{p.techStack.length > 3 && '…'}</td>
                        <td>{p.featured ? '⭐' : '—'}</td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openEditProject(p)}>Edit</button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteProject(p._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {tab === 'skills' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>All Skills ({skills.length})</h3>
              <button id="add-skill-btn" className="btn btn-primary" onClick={openAddSkill}>+ Add Skill</button>
            </div>
            {sLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Name</th><th>Category</th><th>Proficiency</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s._id}>
                        <td><strong>{s.name}</strong></td>
                        <td><span className="badge">{s.category}</span></td>
                        <td>
                          <div className="dash-skill-bar">
                            <div className="dash-skill-fill" style={{ width: `${s.proficiency}%` }} />
                          </div>
                          {s.proficiency}%
                        </td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openEditSkill(s)}>Edit</button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteSkill(s._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>Inbox ({messages.length})</h3>
            </div>
            {mLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={m._id} className={!m.isRead ? 'dash-row--unread' : ''}>
                        <td><strong>{m.name}</strong><br /><small>{m.email}</small></td>
                        <td>{m.subject}</td>
                        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${m.isRead ? '' : 'dash-badge--new'}`}>
                            {m.isRead ? 'Read' : 'New'}
                          </span>
                        </td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openMessage(m)}>View</button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteMessage(m._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODALS ── */}

      {/* Add / Edit Project */}
      {(modal === 'addProject' || modal === 'editProject') && (
        <Modal title={modal === 'addProject' ? 'Add Project' : 'Edit Project'} onClose={() => setModal(null)}>
          <div className="modal-form">
            {[
              { label: 'Title', key: 'title', type: 'text', placeholder: 'My Awesome Project' },
              { label: 'Tech Stack (comma-separated)', key: 'techStack', type: 'text', placeholder: 'React, Node.js, MongoDB' },
              { label: 'GitHub URL', key: 'githubUrl', type: 'url', placeholder: 'https://github.com/...' },
              { label: 'Live URL', key: 'liveUrl', type: 'url', placeholder: 'https://...' },
            ].map(({ label, key, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" placeholder={placeholder}
                  value={pForm[key]} onChange={(e) => setPForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Project description…"
                value={pForm.description} onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Image URL field with live preview */}
            <div className="form-group">
              <label className="form-label">Project Image URL</label>
              <input type="url" className="form-input" placeholder="https://example.com/screenshot.png"
                value={pForm.imageUrl} onChange={(e) => setPForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              {pForm.imageUrl && (
                <div className="modal-img-preview">
                  <img src={pForm.imageUrl} alt="Preview" onError={(e) => { e.target.style.display='none'; }} />
                  <span className="modal-img-preview__label">Preview</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="featured-check" checked={pForm.featured}
                onChange={(e) => setPForm((f) => ({ ...f, featured: e.target.checked }))} />
              <label htmlFor="featured-check" className="form-label" style={{ margin: 0 }}>Featured project</label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveProject}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Skill */}
      {(modal === 'addSkill' || modal === 'editSkill') && (
        <Modal title={modal === 'addSkill' ? 'Add Skill' : 'Edit Skill'} onClose={() => setModal(null)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Skill Name</label>
              <input type="text" className="form-input" placeholder="React"
                value={sForm.name} onChange={(e) => setSForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={sForm.category}
                onChange={(e) => setSForm((f) => ({ ...f, category: e.target.value }))}>
                {['Frontend', 'Backend', 'Database', 'Tools', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Proficiency: {sForm.proficiency}%</label>
              <input type="range" min="1" max="100" value={sForm.proficiency}
                onChange={(e) => setSForm((f) => ({ ...f, proficiency: Number(e.target.value) }))}
                style={{ width: '100%' }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSkill}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Message */}
      {modal === 'viewMessage' && selected && (
        <Modal title="Message" onClose={() => setModal(null)}>
          <div className="modal-message">
            <p><strong>From:</strong> {selected.name} &lt;{selected.email}&gt;</p>
            <p><strong>Subject:</strong> {selected.subject}</p>
            <p><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
            <div className="modal-message__body">{selected.message}</div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn btn-primary">Reply</a>
              <button className="btn dash-btn--danger btn" onClick={() => handleDeleteMessage(selected._id)}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;
