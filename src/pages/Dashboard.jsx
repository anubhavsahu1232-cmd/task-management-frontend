import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");

    const [profileOpen, setProfileOpen] = useState(false);

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

        fetchData();
    }, [navigate]);

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

    const fetchData = async () => {
        setLoading(true);

        try {
            const [userResponse, taskResponse] = await Promise.all([
                api.get("/users/me"),
                api.get("/tasks")
            ]);

            setUser(userResponse.data);
            setTasks(taskResponse.data);
        } catch (error) {
            console.log("Dashboard loading error:", error);

            if (
                error.response?.status !== 401 &&
                error.response?.status !== 403
            ) {
                showToast("Failed to load dashboard", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        setActionLoading(id);

        try {
            await api.delete(`/tasks/${id}`);

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== id)
            );

            showToast("Task deleted successfully");
        } catch (error) {
            console.log("Delete error:", error);

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
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleView = (id) => {
        navigate(`/task/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/edit-task/${id}`);
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setSortBy("NEWEST");
    };

    const isOverdue = (task) => {
        if (!task.dueDate || task.status === "COMPLETED") {
            return false;
        }

        return new Date(task.dueDate) < new Date();
    };

    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        // Search
        if (search.trim()) {
            const searchText = search.toLowerCase();

            result = result.filter((task) =>
                task.title?.toLowerCase().includes(searchText) ||
                task.description?.toLowerCase().includes(searchText)
            );
        }

        // Status filter
        if (statusFilter !== "ALL") {
            result = result.filter(
                (task) => task.status === statusFilter
            );
        }

        // Priority filter
        if (priorityFilter !== "ALL") {
            result = result.filter(
                (task) => task.priority === priorityFilter
            );
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "NEWEST") {
                return b.id - a.id;
            }

            if (sortBy === "OLDEST") {
                return a.id - b.id;
            }

            const priorityValue = {
                HIGH: 3,
                MEDIUM: 2,
                LOW: 1
            };

            if (sortBy === "HIGH_PRIORITY") {
                return (
                    priorityValue[b.priority] -
                    priorityValue[a.priority]
                );
            }

            if (sortBy === "LOW_PRIORITY") {
                return (
                    priorityValue[a.priority] -
                    priorityValue[b.priority]
                );
            }

            if (sortBy === "DUE_SOON") {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;

                return (
                    new Date(a.dueDate) -
                    new Date(b.dueDate)
                );
            }

            if (sortBy === "DUE_LATEST") {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;

                return (
                    new Date(b.dueDate) -
                    new Date(a.dueDate)
                );
            }

            return 0;
        });

        return result;
    }, [
        tasks,
        search,
        statusFilter,
        priorityFilter,
        sortBy
    ]);

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.status === "COMPLETED"
    ).length;

    const pendingTasks = tasks.filter(
        (task) => task.status !== "COMPLETED"
    ).length;

    const overdueTasks = tasks.filter(
        (task) => isOverdue(task)
    ).length;

    const completionPercentage =
        totalTasks === 0
            ? 0
            : Math.round(
                (completedTasks / totalTasks) * 100
            );

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

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner large-spinner"></div>
                <h2>Loading Dashboard...</h2>
                <p>Please wait</p>
            </div>
        );
    }

    const userInitial =
        user?.name?.charAt(0).toUpperCase() || "U";

    return (
        <div className="dashboard-page">

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
            <header className="dashboard-navbar">

                <div className="dashboard-brand">
                    <div className="dashboard-logo">
                        ✓
                    </div>

                    <div>
                        <h1>Task Manager</h1>
                        <span>Manage your work efficiently</span>
                    </div>
                </div>

                <div className="profile-container">

                    <button
                        type="button"
                        className="profile-button"
                        onClick={() =>
                            setProfileOpen(!profileOpen)
                        }
                    >
                        <div className="profile-avatar">
                            {userInitial}
                        </div>

                        <div className="profile-name">
                            <strong>{user?.name}</strong>
                            <span>{user?.email}</span>
                        </div>

                        <span className="profile-arrow">
                            {profileOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    {profileOpen && (
                        <div className="profile-menu">

                            <div className="profile-menu-header">
                                <div className="profile-menu-avatar">
                                    {userInitial}
                                </div>

                                <div>
                                    <strong>
                                        {user?.name}
                                    </strong>

                                    <span>
                                        {user?.email}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/profile")
                                }
                                className="profile-view-button"
                            >
                                View Profile
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="profile-logout"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main */}
            <main className="dashboard-content">

                <div className="dashboard-heading">
                    <div>
                        <h2>Dashboard</h2>
                        <p>
                            Track and manage all your tasks
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-task-button"
                        onClick={() =>
                            navigate("/add-task")
                        }
                    >
                        + Add Task
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-icon">
                            📋
                        </div>

                        <div>
                            <span>Total Tasks</span>
                            <strong>{totalTasks}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ✓
                        </div>

                        <div>
                            <span>Completed</span>
                            <strong>{completedTasks}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ⏳
                        </div>

                        <div>
                            <span>Pending</span>
                            <strong>{pendingTasks}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            ⚠
                        </div>

                        <div>
                            <span>Overdue</span>
                            <strong>{overdueTasks}</strong>
                        </div>
                    </div>

                </div>

                {/* Progress */}
                <div className="progress-card">

                    <div className="progress-header">
                        <div>
                            <h3>Task Completion</h3>
                            <p>
                                {completedTasks} of {totalTasks} tasks
                                completed
                            </p>
                        </div>

                        <strong>
                            {completionPercentage}%
                        </strong>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${completionPercentage}%`
                            }}
                        ></div>
                    </div>

                </div>

                {/* Filters */}
                <div className="filter-card">

                    <div className="filter-header">
                        <div>
                            <h3>My Tasks</h3>
                            <p>
                                {filteredTasks.length} task
                                {filteredTasks.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>

                        <button
                            type="button"
                            className="clear-filter-button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>

                    <div className="filters">

                        <div className="search-box">
                            <span>🔍</span>

                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="ALL">
                                All Status
                            </option>
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

                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                setPriorityFilter(e.target.value)
                            }
                        >
                            <option value="ALL">
                                All Priority
                            </option>
                            <option value="HIGH">
                                High
                            </option>
                            <option value="MEDIUM">
                                Medium
                            </option>
                            <option value="LOW">
                                Low
                            </option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.target.value)
                            }
                        >
                            <option value="NEWEST">
                                Newest First
                            </option>
                            <option value="OLDEST">
                                Oldest First
                            </option>
                            <option value="HIGH_PRIORITY">
                                Highest Priority
                            </option>
                            <option value="LOW_PRIORITY">
                                Lowest Priority
                            </option>
                            <option value="DUE_SOON">
                                Due Soon
                            </option>
                            <option value="DUE_LATEST">
                                Due Latest
                            </option>
                        </select>

                    </div>
                </div>

                {/* Task List */}
                <div className="task-list">

                    {filteredTasks.length === 0 ? (

                        <div className="empty-state">
                            <div className="empty-icon">
                                📋
                            </div>

                            <h3>No tasks found</h3>

                            <p>
                                {tasks.length === 0
                                    ? "Create your first task to get started."
                                    : "Try changing your filters or search."}
                            </p>

                            {tasks.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/add-task")
                                    }
                                >
                                    + Create Task
                                </button>
                            )}
                        </div>

                    ) : (

                        filteredTasks.map((task) => (

                            <div
                                className="task-card"
                                key={task.id}
                            >

                                <div className="task-main">

                                    <div className="task-title-row">

                                        <h3>
                                            {task.title}
                                        </h3>

                                        <span
                                            className={`priority-badge priority-${task.priority?.toLowerCase()}`}
                                        >
                                            {getPriorityText(
                                                task.priority
                                            )}
                                        </span>

                                    </div>

                                    <p className="task-description">
                                        {task.description ||
                                            "No description"}
                                    </p>

                                    <div className="task-meta">

                                        <span
                                            className={`status-badge status-${task.status?.toLowerCase()}`}
                                        >
                                            {getStatusText(
                                                task.status
                                            )}
                                        </span>

                                        <span>
                                            📅{" "}
                                            {formatDate(
                                                task.dueDate
                                            )}
                                        </span>

                                        {isOverdue(task) && (
                                            <span className="overdue-badge">
                                                Overdue
                                            </span>
                                        )}

                                    </div>

                                </div>

                                <div className="task-actions">

                                    <button
                                        type="button"
                                        className="view-button"
                                        onClick={() =>
                                            handleView(task.id)
                                        }
                                        disabled={
                                            actionLoading ===
                                            task.id
                                        }
                                    >
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEdit(task.id)
                                        }
                                        disabled={
                                            actionLoading ===
                                            task.id
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() =>
                                            handleDelete(task.id)
                                        }
                                        disabled={
                                            actionLoading ===
                                            task.id
                                        }
                                    >
                                        {actionLoading === task.id
                                            ? "..."
                                            : "Delete"}
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>

            </main>
        </div>
    );
}

export default Dashboard;