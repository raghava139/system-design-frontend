const express = require("express");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// Demo user/session
const SESSION_ID = "user-session-123";

// Login - creates an authenticated session
app.get("/login", (req, res) => {
  res.cookie("sessionId", SESSION_ID, {
    httpOnly: true,
    secure: false, // true in HTTPS production
    sameSite: "lax"
  });

  res.send("Logged in successfully. <a href='/'>Go to app</a>");
});

// Generate CSRF token
app.get("/csrf-token", (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");

  // Store token in a cookie for this demo
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: false,
    sameSite: "lax"
  });

  res.json({ csrfToken: token });
});

// Vulnerable endpoint
app.post("/vulnerable-transfer", (req, res) => {
  const session = req.cookies.sessionId;

  if (session !== SESSION_ID) {
    return res.status(401).send("Not authenticated");
  }

  console.log("VULNERABLE TRANSFER:", req.body);

  res.send("Transfer successful — CSRF protection was NOT used.");
});

// Protected endpoint
app.post("/secure-transfer", (req, res) => {
  const session = req.cookies.sessionId;

  if (session !== SESSION_ID) {
    return res.status(401).send("Not authenticated");
  }

  // 1. CSRF token validation
  const csrfTokenFromCookie = req.cookies.csrfToken;
  const csrfTokenFromRequest = req.body.csrfToken;

  if (
    !csrfTokenFromCookie ||
    !csrfTokenFromRequest ||
    csrfTokenFromCookie !== csrfTokenFromRequest
  ) {
    return res.status(403).send("CSRF validation failed");
  }

  // 2. Origin validation
  const origin = req.get("Origin");

  if (origin && origin !== "http://localhost:3000") {
    return res.status(403).send("Invalid Origin");
  }

  console.log("SECURE TRANSFER:", req.body);

  res.send("Transfer successful — CSRF checks passed.");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});