import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import AxiosInstance from "../Component/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Auth.css";

const Auth = ({ onSuccess }) => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [activeTab, setActiveTab] = useState("user");

    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("access");
        const role = localStorage.getItem("role");
        if (token) {
            if (role === "Hotel") {
                navigate("/admin-dashboard", { replace: true });
            } else if (["Restaurant", "Saloon"].includes(role)) {
                navigate("/restaurant-dashboard", { replace: true });
            } else if (role === "Business") {
                navigate("/login-business", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        }
    }, [navigate]);

    // LOGIN FORM
    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: errorsLogin },
    } = useForm({ mode: "onChange" });

    const onLoginSubmit = async (data) => {
        try {
            const response = await AxiosInstance.post("login/", {
                email: data.email,
                password: data.password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("role", response.data.user.role || "User");
            localStorage.setItem("username", response.data.user.first_name);
            localStorage.setItem("email", response.data.user.email);
            localStorage.setItem("phone", response.data.user.phone || "");

            if (response.data.user.profile_image) {
                localStorage.setItem("profile_image", response.data.user.profile_image);
            }

            const role = response.data.user.role;
            const accountType = ["Hotel", "Restaurant", "Saloon"].includes(role)
                ? "business"
                : "user";
            localStorage.setItem("account_type", accountType);

            if (onSuccess) onSuccess();

            if (role === "Hotel") {
                navigate("/admin-dashboard", { replace: true });
            } else if (["Restaurant", "Saloon"].includes(role)) {
                navigate("/restaurant-dashboard", { replace: true });
            } else if (role === "Business") {
                navigate("/login-business", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            toast.error("Invalid email or password");
        }
    };

    // SIGNUP FORM
    const {
        register: registerSignUp,
        handleSubmit: handleSubmitSignUp,
        formState: { errors: errorsSignUp },
    } = useForm({ mode: "onChange" });

    const onSignUpSubmit = (data) => {
        AxiosInstance.post("register/", {
            first_name: data.first_name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            account_type: activeTab,
        })
            .then((res) => {
                if (res.data.access) {
                    localStorage.setItem("access", res.data.access);
                    localStorage.setItem("refresh", res.data.refresh);
                    localStorage.setItem("account_type", activeTab);
                    localStorage.setItem("username", data.first_name);
                    localStorage.setItem("email", data.email);
                    localStorage.setItem("phone", data.phone);
                }

                if (activeTab === "business") {
                    navigate("/login-business");
                } else {
                    navigate("/");
                }
            })
            .catch((err) => {
                toast.error(JSON.stringify(err.response?.data));
            });
    };

    return (
        <div className="auth-wrapper">
            <div
                className={`auth-container-main ${isRightPanelActive ? "right-panel-active" : ""
                    }`}
            >
                {/* SIGN UP CONTAINER */}
                <div
                    className={`form-containers sign-up-containers ${isRightPanelActive ? "active" : ""
                        }`}
                >
                    <form onSubmit={handleSubmitSignUp(onSignUpSubmit)}>
                        <h1>Create Account</h1>

                        {/* Account Type Toggle */}
                        <div className="account-type-toggle">
                            <div className={`toggle-slider ${activeTab === "business" ? "business" : "user"}`}></div>
                            <button
                                type="button"
                                className={`toggle-btn ${activeTab === "user" ? "active" : ""}`}
                                onClick={() => setActiveTab("user")}
                            >
                                User
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${activeTab === "business" ? "active" : ""}`}
                                onClick={() => setActiveTab("business")}
                            >
                                Business
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder={
                                activeTab === "user"
                                    ? "Enter full name"
                                    : "Business name"
                            }
                            {...registerSignUp("first_name", {
                                required: "Full name is required",
                            })}
                        />
                        {errorsSignUp.first_name && (
                            <div className="error">{errorsSignUp.first_name.message}</div>
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            {...registerSignUp("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter valid email",
                                },
                            })}
                        />
                        {errorsSignUp.email && (
                            <div className="error">{errorsSignUp.email.message}</div>
                        )}

                        {/* SIGNUP PASSWORD WITH EYE ICON */}
                        <div style={{ position: "relative", width: "100%" }}>
                            <input
                                type={showSignupPassword ? "text" : "password"}
                                placeholder="Password"
                                {...registerSignUp("password", {
                                    required: "Password is required",
                                    pattern: {
                                        value:
                                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                                        message:
                                            "Min 8 chars, Uppercase, lowercase, number & special char",
                                    },
                                })}
                                style={{ width: "100%" }}
                            />

                            <span
                                onClick={() =>
                                    setShowSignupPassword(!showSignupPassword)
                                }
                                style={{
                                    position: "absolute",
                                    right: "15px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#667eea",
                                    userSelect: "none",
                                }}
                            >
                                {showSignupPassword ? "🙈" : "👁"}
                            </span>
                        </div>

                        {errorsSignUp.password && (
                            <div className="error">{errorsSignUp.password.message}</div>
                        )}

                        <input
                            type="text"
                            placeholder="Phone"
                            maxLength="10"
                            {...registerSignUp("phone", {
                                required: "Phone is required",
                            })}
                        />
                        {errorsSignUp.phone && (
                            <div className="error">{errorsSignUp.phone.message}</div>
                        )}

                        <button type="submit" style={{ borderRadius: "20px", border: "2px solid #667eea", marginTop: "30px" }}>
                            Sign Up
                        </button>
                    </form>
                </div>

                {/* SIGN IN CONTAINER */}
                <div
                    className={`form-containers sign-in-containers ${!isRightPanelActive ? "active" : ""
                        }`}
                >
                    <form onSubmit={handleSubmitLogin(onLoginSubmit)}>
                        <h1>Sign in</h1>
                        <span>or use your account</span>

                        <input
                            type="email"
                            placeholder="Email"
                            {...registerLogin("email", {
                                required: "Email is required",
                            })}
                        />
                        {errorsLogin.email && (
                            <div className="error">{errorsLogin.email.message}</div>
                        )}

                        <div style={{ position: "relative", width: "100%" }}>
                            <input
                                type={showLoginPassword ? "text" : "password"}
                                placeholder="Password"
                                {...registerLogin("password", {
                                    required: "Password is required",
                                })}
                                style={{ width: "100%" }}
                            />

                            <span
                                onClick={() =>
                                    setShowLoginPassword(!showLoginPassword)
                                }
                                style={{
                                    position: "absolute",
                                    right: "15px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    color: "#667eea",
                                }}
                            >
                                {showLoginPassword ? "🙈" : "👁"}
                            </span>
                        </div>

                        {errorsLogin.password && (
                            <div className="error">{errorsLogin.password.message}</div>
                        )}

                        <Link style={{ fontSize: "12px" }} to="/forgotpassword">Forgot your password?</Link>
                        <button style={{ borderRadius: "20px", border: "2px solid #667eea", marginTop: "30px" }} type="submit">Sign In</button>
                    </form>
                </div>

                {/* Overlay section unchanged */}
                <div className="overlay-containers">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>
                                To keep connected with us please login with your personal info
                            </p>
                            <button
                                className="ghost"
                                onClick={() => setIsRightPanelActive(false)}
                            >
                                Sign In
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>
                                Enter your personal details and start your journey with us
                            </p>
                            <button
                                className="ghost"
                                onClick={() => setIsRightPanelActive(true)}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;