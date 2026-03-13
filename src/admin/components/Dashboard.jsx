import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AxiosInstance from "../../Component/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

  // ── Bookings state ──────────────────────────────────────────────
  const [bookings, setBookings] = useState([]);
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
      fetchBookings();
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
      setRooms(res.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchGallery = async (hotelId) => {
    try {
      const res = await AxiosInstance.get(`api/gallery/?hotel=${hotelId}`);
      setGalleryImages(res.data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };

  const fetchNearby = async (hotelId) => {
    try {
      const res = await AxiosInstance.get(`api/nearby-attractions/?hotel=${hotelId}`);
      setNearby(res.data);
    } catch (error) {
      console.error("Error fetching nearby attractions:", error);
    }
  };

  /* ---------- FIXED: correct endpoint matching urls.py ---------- */
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await AxiosInstance.get("api/hotel-dashboard/bookings/");
      const data = res.data || [];
      setBookings(data);
      if (Array.isArray(data)) {
        const uniqueHotels = [...new Set(data.map((b) => b.hotel_name))];
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
    if (!form.amenities.trim()) newErrors.amenities = "Amenities required";
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
      amenities: room.amenities,
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

  /* ---------- HELPERS ---------- */
  const InputError = ({ msg }) =>
    msg ? <small className="text-danger">{msg}</small> : null;

  const statusBadgeClass = (status) => {
    if (status === "confirmed") return "bg-success";
    if (status === "cancelled") return "bg-danger";
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
            {["dashboard", "rooms", "bookings", "gallery", "nearby"].map((tab) => (
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
                          <span className="badge bg-success mt-2">
                            {room.total_rooms} Rooms Total
                          </span>
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
                <div className="row g-3">
                  <div className="col-md-4">
                    <select className="form-select" value={form.room_type} onChange={(e) => setForm({ ...form, room_type: e.target.value })}>
                      <option value="">Select Room Type</option>
                      {roomTypes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <InputError msg={errors.room_type} />
                  </div>
                  <div className="col-md-4">
                    <input type="number" className="form-control" placeholder="Price" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    <InputError msg={errors.price} />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={form.adults} onChange={(e) => setForm({ ...form, adults: e.target.value })}>
                      <option value="">Adults</option>
                      {[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                    </select>
                    <InputError msg={errors.adults} />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={form.children} onChange={(e) => setForm({ ...form, children: e.target.value })}>
                      <option value="">Children</option>
                      {[0, 1, 2, 3].map((n) => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <input type="number" className="form-control" placeholder="Total Rooms" min="1" value={form.total_rooms} onChange={(e) => setForm({ ...form, total_rooms: e.target.value })} />
                    <InputError msg={errors.total_rooms} />
                  </div>
                  <div className="col-md-4">
                    <select className="form-select" value={form.bed_type} onChange={(e) => setForm({ ...form, bed_type: e.target.value })}>
                      <option value="">Bed Type</option>
                      {bedTypes.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <input type="text" className="form-control" placeholder="Amenities (comma separated) e.g. WiFi, AC, TV" value={form.amenities} maxLength={200} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
                    <InputError msg={errors.amenities} />
                  </div>
                  <div className="col-md-6">
                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  {imagePreview && (
                    <div className="col-12">
                      <img src={imagePreview} className="img-fluid rounded" style={{ maxHeight: 200 }} alt="preview" />
                    </div>
                  )}
                  <div className="col-12">
                    <textarea className="form-control" placeholder="Description" rows="2" maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <InputError msg={errors.description} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-primary" onClick={handleSubmitRoom}>
                    {editingRoomId ? "Update Room" : "Add Room"}
                  </button>
                  <button className="btn btn-outline-secondary" onClick={resetForm}>Reset</button>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === "bookings" && (
              <div className="card shadow border-0 p-4 rounded-4">

                {/* Header + hotel filter dropdown */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                  <h5
                    className="mb-0 fw-semibold d-flex align-items-center gap-2"
                    style={{ color: theme.primary }}
                  >
                    Recent Bookings
                    {filteredBookings.length > 0 && (
                      <span
                        className="badge rounded-pill"
                        style={{ background: theme.secondary, fontSize: "0.75rem" }}
                      >
                        {filteredBookings.length}
                      </span>
                    )}
                  </h5>

                  {hotels.length > 0 && (
                    <select
                      className="form-select form-select-sm w-auto"
                      value={selectedHotel}
                      onChange={(e) => setSelectedHotel(e.target.value)}
                      style={{ minWidth: 190, borderColor: theme.secondary }}
                    >
                      <option value="all">All Hotels</option>
                      {hotels.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Loading */}
                {loadingBookings ? (
                  <div className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status" />
                    Loading bookings...
                  </div>

                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => (
                    <div
                      key={b.booking_id}
                      className="border rounded-3 p-3 mb-3 d-flex justify-content-between align-items-start"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      <div className="d-flex flex-column gap-1">
                        <strong style={{ color: theme.primary }}>{b.customer_name}</strong>
                        <span className="text-muted small">{b.customer_email}</span>
                        <span className="text-muted small">🏨 {b.hotel_name}</span>
                        {b.room_type && <span className="text-muted small">🛏 Type: {b.room_type}</span>}
                        <span className="text-muted small">
                          📅 Check-in: <span className="fw-medium text-dark">{b.check_in}</span>
                          {"  →  "}
                          Check-out: <span className="fw-medium text-dark">{b.check_out}</span>
                        </span>
                        {b.rooms_booked && (
                          <span className="text-muted small">
                            🛏 {b.rooms_booked} room(s) · 👤 {b.number_of_guests} guest(s)
                          </span>
                        )}
                        <span className="text-muted small">
                          🕐 Booked: {new Date(b.booked_at).toLocaleString()}
                        </span>
                      </div>

                      <span
                        className={`badge ${statusBadgeClass(b.status)} ms-3`}
                        style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}
                      >
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                  ))

                ) : (
                  <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: "2.5rem" }}>📭</div>
                    <p className="mt-2 mb-0">
                      {selectedHotel === "all"
                        ? "No bookings yet."
                        : `No bookings found for "${selectedHotel}".`}
                    </p>
                  </div>
                )}
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

          </div>
        </div>
      </div>
    </div>
  );
}
