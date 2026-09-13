import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Toast from "../components/Toast";

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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

        fetchProfile();
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

    const fetchProfile = async () => {
        setLoading(true);

        try {
            const [userResponse, taskResponse] =
                await Promise.all([
                    api.get("/users/me"),
                    api.get("/tasks")
                ]);

            setUser(userResponse.data);
            setTasks(taskResponse.data);

        } catch (error) {
            console.log("Profile loading error:", error);

            if (
                error.response?.status !== 401 &&
                error.response?.status !== 403
            ) {
                showToast(
                    error.response?.data?.error ||
                    "Failed to load profile",
                    "error"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.status === "COMPLETED"
    ).length;

    const pendingTasks = tasks.filter(
        (task) => task.status !== "COMPLETED"
    ).length;

    const overdueTasks = tasks.filter((task) => {
        if (
            !task.dueDate ||
            task.status === "COMPLETED"
        ) {
            return false;
        }

        return new Date(task.dueDate) < new Date();
    }).length;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner large-spinner"></div>

                <h2>Loading Profile...</h2>

                <p>Please wait</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const userInitial =
        user.name?.charAt(0).toUpperCase() || "U";

    return (
        <div className="profile-page">

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

                        <span>
                            My Profile
                        </span>
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

            <main className="profile-content">

                {/* Profile Card */}
                <div className="profile-main-card">

                    <div className="profile-cover"></div>

                    <div className="profile-info">

                        <div className="profile-page-avatar">
                            {userInitial}
                        </div>

                        <div className="profile-user-info">

                            <h2>
                                {user.name}
                            </h2>

                            <p>
                                {user.email}
                            </p>

                            <span>
                                Task Manager User
                            </span>

                        </div>

                    </div>

                </div>

                {/* Stats */}
                <div className="profile-stats">

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">
                            📋
                        </div>

                        <div>
                            <strong>
                                {totalTasks}
                            </strong>

                            <span>
                                Total Tasks
                            </span>
                        </div>

                    </div>

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">
                            ✓
                        </div>

                        <div>
                            <strong>
                                {completedTasks}
                            </strong>

                            <span>
                                Completed
                            </span>
                        </div>

                    </div>

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">
                            ⏳
                        </div>

                        <div>
                            <strong>
                                {pendingTasks}
                            </strong>

                            <span>
                                Pending
                            </span>
                        </div>

                    </div>

                    <div className="profile-stat-card">

                        <div className="profile-stat-icon">
                            ⚠
                        </div>

                        <div>
                            <strong>
                                {overdueTasks}
                            </strong>

                            <span>
                                Overdue
                            </span>
                        </div>

                    </div>

                </div>

                {/* Account Information */}
                <div className="account-card">

                    <div className="account-card-header">

                        <h3>
                            Account Information
                        </h3>

                        <p>
                            Your account details and activity
                        </p>

                    </div>

                    <div className="account-details">

                        <div className="account-item">

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {user.name}
                            </strong>

                        </div>

                        <div className="account-item">

                            <span>
                                Email Address
                            </span>

                            <strong>
                                {user.email}
                            </strong>

                        </div>

                        <div className="account-item">

                            <span>
                                User ID
                            </span>

                            <strong>
                                #{user.id}
                            </strong>

                        </div>

                        <div className="account-item">

                            <span>
                                Account Status
                            </span>

                            <strong className="active-status">
                                ● Active
                            </strong>

                        </div>

                    </div>

                </div>

                {/* Actions */}
                <div className="profile-actions">

                    <button
                        type="button"
                        className="profile-dashboard-button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Back to Dashboard
                    </button>

                    <button
                        type="button"
                        className="profile-logout-page"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </main>

        </div>
    );
}

export default Profile;