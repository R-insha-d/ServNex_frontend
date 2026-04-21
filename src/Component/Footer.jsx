import React from 'react'
import { Box, Typography, Link, Grid, Divider, IconButton, Stack } from "@mui/material";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <Box sx={{ bgcolor: "var(--background)", pb: 0, px: 0, mt: 8 }}>
      <Box
        sx={{
          background: "var(--grad-primary)",
          color: "white",
          borderRadius: { xs: "32px 32px 0 0", md: "50px 50px 0 0" },
          px: { xs: 4, md: 10 },
          pt: { xs: 6, md: 8 },
          pb: { xs: 3, md: 4 },
          boxShadow: "var(--shadow-premium)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Subtle Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        <Grid container spacing={6} alignItems="flex-start">

          {/* Left: Brand & Description */}
          <Grid item xs={12} md={4} className="animate__animated animate__fadeInUp">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: 32, md: 40 },
                letterSpacing: "-1.5px",
                color: "white",
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              ServNex
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: "rgba(255,255,255,0.8)", maxWidth: "380px", fontSize: "16px" }}>
              Experience the next generation of service discovery. We combine institutional-grade security with unparalleled convenience to redefine how you book your lifestyle.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                <IconButton
                  key={idx}
                  href="#"
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    backdropFilter: 'blur(10px)',
                    width: "48px",
                    height: "48px",
                    transition: "all 0.4s ease",
                    border: '1px solid rgba(255,255,255,0.1)',
                    "&:hover": {
                      bgcolor: "white",
                      color: "var(--primary)",
                      transform: "translateY(-5px) rotate(10deg)",
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Icon size={20} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Center Column: Quick Links */}
          <Grid item xs={12} sm={4} md={2.5}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800, mb: 3, fontSize: "18px", textTransform: 'uppercase', letterSpacing: '1px' }}>
              Solutions
            </Typography>
            <Stack spacing={2}>
              {["Hotels & Stays", "Fine Dining", "Wellness & Spa", "Home Logistics"].map((text) => (
                <Link
                  key={text}
                  href="#"
                  underline="none"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "15px",
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    "&:hover": { color: "white", transform: "translateX(8px)" },
                    "&::before": { content: '">"', fontSize: '10px', opacity: 0 }
                  }}
                >
                  {text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Center Column: Support */}
          <Grid item xs={12} sm={4} md={2.5}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800, mb: 3, fontSize: "18px", textTransform: 'uppercase', letterSpacing: '1px' }}>
              Support
            </Typography>
            <Stack spacing={2}>
              {["Expert Help Center", "Privacy Architecture", "Client Relations", "Enterprise Solutions"].map((text) => (
                <Link
                  key={text}
                  href="#"
                  underline="none"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "15px",
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                    "&:hover": { color: "white", transform: "translateX(8px)" },
                  }}
                >
                  {text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Right: Connect */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800, mb: 3, fontSize: "18px", textTransform: 'uppercase', letterSpacing: '1px' }}>
              Connect
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <FaEnvelope size={18} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700 }}>Inquiries</Typography>
                  <Typography sx={{ color: "white", fontWeight: 600, fontSize: "15px" }}>official@servnex.com</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <FaPhoneAlt size={18} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700 }}>Support</Typography>
                  <Typography sx={{ color: "white", fontWeight: 600, fontSize: "15px" }}>+91 90000 00001</Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Global Footer Divider */}
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)", mt: 8, mb: 4 }} />

        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 3 }}>
          <Typography sx={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
            © {new Date().getFullYear()} ServNex Engineering. Engineered for Excellence.
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            {['Cookies', 'Trust Center', 'Security'].map(item => (
              <Link key={item} href="#" sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', "&:hover": { color: 'white' } }}>
                {item}
              </Link>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer