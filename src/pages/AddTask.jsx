import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";

function AddTask() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("TODO");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");

    const [loading, setLoading] = useState(false);

    const [toast, setToast] = useState({
        message: "",
        type: "success"
    });

    const showToast = (message, type = "success") => {
        setToast({
            message,
            type
        });

        setTimeout(() => {
            setToast({
                message: "",
                type: "success"
            });
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (title.trim().length < 3) {
            showToast(
                "Task title must be at least 3 characters",
                "error"
            );
            return;
        }

        setLoading(true);

        try {
            await api.post("/tasks", {
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                dueDate: dueDate || null
            });

            showToast("Task created successfully");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            console.log("Create task error:", error);

            if (
                error.response?.status !== 401 &&
                error.response?.status !== 403
            ) {
                showToast(
                    error.response?.data?.error ||
                    "Failed to create task",
                    "error"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="form-page">

            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast({
                        message: "",
                        type: "success"
                    })
                }
            />

            <header className="form-navbar">

                <div className="form-brand">
                    <div className="dashboard-logo">
                        ✓
                    </div>

                    <div>
                        <h1>Task Manager</h1>
                        <span>Create a new task</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="form-back-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    ← Dashboard
                </button>

            </header>

            <main className="form-content">

                <div className="task-form-card">

                    <div className="form-title">

                        <div className="form-title-icon">
                            +
                        </div>

                        <div>
                            <h2>Create New Task</h2>

                            <p>
                                Add a task and keep your work organized
                            </p>
                        </div>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label>
                                Task Title
                                <span>*</span>
                            </label>

                            <input
                                type="text"
                                placeholder="Enter task title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                maxLength={100}
                                required
                            />

                            <small>
                                {title.length}/100
                            </small>

                        </div>

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Describe your task..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                maxLength={500}
                                rows={5}
                            ></textarea>

                            <small>
                                {description.length}/500
                            </small>

                        </div>

                        <div className="form-row">

                            <div className="form-group">

                                <label>
                                    Status
                                    <span>*</span>
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
                                    }
                                >
                                    <option value="TODO">
                                        To Do
                                    </option>

                                    <option value="IN_PROGRESS">
                                        In Progress
                                    </option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>
                                </select>

                            </div>

                            <div className="form-group">

                                <label>
                                    Priority
                                    <span>*</span>
                                </label>

                                <select
                                    value={priority}
                                    onChange={(e) =>
                                        setPriority(e.target.value)
                                    }
                                >
                                    <option value="LOW">
                                        Low
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HIGH">
                                        High
                                    </option>
                                </select>

                            </div>

                        </div>

                        <div className="form-group">

                            <label>
                                Due Date
                            </label>

                            <input
                                type="date"
                                min={today}
                                value={dueDate}
                                onChange={(e) =>
                                    setDueDate(e.target.value)
                                }
                            />

                        </div>

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-task-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Task"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default AddTask;