import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AxiosInstance from "./AxiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import Typography from "@mui/material/Typography";
import { FaUser } from "react-icons/fa6";
import { FaEdit, FaTrash } from "react-icons/fa";

import { FaHome, FaCalendarAlt, FaPhoneAlt, FaInfo } from "react-icons/fa";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoIosLogOut } from "react-icons/io";
import NotificationDropdown from "./NotificationDropdown";
import { toast } from "react-toastify";

function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [username, setUsername] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("access");
      setIsLoggedIn(!!token);
      setAccountType(localStorage.getItem("account_type"));
      setUsername(localStorage.getItem("username"));

      const savedImage = localStorage.getItem("profile_image");
      if (savedImage) {
        // Handle Base64 (data:), Absolute (http), and Relative (/media) URLs
        const imageUrl = savedImage.startsWith('http') || savedImage.startsWith('data:')
          ? savedImage
          : `http://127.0.0.1:8000${savedImage}`;
        setProfileImage(imageUrl);
      } else {
        setProfileImage(null);
      }
    };

    loadUserData();

    // Listen for storage changes (helpful when updating profile in another component)
    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setSidebarOpen(false);
    navigate("/", { replace: true });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      AxiosInstance.delete("delete-profile/")
        .then(() => {
          localStorage.clear();
          setIsLoggedIn(false);
          setSidebarOpen(false);
          toast.success("Account deleted successfully.");
          navigate("/", { replace: true });
          window.location.reload();
        })
        .catch((err) => {
          toast.error("Failed to delete account: " + JSON.stringify(err.response?.data));
        });
    }
  };

  const handleProfileClick = () => {
    if (accountType === "user") {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Image must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Send to backend
    const formData = new FormData();
    formData.append("profile_image", file);

    AxiosInstance.patch("update-profile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        const { profile_image } = res.data.user;
        if (profile_image) {
          localStorage.setItem("profile_image", profile_image);
          // Prepend base URL for Header display if it's relative
          const imageUrl = profile_image.startsWith('http') || profile_image.startsWith('data:')
            ? profile_image
            : `http://127.0.0.1:8000${profile_image}`;
          setProfileImage(imageUrl);
        }
        toast.success("Profile picture updated!");
      })
      .catch((err) => {
        toast.error("Failed to update picture: " + JSON.stringify(err.response?.data));
      });
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg px-4"
        style={{
          background: "var(--grad-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          paddingTop: "16px",
          paddingBottom: "16px",
          position: "sticky",
          top: 0,
          zIndex: 1050,
          transition: "all 0.3s ease",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            padding: '2px',
            background: 'var(--grad-primary)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <img
              src="/logo.png"
              alt="ServNex Logo"
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "10px",
                objectFit: "cover",
                background: 'white'
              }}
            />
          </div>
          <span className="header-logo" style={{
            fontSize: '24px',
            fontWeight: '800',
            background: 'var(--grad-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>
            ServNex
          </span>
        </Link>

        {/* TOGGLER BUTTON  */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: "none", padding: '8px' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* COLLAPSE WRAPPER */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="ms-auto mt-3 mt-lg-0 d-flex align-items-center gap-3">
            {!isLoggedIn && (
              <>
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <button
                    className="nav-btn-secondary"
                  >
                    Login
                  </button>
                </Link>

                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <button
                    className="nav-btn-primary"
                  >
                    Get Started
                  </button>
                </Link>
              </>
            )}

            {isLoggedIn && (
              <div className="d-flex align-items-center gap-4">
                <NotificationDropdown />
                <div
                  onClick={toggleSidebar}
                  style={{
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  className="profile-trigger"
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--grad-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <FaUser size={16} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--primary)', paddingRight: '8px' }}>
                    {username}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav >

      {/* Sidebar */}
      < div
        className="position-fixed top-0 end-0 vh-100 text-white d-flex flex-column"
        style={{
          width: "350px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 2000,
          background: "var(--surface)",
          boxShadow: "-20px 0 50px rgba(0,0,0,0.15)",
          color: '#6366f1'
        }}
      >
        <div className="p-4 d-flex align-items-center justify-content-between border-bottom">
          <h6 style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)' }}>Menu</h6>
          <button onClick={toggleSidebar} style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        <div className="flex-grow-1 overflow-auto">
          {accountType === "user" && (
            <div className="p-4 text-center border-bottom mb-3" style={{ background: 'var(--background)' }}>
              <div
                onClick={handleProfileClick}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "inline-block",
                  marginBottom: '16px'
                }}
                className="profile-wrapper"
              >
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  padding: '4px',
                  background: 'var(--grad-primary)',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid white',
                    background: '#eee'
                  }}>
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="h-100 w-100 d-flex align-items-center justify-content-center text-muted">
                        <FaUser size={40} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-overlay">Update</div>
              </div>

              <h5 style={{ fontWeight: 700, marginBottom: '4px', color: '#6366f1', marginBottom: '20px' }}>{username}</h5>
              {/* <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Standard Membership</p> */}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              <div className="d-flex flex-column gap-2">
                <button
                  className="side-nav-action"
                  onClick={() => setManageOpen(!manageOpen)}
                >
                  Manage Account {manageOpen ? '↑' : '↓'}
                </button>

                {manageOpen && (
                  <div className="d-flex flex-column gap-2 mt-2 p-2 rounded" style={{ background: 'rgba(0,0,0,0.03)' }}>
                    <Link
                      className="side-nav-sublink"
                      to="/edit-profile"
                      onClick={toggleSidebar}
                    >
                      <FaEdit className="me-2" /> Edit Profile
                    </Link>

                    <button
                      className="side-nav-sublink text-danger"
                      onClick={handleDeleteAccount}
                    >
                      <FaTrash className="me-2" /> Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <nav className="p-3">
            {[
              { to: "/", icon: <FaHome />, label: "Home" },
              { to: "/my-bookings", icon: <FaCalendarAlt />, label: "My Bookings" },
              { to: "/services", icon: <FaPhoneAlt />, label: "Service Categories" },
              { to: "/about", icon: <FaInfo />, label: "About Us" },
              { to: "/help", icon: <BiSolidMessageRoundedDetail />, label: "Support Center" }
            ].map((item, idx) => (
              <Link
                key={idx}
                className="side-nav-link"
                to={item.to}
                onClick={toggleSidebar}
              >
                <span className="icon-box">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-top">
          <button
            className="logout-btn w-100"
            onClick={handleLogout}
          >
            <IoIosLogOut size={20} className="me-2" />
            Sign Out
          </button>
        </div>
      </div >

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 animate__animated animate__fadeIn"
          style={{ zIndex: 1999, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
          onClick={toggleSidebar}
        />
      )}

      {/* Header Specific CSS */}
      <style>
        {`
          .nav-btn-primary {
            background: var(--grad-primary);
            color: white;
            padding: 10px 24px;
            border-radius: var(--radius-full);
            font-weight: 700;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            transition: all 0.3s ease;
          }
          .nav-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
            filter: brightness(1.1);
          }
          
          .nav-btn-secondary {
            background: transparent;
            color: var(--text-main);
            padding: 10px 24px;
            border-radius: var(--radius-full);
            font-weight: 600;
            transition: all 0.3s ease;
            border: 1.5px solid var(--border);
          }
          .nav-btn-secondary:hover {
            background: var(--primary-light);
            border-color: var(--primary);
            color: var(--primary);
            transform: translateY(-2px);
          }

          .side-nav-link {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 16px;
            border-radius: var(--radius-lg);
            color: var(--text-main);
            font-weight: 600;
            transition: all 0.2s ease;
            margin-bottom: 4px;
            text-decoration: none !important;
          }
          .side-nav-link:hover {
            background: var(--primary-light);
            color: var(--primary);
            transform: translateX(6px);
          }
          .side-nav-link .icon-box {
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.04);
            border: 1px solid rgba(0,0,0,0.05);
            color: var(--primary);
            transition: all 0.3s ease;
            font-size: 16px;
          }
          .side-nav-link:hover .icon-box {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
          }

          .side-nav-action {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            background: var(--surface);
            border: 1px solid var(--border);
            font-weight: 700;
            color: var(--primary);
            transition: all 0.3s ease;
          }
          .side-nav-action:hover {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          }

          .side-nav-sublink {
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-align: left;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
          }
          .side-nav-sublink:hover {
            background: white;
            transform: translateX(4px);
          }

          .logout-btn {
            background: #fff1f2;
            color: var(--danger);
            padding: 14px;
            border-radius: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            border: 1px solid #fecaca;
          }
          .logout-btn:hover {
            background: var(--danger);
            color: white;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
          }

          .profile-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            opacity: 0;
            transition: 0.3s ease;
          }
          .profile-wrapper:hover .profile-overlay {
            opacity: 1;
          }

          .profile-trigger:hover {
            background: var(--primary);
            color: white !important;
          }
          .profile-trigger:hover span {
             color: white !important;
          }
        `}
      </style>
    </>
  );
}

export default Header;