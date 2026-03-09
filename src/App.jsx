import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'unga url potukonga guys!!!!';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Action loading state
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/get-all-task`);
      const data = response.data;

      if (data && data.tasks) {
        setTasks(data.tasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError('Failed to load tasks. Make sure your server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add highly defensive helper
  const showMessage = (msg, isError = false) => {
    // We could use a toast library, but simple state is fine for now
    if (isError) setError(msg);
  };

  // Create a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setActionLoading(true);
      setError(null);

      const payload = {
        title,
        message: title,
        format: 'test'
      };

      if (userId) { payload.user_id = parseInt(userId, 10) || userId; }

      await axios.post(`${API_BASE_URL}/add-task`, payload);

      setTitle('');
      setUserId('');
      await fetchTasks();
    } catch (err) {
      console.error(err);
      setError('Failed to add task. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Prepare edit mode
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title || task.message || '');

    // Optional: fetch single task detail
    fetchSingleTask(task.id);
  };

  const fetchSingleTask = async (id) => {
    try {
      await axios.get(`${API_BASE_URL}/get-task/${id}`);
    } catch (e) {
      console.error("Single fetch error", e);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  // Update a task
  const handleUpdateTask = async (id) => {
    if (!editTitle.trim()) return;

    try {
      setActionLoading(true);
      setError(null);

      await axios.put(`${API_BASE_URL}/update/${id}`, { title: editTitle });

      setEditingId(null);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      setError(`Failed to update task #${id}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      setActionLoading(true);
      setError(null);

      await axios.delete(`${API_BASE_URL}/delete/${id}`);

      await fetchTasks();
    } catch (err) {
      console.error(err);
      setError(`Failed to delete task #${id}.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="glass-panel">

        <header className="header">
          <h1>Task Express</h1>
          <p>Manage your daily activities seamlessly</p>
        </header>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button className="close-btn" onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Add Task Form */}
        <form className="task-form" onSubmit={handleAddTask}>
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={actionLoading}
              required
            />
          </div>
          <div className="input-group" style={{ flex: 0.5 }}>
            <input
              type="text"
              className="input-field"
              placeholder="User ID (optional)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={actionLoading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={actionLoading || !title.trim()}>
            {actionLoading ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        {/* Tasks List Area */}
        {loading ? (
          <div className="spinner"></div>
        ) : tasks.length === 0 ? (
          <div className="status-message">
            <p>No tasks found. Create one above!</p>
          </div>
        ) : (
          <div className="tasks-container">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">

                {editingId === task.id ? (
                  // Edit Mode UI
                  <div style={{ display: 'flex', flex: 1, gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <div className="task-actions">
                      <button
                        className="btn btn-primary" style={{ padding: '10px 16px' }}
                        onClick={() => handleUpdateTask(task.id)}
                        disabled={actionLoading}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-danger" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
                        onClick={cancelEdit}
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode UI
                  <>
                    <div className="task-content">
                      <h3 className="task-title">{task.title || task.message || 'Untitled Task'}</h3>
                      <div className="task-meta">
                        <span className="pill">ID: {task.id}</span>
                        {task.user_id && <span className="pill">User: {task.user_id}</span>}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => startEdit(task)}
                        disabled={actionLoading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
