// src/Credentials/Login.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import AxiosInstance from "../Component/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login({ onSuccess }) {
  const { handleSubmit, register } = useForm();
  const navigate = useNavigate();

  // If already logged in, redirect to landing page
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Form submit
  const submission = async (data) => {
    try {
      const response = await AxiosInstance.post("login/", {
        email: data.email,
        password: data.password,
      });

      // Save tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      // Save user info
      localStorage.setItem("role", response.data.user.role || "User");
      localStorage.setItem("username", response.data.user.first_name);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("phone", response.data.user.phone || "");
      if (response.data.user.profile_image) {
        localStorage.setItem("profile_image", response.data.user.profile_image);
      }

      // Determine account_type for Header/Sidebar visibility
      const role = response.data.user.role;
      const accountType = ["Hotel", "Restaurant", "Saloon"].includes(role) ? "business" : "user";
      localStorage.setItem("account_type", accountType);

      // Trigger callback (close modal)
      if (onSuccess) onSuccess();

      // Check role and redirect
      if (["Hotel"].includes(role)) {
        navigate("/admin-dashboard", { replace: true });
      }
      else if (["Restaurant", "Saloon"].includes(role)) {
        navigate("/restaurant-dashboard", { replace: true });
      }
      else {
        navigate("/", { replace: true });
      }

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="w-100 d-flex align-items-center justify-content-center" style={{ height: "90vh" }}>
      <div className="d-flex align-items-center justify-content-center">
        <div>
          <div className="row shadow-lg rounded-4 overflow-hidden">

            {/* LEFT SIDE */}
            <div
              className="col-12 col-md-6 text-white p-3 p-md-5 d-flex flex-column justify-content-center text-center text-md-start"
              style={{ background: "linear-gradient(135deg, #0077ff, #00b4ff)" }}
            >
              <h1 className="fw-bold">WELCOME</h1>
              <h5 className="fw-normal opacity-75 mt-2">
                Your Headline Name
              </h5>
              <p className="mt-3 opacity-75">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div
              className="col-12 col-md-6 bg-white p-3 p-md-5 d-flex flex-column justify-content-center"
            >
              <h2 className="mb-4 text-center text-md-start">Sign in</h2>

              <form onSubmit={handleSubmit(submission)}>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control rounded-3"
                    placeholder="Email"
                    {...register("email")}
                    required
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control rounded-3"
                    placeholder="Password"
                    {...register("password")}
                    required
                  />
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 small">
                  <div className="form-check mb-2 mb-sm-0">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label">
                      Remember me
                    </label>
                  </div>
                  <Link to={'/forgotpassword'} className="text-primary text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>

                <button className="btn btn-primary w-100 rounded-3 mb-3">
                  Sign in
                </button>
              </form>

              <p className="text-center small mb-0">
                Don’t have an account?{" "}
                <a href="/signup" className="text-primary fw-semibold text-decoration-none">
                  Sign Up
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
