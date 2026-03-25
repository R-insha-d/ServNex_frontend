import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";
import { IoCloseOutline } from "react-icons/io5";


const OTPVerification = () => {
    const [otp, setOtp] = useState(Array(4).fill(""));
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const otpRefs = useRef([]);

    const email = location.state?.email;
    const account_type = location.state?.account_type;

    if (!email) {
        navigate("/auth");
        return null;
    }

    const handleOtpChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        if (value && index < 3) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            await AxiosInstance.post("resend-otp/", { email });
            toast.success("New OTP sent successfully!");
            setOtp(Array(4).fill(""));
            otpRefs.current[0].focus();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 4) {
            toast.error("Please enter the complete 4-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await AxiosInstance.post("otp-verify/", {
                email: email,
                otp: enteredOtp,
            });

            if (res.data.access) {
                toast.success("Registration successful! ✅");
                navigate("/auth");
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Verification failed");
            // Clear OTP inputs and focus first field WITHOUT resending
            setOtp(Array(4).fill(""));
            otpRefs.current[0].focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="card shadow-lg border-0 rounded-4 p-4 text-center" style={{ width: "420px" }}>
            <div className="d-flex justify-content-end">
                <IoCloseOutline type="button" size={25} onClick={() => navigate("/auth")} />
            </div>
                <h4 className="fw-bold mb-3">Verify Your Email</h4>
                <p className="text-muted mb-4">We've sent a 4-digit code to <br /><strong>{email}</strong></p>

                <form onSubmit={handleSubmit}>
                    <div className="d-flex justify-content-center gap-3 mb-4">
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (otpRefs.current[i] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                className="form-control text-center fw-bold fs-4"
                                style={{ width: 55, height: 60, borderRadius: "10px", border: "2px solid #0f62c5" }}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn text-white w-100 py-3 rounded-pill fw-bold mb-3"
                        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify & Sign Up"}
                    </button>

                    {/* <button
                        type="button"
                        onClick={handleReset}
                        className="btn  w-100 py-2 rounded-pill fw-bold"
                        style={{ border: "2px solid #667eea", color: "#667eea" }}
                        disabled={loading}
                    >
                        Resend OTP
                    </button> */}
                </form>

                <p className="text-muted mt-4 mb-0">
                    Didn't receive the code?<span className="btn p-0" onClick={handleReset} style={{ fontSize: "12px", fontWeight: "bold", color: "#667eea" }}> Resend OTP</span>
                </p>
            </div>
        </div>
    );
};

export default OTPVerification;
