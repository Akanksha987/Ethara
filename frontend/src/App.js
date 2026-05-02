import { useEffect, useState } from 'react';
import './App.css';
import { post, get } from './api';

function App() {
  const [view, setView] = useState('login');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dashboard, setDashboard] = useState({ tasks: [], summary: {}, overdue: [] });
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ethara_token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ethara_token', token);
      fetchProfile();
      fetchDashboard();
      fetchProjects();
    }
  }, [token]);

  async function fetchProfile() {
    const response = await get('/api/users/me', token);
    if (response.status) setUser(response.data);
  }

  async function fetchProjects() {
    const response = await get('/api/projects', token);
    if (response.status) setProjects(response.data);
  }

  async function fetchDashboard() {
    const response = await get('/api/dashboard', token);
    if (response.status) setDashboard(response.data);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    const path = view === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const response = await post(path, form);
    if (response.status) {
      setToken(response.data.token);
      setUser(response.data.user);
      setView('dashboard');
      setMessage('Welcome!');
    } else {
      setMessage(response.message || 'Unable to complete request.');
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function logout() {
    setToken('');
    setUser(null);
    setProjects([]);
    setDashboard({ tasks: [], summary: {}, overdue: [] });
    localStorage.removeItem('ethara_token');
  }

  if (!token) {
    return (
      <div className="app-shell">
        <div className="auth-card">
          <h1>Ethara Project Tracker</h1>
          <div className="toggle-buttons">
            <button onClick={() => setView('login')} className={view === 'login' ? 'active' : ''}>Login</button>
            <button onClick={() => setView('signup')} className={view === 'signup' ? 'active' : ''}>Signup</button>
          </div>
          <form onSubmit={handleSubmit}>
            {view === 'signup' && (
              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
            )}
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={handleChange} required />
            </label>
            <button type="submit">{view === 'signup' ? 'Create Account' : 'Login'}</button>
          </form>
          {message && <div className="message">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Ethara Dashboard</h1>
          <p>Welcome, {user?.name} ({user?.role})</p>
        </div>
        <button className="logout" onClick={logout}>Logout</button>
      </header>
      <section className="summary-grid">
        <div className="summary-card">
          <h2>Projects</h2>
          <p>{projects.length}</p>
        </div>
        <div className="summary-card">
          <h2>Tasks</h2>
          <p>{dashboard.tasks.length}</p>
        </div>
        <div className="summary-card">
          <h2>Overdue</h2>
          <p>{dashboard.overdue.length}</p>
        </div>
      </section>
      <section className="panel">
        <h2>Recent Tasks</h2>
        {dashboard.tasks.length ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.tasks.slice(0, 10).map(task => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tasks found.</p>
        )}
      </section>
    </div>
  );
}

export default App;
