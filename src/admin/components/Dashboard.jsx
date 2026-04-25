import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AxiosInstance from "../../Component/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HotelProfileStepper from "./HotelProfileStepper";
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [myHotel, setMyHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [galleryImages, setGalleryImages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // ── Bookings state ──────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState("all");
  const [loadingBookings, setLoadingBookings] = useState(false);
  // ────────────────────────────────────────────────────────────────

  const theme = {
    primary: "#1e3a8a",
    secondary: "#3b82f6",
    light: "#f8fbff",
  };

  const [form, setForm] = useState({
    room_type: "",
    price: "",
    adults: "",
    children: "",
    total_rooms: "",
    bed_type: "",
    amenities: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  const [nearbyForm, setNearbyForm] = useState({
    name: "",
    distance_km: "",
  });
  const [editingNearbyId, setEditingNearbyId] = useState(null);

  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_percent: 10,
    valid_from: "",
    valid_to: "",
    is_active: true
  });
  const [editingCouponId, setEditingCouponId] = useState(null);

  const roomTypes = ["Deluxe", "Suite", "Executive", "Standard"];
  const bedTypes = ["Single", "Double", "Queen", "King"];

  /* ---------- FETCH ON MOUNT ---------- */
  useEffect(() => {
    fetchMyHotel();
  }, []);

  const fetchMyHotel = async () => {
    try {
      setLoading(true);
      const hotelRes = await AxiosInstance.get("api/hotels/me/");
      const hotelData = hotelRes.data;
      setMyHotel(hotelData);
      fetchRooms(hotelData.id);
      fetchGallery(hotelData.id);
      fetchNearby(hotelData.id);
      fetchCoupons(hotelData.id);
      fetchBookings();
      fetchReviews(hotelData.id); // Fetch reviews for this hotel
    } catch (error) {
      console.error("Error fetching hotel data:", error);
      if (error.response && error.response.status === 404) {
        toast.error("No hotel profile found. Please create one.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hotelId) => {
    try {
      const res = await AxiosInstance.get(`api/rooms/?hotel=${hotelId}`);
      const data = res.data;
      setRooms(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchGallery = async (hotelId) => {
    try {
      const res = await AxiosInstance.get(`api/gallery/?hotel=${hotelId}`);
      const data = res.data;
      setGalleryImages(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const fetchNearby = async (hotelId) => {
    try {
      const res = await AxiosInstance.get(`api/nearby-attractions/?hotel=${hotelId}`);
      const data = res.data;
      setNearby(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching nearby attractions:", error);
    }
  };

  const fetchCoupons = async (hotelId) => {
    try {
      const res = await AxiosInstance.get(`api/coupons/?hotel=${hotelId}`);
      const data = res.data;
      setCoupons(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  /* ---------- FIXED: correct endpoint matching urls.py ---------- */
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await AxiosInstance.get("api/hotel-dashboard/bookings/");
      const data = res.data || [];
      const actualData = Array.isArray(data) ? data : (data.results || []);
      setBookings(actualData);
      if (Array.isArray(actualData)) {
        const uniqueHotels = [...new Set(actualData.map((b) => b.hotel_name))];
        setHotels(uniqueHotels);
      }
    } catch (error) {
      console.error(
        "Bookings fetch error:",
        error.response?.status,
        error.response?.data || error.message
      );
    } finally {
      setLoadingBookings(false);
    }
  };
  /* ------------------------------------------------------------- */

  const fetchReviews = async (hotelId) => {
    try {
      // Changed to all_owner_reviews to get all reviews for the owner
      const res = await AxiosInstance.get(`api/hotel-reviews/all_owner_reviews/`);
      const data = res.data;
      setReviews(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Client-side filter — no extra API call needed
  const filteredBookings =
    selectedHotel === "all"
      ? bookings
      : bookings.filter((b) => b.hotel_name === selectedHotel);

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    let newErrors = {};
    if (!form.room_type) newErrors.room_type = "Room type required";
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Enter a valid price";
    if (!form.adults) newErrors.adults = "Adults required";
    if (!form.total_rooms || Number(form.total_rooms) <= 0)
      newErrors.total_rooms = "Enter valid room count";

    // Amenities are optional in backend, so making it optional in frontend too
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- IMAGE UPLOAD ---------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!myHotel) return toast.error("Hotel not found");
    const token = localStorage.getItem("access");
    for (const file of files) {
      if (!file.type.startsWith("image")) continue;
      const formData = new FormData();
      formData.append("hotel", myHotel.id);
      formData.append("image", file);
      try {
        await AxiosInstance.post("api/gallery/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (error) {
        console.error("Error uploading gallery image:", error);
      }
    }
    fetchGallery(myHotel.id);
  };

  /* ---------- ADD / UPDATE ROOM ---------- */
  const handleSubmitRoom = async () => {
    if (!validateForm()) return;
    if (!myHotel) return toast.error("Hotel profile missing!");
    const token = localStorage.getItem("access");
    const formData = new FormData();
    formData.append("hotel", myHotel.id);
    formData.append("room_type", form.room_type);
    formData.append("price", form.price);
    formData.append("adults", form.adults);
    formData.append("children", form.children || 0);
    formData.append("total_rooms", form.total_rooms);
    formData.append("bed_type", form.bed_type);
    formData.append("amenities", form.amenities);
    formData.append("description", form.description);
    if (form.image instanceof File) formData.append("image", form.image);

    try {
      if (editingRoomId) {
        await AxiosInstance.patch(
          `api/rooms/${editingRoomId}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Room updated successfully!");
      } else {
        await AxiosInstance.post("api/rooms/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Room added successfully!");
      }
      fetchRooms(myHotel.id);
      resetForm();
      // Go back to dashboard to see the updated/new room card
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error("Failed to save room. See console.");
    }
  };

  const handleEditRoom = (room) => {
    setForm({
      room_type: room.room_type,
      price: room.price,
      adults: room.adults,
      children: room.children,
      total_rooms: room.total_rooms,
      bed_type: room.bed_type,
      // Ensure amenities is a comma-separated string for the form input
      amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : (room.amenities || ""),
      description: room.description,
      image: null,
    });
    setImagePreview(room.image);
    setEditingRoomId(room.id);
    setActiveTab("rooms");
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await AxiosInstance.delete(
        `api/rooms/${id}/`
      );
      setRooms(rooms.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    }
  };

  const resetForm = () => {
    setForm({
      room_type: "",
      price: "",
      adults: "",
      children: "",
      total_rooms: "",
      bed_type: "",
      amenities: "",
      description: "",
      image: null,
    });
    setImagePreview("");
    setEditingRoomId(null);
    setErrors({});
  };

  const resetNearbyForm = () => {
    setNearbyForm({ name: "", distance_km: "" });
    setEditingNearbyId(null);
  };

  const handleSubmitNearby = async () => {
    if (!myHotel) return toast.error("Hotel profile missing!");
    if (!nearbyForm.name.trim() || !nearbyForm.distance_km) {
      return toast.error("Please enter name and distance.");
    }
    const payload = {
      hotel: myHotel.id,
      name: nearbyForm.name.trim(),
      distance_km: nearbyForm.distance_km,
    };
    try {
      if (editingNearbyId) {
        await AxiosInstance.patch(`api/nearby-attractions/${editingNearbyId}/`, payload);
        toast.success("Nearby place updated.");
      } else {
        if (nearby.length >= 5) {
          return toast.error("Maximum 5 nearby places allowed.");
        }
        await AxiosInstance.post("api/nearby-attractions/", payload);
        toast.success("Nearby place added.");
      }
      fetchNearby(myHotel.id);
      resetNearbyForm();
    } catch (error) {
      console.error("Error saving nearby place:", error);
      toast.error("Failed to save nearby place.");
    }
  };

  const handleEditNearby = (place) => {
    setNearbyForm({ name: place.name, distance_km: place.distance_km });
    setEditingNearbyId(place.id);
    setActiveTab("nearby");
  };

  const handleDeleteNearby = async (id) => {
    if (!window.confirm("Delete this place?")) return;
    try {
      await AxiosInstance.delete(`api/nearby-attractions/${id}/`);
      setNearby(nearby.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting nearby place:", error);
      toast.error("Failed to delete nearby place.");
    }
  };

  /* ---------- COUPONS ---------- */
  const resetCouponForm = () => {
    setCouponForm({
      code: "",
      discount_percent: 10,
      valid_from: "",
      valid_to: "",
      is_active: true
    });
    setEditingCouponId(null);
  };

  const handleSubmitCoupon = async () => {
    if (!myHotel) return toast.error("Hotel profile missing!");
    if (!couponForm.code.trim()) return toast.error("Coupon code is required");

    const today = new Date().toISOString().split('T')[0];
    if (!editingCouponId && couponForm.valid_from && couponForm.valid_from < today) {
      return toast.error("Coupon start date cannot be in the past.");
    }

    const { id, ...formData } = couponForm;
    const payload = {
      ...formData,
      hotel: myHotel.id,
      discount_percent: parseInt(formData.discount_percent)
    };

    try {
      if (editingCouponId) {
        await AxiosInstance.patch(`api/coupons/${editingCouponId}/`, payload);
        toast.success("Coupon updated.");
      } else {
        await AxiosInstance.post("api/coupons/", payload);
        toast.success("Coupon created.");
      }
      fetchCoupons(myHotel.id);
      resetCouponForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to save coupon.";
      toast.error(msg);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await AxiosInstance.delete(`api/coupons/${id}/`);
      setCoupons(coupons.filter(c => c.id !== id));
      if (editingCouponId === id) {
        resetCouponForm();
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon.");
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      await AxiosInstance.post(`api/bookings/${bookingId}/complete_booking/`);
      toast.success("Stay marked as completed!");
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Error completing booking:", error);
      toast.error("Failed to complete booking.");
    }
  };

  /* ---------- HELPERS ---------- */
  const InputError = ({ msg }) =>
    msg ? <small className="text-danger">{msg}</small> : null;

  const statusBadgeClass = (status) => {
    if (status === "confirmed") return "bg-success";
    if (status === "cancelled") return "bg-danger";
    if (status === "completed") return "bg-transparent text-dark border border-secondary";
    if (status === "pending") return "bg-danger";
    return "bg-warning text-dark";
  };

  /* ---------- GUARDS ---------- */
  if (loading)
    return <div className="p-5 text-center">Loading Dashboard...</div>;
  if (!myHotel)
    return (
      <div className="p-5 text-center">
        No Hotel Profile Found. Please complete signup.
      </div>
    );

  return (
    <div className="container-fluid" style={{ background: theme.light }}>
      <div className="row min-vh-100">

        {/* SIDEBAR */}
        <div
          className={`col-md-3 col-lg-2 text-white p-3 d-flex flex-column ${sidebarOpen ? "d-block" : "d-none d-md-flex"
            }`}
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          <h4 className="fw-bold mb-4">ServNex Business</h4>
          <div className="flex-grow-1">
            {["dashboard", "profile", "rooms", "bookings", "records", "reviews", "coupons", "gallery", "nearby"].map((tab) => (
              <button
                key={tab}
                className="btn w-100 text-start mb-2 px-3 py-2"
                style={{
                  background: activeTab === tab ? "white" : "transparent",
                  color: activeTab === tab ? "#667eea" : "rgba(255,255,255,0.9)",
                  borderRadius: "12px",
                  fontWeight: activeTab === tab ? "600" : "500",
                  transition: "all 0.3s ease",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateX(5px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
                onClick={() => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            <small style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", display: "block", marginBottom: "10px" }}>{myHotel.name}</small>
            <button className="btn w-100"
              style={{
                background: "rgba(220,53,69,0.2)",
                border: "1px solid rgba(220,53,69,0.4)",
                color: "white",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: "12px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(220,53,69,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(220,53,69,0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onClick={() => { localStorage.clear(); navigate("/", { replace: true }); }}>
              Logout
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="col-md-9 col-lg-10 p-0">
          {/* TOPBAR */}
          <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
            <button
              className="btn d-md-none"
              style={{ background: theme.secondary, color: "white" }}
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h5
              className="fw-semibold text-capitalize mb-0"
              style={{ color: theme.primary }}
            >
              {activeTab}
            </h5>
          </div>

          <div className="p-4">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <HotelProfileStepper hotel={myHotel} fetchMyHotel={fetchMyHotel} theme={theme} />
            )}

            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <>
                <div className="card border-0 shadow mb-4 rounded-4 overflow-hidden">
                  <img
                    src={
                      myHotel.image ||
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
                    }
                    style={{ height: 260, objectFit: "cover" }}
                    alt="hotel"
                  />
                  <div
                    className="card-img-overlay text-white d-flex flex-column justify-content-end"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <h3 className="fw-bold">{myHotel.name}</h3>
                    <p>
                      {myHotel.city} • ⭐ {myHotel.rating || "New"}
                    </p>
                  </div>
                </div>

                {/* ── STATS SECTION ── */}
                <div className="row g-4 mb-4">
                  <div className="col-12 text-center p-4 bg-white rounded-4 shadow-sm border" style={{ borderColor: "#e2e8f0" }}>
                    <div className="d-flex flex-column align-items-center">
                      <div className="mb-2" style={{ fontSize: "2.5rem" }}>🏨</div>
                      <h2 className="mb-0 fw-bold" style={{ color: theme.primary, letterSpacing: "-0.02em" }}>
                        {bookings.filter(b => {
                          const today = new Date().toISOString().split('T')[0];
                          const isActive = b.check_in <= today && b.check_out > today;
                          return (b.status === "confirmed" || b.status === "paid") && isActive;
                        }).reduce((acc, b) => acc + (b.rooms_booked || 1), 0)} Rooms Occupied Today
                      </h2>
                      <p className="text-muted fw-medium mt-1 mb-0">Currently active guests in your hotel</p>
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="col-sm-6 col-lg-4 col-xl-3">
                      <div className="card border-0 shadow h-100 rounded-4">
                        <img
                          src={room.image || "https://via.placeholder.com/300"}
                          style={{ height: 180, objectFit: "cover" }}
                          alt="room"
                        />
                        <div className="card-body d-flex flex-column">
                          <h5>{room.room_type}</h5>
                          <p className="fw-bold text-primary">
                            ₹{room.price}/night
                          </p>
                          <small>
                            Adults: {room.adults} | Children: {room.children || 0}
                            <br />
                            BedType: {room.bed_type || "-"}
                          </small>
                          {room.amenities && (
                            <div className="mt-2 d-flex flex-wrap gap-1">
                              {(Array.isArray(room.amenities)
                                ? room.amenities
                                : room.amenities.split(",")
                              )
                                .slice(0, 3)
                                .map((a, i) => (
                                  <span
                                    key={i}
                                    className="badge rounded-pill text-bg-light border"
                                    style={{ fontSize: "0.72rem" }}
                                  >
                                    ✨ {a.trim()}
                                  </span>
                                ))}
                            </div>
                          )}
                          <div className="d-flex gap-1 mt-2">
                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.75rem' }}>
                              {room.total_rooms} Total
                            </span>
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.75rem' }}>
                              {bookings.filter(b => {
                                const today = new Date().toISOString().split('T')[0];
                                const isActive = b.check_in <= today && b.check_out > today;
                                return b.room_type === room.room_type && (b.status === 'confirmed' || b.status === 'paid') && isActive;
                              }).reduce((acc, b) => acc + (b.rooms_booked || 1), 0)} Occupied
                            </span>
                          </div>
                          <div className="mt-auto pt-3">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEditRoom(room)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="col-sm-6 col-lg-4 col-xl-3">
                    <div
                      className="card border-2 h-100 rounded-4 d-flex align-items-center justify-content-center text-center p-4"
                      style={{ minHeight: 320, cursor: "pointer", borderStyle: "dashed" }}
                      onClick={() => setActiveTab("rooms")}
                    >
                      <div>
                        <div style={{ fontSize: "2rem", color: theme.secondary, fontWeight: "bold" }}>+</div>
                        <h6 className="mt-2 mb-1">Add Room</h6>
                        <small className="text-muted">Click to create a new room</small>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ROOMS TAB */}
            {activeTab === "rooms" && (
              <div className="card border-0 shadow p-4 rounded-4">
                <h5 className="fw-semibold mb-3">
                  {editingRoomId ? "Edit Room" : "Add Room"}
                </h5>
                <div className="row g-3 align-items-start">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Room Type</label>
                    <select className="form-select" value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}>
                      <option value="">Select Room Type</option>
                      {roomTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <InputError msg={errors.room_type} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Price</label>
                    <input type="number" className="form-control" style={{ marginTop: "-1px" }} placeholder="Price" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <InputError msg={errors.price} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Adults</label>
                    <select className="form-select" value={form.adults} onChange={(e) => setForm({ ...form, adults: e.target.value })}>
                      <option value="">Adults</option>
                      {[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                    </select>
                    <InputError msg={errors.adults} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Children</label>
                    <select className="form-select" value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })}>
                      <option value="">Children</option>
                      {[0, 1, 2, 3].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Total Rooms</label>
                    <input type="number" className="form-control" style={{ marginTop: "-1px" }} placeholder="Total Rooms" min="1" value={form.total_rooms} onChange={(e) => setForm({ ...form, total_rooms: e.target.value })} />
                    <InputError msg={errors.total_rooms} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Bed Type</label>
                    <select className="form-select" value={form.bed_type} onChange={(e) => setForm({ ...form, bed_type: e.target.value })}>
                      <option value="">Bed Type</option>
                      {bedTypes.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Amenities</label>
                    <input type="text" className="form-control" placeholder="Amenities (comma separated) e.g. WiFi, AC, TV" value={form.amenities} maxLength={200} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                    <InputError msg={errors.amenities} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Room Image</label>
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  {imagePreview && (
                    <div className="col-md-6 d-flex align-items-center">
                      <img src={imagePreview} className="img-fluid rounded mt-4" style={{ maxHeight: 100 }} alt="preview" />
                    </div>
                  )}
                  <div className="col-12 mt-2">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Description</label>
                    <textarea className="form-control" placeholder="Description" rows="3" maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <InputError msg={errors.description} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }} onClick={handleSubmitRoom}>
                    {editingRoomId ? "Update Room" : "Add Room"}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={resetForm}>Reset</button>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div className="card shadow border-0 p-4 rounded-4">

                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                  <h5
                    className="mb-0 fw-semibold d-flex align-items-center gap-2"
                    style={{ color: theme.primary }}
                  >
                    Recent Bookings
                    {filteredBookings.filter(b => b.status === "confirmed" || b.status === "paid").length > 0 && (
                      <span
                        className="badge rounded-pill"
                        style={{ background: theme.secondary, fontSize: "0.75rem" }}
                      >
                        {filteredBookings.filter(b => b.status === "confirmed" || b.status === "paid").length}
                      </span>
                    )}
                  </h5>
                </div>

                {/* Loading */}
                {loadingBookings ? (
                  <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status" />
                    Loading bookings...
                  </div>
                ) : filteredBookings.filter(b => b.status === "confirmed" || b.status === "paid").length > 0 ? (
                  filteredBookings.filter(b => b.status === "confirmed" || b.status === "paid").map((b) => (
                    <div
                      key={b.booking_id}
                      className="card mb-3 border-0 shadow-sm"
                      style={{ borderRadius: "16px" }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h5 className="mb-0 fw-bold">{b.guest_name || b.customer_name}</h5>
                              <span className={`badge ${statusBadgeClass(b.status)}`} style={{ fontSize: '0.7rem' }}>
                                {b.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="d-flex flex-column gap-1">
                              {b.guest_name && (
                                <span className="small" style={{ color: '#d97706', fontWeight: 500 }}>
                                  📞 {b.guest_phone}
                                </span>
                              )}
                              {b.guest_name && (
                                <span className="small" style={{ color: '#6366f1', fontStyle: 'italic' }}>
                                  (Booked by: {b.customer_name} • {b.customer_phone || b.customer_email})
                                </span>
                              )}
                              {!b.guest_name && (
                                <span className="text-muted small">{b.customer_email}</span>
                              )}
                              <span className="text-muted small">🏨 {b.hotel_name}</span>
                              {b.room_type && <span className="text-muted small">🛏 Type: {b.room_type}</span>}
                              <span className="text-muted small">
                                📅 Check-in: <span className="fw-medium text-dark">{b.check_in}</span>
                                {"  →  "}
                                Check-out: <span className="fw-medium text-dark">{b.check_out}</span>
                              </span>
                              {!b.guest_name && b.customer_phone && (
                                <span className="text-muted small">📞 {b.customer_phone}</span>
                              )}
                              <div className="mt-1">
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style={{ fontSize: '0.8rem' }}>
                                  🛏 {b.rooms_booked} {b.rooms_booked === 1 ? 'Room' : 'Rooms'}
                                </span>
                              </div>
                              <span className="text-muted small">
                                🕐 Time: {new Date(b.booked_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="d-flex flex-column align-items-end">
                            {(b.status === 'confirmed' || b.status === 'paid') && (
                              <button
                                className="btn btn-sm btn-success mt-2"
                                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                onClick={() => handleCompleteBooking(b.booking_id)}
                              >
                                Complete Stay
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: "2.5rem" }}>📭</div>
                    <p className="mt-2 mb-0">
                      {selectedHotel === "all"
                        ? "No active bookings yet."
                        : `No active bookings found for "${selectedHotel}".`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* RECORDS TAB */}
            {activeTab === "records" && (
              <div className="card shadow border-0 p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-semibold" style={{ color: theme.primary }}>Booking Records & History</h5>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="bg-light">
                      <tr style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "#64748b" }}>
                        <th className="px-3">Customer</th>
                        <th>Hotel & Room</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Booked At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.filter(b => !(b.status === "confirmed" || b.status === "paid")).length > 0 ? (
                        filteredBookings.filter(b => !(b.status === "confirmed" || b.status === "paid")).map((b) => (
                          <tr key={b.booking_id}>
                            <td className="px-3">
                              <div className="fw-bold">{b.guest_name || b.customer_name}</div>
                              {b.guest_name ? (
                                <>
                                  <div className="small" style={{ color: '#d97706', fontWeight: 500 }}>📞 {b.guest_phone}</div>
                                  <div className="small" style={{ color: '#6366f1', fontStyle: 'italic' }}>(Booked by: {b.customer_name} • {b.customer_phone || b.customer_email})</div>
                                </>
                              ) : (
                                <>
                                  <div className="small text-muted">{b.customer_email}</div>
                                  {b.customer_phone && <div className="small text-muted">📞 {b.customer_phone}</div>}
                                </>
                              )}
                            </td>
                            <td>
                              <div className="fw-medium">{b.hotel_name}</div>
                              <div className="small text-muted mb-1">🛏 {b.room_type || "N/A"}</div>
                              <div className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0" style={{ fontSize: '0.7rem' }}>
                                {b.rooms_booked || 1} {(b.rooms_booked || 1) === 1 ? 'Room' : 'Rooms'}
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                <strong>In:</strong> {b.check_in}<br />
                                <strong>Out:</strong> {b.check_out}
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${statusBadgeClass(b.status)}`}>
                                {b.status === 'pending' ? 'PAYMENT FAILED' : b.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="small text-muted">
                              {new Date(b.booked_at).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5 text-muted">No records found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GALLERY TAB */}
            {activeTab === "gallery" && (
              <div className="card shadow border-0 p-5 text-center rounded-4">
                <h5>Upload Gallery</h5>
                <div className="alert alert-info mt-3 mb-4 text-start">
                  📸 <strong>Reminder:</strong> Add high-quality photos of rooms, lobby, and amenities to attract more customers.
                </div>
                <input type="file" multiple accept="image/*" className="form-control mb-4" onChange={handleGalleryUpload} />
                {galleryImages.length > 0 ? (
                  <div className="row g-3">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="col-6 col-md-4 col-lg-3">
                        <img
                          src={img.image}
                          alt={`gallery-${i}`}
                          className="img-fluid rounded shadow-sm"
                          style={{ height: 150, objectFit: "cover", width: "100%" }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-2 p-5 text-muted rounded">
                    Drag & Drop Hotel Photos Here
                  </div>
                )}
              </div>
            )}

            {/* NEARBY TAB */}
            {activeTab === "nearby" && (
              <div className="card shadow border-0 p-4 rounded-4">
                <h5 className="mb-3">Nearby Places</h5>
                <p className="text-muted small">
                  Add popular landmarks and attractions near your hotel. Guests will see this list on the hotel detail page.
                </p>

                <div className="row g-3 align-items-end mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-uppercase text-muted">
                      Place name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Bangalore Palace"
                      value={nearbyForm.name}
                      onChange={(e) =>
                        setNearbyForm({ ...nearbyForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-uppercase text-muted">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      placeholder="e.g., 2.85"
                      value={nearbyForm.distance_km}
                      onChange={(e) =>
                        setNearbyForm({
                          ...nearbyForm,
                          distance_km: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                    <button
                      className="btn btn-primary w-100"
                      type="button"
                      onClick={handleSubmitNearby}
                    >
                      {editingNearbyId ? "Update" : "Add"}
                    </button>
                    {editingNearbyId && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={resetNearbyForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {nearby.length > 0 ? (
                  <ul className="list-group">
                    {nearby.map((place) => (
                      <li
                        key={place.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-semibold">{place.name}</div>
                          <small className="text-muted">
                            {parseFloat(place.distance_km).toFixed(2)} km away
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            type="button"
                            onClick={() => handleEditNearby(place)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            onClick={() => handleDeleteNearby(place.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted small">
                    No nearby places added yet. Start by adding one above.
                  </div>
                )}
              </div>
            )}

            {/* COUPONS TAB */}
            {activeTab === "coupons" && (
              <div className="card shadow border-0 p-4 rounded-4">
                <h5 className="mb-3">Manage Coupons</h5>
                <p className="text-muted small">
                  Create special discount codes for your guests.
                </p>

                <div className="row g-3 align-items-end mb-4 p-3 bg-light rounded-3">
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Code</label>
                    <input type="text" className="form-control" placeholder="SUMMER10" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Discount %</label>
                    <input type="number" className="form-control" value={couponForm.discount_percent} onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Valid From</label>
                    <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} value={couponForm.valid_from ? couponForm.valid_from.split('T')[0] : ""} onChange={(e) => setCouponForm({ ...couponForm, valid_from: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold text-uppercase text-muted">Valid To</label>
                    <input type="date" className="form-control" min={couponForm.valid_from ? couponForm.valid_from.split('T')[0] : new Date().toISOString().split('T')[0]} value={couponForm.valid_to ? couponForm.valid_to.split('T')[0] : ""} onChange={(e) => setCouponForm({ ...couponForm, valid_to: e.target.value })} />
                  </div>
                  <div className="col-md-2 d-flex gap-2">
                    <button className="btn btn-primary flex-grow-1" onClick={handleSubmitCoupon}>{editingCouponId ? "Update" : "Add"}</button>
                    {editingCouponId && (
                      <button className="btn btn-outline-secondary" onClick={resetCouponForm}>Cancel</button>
                    )}
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Validity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td><span className="fw-bold text-primary">{c.code}</span></td>
                          <td>{c.discount_percent}%</td>
                          <td>
                            <small className="text-muted">
                              {c.valid_from ? new Date(c.valid_from).toLocaleDateString() : "Anytime"} - {c.valid_to ? new Date(c.valid_to).toLocaleDateString() : "Always"}
                            </small>
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" checked={c.is_active} onChange={async () => {
                                try {
                                  await AxiosInstance.patch(`api/coupons/${c.id}/`, { is_active: !c.is_active });
                                  fetchCoupons(myHotel.id);
                                } catch (e) { toast.error("Failed to toggle status"); }
                              }} />
                            </div>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {
                              setCouponForm({ ...c });
                              setEditingCouponId(c.id);
                            }}>Edit</button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCoupon(c.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No coupons created yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="card shadow border-0 p-4 rounded-4">
                <h5 className="mb-4 fw-semibold" style={{ color: theme.primary }}>Guest Reviews</h5>
                {reviews.length > 0 ? (
                  <div className="row g-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="col-12">
                        <div className="border rounded-4 p-3 shadow-sm bg-white">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                style={{ width: "40px", height: "40px", backgroundColor: theme.primary, fontSize: "1.1rem" }}
                              >
                                {(rev.user_name || "G")[0].toUpperCase()}
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">{rev.user_name}</h6>
                                <small className="text-muted">{new Date(rev.created_at).toLocaleDateString()}</small>
                              </div>
                            </div>
                            <div className="bg-warning-subtle text-warning px-2 py-1 rounded small fw-bold">
                              {rev.rating} ⭐
                            </div>
                          </div>
                          <p className="mb-3 text-secondary" style={{ fontStyle: "italic" }}>"{rev.comment}"</p>

                          {/* Attached Images */}
                          {rev.images && rev.images.length > 0 && (
                            <div className="d-flex gap-2 flex-wrap">
                              {rev.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.image}
                                  alt="review"
                                  className="rounded-3 border shadow-sm"
                                  style={{ width: "100px", height: "100px", objectFit: "cover", cursor: "pointer" }}
                                  onClick={() => window.open(img.image, '_blank')}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: "2.5rem" }}>⭐</div>
                    <p className="mt-2 mb-0">No reviews found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
