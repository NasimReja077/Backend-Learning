import { useState, useEffect } from "react";
import axios from "axios";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import "./App.css";

// const API_URL = "http://localhost:5000/api/tasks";
const API_URL = "/api/tasks";
function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setTasks(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch tasks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const addTask = async (taskData) => {
    try {
      const res = await axios.post(API_URL, taskData);
      setTasks([res.data, ...tasks]);
    } catch (err) {
      setError("Failed to add task");
    }
  };

  // Toggle complete
  const toggleTask = async (id) => {
    try {
      const task = tasks.find((t) => t._id === id);
      const res = await axios.put(`${API_URL}/${id}`, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError("Failed to update task");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>Task Manager</h1>
        <p>Full Stack App with React + Node.js + MongoDB</p>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}

        <TaskForm onAddTask={addTask} />

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;