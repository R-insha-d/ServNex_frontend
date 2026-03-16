import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AxiosInstance from "./AxiosInstance";
import "bootstrap/dist/css/bootstrap.min.css";
import Typography from "@mui/material/Typography";
import { FaUser } from "react-icons/fa6";
import { FaEdit, FaTrash } from "react-icons/fa";

import { FaHome } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { FaInfo } from "react-icons/fa";
import { BiSolidMessageRoundedDetail } from "react-icons/bi";
import { IoIosLogOut } from "react-icons/io";

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
          alert("Account deleted successfully.");
          navigate("/", { replace: true });
          window.location.reload();
        })
        .catch((err) => {
          alert("Failed to delete account: " + JSON.stringify(err.response?.data));
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
      alert("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB.");
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
        alert("Profile picture updated!");
      })
      .catch((err) => {
        alert("Failed to update picture: " + JSON.stringify(err.response?.data));
      });
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg px-4"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          paddingTop: "14px",
          paddingBottom: "14px",
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
          <img
            src="/logo.jpeg"
            alt="ServNex Logo"
            style={{
              height: "40px",
              width: "40px",
              borderRadius: "10px",
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <span className="header-logo">
            ServNex
          </span>
        </Link>

        {/* TOGGLER BUTTON  */}
        <span
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: "none" }}
        >
          <span className="navbar-toggler-icon"></span>
        </span>

        {/* COLLAPSE WRAPPER */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="ms-auto mt-4 mt-md-3 mt-lg-0 d-flex align-items-center gap-3">
            {!isLoggedIn && (
              <>
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <Button
                    style={{
                      background:
                        "transparent",
                      color: "#23283c",
                      border: "1px solid rgba(102,126,234,0.4)",
                      padding: "8px 22px",
                      borderRadius: "30px",
                      textTransform: "none",
                      fontWeight: 500,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(102,126,234,0.08)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Login
                  </Button>
                </Link>

                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <Button
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      padding: "8px 22px",
                      borderRadius: "30px",
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "0 6px 18px rgba(102,126,234,0.35)",
                      border: "none",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(102,126,234,0.45)";
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 18px rgba(102,126,234,0.35)";
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {isLoggedIn && (
              <Button
                onClick={toggleSidebar}
                style={{
                  background: "white",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)";
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FaUser
                    size={18}
                    style={{ color: "#667eea" }}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      </nav >

      {/* Sidebar */}
      < div
        className="position-fixed top-0 end-0 vh-100 text-white d-flex flex-column justify-content-between"
        style={{
          width: "320px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1050,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
        }
        }
      >
        <div className="d-flex flex-column flex-grow-1">
          {accountType === "user" ? (
            <div className="p-4 border-bottom" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
              {/* Profile Section */}
              <div
                onClick={handleProfileClick}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  display: "inline-block",
                }}
                className="profile-wrapper d-flex align-items-center justify-content-center"
              >
                <div style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "84px",
                        height: "84px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <FaUser size={40} style={{ color: "rgba(255,255,255,0.8)" }} />
                  )}
                </div>

                {!profileImage && (
                  <div className="profile-overlay">
                    Add Image +
                  </div>
                )}
              </div>

              <div>
                <h5 className="mt-3 mb-3 text-center" style={{ fontWeight: "600", fontSize: "18px" }}>
                  {username}
                </h5>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />

                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn"
                    onClick={() => setManageOpen(!manageOpen)}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                      borderRadius: "12px",
                      padding: "10px 16px",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Manage Account
                  </button>

                  {manageOpen && (
                    <div className="d-flex flex-column gap-2 mt-2">
                      <Link
                        className="btn"
                        to="/edit-profile"
                        onClick={toggleSidebar}
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          color: "white",
                          borderRadius: "10px",
                          padding: "8px 14px",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        }}
                      >
                        <FaEdit className="me-2" />
                        Edit Profile
                      </Link>

                      <button
                        className="btn"
                        onClick={handleDeleteAccount}
                        style={{
                          background: "rgba(220,53,69,0.2)",
                          border: "1px solid rgba(220,53,69,0.4)",
                          color: "white",
                          borderRadius: "10px",
                          padding: "8px 14px",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(220,53,69,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(220,53,69,0.2)";
                        }}
                      >
                        <FaTrash className="me-2" />
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-bottom" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
              <h5 className="mb-0" style={{ fontWeight: "600", fontSize: "20px" }}>
                Menu
              </h5>
              <p style={{ fontSize: "14px", opacity: "0.8", marginTop: "5px" }}>
                Navigate Options
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="nav flex-column px-4 pb-4 gap-2">
            <Link
              className="nav-link d-flex align-items-center px-3 py-2 rounded-3 mt-3"
              to="/"
              onClick={toggleSidebar}
              style={{
                color: "rgba(255,255,255,0.9)",
                transition: "all 0.3s ease",
                border: "none",
                background: "transparent",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ marginRight: "12px" }}><FaHome size={20} /></span> Home
            </Link>
            <Link
              className="nav-link d-flex align-items-center px-3 py-2 rounded-3"
              to="/my-bookings"
              onClick={toggleSidebar}
              style={{
                color: "rgba(255,255,255,0.9)",
                transition: "all 0.3s ease",
                border: "none",
                background: "transparent",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ marginRight: "12px" }}><FaCalendarAlt size={20} /></span> My Bookings
            </Link>
            <Link
              className="nav-link d-flex align-items-center px-3 py-2 rounded-3"
              to="/services"
              onClick={toggleSidebar}
              style={{
                color: "rgba(255,255,255,0.9)",
                transition: "all 0.3s ease",
                border: "none",
                background: "transparent",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ marginRight: "12px" }}><FaPhoneAlt size={20} /></span> Services
            </Link>
            <Link
              className="nav-link d-flex align-items-center px-3 py-2 rounded-3"
              to="/about"
              onClick={toggleSidebar}
              style={{
                color: "rgba(255,255,255,0.9)",
                transition: "all 0.3s ease",
                border: "none",
                background: "transparent",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ marginRight: "12px" }}><FaInfo size={20} /> </span> About Us
            </Link>
            <Link
              className="nav-link d-flex align-items-center px-3 py-2 rounded-3"
              to="/help"
              onClick={toggleSidebar}
              style={{
                color: "rgba(255,255,255,0.9)",
                transition: "all 0.3s ease",
                border: "none",
                background: "transparent",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ marginRight: "12px" }}><BiSolidMessageRoundedDetail size={20} /></span> Help & Support
            </Link>
            <hr style={{ borderColor: "rgba(255,255,255,0.2)", margin: "15px 0" }} />
          </nav>
        </div>

        <div className="p-4">
          <Button
            className="w-100"
            onClick={handleLogout}
            style={{
              background: "rgba(220,53,69,0.2)",
              border: "1px solid rgba(220,53,69,0.4)",
              color: "white",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "12px",
              fontWeight: "600",
              transition: "all 0.3s ease",
              fontSize: "16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = " rgba(220,53,69,0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = " rgba(220,53,69,0.4)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={{ marginRight: "8px", color: "white", fontWeight: "700px" }}><IoIosLogOut size={20} color="white" />  Logout</span>
          </Button>
        </div>
      </div >

      {/* Overlay */}
      {
        sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={toggleSidebar}
          />
        )
      }

      {/* Hover CSS */}
      <style>
        {`
          .profile-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: rgba(0,0,0,0.7);
            backdropFilter: "blur(5px)";
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s ease;
            border: "3px solid rgba(255,255,255,0.3)";
          }

          .profile-wrapper:hover .profile-overlay {
            opacity: 1;
          }
        `}
      </style>
    </>
  );
}

export default Header;