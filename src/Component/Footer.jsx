import React from 'react'
import { Box, Typography, Link, Grid, Divider, IconButton, Stack } from "@mui/material";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <Box sx={{ bgcolor: "#f6f7fb", pb: 0, px: 0 }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: { xs: "30px 30px 0 0", md: "40px 40px 0 0" },
          px: { xs: 4, md: 8 },
          pt: { xs: 4, md: 5 },
          pb: { xs: 2, md: 3 },
          boxShadow: "0 20px 40px rgba(102, 126, 234, 0.2)",
          mt: 'auto'
        }}
      >
        <Grid container spacing={4} alignItems="flex-start" justifyContent="space-between">

          {/* Left: Brand & Description */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 28, md: 32 },
                letterSpacing: "0.5px",
                color: "white",
                mb: 2
              }}
            >
              ServNex
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: "rgba(255,255,255,0.85)", maxWidth: "340px", fontSize: "15px" }}>
              The fast, secure, and location-smart booking platform designed to simplify your everyday services. Experience service booking like never before.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                <IconButton
                  key={idx}
                  href="#"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.15)",
                    width: "42px",
                    height: "42px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.25)",
                      transform: "translateY(-3px)",
                    }
                  }}
                >
                  <Icon size={18} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Center: Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "16px" }}>
              Quick Links
            </Typography>
            <Stack spacing={2}>
              {["About Us", "Services", "How It Works", "Testimonials"].map((text) => (
                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
                  <Link
                    href="#"
                    underline="none"
                    sx={{
                      color: "rgba(255,255,255,0.85)",
                      fontSize: "15px",
                      transition: "all 0.2s ease",
                      "&:hover": { color: "white", transform: "translateX(5px)" },
                    }}
                  >
                    {text}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Center: Legal */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "16px" }}>
              Support
            </Typography>
            <Stack spacing={2}>
              {["Help Center", "Privacy Policy", "Terms of Service", "FAQs"].map((text) => (
                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
                  <Link
                    href="#"
                    underline="none"
                    sx={{
                      color: "rgba(255,255,255,0.85)",
                      fontSize: "15px",
                      transition: "all 0.2s ease",
                      "&:hover": { color: "white", transform: "translateX(5px)" },
                    }}
                  >
                    {text}
                  </Link>
                </Box>
              ))}
            </Stack>
          </Grid>

          {/* Right: Contact */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "16px" }}>
              Contact Us
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <FaEnvelope size={18} color="rgba(255,255,255,0.6)" style={{ marginTop: '2px' }} />
                <Box>
                  <Typography sx={{ color: "white", fontWeight: 700, fontSize: "14px", mb: 0.5 }}>Email:</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>Servnexofficial@gmail.com</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <FaPhoneAlt size={18} color="rgba(255,255,255,0.6)" style={{ marginTop: '2px' }} />
                <Box>
                  <Typography sx={{ color: "white", fontWeight: 700, fontSize: "14px", mb: 0.5 }}>Phone:</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>+91 90000 00000</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <FaMapMarkerAlt size={18} color="rgba(255,255,255,0.6)" style={{ marginTop: '2px' }} />
                <Box>
                  <Typography sx={{ color: "white", fontWeight: 700, fontSize: "14px", mb: 0.5 }}>HQ:</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "14px" }}>123 Service Street, Tech Park</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom */}
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.15)", mt: 4, mb: 3 }} />

        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
            © {new Date().getFullYear()} ServNex. All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
            Designed for absolute convenience.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer