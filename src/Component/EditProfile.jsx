import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaPlus } from "react-icons/fa";
import AxiosInstance from "./AxiosInstance";
import { toast } from "react-toastify";

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(null);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  // Load existing data from localStorage
  useEffect(() => {
    const name = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    const phone = localStorage.getItem("phone");
    const image = localStorage.getItem("profile_image");

    if (name) setValue("first_name", name);
    if (email) setValue("email", email);
    if (phone) setValue("phone", phone);
    if (image) {
      const imageUrl = image.startsWith('http') || image.startsWith('data:') ? image : `http://127.0.0.1:8000${image}`;
      setProfileImage(imageUrl);
    }
  }, [setValue]);

  const [imageFile, setImageFile] = useState(null);

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
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        const { first_name, email, phone, profile_image } = res.data.user;
        localStorage.setItem("username", first_name);
        localStorage.setItem("email", email);
        localStorage.setItem("phone", phone);
        if (profile_image) {
          localStorage.setItem("profile_image", profile_image);
        }

        // Manually trigger storage event so Header component updates immediately
        window.dispatchEvent(new Event("storage"));

        toast.success("Profile updated successfully!");
        navigate("/");
      })
      .catch((err) => {
        toast.error("Failed to update profile: " + JSON.stringify(err.response?.data));
      });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warn("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.warn("Image must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
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
        <h4 className="text-center fw-bold mb-4">Edit Profile</h4>

        {/* Profile Image Section */}
        <div className="text-center mb-4">
          <div
            style={{
              position: "relative",
              display: "inline-block",
              cursor: "pointer",
            }}
            onClick={() => fileInputRef.current.click()}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "#ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaUser size={40} />
              </div>
            )}

            {/* + Icon */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                background: "#0f62c5",
                borderRadius: "50%",
                padding: "6px",
                color: "#fff",
              }}
            >
              <FaPlus size={12} />
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Enter full name"
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
          <div className="mb-3">
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
                    message: "Enter valid email",
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

          {/* Phone */}
          <div className="mb-4">
            <div className="input-group">
              <span className="input-group-text">
                <FaPhone />
              </span>

              <input
                type="text"
                maxLength="10"
                inputMode="numeric"
                className="form-control"
                placeholder="Enter phone number"
                {...register("phone", {
                  required: "Phone number is required",
                  validate: (value) => {
                    if (!/^[0-9]*$/.test(value))
                      return "Only numbers allowed";
                    if (value.length !== 10)
                      return "Must be exactly 10 digits";
                    if (!/^[6-9]/.test(value))
                      return "Must start with 6,7,8,9";
                    return true;
                  },
                })}
                onInput={(e) =>
                  (e.target.value = e.target.value.replace(/\D/g, ""))
                }
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
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;