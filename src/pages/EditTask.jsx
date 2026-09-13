import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";

function EditTask() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("TODO");
    const [priority, setPriority] = useState("MEDIUM");
    const [dueDate, setDueDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [toast, setToast] = useState({
        message: "",
        type: "success"
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        fetchTask();
    }, [id, navigate]);

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

    const fetchTask = async () => {
        setLoading(true);

        try {
            const response = await api.get(`/tasks/${id}`);

            const task = response.data;

            setTitle(task.title || "");
            setDescription(task.description || "");
            setStatus(task.status || "TODO");
            setPriority(task.priority || "MEDIUM");
            setDueDate(task.dueDate || "");

        } catch (error) {
            console.log("Fetch task error:", error);

            if (
                error.response?.status !== 401 &&
                error.response?.status !== 403
            ) {
                showToast(
                    error.response?.data?.error ||
                    "Failed to load task",
                    "error"
                );
            }
        } finally {
            setLoading(false);
        }
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

        setSaving(true);

        try {
            await api.put(`/tasks/${id}`, {
                title: title.trim(),
                description: description.trim(),
                status,
                priority,
                dueDate: dueDate || null
            });

            showToast("Task updated successfully");

            setTimeout(() => {
                navigate(`/task/${id}`);
            }, 1000);

        } catch (error) {
            console.log("Update task error:", error);

            if (
                error.response?.status !== 401 &&
                error.response?.status !== 403
            ) {
                showToast(
                    error.response?.data?.error ||
                    "Failed to update task",
                    "error"
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const today = new Date()
        .toISOString()
        .split("T")[0];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner large-spinner"></div>
                <h2>Loading Task...</h2>
                <p>Please wait</p>
            </div>
        );
    }

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
                        <span>Edit task details</span>
                    </div>

                </div>

                <button
                    type="button"
                    className="form-back-button"
                    onClick={() =>
                        navigate(`/task/${id}`)
                    }
                    disabled={saving}
                >
                    ← Task Details
                </button>

            </header>

            <main className="form-content">

                <div className="task-form-card">

                    <div className="form-title">

                        <div className="form-title-icon edit-icon">
                            ✎
                        </div>

                        <div>
                            <h2>Edit Task</h2>

                            <p>
                                Update your task information
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
                                    disabled={saving}
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
                                    disabled={saving}
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
                                disabled={saving}
                            />

                        </div>

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    navigate(`/task/${id}`)
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-task-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default EditTask;