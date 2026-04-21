import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Camera, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import AxiosInstance from "./AxiosInstance";
import { toast } from "react-toastify";
import Header from "./Header";
import Footer from "./Footer";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    const name = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");
    const image = localStorage.getItem("profile_image");

    if (name) setValue("first_name", name);
    if (email) setValue("email", email);
    if (phone) setValue("phone", phone);
    if (image) {
      const imageUrl =
        image.startsWith("http") || image.startsWith("data:")
          ? image
          : (AxiosInstance.defaults.baseURL || "http://127.0.0.1:8000") + image;
      setProfileImage(imageUrl);
    }
  }, [setValue]);

  const onSubmit = (data) => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    if (imageFile) {
      formData.append("profile_image", imageFile);
    }

    AxiosInstance.patch("update-profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        const { first_name, email, phone, profile_image } = res.data.user;
        localStorage.setItem("username", first_name);
        localStorage.setItem("email", email);
        localStorage.setItem("phone", phone);
        if (profile_image) localStorage.setItem("profile_image", profile_image);

        window.dispatchEvent(new Event("storage"));
        toast.success("Identity updated successfully");
        navigate("/");
      })
      .catch((err) => {
        toast.error("Failed to update profile");
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  return (
    <div className="edit-profile-page">
      <Header />

      {/* ── Hero ── */}
      <div className="profile-hero">
        <div className="container">
          <h1 className="animate__animated animate__fadeInDown">Account Settings</h1>
          <p className="animate__animated animate__fadeInUp">
            Refine your prestige identity and preferences
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container py-5">

        {/* Back navigation */}
        <span className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
          Back
        </span>

        <div className="profile-grid">

          {/* ── Sidebar: Avatar ── */}
          <div className="profile-card-prestige glass-card animate__animated animate__fadeInLeft">
            <div className="avatar-section">
              <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                <img src={profileImage || "/default-avatar.png"} alt="User" />
                <div className="camera-overlay">
                  <Camera size={22} />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                hidden
                onChange={handleImageUpload}
              />
              <h3>{localStorage.getItem("username") || "Prestige Guest"}</h3>
              {/* <p>Member since 2024</p> */}
              <div className="rule" />
            </div>
          </div>

          {/* ── Main: Form ── */}
          <div className="edit-form-card glass-card animate__animated animate__fadeInRight">
            <p className="form-section-label">Personal Information</p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row-prestige">
                <div className="form-group-prestige full-width">
                  <label>
                    <User size={14} />
                    Legal Name
                  </label>
                  <input
                    {...register("first_name", { required: true })}
                    className={errors.first_name ? "error" : ""}
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group-prestige">
                  <label>
                    <Mail size={14} />
                    Email Address
                  </label>
                  <input
                    {...register("email", { required: true })}
                    className={errors.email ? "error" : ""}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-group-prestige">
                  <label>
                    <Phone size={14} />
                    Contact Number
                  </label>
                  <input
                    {...register("phone", { required: true })}
                    className={errors.phone ? "error" : ""}
                    placeholder="+1 (000) 000-0000"
                  />
                </div>
              </div>

              <div className="security-notice mb-4">
                <ShieldCheck size={18} />
                <p>
                  Your personal data is encrypted and managed according to ServNex privacy
                  standards.
                </p>
              </div>

              <button type="submit" className="btn-save-profile">
                Commit Changes
                <Sparkles size={16} />
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditProfile;