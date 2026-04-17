import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import AxiosInstance from "../Component/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Auth.css";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";

const Auth = ({ onSuccess }) => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [activeTab, setActiveTab] = useState("user");

    // Password visibility states
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("access");
        const role = localStorage.getItem("role");
        const userStr = localStorage.getItem("user");
        let isStaff = false;

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                isStaff = user.is_staff || user.is_superuser;
            } catch (e) {
                console.error("Error parsing user in Auth useEffect", e);
            }
        }

        if (token) {
            if (isStaff) {
                navigate("/custom-admin", { replace: true });
            } else {
                const isBusiness = ["Hotel", "Restaurant", "Saloon", "Business"].includes(role);

                if (isBusiness) {
                    if (role === "Hotel") {
                        navigate("/admin-dashboard", { replace: true });
                    } else if (["Restaurant", "Saloon"].includes(role)) {
                        navigate("/restaurant-dashboard", { replace: true });
                    } else {
                        navigate("/login-business", { replace: true });
                    }
                } else {
                    navigate("/", { replace: true });
                }
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
        setLoading(true);
        try {
            const response = await AxiosInstance.post("login/", {
                email: data.email,
                password: data.password,
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("user", JSON.stringify(response.data.user)); // Store full object
            localStorage.setItem("role", response.data.user.role || "User");
            localStorage.setItem("username", response.data.user.first_name);
            localStorage.setItem("email", response.data.user.email);
            localStorage.setItem("phone", response.data.user.phone || "");

            if (response.data.user.profile_image) {
                localStorage.setItem("profile_image", response.data.user.profile_image);
            }

            const role = response.data.user.role;
            const isStaff = response.data.user.is_staff || response.data.user.is_superuser;
            const accountType = ["Hotel", "Restaurant", "Saloon", "Business"].includes(role)
                ? "business"
                : "user";
            localStorage.setItem("account_type", accountType);
            toast.success("Login Successful");

            if (onSuccess) onSuccess();

            if (isStaff) {
                navigate("/custom-admin", { replace: true });
            }
            else if (accountType === "business") {
                if (role === "Hotel") {
                    navigate("/admin-dashboard", { replace: true });
                } else if (["Restaurant", "Saloon"].includes(role)) {
                    navigate("/restaurant-dashboard", { replace: true });
                } else {
                    navigate("/login-business", { replace: true });
                }
            } 
            else {
                navigate("/", { replace: true });
            }
        } catch (error) {
            toast.error("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    // SIGNUP FORM
    const {
        register: registerSignUp,
        handleSubmit: handleSubmitSignUp,
        formState: { errors: errorsSignUp },
    } = useForm({ mode: "onChange" });

    const onSignUpSubmit = (data) => {
        setLoading(true);
        AxiosInstance.post("register/", {
            first_name: data.first_name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            account_type: activeTab,
        })
            .then((res) => {
                toast.info(res.data.message || "OTP sent to your email!");
                navigate("/otp-verify", {
                    state: {
                        email: data.email,
                        account_type: activeTab
                    }
                });
            })
            .catch((err) => {
                toast.error(JSON.stringify(err.response?.data));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // GOOGLE LOGIN HANDLER
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // We receive an access_token here. We'll send it to our backend to verify and get/create user.
                const response = await AxiosInstance.post("google-login/", {
                    access_token: tokenResponse.access_token,
                });

                localStorage.setItem("access", response.data.access);
                localStorage.setItem("refresh", response.data.refresh);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                localStorage.setItem("role", response.data.user.role || "User");
                localStorage.setItem("username", response.data.user.first_name);
                localStorage.setItem("email", response.data.user.email);
                localStorage.setItem("phone", response.data.user.phone || "");

                if (response.data.user.profile_image) {
                    localStorage.setItem("profile_image", response.data.user.profile_image);
                }

                const role = response.data.user.role;
                const isStaff = response.data.user.is_staff || response.data.user.is_superuser;
                const accountType = ["Hotel", "Restaurant", "Saloon", "Business"].includes(role)
                    ? "business"
                    : "user";
                localStorage.setItem("account_type", accountType);
                toast.success("Login Successful with Google");

                if (onSuccess) onSuccess();

                if (isStaff) {
                    navigate("/custom-admin", { replace: true });
                } else if (accountType === "business") {
                    if (role === "Hotel") {
                        navigate("/admin-dashboard", { replace: true });
                    } else if (["Restaurant", "Saloon"].includes(role)) {
                        navigate("/restaurant-dashboard", { replace: true });
                    } else {
                        navigate("/login-business", { replace: true });
                    }
                } else {
                    navigate("/", { replace: true });
                }
            } catch (error) {
                console.error("Google authentication failed:", error);
                toast.error(error.response?.data?.error || "Google Authentication Failed");
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Login Initialization Failed");
        }
    });

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
                                {showSignupPassword ? <GoEyeClosed/> : <GoEye /> }
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

                        <button type="submit" disabled={loading} style={{ borderRadius: "20px", border: "2px solid #667eea", marginTop: "30px" }}>
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>

                        <button type="button" className="google-btn" style={{ marginTop: "15px" }} onClick={() => handleGoogleLogin()}>
                             <FcGoogle size={24} />
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
                                {showLoginPassword ? <GoEyeClosed />: <GoEye /> }
                            </span>
                        </div>

                        {errorsLogin.password && (
                            <div className="error">{errorsLogin.password.message}</div>
                        )}

                        <Link style={{ fontSize: "12px" }} to="/forgotpassword">Forgot your password?</Link>
                        <button disabled={loading} style={{ borderRadius: "20px", border: "2px solid #667eea", marginTop: "30px" }} type="submit">
                            {loading ? "Signing In..." : "Sign In"}
                        </button>

                        <button type="button" className="google-btn" style={{ marginTop: "15px" }} onClick={() => handleGoogleLogin()}>
                             <FcGoogle size={24} />
                        </button>
                    </form>
                </div>

                {/* Overlay section */}
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