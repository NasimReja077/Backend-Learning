function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-description">{task.description}</div>
        )}
        <div className="task-date">
          {new Date(task.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="task-actions">
        <button className="btn-complete" onClick={() => onToggle(task._id)}>
          {task.completed ? "Undo" : "Complete"}
        </button>
        <button className="btn-delete" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;