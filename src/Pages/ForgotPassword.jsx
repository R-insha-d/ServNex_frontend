import React, { useState, useRef } from "react";
import AxiosInstance from "../Component/AxiosInstance.jsx";
import { toast } from "react-toastify";
function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef([]);

  /* ---------- SEND OTP ---------- */
  const handleSendOtp = async () => {
    if (!email) return setError("Email is required");
    setError("");
    setLoading(true);

    try {
      await AxiosInstance.post("/forgot-password/send-otp/", { email }); // Changed from axios to AxiosInstance
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };
  

  /* ---------- VERIFY OTP ---------- */
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) return setError("Enter complete OTP");

    setError("");
    setLoading(true);

    try {
      await AxiosInstance.post("/forgot-password/verify-otp/", { // Changed from axios to AxiosInstance
        email,
        otp: enteredOtp,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.non_field_errors || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- RESET PASSWORD ---------- */
  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword)
      return setError("All fields are required");

    if (newPassword !== confirmPassword)
      return setError("Passwords do not match");

    setError("");
    setLoading(true);

    try {
      await AxiosInstance.post("/forgot-password/reset-password/", { // Changed from axios to AxiosInstance
        email,
        password: newPassword,
        confirm_password: confirmPassword,
      });

      toast.success("Password updated successfully ✅");
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#eef2f5" }}>
      <div className="card shadow-lg border-0 rounded-4 p-4 text-center" style={{ width: "420px" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h4 className="fw-bold">Forgot Password</h4>

            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <small className="text-danger">{error}</small>}

            <button
              className="btn text-white w-100 mt-3"
              onClick={handleSendOtp}
              style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h4 className="fw-bold">Enter OTP</h4>

            <div className="d-flex justify-content-center gap-2 mb-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  className="form-control text-center"
                  style={{ width: 42, height: 42 }}
                />
              ))}
            </div>

            {error && <small className="text-danger">{error}</small>}

            <button
              className="btn text-white w-100 mt-3"
              style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h4 className="fw-bold">Set New Password</h4>

            <input
              type="password"
              className="form-control mb-3"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <input
              type="password"
              className="form-control mb-3"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <small className="text-danger">{error}</small>}

            <button
              className="btn btn-primary w-100"
              onClick={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;