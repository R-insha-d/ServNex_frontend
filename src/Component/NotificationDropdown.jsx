import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCheckCircle, FaCalendarCheck, FaInfoCircle, FaTrash, FaTimesCircle } from 'react-icons/fa';
import AxiosInstance from './AxiosInstance';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await AxiosInstance.get('api/notifications/');
            setNotifications(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await AxiosInstance.get('api/notifications/unread_count/');
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Polling for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
            if (isOpen) fetchNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await AxiosInstance.post(`api/notifications/${id}/mark_as_read/`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await AxiosInstance.post('api/notifications/mark_all_as_read/');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <FaCalendarCheck className="notif-icon booking" />;
            case 'reservation': return <FaCheckCircle className="notif-icon reservation" />;
            case 'failure': return <FaTimesCircle className="notif-icon failure" />;
            default: return <FaInfoCircle className="notif-icon info" />;
        }
    };

    return (
        <div className="notification-dropdown-container" ref={dropdownRef}>
            <div className="notification-bell-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <FaBell className={`bell-icon ${unreadCount > 0 ? 'ringing' : ''}`} />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`notification-item ${notif.is_read ? 'read' : 'unread'}`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    <div className="notif-content-wrapper">
                                        {getIcon(notif.notification_type)}
                                        <div className="notif-text">
                                            <p className="notif-title">{notif.title}</p>
                                            <p className="notif-message">{notif.message}</p>
                                            <span className="notif-time">{notif.created_at_human}</span>
                                        </div>
                                    </div>
                                    {!notif.is_read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                    
                    <div className="notification-footer">
                        <a href="/my-bookings">View all activity</a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
