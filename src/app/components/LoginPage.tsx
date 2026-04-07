import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, User, Lock, Phone, Mail, MapPin, ChevronRight,
  Bike, Info, X, Home, AlertCircle
} from "lucide-react";
import { DUMMY_ACCOUNTS } from "./mockData";

type View = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showHints, setShowHints] = useState(false);

  const [regData, setRegData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    password: "",
    confirmPassword: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    const account = DUMMY_ACCOUNTS.find(
      (a) => a.username === username && a.password === password
    );
    if (!account) {
      setError("Invalid credentials. Please check your username and password.");
      return;
    }
    setError("");
    navigate(`/${account.role}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const handleRegister = () => {
    setRegError("");
    if (!regData.fullName || !regData.phone || !regData.address || !regData.password) {
      setRegError("Please fill in all required fields.");
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }
    if (regData.phone.length < 11) {
      setRegError("Please enter a valid 11-digit phone number.");
      return;
    }
    setRegSuccess(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0F1F3D 0%, #1E3A5F 50%, #162D4A 100%)" }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "#4A90D9" }} />
        <div className="absolute -bottom-48 -right-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "#4A90D9" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "#E53935" }}>
              <Bike className="text-white" size={28} />
            </div>
            <div className="text-left">
              <h1 className="text-white" style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1, letterSpacing: "0.05em" }}>SUGO</h1>
              <p style={{ color: "#93C5FD", fontSize: "0.7rem", fontWeight: 500, letterSpacing: "0.15em" }}>ERRAND SERVICE MANAGEMENT</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {view === "login" ? (
            <div className="p-8">
              <h2 className="text-center mb-1" style={{ color: "#1F2937" }}>Welcome Back</h2>
              <p className="text-center mb-6" style={{ color: "#6B7280", fontSize: "0.875rem" }}>Sign in to your Sugo account</p>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <AlertCircle size={16} style={{ color: "#EF4444" }} />
                  <p style={{ color: "#DC2626", fontSize: "0.875rem" }}>{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block mb-1.5" style={{ color: "#374151", fontSize: "0.875rem" }}>Username</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                      style={{
                        background: "#F9FAFB",
                        border: "1.5px solid #E5E7EB",
                        color: "#1F2937",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5" style={{ color: "#374151", fontSize: "0.875rem" }}>Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition-all"
                      style={{
                        background: "#F9FAFB",
                        border: "1.5px solid #E5E7EB",
                        color: "#1F2937",
                        fontSize: "0.875rem"
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#9CA3AF" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: "#1E3A5F", fontSize: "0.9rem", fontWeight: 600 }}
                >
                  Sign In <ChevronRight size={16} />
                </button>
              </div>

              {/* Hints toggle */}
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full flex items-center justify-center gap-2 mt-4 py-2 rounded-xl transition-all"
                style={{ color: "#6B7280", fontSize: "0.8rem", background: "#F3F4F6" }}
              >
                <Info size={14} />
                {showHints ? "Hide" : "Show"} demo credentials
              </button>

              {showHints && (
                <div className="mt-3 p-4 rounded-xl" style={{ background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
                  <p style={{ color: "#0369A1", fontSize: "0.75rem", fontWeight: 700, marginBottom: "8px" }}>DEMO ACCOUNTS</p>
                  <div className="space-y-2">
                    {[
                      { role: "Owner", user: "owner", pass: "owner123", color: "#1E3A5F" },
                      { role: "Dispatcher", user: "dispatcher", pass: "dispatch123", color: "#2563EB" },
                      { role: "Rider", user: "rider01", pass: "rider123", color: "#DC2626" },
                      { role: "Customer", user: "customer", pass: "customer123", color: "#D946EF" },
                    ].map((acc) => (
                      <div key={acc.role} className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-white" style={{ background: acc.color, fontSize: "0.7rem" }}>{acc.role}</span>
                        <span style={{ color: "#1F2937", fontSize: "0.75rem" }}>
                          <span style={{ color: "#6B7280" }}>user:</span> <strong>{acc.user}</strong> &nbsp;
                          <span style={{ color: "#6B7280" }}>pass:</span> <strong>{acc.pass}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Account */}
              <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E5E7EB" }}>
                <p className="text-center mb-3" style={{ color: "#6B7280", fontSize: "0.85rem" }}>New to Sugo? Join as a customer</p>
                <button
                  onClick={() => setView("register")}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  style={{ border: "1.5px solid #E91E63", color: "#E91E63", fontSize: "0.875rem", fontWeight: 600 }}
                >
                  Create a Customer Account
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setView("login"); setRegSuccess(false); setRegError(""); }} style={{ color: "#6B7280" }}>
                  <X size={20} />
                </button>
                <div>
                  <h2 style={{ color: "#1F2937" }}>Create Account</h2>
                  <p style={{ color: "#6B7280", fontSize: "0.8rem" }}>Register as a Sugo Customer</p>
                </div>
              </div>

              {regSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#D1FAE5" }}>
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 style={{ color: "#1F2937" }}>Account Created!</h3>
                  <p className="mt-2 mb-6" style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                    Welcome to Sugo, <strong>{regData.fullName}</strong>! Your account is ready.
                  </p>
                  <button
                    onClick={() => { setView("login"); setRegSuccess(false); setUsername("customer"); setPassword("customer123"); setRegData({ fullName: "", phone: "", email: "", address: "", landmark: "", password: "", confirmPassword: "" }); }}
                    className="px-6 py-3 rounded-xl text-white"
                    style={{ background: "#1E3A5F", fontSize: "0.875rem" }}
                  >
                    Sign In Now
                  </button>
                </div>
              ) : (
                <>
                  {regError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                      <AlertCircle size={16} style={{ color: "#EF4444" }} />
                      <p style={{ color: "#DC2626", fontSize: "0.8rem" }}>{regError}</p>
                    </div>
                  )}

                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {[
                      { label: "Full Name *", key: "fullName", placeholder: "Juan dela Cruz", icon: <User size={15} /> },
                      { label: "Phone Number *", key: "phone", placeholder: "09XXXXXXXXX", icon: <Phone size={15} /> },
                      { label: "Email Address", key: "email", placeholder: "juan@email.com", icon: <Mail size={15} /> },
                      { label: "Complete Address *", key: "address", placeholder: "House No., Street, Barangay, City", icon: <Home size={15} /> },
                      { label: "Delivery Landmark", key: "landmark", placeholder: "e.g. Near SM, beside sari-sari store", icon: <MapPin size={15} /> },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block mb-1" style={{ color: "#374151", fontSize: "0.8rem" }}>{field.label}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }}>{field.icon}</span>
                          <input
                            type={field.key === "email" ? "email" : "text"}
                            value={regData[field.key as keyof typeof regData]}
                            onChange={(e) => setRegData({ ...regData, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none"
                            style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#1F2937", fontSize: "0.8rem" }}
                          />
                        </div>
                      </div>
                    ))}

                    {[
                      { label: "Password *", key: "password" },
                      { label: "Confirm Password *", key: "confirmPassword" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block mb-1" style={{ color: "#374151", fontSize: "0.8rem" }}>{field.label}</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                          <input
                            type="password"
                            value={regData[field.key as keyof typeof regData]}
                            onChange={(e) => setRegData({ ...regData, [field.key]: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none"
                            style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#1F2937", fontSize: "0.8rem" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 mb-4" style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
                    By registering, you agree to Sugo's Terms of Service and Privacy Policy (Philippines Data Privacy Act of 2012).
                  </p>

                  <button
                    onClick={handleRegister}
                    className="w-full py-3 rounded-xl text-white"
                    style={{ background: "#E91E63", fontSize: "0.875rem", fontWeight: 600 }}
                  >
                    Create My Account
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center mt-4" style={{ color: "#64748B", fontSize: "0.75rem" }}>
          Sugo Services On the Go &bull; Tacurong City, Sultan Kudarat
        </p>
      </div>
    </div>
  );
}
