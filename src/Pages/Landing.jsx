import React, { useEffect } from "react";
import Footer from "../Component/Footer";
import "../Pages/Landing.css";
import Hotel from "../assets/hotel-illu.png";
import Home from "../assets/HomeService.png"
import Health from "../assets/Health.png"
import Transport from "../assets/Transport.png"
import Restaurant from "../assets/resta.png";
import Saloon from "../assets/Saloon.png";
import DashboardImg from "../assets/section.png"
import Header from "../Component/Header";
import { Link, useNavigate } from "react-router-dom";
import { AiFillThunderbolt } from "react-icons/ai";
import { IoIosLock } from "react-icons/io";
import { MdLocationPin } from "react-icons/md";

function Landing() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const isBusinessUser = ["Hotel", "Restaurant", "Saloon"].includes(role);

    // If business user, show redirect page instead
    if (isBusinessUser) {
        return (
            <>
                <Header />
                <div className="d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "80vh", textAlign: "center", padding: "40px" }}>
                    <img
                        src={role === "Hotel" ? Hotel : role === "Restaurant" ? Restaurant : Saloon}
                        alt="dashboard"
                        style={{ width: "120px", marginBottom: "24px", opacity: 0.8 }}
                    />
                    <h3 className="fw-bold mb-2">Welcome back! 👋</h3>
                    <p className="text-muted mb-4" style={{ maxWidth: "400px" }}>
                        You're logged in as a <strong>{role}</strong> business account.
                        This page is for customers only.
                    </p>
                    <button
                        className="btn btn-primary btn-lg rounded-3 px-5"
                        onClick={() => navigate(role === "Hotel" ? "/admin-dashboard" : "/restaurant-dashboard")}
                    >
                        Go to My Dashboard →
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            {/* ================= HERO SERVICES SECTION ================= */}
            <section className="hero-section py-5">
                <div className="container text-center">
                    <h2 className="section-title mb-5">Explore Our Services</h2>
                    <div className="row g-4 justify-content-center">

                        <div className="col-lg-4 col-md-6">
                            <div className="service-card text-center p-4">
                                <img src={Hotel} className="service-icon mb-3" alt="" />
                                <h4>Hotels</h4>
                                <p>Book luxury and budget stays instantly.</p>
                                <Link to="/hotel" className="explore-btns">
                                    <span className="fs-6">Explore ›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="service-card text-center p-4">
                                <img src={Restaurant} className="service-icon mb-3" alt="" />
                                <h4>Restaurants</h4>
                                <p>Reserve tables at the best restaurants.</p>
                                <Link to="/restaurant" className="explore-btns">
                                    <span className="fs-6">Explore ›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="service-card text-center p-4 position-relative overflow-hidden">
                                <div className="coming-soon-badge">
                                    <div className="badge-track">
                                        <span>Coming Soon</span>
                                        <span>Coming Soon</span>
                                    </div>
                                </div>
                                <img src={Saloon} className="service-icon mb-3" alt="" />
                                <h4>Salons</h4>
                                <p>Schedule appointments with top-rated stylists.</p>
                                <Link to="" className="explore-btns">
                                    <span className="fs-6">Explore ›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="service-card text-center p-4 position-relative overflow-hidden">
                                <div className="coming-soon-badge">
                                    <div className="badge-track">
                                        <span>Coming Soon</span>
                                        <span>Coming Soon</span>
                                    </div>
                                </div>
                                <img src={Home} className="service-icon mb-3" alt="" />
                                <h4>Home Services</h4>
                                <p>Book trusted professionals for cleaning, repairs, and maintenance.</p>
                                <Link to="" className="explore-btns">
                                    <span className="fs-6">Explore ›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="service-card text-center p-4 position-relative overflow-hidden">
                                <div className="coming-soon-badge">
                                    <div className="badge-track">
                                        <span>Coming Soon</span>
                                        <span>Coming Soon</span>
                                    </div>
                                </div>
                                <img src={Health} className="service-icon mb-3" alt="" />
                                <h4>Health</h4>
                                <p>Schedule appointments with certified doctors and clinics.</p>
                                <Link to="" className="explore-btns">
                                    <span className="fs-6">Explore ›</span>
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-4 col-md-6">
                            <div className="service-card text-center p-4 position-relative overflow-hidden">
                                <div className="coming-soon-badge">
                                    <div className="badge-track">
                                        <span>Coming Soon</span>
                                        <span>Coming Soon</span>
                                    </div>
                                </div>
                                <img src={Transport} className="service-icon mb-3" alt="" />
                                <h4>Transport</h4>
                                <p>Book reliable rides and travel services instantly, anytime you need.</p>
                                <Link to="" className="explore-btns">
                                    <span className="fs-6">Explore ›</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= WHY CHOOSE SECTION ================= */}
            <section className="why-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <span className="section-badge">WHY SERVNEX</span>
                            <h2 className="section-title">
                                Experience Service Booking <span>Like Never Before</span>
                            </h2>
                            <p className="section-subtitle">
                                Fast, secure and location-smart booking platform designed
                                to simplify your everyday services.
                            </p>
                            <div className="feature-card">
                                <div className="icon-circle"><AiFillThunderbolt /></div>
                                <div>
                                    <h5>Instant Booking</h5>
                                    <p>Book services in seconds without unnecessary steps.</p>
                                </div>
                            </div>
                            <div className="feature-card">
                                <div className="icon-circle"><IoIosLock /></div>
                                <div>
                                    <h5>Secure Payments</h5>
                                    <p>Advanced encryption ensures safe transactions.</p>
                                </div>
                            </div>
                            <div className="feature-card">
                                <div className="icon-circle"><MdLocationPin /></div>
                                <div>
                                    <h5>Smart Location Discovery</h5>
                                    <p>Find top-rated services near your location instantly.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 text-center">
                            <div className="image-wrapper-div">
                                <div className="image-wrapper"
                                    style={{ backgroundImage: `url(${DashboardImg})` }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            <Footer />
        </>
    );
}

export default Landing;