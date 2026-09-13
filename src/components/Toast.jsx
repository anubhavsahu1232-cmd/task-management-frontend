function Toast({ message, type = "success", onClose }) {
    if (!message) {
        return null;
    }

    return (
        <div className={`toast toast-${type}`}>

            <div className="toast-icon">
                {type === "success" ? "✓" : "!"}
            </div>

            <span>
                {message}
            </span>

            <button
                type="button"
                onClick={onClose}
                className="toast-close"
            >
                ×
            </button>

        </div>
    );
}

export default Toast;