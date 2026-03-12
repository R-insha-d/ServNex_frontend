import React, { useState, useEffect } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Landing from './Pages/Landing'
import HotelList from './Pages/HotelList'
import SignUp from './Pages/SignUp'
import Login from './Credentials/Login'
import HotelDetail from './Pages/HotelDetail'
import HotelBooking from './Pages/HotelBooking'
import ForgotPassword from './Pages/ForgotPassword'
import MyBookings from './Pages/MyBookings'
import BusinessLogin from './Credentials/BusinessLogin'
import RestaurantList from './Pages/RestaurantList'
import RestaurantDetail from './Pages/RestaurantDetail'
import RestaurantReservation from './Pages/RestaurantReservation'
import Dashboard from './admin/components/Dashboard'
import EditProfile from './Component/EditProfile'
import RestaurantDashboard from './admin/components/RestaurantDashboard'
import Auth from './Credentials/Auth'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Preloader from './Credentials/Preloader'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  return token ? children : <Navigate to="/auth" replace />;
};

function App() {
  const [preload, setPreload] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      setPreload(false)
    }, 3000)
  }, [])

  return (
    <>
      <Routes>
        <Route path='/' element={preload ? <Preloader setPreload={setPreload} /> : <Landing />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/login' element={<Login />} />
        <Route path='/login-business' element={<BusinessLogin />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/edit-profile" element={<EditProfile />} />


        {/* Hotel routes */}
        <Route
          path='/hotel'
          element={
            <ProtectedRoute>
              <HotelList />
            </ProtectedRoute>
          }
        />
        <Route path='/hotel/:id' element={<HotelDetail />} />
        <Route path='/booking/:id' element={<HotelBooking />} />

        {/* Restaurant routes */}
        <Route
          path='/restaurant'
          element={
            <ProtectedRoute>
              <RestaurantList />
            </ProtectedRoute>
          }
        />
        <Route path='/restaurant/:id' element={<RestaurantDetail />} />
        <Route path='/reservation/:id' element={<RestaurantReservation />} />

        {/* admin */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-dashboard"
          element={
            <ProtectedRoute>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />


        {/* Authentication */}
        <Route path='/auth' element={<Auth />} />


      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  )
}

export default App