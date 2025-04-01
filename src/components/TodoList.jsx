import { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";

export default function TodoList({ darkMode, setDarkMode }) {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectAll, setSelectAll] = useState(false);

  // Fetch tasks from the backend API
  useEffect(() => {
    axios.get("http://localhost:8000/api/tasks/") // Replace with your backend URL
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => console.error("There was an error fetching tasks:", error));
  }, []);

  const addTask = () => {
    if (task.trim() === "") return;
    axios.post("http://localhost:8000/api/tasks/", { title: task, completed: false })
      .then(response => {
        setTasks([...tasks, response.data]);
        setTask("");
      })
      .catch(error => console.error("Error adding task:", error));
  };

  const removeTask = (index) => {
    const taskToDelete = tasks[index];
    axios.delete(`http://localhost:8000/api/tasks/${taskToDelete.id}/`)
      .then(() => {
        setTasks(tasks.filter((_, i) => i !== index));
      })
      .catch(error => console.error("Error removing task:", error));
  };

  const toggleComplete = (index) => {
    const taskToToggle = tasks[index];
    axios.put(`http://localhost:8000/api/tasks/${taskToToggle.id}/`, {
      ...taskToToggle,
      completed: !taskToToggle.completed,
    })
      .then(response => {
        setTasks(tasks.map((t, i) => (i === index ? response.data : t)));
      })
      .catch(error => console.error("Error toggling task completion:", error));
  };

  const startEditing = (index, text) => {
    setEditingIndex(index);
    setEditedTask(text);
  };

  const saveEdit = (index) => {
    if (editedTask.trim() === "") return;
    const taskToEdit = tasks[index];
    axios.put(`http://localhost:8000/api/tasks/${taskToEdit.id}/`, {
      ...taskToEdit,
      title: editedTask,
    })
      .then(response => {
        setTasks(tasks.map((t, i) => (i === index ? response.data : t)));
        setEditingIndex(null);
      })
      .catch(error => console.error("Error saving task edit:", error));
  };

  const handleDeleteAll = () => {
    if (selectAll) {
      axios.delete("http://localhost:8000/api/tasks/")
        .then(() => {
          setTasks([]);
          setSelectAll(false);
        })
        .catch(error => console.error("Error deleting all tasks:", error));
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    tasks.forEach(task => toggleComplete(tasks.indexOf(task)));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <div className="todo-container">
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <h2>To-Do List</h2>
      <input
        type="text"
        placeholder="Add a new task..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <button onClick={addTask}>Add Task</button>
      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button className="delete-all-button" onClick={handleDeleteAll} disabled={!selectAll}>Delete All</button>
      </div>
      <div className="select-all-container">
        <input 
          type="checkbox" 
          checked={selectAll} 
          onChange={handleSelectAll} 
          id="select-all"
        />
        <label htmlFor="select-all">Select All</label>
      </div>
      <ul>
        {filteredTasks.map((t, index) => (
          <li key={index} className={t.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggleComplete(index)}
            />
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editedTask}
                  onChange={(e) => setEditedTask(e.target.value)}
                />
                <button onClick={() => saveEdit(index)}>✅</button>
              </>
            ) : (
              <>
                <span>{t.title}</span>
                <button onClick={() => startEditing(index, t.title)}>✏️</button>
                <button onClick={() => removeTask(index)}>❌</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
