import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Box,
} from "@mui/material";
import { Container, Row, Col } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";

export default function BusinessLogin() {
  const [screen, setScreen] = useState("dashboard");
  const [category, setCategory] = useState("Hotels");
  const [step, setStep] = useState(0);

  const navigate = useNavigate();

  const steps = ["Category", "Business Info"];

  const [errors, setErrors] = useState({});

  /* ------------------------------------------------
     BUSINESS LOGIN DATA (badge removed)
     ------------------------------------------------ */
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    area: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- WEB-STANDARD VALIDATION ---------- */

  const validateStep = () => {
    let newErrors = {};

    if (step === 1) {
      const name = formData.name.trim();
      const city = formData.city.trim();
      const area = formData.area.trim();
      const description = formData.description.trim();

      // Business Name (2–80 chars, letters/numbers/basic punctuation)
      if (!name) {
        newErrors.name = "Business name required";
      } else if (name.length < 2 || name.length > 80) {
        newErrors.name = "Name must be 2–80 characters";
      } else if (!/^[\w\s&.,'()-]+$/u.test(name)) {
        newErrors.name = "Contains invalid characters";
      }

      // City (letters, spaces, hyphen, apostrophe)
      if (!city) {
        newErrors.city = "City required";
      } else if (city.length < 2 || city.length > 60) {
        newErrors.city = "City must be 2–60 characters";
      } else if (!/^[a-zA-Z\s'-]+$/.test(city)) {
        newErrors.city = "Enter a valid city name";
      }

      // Address / Area
      if (!area) {
        newErrors.area = "Area/Address required";
      } else if (area.length < 5 || area.length > 120) {
        newErrors.area = "Address must be 5–120 characters";
      }

      // Description
      if (!description) {
        newErrors.description = "Description required";
      } else if (description.length < 20 || description.length > 500) {
        newErrors.description =
          "Description must be 20–500 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateRoleOnBackend = async () => {
    const token = localStorage.getItem("access");
    if (!token) return true;

    try {
      const roleMap = {
        Hotels: "Hotel",
        Restaurants: "Restaurant",
        Saloons: "Saloon",
      };

      await AxiosInstance.patch(
        "update-role/",
        { role: roleMap[category] }
      );
      return true;
    } catch (error) {
      console.error("Error updating role:", error);
      return true;
    }
  };

  const next = async () => {
    if (step === 0) {
      const success = await updateRoleOnBackend();
      if (success) setStep((prev) => prev + 1);
    } else if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prev = () => setStep((prev) => prev - 1);

  /* ---------- DASHBOARD (UNCHANGED EXACTLY) ---------- */

  if (screen === "dashboard") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          px: 2,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            borderRadius: 4,
            boxShadow: 6,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            color="#667eea"
            gutterBottom
          >
            Welcome Business Partner 👋
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Start listing your business and reach more customers easily.
          </Typography>

          <Button
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            variant="contained"
            size="large"
            startIcon={<FaPlus />}
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => setScreen("stepper")}
          >
            List Your Business
          </Button>
        </Card>
      </Box>
    );
  }

  /* ---------- STEPPER FORM ---------- */

  return (
    <div className="p-5" style={{ width: "100%", height: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Card style={{ borderRadius: 16 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Business Listing
          </Typography>

          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box mt={4}>
            {/* STEP 1 — CATEGORY */}
            {step === 0 && (
              <TextField
                select
                fullWidth
                label="Select Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="Hotels">Hotels</MenuItem>
                <MenuItem value="Restaurants">Restaurants</MenuItem>
                <MenuItem value="Saloons">Salons</MenuItem>
              </TextField>
            )}

            {/* STEP 2 — BUSINESS INFO ONLY */}
            {step === 1 && (
              <Row>
                <Col xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={`${category.slice(0, -1)} Name`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    margin="normal"
                    inputProps={{ maxLength: 80 }}
                    required
                  />
                </Col>

                <Col xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={!!errors.city}
                    helperText={errors.city}
                    margin="normal"
                    inputProps={{ maxLength: 60 }}
                    required
                  />
                </Col>

                <Col xs={12}>
                  <TextField
                    fullWidth
                    label="Area / Address"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    error={!!errors.area}
                    helperText={errors.area}
                    margin="normal"
                    inputProps={{ maxLength: 120 }}
                    required
                  />
                </Col>

                <Col xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={
                      errors.description ||
                      `${formData.description.length}/500`
                    }
                    margin="normal"
                    inputProps={{ maxLength: 500 }}
                    required
                  />
                </Col>
              </Row>
            )}

            {/* NAV BUTTONS */}
            <Box mt={4} display="flex" justifyContent="space-between">
              <Button disabled={step === 0} onClick={prev}>
                Previous
              </Button>

              {step === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    if (validateStep()) {
                      const token = localStorage.getItem("access");
                      if (token) await updateRoleOnBackend();

                      const data = new FormData();
                      data.append("name", formData.name.trim());
                      data.append("city", formData.city.trim());
                      data.append("area", formData.area.trim());
                      data.append(
                        "description",
                        formData.description.trim()
                      );

                      try {
                        await AxiosInstance.post(
                          "api/business-profile/",
                          data,
                          {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          }
                        );
                        toast.success("Business Profile Submitted Successfully");
                        if (category === "Restaurants") {
                          navigate("/restaurant-dashboard");
                        } else {
                          navigate("/admin-dashboard");
                        }
                      } catch (error) {
                        console.error("Error submitting business:", error);
                        toast.error("Failed to submit business profile.");
                      }
                    }
                  }}
                >
                  Submit
                </Button>
              ) : (
                <Button variant="contained" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }} onClick={next}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}