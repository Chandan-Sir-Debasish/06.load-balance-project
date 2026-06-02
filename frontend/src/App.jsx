import { useState, useEffect } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [serverInfo, setServerInfo] = useState("");
  const [algo, setAlgo] = useState("");

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks);
    setServerInfo(`Served by server on port ${data.server}`);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    setServerInfo(`Served by server on port ${data.server}`);
    setTitle("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    const data = await res.json();
    setServerInfo(`Served by server on port ${data.server}`);
    fetchTasks();
  };

  const switchAlgorithm = async (algorithm) => {
    try {
      const res = await fetch("http://localhost:3001/switch-algorithm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ algorithm }),
      });
      const data = await res.json();
      if (data.success) {
        setAlgo(algorithm);
        alert(data.message);
        // Give Nginx a moment to reload, then re-fetch tasks to see the new server
        setTimeout(fetchTasks, 500);
      }
    } catch (err) {
      alert("Failed to switch algorithm: " + err.message);
    }
  };
  const fetchCurrentAlgorithm = async () => {
    try {
      const res = await fetch("http://localhost:3001/current-algorithm");
      const data = await res.json();
      setAlgo(data.algorithm);
    } catch (err) {
      console.error("Failed to fetch current algorithm", err);
      setAlgo("unknown"); // fallback
    }
  };

  useEffect(() => {
    fetchCurrentAlgorithm();
    fetchTasks();
  }, []);

  return (
    <div className="container">
      <h1>Task Manager (Load Balanced)</h1>
      <div className="server-badge">Current server: {serverInfo}</div>

      <div className="algo-switcher">
        <p>
          Current algorithm: <strong>{algo || "Loading..."}</strong>
        </p>
        <div className="algo-buttons">
          <button onClick={() => switchAlgorithm("roundrobin")}>
            Round Robin
          </button>
          <button onClick={() => switchAlgorithm("leastconn")}>
            Least Connections
          </button>
          <button onClick={() => switchAlgorithm("iphash")}>IP Hash</button>
          <button onClick={() => switchAlgorithm("weighted")}>Weighted</button>
        </div>
      </div>

      <form onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <div>
              <span className="task-title">{task.title}</span>
              <span className="task-meta">
                ({task.completed ? "done" : "pending"}) — created by{" "}
                <strong>{task.createdBy}</strong>
              </span>
            </div>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
