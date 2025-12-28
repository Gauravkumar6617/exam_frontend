import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewTask, clearError } from '../../features/users/taskSlice';
import type { RootState, AppDispatch } from '.././../redux/store/store';

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.tasks);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return alert("Title is required");
    if (!dueDate) return alert("Please select a specific time for the reminder");

    // Convert local user input to the exact ISO string the worker expects
    const selectedDate = new Date(dueDate);
    const formattedDate = selectedDate.toISOString(); 

    console.log("Current UTC Heartbeat should be near:", new Date().toISOString());
    console.log("Sending to Backend:", formattedDate);

    const resultAction = await dispatch(createNewTask({ 
        title, 
        due_date: formattedDate 
    }));

    if (createNewTask.fulfilled.match(resultAction)) {
      setTitle('');
      setDueDate('');
      alert("Task created! Check your worker terminal.");
    }
};
  return (
    <div style={styles.container}>
      <h3>Create New Task</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Task Title</label>
          <input
            type="text"
            placeholder="Enter task name..."
            value={title}
            onChange={(e) => {
                setTitle(e.target.value);
                if (error) dispatch(clearError());
            }}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Due Date</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={styles.input}
          />
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button 
          type="submit" 
          disabled={loading} 
          style={{...styles.button, opacity: loading ? 0.7 : 1}}
        >
          {loading ? "Saving to Database..." : "Add Task"}
        </button>
      </form>
    </div>
  );
};

// Simple inline styles for demonstration
const styles = {
  container: { maxWidth: '400px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '5px' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  errorText: { color: 'red', fontSize: '14px' }
};

export default TaskForm;