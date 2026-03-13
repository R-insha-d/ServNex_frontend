import React, { useState, useEffect } from "react";
import AxiosInstance from "../../Component/AxiosInstance";
import { toast } from "react-toastify";
import WifiIcon from "@mui/icons-material/Wifi";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PoolIcon from "@mui/icons-material/Pool";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import SpaIcon from "@mui/icons-material/Spa";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import TvIcon from "@mui/icons-material/Tv";
import KitchenIcon from "@mui/icons-material/Kitchen";

const availableAmenities = [
  { name: "Free Wifi", icon: <WifiIcon fontSize="small" />, value: "Wifi" },
  { name: "Parking", icon: <LocalParkingIcon fontSize="small" />, value: "Parking" },
  { name: "Restaurant", icon: <RestaurantIcon fontSize="small" />, value: "Restaurant" },
  { name: "Pool", icon: <PoolIcon fontSize="small" />, value: "Pool" },
  { name: "Fitness Center", icon: <FitnessCenterIcon fontSize="small" />, value: "Gym" },
  { name: "Air Conditioning", icon: <AcUnitIcon fontSize="small" />, value: "AC" },
  { name: "Bar / Lounge", icon: <LocalBarIcon fontSize="small" />, value: "Bar" },
  { name: "Spa", icon: <SpaIcon fontSize="small" />, value: "Spa" },
  { name: "Room Service", icon: <RoomServiceIcon fontSize="small" />, value: "Room Service" },
  { name: "Laundry", icon: <LocalLaundryServiceIcon fontSize="small" />, value: "Laundry" },
  { name: "TV", icon: <TvIcon fontSize="small" />, value: "TV" },
  { name: "Kitchen", icon: <KitchenIcon fontSize="small" />, value: "Kitchen" },
];

export default function HotelProfileStepper({ hotel, fetchMyHotel, theme }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "",
    area: "",
    badge: "",
    price: "",
    old_price: "",
    description: "",
    amenities: "",
    image: null,
    room_image1: null,
    room_image2: null,
    environment_image: null,
  });

  const [previews, setPreviews] = useState({
    image: "",
    room_image1: "",
    room_image2: "",
    environment_image: "",
  });

  useEffect(() => {
    if (hotel) {
      setForm({
        name: hotel.name || "",
        city: hotel.city || "",
        area: hotel.area || "",
        badge: hotel.badge || "",
        price: hotel.price || "",
        old_price: hotel.old_price || "",
        description: hotel.description || "",
        amenities: hotel.amenities || "",
        image: null,
        room_image1: null,
        room_image2: null,
        environment_image: null,
      });
      setPreviews({
        image: hotel.image || "",
        room_image1: hotel.room_image1 || "",
        room_image2: hotel.room_image2 || "",
        environment_image: hotel.environment_image || "",
      });
    }
  }, [hotel]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenityValue) => {
    let currentAmenities = [];
    if (form.amenities) {
      if (Array.isArray(form.amenities)) {
        currentAmenities = [...form.amenities];
      } else if (typeof form.amenities === "string") {
        currentAmenities = form.amenities.split(",").map(a => a.trim()).filter(Boolean);
      }
    }
    
    if (currentAmenities.includes(amenityValue)) {
      currentAmenities = currentAmenities.filter(a => a !== amenityValue);
    } else {
      currentAmenities.push(amenityValue);
    }
    setForm({ ...form, amenities: currentAmenities.join(", ") });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    if (file && file.type.startsWith("image")) {
      setForm({ ...form, [name]: file });
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.city) {
      toast.error("Name and City are required!");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("city", form.city);
    formData.append("area", form.area);
    formData.append("badge", form.badge);
    if(form.price) formData.append("price", form.price);
    if(form.old_price) formData.append("old_price", form.old_price);
    formData.append("description", form.description);
    formData.append("amenities", form.amenities);

    if (form.image instanceof File) formData.append("image", form.image);
    if (form.room_image1 instanceof File) formData.append("room_image1", form.room_image1);
    if (form.room_image2 instanceof File) formData.append("room_image2", form.room_image2);
    if (form.environment_image instanceof File) formData.append("environment_image", form.environment_image);

    try {
      await AxiosInstance.patch(`api/hotels/${hotel.id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile updated successfully!");
      if (fetchMyHotel) fetchMyHotel();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow border-0 p-4 rounded-4">
      <h5 className="mb-4 d-flex justify-content-between align-items-center" style={{ color: theme.primary }}>
        Edit Personal Details
        <span className="badge" style={{ background: theme.secondary }}>Step {step} of 3</span>
      </h5>

      {/* Stepper Progress */}
      <div className="position-relative mb-5 mx-3 pt-2">
        <div className="progress" style={{ height: "4px", backgroundColor: "#e2e8f0" }}>
          <div
            className="progress-bar transition-all"
            role="progressbar"
            style={{ width: `${(step - 1) * 50}%`, backgroundColor: theme.primary }}
          ></div>
        </div>
        <div className="d-flex justify-content-between position-absolute w-100 top-0 translate-middle-y">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold transition-all shadow-sm`}
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: step >= num ? theme.primary : "#cbd5e1",
                cursor: step > num ? "pointer" : "default",
                border: "4px solid white"
              }}
              onClick={() => {
                if(num < step) setStep(num);
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3">
        {step === 1 && (
          <div className="row g-3">
            <h6 className="fw-semibold text-muted">Basic Information</h6>
            <div className="col-md-6">
              <label className="form-label small">Hotel Name</label>
              <input type="text" className="form-control" name="name" value={form.name} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">City</label>
              <input type="text" className="form-control" name="city" value={form.city} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Area</label>
              <input type="text" className="form-control" name="area" value={form.area} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Badge</label>
              <select className="form-select" name="badge" value={form.badge} onChange={handleInputChange}>
                <option value="">Select Badge</option>
                <option value="Luxury Stays">Luxury Stays</option>
                <option value="Cheap & Best">Cheap & Best</option>
                <option value="Dormitory">Dormitory</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="row g-3">
            <h6 className="fw-semibold text-muted">Details & Amenities</h6>
            <div className="col-md-6">
              <label className="form-label small">Price</label>
              <input type="number" className="form-control" name="price" value={form.price} onChange={handleInputChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label small">Old Price</label>
              <input type="number" className="form-control" name="old_price" value={form.old_price} onChange={handleInputChange} />
            </div>
            <div className="col-12 mt-3">
              <label className="form-label small fw-semibold text-muted mb-3">Amenities / Facilities</label>
              <div className="d-flex flex-wrap gap-2">
                {availableAmenities.map((amenity) => {
                  let isSelected = false;
                  if (form.amenities) {
                    if (Array.isArray(form.amenities)) {
                       isSelected = form.amenities.includes(amenity.value);
                    } else if (typeof form.amenities === "string") {
                       isSelected = form.amenities.split(",").map(a => a.trim()).includes(amenity.value);
                    }
                  }
                  return (
                    <div
                      key={amenity.value}
                      onClick={() => toggleAmenity(amenity.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "20px",
                        border: `1px solid ${isSelected ? theme.primary : "#e2e8f0"}`,
                        backgroundColor: isSelected ? theme.primary : "#fff",
                        color: isSelected ? "#fff" : "#475569",
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        boxShadow: isSelected ? "0 4px 10px rgba(0,0,0,0.1)" : "none"
                      }}
                    >
                      {amenity.icon}
                      {amenity.name}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-12">
              <label className="form-label small">Description</label>
              <textarea className="form-control" rows="3" name="description" value={form.description} onChange={handleInputChange}></textarea>
            </div>
            <div className="col-12 mt-2">
              <button 
                className="btn btn-sm text-white" 
                style={{ backgroundColor: "#10b981", fontSize: "0.80rem", padding: "8px 16px", borderRadius: "8px" }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Saving Amenities..." : "Save Amenities Progress"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="row g-3">
            <h6 className="fw-semibold text-muted">Images</h6>
            <div className="col-md-6">
              <label className="form-label small">Main Image</label>
              <input type="file" className="form-control mb-2" name="image" accept="image/*" onChange={handleFileChange} />
              {previews.image && <img src={previews.image} alt="Main" className="img-thumbnail" style={{ height: 80, objectFit: "cover" }} />}
            </div>
            <div className="col-md-6">
              <label className="form-label small">Environment Image</label>
              <input type="file" className="form-control mb-2" name="environment_image" accept="image/*" onChange={handleFileChange} />
              {previews.environment_image && <img src={previews.environment_image} alt="Env" className="img-thumbnail" style={{ height: 80, objectFit: "cover" }} />}
            </div>
            <div className="col-md-6">
              <label className="form-label small">Room Image 1</label>
              <input type="file" className="form-control mb-2" name="room_image1" accept="image/*" onChange={handleFileChange} />
              {previews.room_image1 && <img src={previews.room_image1} alt="Room 1" className="img-thumbnail" style={{ height: 80, objectFit: "cover" }} />}
            </div>
            <div className="col-md-6">
              <label className="form-label small">Room Image 2</label>
              <input type="file" className="form-control mb-2" name="room_image2" accept="image/*" onChange={handleFileChange} />
              {previews.room_image2 && <img src={previews.room_image2} alt="Room 2" className="img-thumbnail" style={{ height: 80, objectFit: "cover" }} />}
            </div>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-outline-secondary" 
          disabled={step === 1 || loading} 
          onClick={() => setStep(step - 1)}
        >
          Previous
        </button>
        {step < 3 ? (
          <button 
            className="btn text-white px-4" 
            style={{ backgroundColor: theme.primary }} 
            onClick={() => setStep(step + 1)}
          >
            Next
          </button>
        ) : (
          <button 
            className="btn text-white px-4" 
            style={{ backgroundColor: "#10b981" }} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        )}
      </div>
    </div>
  );
}
