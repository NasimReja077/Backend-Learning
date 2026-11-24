import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleCheck,
  Inbox,
  LogOut,
  MessageSquareText,
  Radio,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import AuthScreen from "./components/auth-screen.jsx";
import Button from "./components/ui/button.jsx";
import Input from "./components/ui/input.jsx";
import Label from "./components/ui/label.jsx";
import Textarea from "./components/ui/textarea.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./components/ui/card.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const fetchNotificationData = (headers) => Promise.all([
  axios.get(`${API}/notifications`, { headers }),
  axios.get(`${API}/notifications/unread-count`, { headers })
]);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
};

export default function App() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const handleAuthenticated = ({ token: sessionToken, user }) => {
    localStorage.setItem("token", sessionToken);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
    setError("");
    setToken(sessionToken);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setCurrentUser(null);
    setNotifications([]);
    setUnread(0);
    setConnected(false);
    setError("");
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [list, count] = await fetchNotificationData(headers);

      setNotifications(list.data.notifications);
      setUnread(count.data.unreadCount);
    } catch (requestError) {
      console.error("Loading notifications failed:", requestError);
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }
      setError(
        "We couldn't load your notifications. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [handleLogout, headers, token]);

  useEffect(() => {
    let active = true;

    if (!token) return undefined;

    fetchNotificationData(headers)
      .then(([list, count]) => {
        if (!active) return;
        setNotifications(list.data.notifications);
        setUnread(count.data.unreadCount);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        console.error("Loading notifications failed:", requestError);
        if (requestError.response?.status === 401) {
          handleLogout();
          return;
        }
        setError(
          "We couldn't load your notifications. Check your connection and try again."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (socketError) => {
      setConnected(false);
      console.error("Socket connection failed:", socketError.message);
    });
    socket.on("newNotification", (notification) => {
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item._id !== notification._id)
      ]);
      if (!notification.isRead) setUnread((current) => current + 1);
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [handleLogout, headers, token]);

  const markRead = async (id) => {
    const notification = notifications.find((item) => item._id === id);
    if (!notification || notification.isRead) return;

    setError("");
    try {
      await axios.patch(`${API}/notifications/${id}/read`, {}, { headers });
      setNotifications((current) =>
        current.map((item) => item._id === id ? { ...item, isRead: true } : item)
      );
      setUnread((current) => Math.max(0, current - 1));
    } catch (requestError) {
      console.error("Marking notification as read failed:", requestError);
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }
      setError("Couldn't update that notification. Please try again.");
    }
  };

  const markAllRead = async () => {
    const unreadItems = notifications.filter((item) => !item.isRead);
    if (unreadItems.length === 0) return;

    setUpdating(true);
    setError("");
    try {
      await Promise.all(
        unreadItems.map((item) =>
          axios.patch(`${API}/notifications/${item._id}/read`, {}, { headers })
        )
      );
      const readIds = new Set(unreadItems.map((item) => item._id));
      setNotifications((current) =>
        current.map((item) => readIds.has(item._id) ? { ...item, isRead: true } : item)
      );
      setUnread((current) => Math.max(0, current - unreadItems.length));
    } catch (requestError) {
      console.error("Marking all notifications as read failed:", requestError);
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }
      setError("Some notifications couldn't be updated. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const deleteNotification = async (id) => {
    const notification = notifications.find((item) => item._id === id);
    setError("");
    try {
      await axios.delete(`${API}/notifications/${id}`, { headers });
      setNotifications((current) => current.filter((item) => item._id !== id));
      if (notification && !notification.isRead) {
        setUnread((current) => Math.max(0, current - 1));
      }
    } catch (requestError) {
      console.error("Deleting notification failed:", requestError);
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }
      setError("Couldn't delete that notification. Please try again.");
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    setSending(true);
    setSendError("");
    setSendSuccess("");

    try {
      await axios.post(
        `${API}/notifications`,
        {
          recipient: recipient.trim(),
          title: messageTitle.trim(),
          message: messageBody.trim(),
          type: "system"
        },
        { headers }
      );

      setSendSuccess("Your message was sent.");
      setComposerOpen(false);
      setRecipient("");
      setMessageTitle("");
      setMessageBody("");
    } catch (requestError) {
      console.error("Sending message failed:", requestError);
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }
      setSendError(
        requestError.response?.data?.message ||
        "We couldn't send your message. Check the recipient ID and try again."
      );
    } finally {
      setSending(false);
    }
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setSendError("");
  };

  const visibleNotifications = filter === "unread"
    ? notifications.filter((item) => !item.isRead)
    : notifications;

  if (!token) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="NotifyHub home">
          <span className="brand-mark"><BellRing size={19} /></span>
          <span>notify<span className="brand-accent">hub</span></span>
        </a>
        <div className={`connection-pill ${connected ? "is-connected" : ""}`}>
          <Radio size={14} />
          <span>{connected ? "Live updates on" : "Connecting"}</span>
        </div>
        <div className="account-controls">
          {currentUser?.name && <span className="account-name">{currentUser.name}</span>}
          <button className="logout-button" onClick={handleLogout} type="button">
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="dashboard">
        {sendSuccess && (
          <div className="send-success" role="status">
            <span><Check size={15} /></span>
            <p>{sendSuccess}</p>
            <button
              aria-label="Dismiss message sent status"
              onClick={() => setSendSuccess("")}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        )}
        <section className="welcome-panel">
          <div className="welcome-copy">
            <div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL INBOX</div>
            <h1>Stay in the <span>know.</span></h1>
            <p>All your updates, gathered in one place.</p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-glow" />
            <BellRing className="art-bell" size={76} strokeWidth={1.2} />
            <span className="art-spark art-spark-one">✦</span>
            <span className="art-spark art-spark-two">✧</span>
          </div>
          <div className="welcome-count">
            <span className="count-value">{unread}</span>
            <span className="count-label">unread {unread === 1 ? "update" : "updates"}</span>
          </div>
        </section>

        <section className="inbox-section" aria-labelledby="inbox-heading">
          <div className="section-heading">
            <div>
              <div className="eyebrow section-eyebrow">YOUR UPDATES</div>
              <h2 id="inbox-heading">Notifications <span className="total-count">{notifications.length}</span></h2>
            </div>
            <div className="heading-actions">
              <Button
                className="compose-button"
                onClick={() => {
                  setSendError("");
                  setComposerOpen(true);
                }}
              >
                <Send size={15} />
                <span>Send message</span>
              </Button>
              <button
                className="text-button"
                onClick={loadNotifications}
                disabled={loading}
                type="button"
              >
                <RefreshCw size={15} className={loading ? "spin" : ""} />
                <span>Refresh</span>
              </button>
              <button
                className="text-button mark-all-button"
                onClick={markAllRead}
                disabled={unread === 0 || updating}
                type="button"
              >
                <CheckCheck size={16} />
                <span>{updating ? "Updating..." : "Mark all read"}</span>
              </button>
            </div>
          </div>

          <div className="inbox-card">
            <div className="filter-bar" role="tablist" aria-label="Filter notifications">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
                role="tab"
                aria-selected={filter === "all"}
                type="button"
              >
                All <span>{notifications.length}</span>
              </button>
              <button
                className={`filter-tab ${filter === "unread" ? "active" : ""}`}
                onClick={() => setFilter("unread")}
                role="tab"
                aria-selected={filter === "unread"}
                type="button"
              >
                Unread <span>{unread}</span>
              </button>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
                <button onClick={loadNotifications} type="button">Try again</button>
              </div>
            )}

            {loading ? (
              <div className="state-panel">
                <span className="loading-icon"><RefreshCw size={21} /></span>
                <p>Gathering your updates...</p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="state-panel empty-state">
                <span className="empty-icon">
                  {filter === "unread" ? <CircleCheck size={25} /> : <Inbox size={25} />}
                </span>
                <h3>{filter === "unread" ? "All caught up!" : "It's quiet in here"}</h3>
                <p>
                  {filter === "unread"
                    ? "You've read every notification. Nice work."
                    : "When something new happens, you'll find it here."}
                </p>
                {filter === "unread" && notifications.length > 0 && (
                  <button className="subtle-button" onClick={() => setFilter("all")} type="button">
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="notification-list">
                {visibleNotifications.map((item) => (
                  <article
                    className={`notification-item ${item.isRead ? "is-read" : "is-unread"}`}
                    key={item._id}
                  >
                    <span className={`notification-icon ${item.isRead ? "" : "icon-unread"}`}>
                      {item.isRead ? <Bell size={18} /> : <BellRing size={18} />}
                    </span>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <h3>{item.title}</h3>
                        {!item.isRead && <span className="new-indicator">NEW</span>}
                      </div>
                      <p>{item.message}</p>
                      <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                    </div>
                    <div className="notification-actions">
                      {!item.isRead && (
                        <button
                          className="icon-button read-button"
                          onClick={() => markRead(item._id)}
                          title="Mark as read"
                          aria-label={`Mark ${item.title} as read`}
                          type="button"
                        >
                          <Check size={17} />
                        </button>
                      )}
                      <button
                        className="icon-button delete-button"
                        onClick={() => deleteNotification(item._id)}
                        title="Delete notification"
                        aria-label={`Delete ${item.title}`}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          <p className="footer-note"><span /> You’re all set — we’ll let you know when something happens.</p>
        </section>
      </main>

      {composerOpen && (
        <div
          className="composer-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeComposer();
          }}
        >
          <Card
            aria-labelledby="composer-title"
            aria-modal="true"
            className="composer-card"
            role="dialog"
          >
            <CardHeader className="composer-header">
              <span className="composer-icon"><MessageSquareText size={19} /></span>
              <div className="composer-heading">
                <CardTitle id="composer-title">Send a message</CardTitle>
                <CardDescription>
                  Send a real-time notification to another NotifyHub user.
                </CardDescription>
              </div>
              <button
                aria-label="Close message form"
                className="composer-close"
                onClick={closeComposer}
                type="button"
              >
                <X size={18} />
              </button>
            </CardHeader>
            <CardContent>
              <form className="composer-form" onSubmit={sendMessage}>
                <div className="composer-field">
                  <Label htmlFor="recipient-id">Recipient user ID</Label>
                  <Input
                    autoComplete="off"
                    autoFocus
                    id="recipient-id"
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="Paste the recipient's account ID"
                    required
                    value={recipient}
                  />
                  <p className="field-hint">
                    Use the recipient’s MongoDB user ID, not their email address.
                  </p>
                </div>
                <div className="composer-field">
                  <Label htmlFor="message-title">Title</Label>
                  <Input
                    id="message-title"
                    maxLength={100}
                    onChange={(event) => setMessageTitle(event.target.value)}
                    placeholder="Give your message a title"
                    required
                    value={messageTitle}
                  />
                </div>
                <div className="composer-field">
                  <Label htmlFor="message-body">Message</Label>
                  <Textarea
                    id="message-body"
                    maxLength={1000}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder="Write your message..."
                    required
                    rows={4}
                    value={messageBody}
                  />
                  <span className="character-count">{messageBody.length}/1000</span>
                </div>
                {sendError && <div className="auth-error" role="alert">{sendError}</div>}
                <div className="composer-actions">
                  <Button
                    className="composer-cancel"
                    onClick={closeComposer}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button className="composer-submit" disabled={sending} type="submit">
                    <Send size={15} />
                    <span>{sending ? "Sending..." : "Send message"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
