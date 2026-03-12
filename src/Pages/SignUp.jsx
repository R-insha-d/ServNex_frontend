import React, { useState } from "react";
import {
  FaUser,
  FaStore,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import AxiosInstance from "../Component/AxiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignUp = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const submission = (data) => {
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

          //  Important for Edit Profile prefill
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
        toast.error(JSON.stringify(err.response?.data) || "Registration failed");
      });
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background:
          "linear-gradient(135deg, #3f71bc35, hsla(213, 86%, 42%, 0.54))",
      }}
    >
      <div
        className="card shadow-lg border-0 rounded-4 p-4"
        style={{ width: "420px" }}
      >
        <h4 className="text-center fw-bold mb-4">
          Sign Up for{" "}
          <span style={{ color: "#0f62c5" }}>
            <strong>ServNex</strong>
          </span>
        </h4>

        {/* Account Type Tabs */}
        <div className="btn-group w-100 mb-4">
          <button
            type="button"
            className={`btn ${activeTab === "user" ? "text-white" : "btn-outline-dark"
              }`}
            style={
              activeTab === "user"
                ? {
                  background:
                    "linear-gradient(135deg, #0a3a82, #0f62c5)",
                }
                : {}
            }
            onClick={() => setActiveTab("user")}
          >
            <FaUser className="me-2" />
            User Account
          </button>

          <button
            type="button"
            className={`btn ${activeTab === "business"
                ? "text-white"
                : "btn-outline-dark"
              }`}
            style={
              activeTab === "business"
                ? {
                  background:
                    "linear-gradient(135deg, #0a3a82, #0f62c5)",
                }
                : {}
            }
            onClick={() => setActiveTab("business")}
          >
            <FaStore className="me-2" />
            Business Account
          </button>
        </div>

        <form onSubmit={handleSubmit(submission)}>
          {/* Full Name */}
          <div className="mb-2">
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder={
                  activeTab === "user"
                    ? "Enter full name"
                    : "Business name"
                }
                {...register("first_name", {
                  required: "Full name is required",
                  pattern: {
                    value: /^[A-Za-z]{4,}\s+[A-Za-z]{1,}$/,
                    message:
                      "Enter at least 4 letters + space + last name",
                  },
                })}
              />
            </div>
            {errors.first_name && (
              <small className="text-danger">
                {errors.first_name.message}
              </small>
            )}
          </div>

          {/* Email */}
          <div className="mb-2">
            <div className="input-group">
              <span className="input-group-text">
                <FaEnvelope />
              </span>
              <input
                type="text"
                inputMode="email"
                className="form-control"
                placeholder="Enter email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message:
                      "Enter valid email (example: name@gmail.com)",
                  },
                })}
              />
            </div>
            {errors.email && (
              <small className="text-danger">
                {errors.email.message}
              </small>
            )}
          </div>

          {/* Password */}
          <div className="mb-2">
            <div className="input-group">
              <span className="input-group-text">
                <FaLock />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Create password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                    message:
                      "Min 8 chars, include Uppercase, lowercase, number & special character",
                  },
                })}
              />

              <span
                className="input-group-text"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {errors.password && (
              <small className="text-danger">
                {errors.password.message}
              </small>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text">
                <FaPhone />
              </span>

              <input
                type="text"
                inputMode="numeric"
                maxLength="10"
                className="form-control"
                placeholder="Enter phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  validate: (value) => {
                    if (!/^[0-9]*$/.test(value)) {
                      return "Only numbers are allowed";
                    }
                    if (value.length !== 10) {
                      return "Phone number must be exactly 10 digits";
                    }
                    if (!/^[6-9]/.test(value)) {
                      return "Phone number must start with 6, 7, 8 or 9";
                    }
                    return true;
                  },
                })}
                onInput={(e) => {
                  e.target.value =
                    e.target.value.replace(/\D/g, "");
                }}
              />
            </div>

            {errors.phone && (
              <small className="text-danger">
                {errors.phone.message}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn text-white w-100 py-2 rounded-pill fw-bold"
            style={{
              background:
                "linear-gradient(135deg, #0a3a82, #0f62c5)",
            }}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary fw-semibold"
            style={{ textDecoration: "none" }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;