import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";

function TaskDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

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
            setTask(response.data);
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

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        try {
            await api.delete(`/tasks/${id}`);

            showToast("Task deleted successfully");

            setTimeout(() => {
                navigate("/dashboard");
            }, 800);

        } catch (error) {
            console.log("Delete task error:", error);

            if (
                error.response?.status !== 401 &&
                error.response?.status !== 403
            ) {
                showToast(
                    error.response?.data?.error ||
                    "Failed to delete task",
                    "error"
                );
            }

            setDeleting(false);
        }
    };

    const getStatusText = (status) => {
        if (status === "TODO") {
            return "To Do";
        }

        if (status === "IN_PROGRESS") {
            return "In Progress";
        }

        if (status === "COMPLETED") {
            return "Completed";
        }

        return status;
    };

    const getPriorityText = (priority) => {
        if (priority === "HIGH") {
            return "High";
        }

        if (priority === "MEDIUM") {
            return "Medium";
        }

        if (priority === "LOW") {
            return "Low";
        }

        return priority;
    };

    const formatDate = (date) => {
        if (!date) {
            return "No due date";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const isOverdue = () => {
        if (!task?.dueDate || task.status === "COMPLETED") {
            return false;
        }

        return new Date(task.dueDate) < new Date();
    };

    const getProgressStep = () => {
        if (task?.status === "COMPLETED") {
            return 3;
        }

        if (task?.status === "IN_PROGRESS") {
            return 2;
        }

        return 1;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner large-spinner"></div>
                <h2>Loading Task...</h2>
                <p>Please wait</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="dashboard-loading">
                <h2>Task Not Found</h2>
                <p>
                    The requested task could not be found.
                </p>

                <button
                    type="button"
                    className="add-task-button"
                    onClick={() => navigate("/dashboard")}
                    style={{ marginTop: "20px" }}
                >
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    const progressStep = getProgressStep();

    return (
        <div className="details-page">

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

            {/* Navbar */}
            <header className="form-navbar">

                <div className="form-brand">

                    <div className="dashboard-logo">
                        ✓
                    </div>

                    <div>
                        <h1>Task Manager</h1>
                        <span>Task Details</span>
                    </div>

                </div>

                <button
                    type="button"
                    className="form-back-button"
                    onClick={() => navigate("/dashboard")}
                    disabled={deleting}
                >
                    ← Dashboard
                </button>

            </header>

            <main className="details-content">

                {/* Header */}
                <div className="details-header">

                    <div>
                        <p className="details-label">
                            TASK DETAILS
                        </p>

                        <h2>{task.title}</h2>

                        <p className="details-id">
                            Task ID: #{task.id}
                        </p>
                    </div>

                    <div className="details-header-actions">

                        <button
                            type="button"
                            className="details-edit-button"
                            onClick={() =>
                                navigate(`/edit-task/${task.id}`)
                            }
                            disabled={deleting}
                        >
                            ✎ Edit Task
                        </button>

                        <button
                            type="button"
                            className="details-delete-button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Task"}
                        </button>

                    </div>

                </div>

                {/* Status Progress */}
                <div className="task-progress-card">

                    <div className="task-progress-title">
                        <h3>Task Progress</h3>

                        <span
                            className={`status-badge status-${task.status?.toLowerCase()}`}
                        >
                            {getStatusText(task.status)}
                        </span>
                    </div>

                    <div className="progress-steps">

                        <div
                            className={`progress-step ${
                                progressStep >= 1
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="step-circle">
                                {progressStep >= 1
                                    ? "✓"
                                    : "1"}
                            </div>

                            <span>To Do</span>
                        </div>

                        <div
                            className={`progress-line ${
                                progressStep >= 2
                                    ? "active"
                                    : ""
                            }`}
                        ></div>

                        <div
                            className={`progress-step ${
                                progressStep >= 2
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="step-circle">
                                {progressStep >= 2
                                    ? "✓"
                                    : "2"}
                            </div>

                            <span>In Progress</span>
                        </div>

                        <div
                            className={`progress-line ${
                                progressStep >= 3
                                    ? "active"
                                    : ""
                            }`}
                        ></div>

                        <div
                            className={`progress-step ${
                                progressStep >= 3
                                    ? "active"
                                    : ""
                            }`}
                        >
                            <div className="step-circle">
                                {progressStep >= 3
                                    ? "✓"
                                    : "3"}
                            </div>

                            <span>Completed</span>
                        </div>

                    </div>

                </div>

                {/* Details */}
                <div className="details-grid">

                    <div className="details-main-card">

                        <h3>Description</h3>

                        <div className="description-box">
                            {task.description ? (
                                <p>{task.description}</p>
                            ) : (
                                <p className="no-description">
                                    No description added for this task.
                                </p>
                            )}
                        </div>

                    </div>

                    <div className="details-side-card">

                        <h3>Task Information</h3>

                        <div className="info-item">
                            <span>Priority</span>

                            <strong
                                className={`priority-text priority-${task.priority?.toLowerCase()}`}
                            >
                                {getPriorityText(task.priority)}
                            </strong>
                        </div>

                        <div className="info-item">
                            <span>Status</span>

                            <strong>
                                {getStatusText(task.status)}
                            </strong>
                        </div>

                        <div className="info-item">
                            <span>Due Date</span>

                            <strong>
                                {formatDate(task.dueDate)}
                            </strong>
                        </div>

                        <div className="info-item">
                            <span>Task ID</span>

                            <strong>
                                #{task.id}
                            </strong>
                        </div>

                        {isOverdue() && (
                            <div className="details-overdue">
                                ⚠ This task is overdue
                            </div>
                        )}

                    </div>

                </div>

                <div className="details-bottom-actions">

                    <button
                        type="button"
                        className="details-back-button"
                        onClick={() => navigate("/dashboard")}
                        disabled={deleting}
                    >
                        ← Back to Dashboard
                    </button>

                    <button
                        type="button"
                        className="details-edit-button"
                        onClick={() =>
                            navigate(`/edit-task/${task.id}`)
                        }
                        disabled={deleting}
                    >
                        Edit Task
                    </button>

                </div>

            </main>

        </div>
    );
}

export default TaskDetails;