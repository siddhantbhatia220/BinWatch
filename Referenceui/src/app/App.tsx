import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MapPin,
  Bell,
  BarChart2,
  Users,
  Code2,
  Mail,
  ChevronDown,
  Github,
  Activity,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Settings,
  Search,
  Menu,
  X,
  Zap,
  Database,
  Server,
  Globe,
  Cpu,
  Radio,
  Lock,
  Download,
  Wifi,
  Eye,
  ArrowUpRight,
  Terminal,
  Package,
  Filter,
  CheckCircle2,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const areaData = [
  { t: "06:00", fill: 12 },
  { t: "08:00", fill: 28 },
  { t: "10:00", fill: 45 },
  { t: "12:00", fill: 71 },
  { t: "14:00", fill: 58 },
  { t: "16:00", fill: 84 },
  { t: "18:00", fill: 91 },
  { t: "20:00", fill: 76 },
];

const weeklyData = [
  { day: "Mon", collections: 12 },
  { day: "Tue", collections: 18 },
  { day: "Wed", collections: 15 },
  { day: "Thu", collections: 22 },
  { day: "Fri", collections: 28 },
  { day: "Sat", collections: 9 },
  { day: "Sun", collections: 6 },
];

const pieData = [
  { name: "Low", value: 42, color: "#10b981" },
  { name: "Medium", value: 31, color: "#f59e0b" },
  { name: "High", value: 18, color: "#ef4444" },
  { name: "Offline", value: 9, color: "#3f3f46" },
];

const bins = [
  { id: "BIN-001", location: "Main Entrance", fill: 91, online: true, status: "critical" },
  { id: "BIN-002", location: "Cafeteria East", fill: 63, online: true, status: "medium" },
  { id: "BIN-003", location: "Library Block", fill: 18, online: true, status: "low" },
  { id: "BIN-004", location: "Sports Complex", fill: 0, online: false, status: "offline" },
  { id: "BIN-005", location: "Admin Building", fill: 47, online: true, status: "medium" },
  { id: "BIN-006", location: "Parking Zone A", fill: 82, online: true, status: "high" },
];

const faqItems = [
  {
    q: "How does the fill level detection work?",
    a: "The HC-SR04 ultrasonic sensor fires pulses and measures echo time to calculate distance to the trash surface. Using the known bin height, fill percentage is derived and transmitted to the backend every 30 seconds via HTTP POST.",
  },
  {
    q: "What happens when a bin goes offline?",
    a: "When a bin misses 3 consecutive heartbeat signals (90 seconds), the system marks it offline, triggers a dashboard alert, and optionally sends an email notification to the administrator.",
  },
  {
    q: "How accurate is the GPS location?",
    a: "The GPS module provides accuracy within 2–5 meters under open sky. Coordinates are transmitted with every payload and displayed as live pins on the Google Maps integration.",
  },
  {
    q: "Can BinWatch scale to hundreds of bins?",
    a: "Yes. The Node.js backend with MongoDB is architected for thousands of concurrent bin connections via WebSocket. Horizontal scaling with load balancing is supported out of the box.",
  },
  {
    q: "Is there a mobile app?",
    a: "The dashboard is fully responsive and works seamlessly on mobile browsers. A native iOS and Android app is on the product roadmap for a future release.",
  },
  {
    q: "How are email alerts configured?",
    a: "Admins set per-bin fill thresholds in the settings panel. When a bin crosses the threshold, the system fires an email via Resend API containing bin ID, fill level, GPS coordinates, and a Google Maps link.",
  },
];

const techStack = [
  { name: "Node.js", icon: Server, label: "Runtime" },
  { name: "Express", icon: Globe, label: "Framework" },
  { name: "MongoDB", icon: Database, label: "Database" },
  { name: "JWT", icon: Lock, label: "Auth" },
  { name: "WebSockets", icon: Zap, label: "Realtime" },
  { name: "ESP8266", icon: Cpu, label: "Hardware" },
  { name: "HC-SR04", icon: Radio, label: "Sensor" },
  { name: "Google Maps", icon: MapPin, label: "Mapping" },
  { name: "Resend", icon: Mail, label: "Email" },
  { name: "REST API", icon: Code2, label: "Interface" },
  { name: "JavaScript", icon: Terminal, label: "Language" },
  { name: "npm", icon: Package, label: "Packages" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fillColor(fill: number, online: boolean) {
  if (!online) return "text-zinc-500";
  if (fill >= 80) return "text-red-400";
  if (fill >= 50) return "text-amber-400";
  return "text-emerald-400";
}

function fillBg(fill: number, online: boolean) {
  if (!online) return "bg-zinc-700";
  if (fill >= 80) return "bg-red-500";
  if (fill >= 50) return "bg-amber-500";
  return "bg-emerald-500";
}

function statusLabel(fill: number, online: boolean) {
  if (!online) return { text: "Offline", cls: "bg-zinc-800 text-zinc-400", dot: "bg-zinc-500" };
  if (fill >= 80) return { text: "Critical", cls: "bg-red-500/15 text-red-400", dot: "bg-red-400" };
  if (fill >= 50) return { text: "Medium", cls: "bg-amber-500/15 text-amber-400", dot: "bg-amber-400" };
  return { text: "Normal", cls: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["Features", "#features"],
    ["Technology", "#technology"],
    ["Dashboard", "#dashboard"],
    ["Architecture", "#architecture"],
    ["Contact", "#contact"],
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Trash2 size={13} className="text-black" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">BinWatch</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13px] text-zinc-400 hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com"
            className="flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white transition-colors"
          >
            <Github size={15} />
            <span>GitHub</span>
          </a>
          <button className="px-4 py-2 text-[13px] font-semibold bg-white text-black rounded-lg hover:bg-zinc-100 transition-colors">
            Login
          </button>
        </div>

        <button
          className="md:hidden text-zinc-400 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#111113] border-t border-white/[0.06] px-6 py-5 space-y-1">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="block text-sm text-zinc-400 hover:text-white py-2.5 border-b border-white/[0.04] last:border-0"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="pt-4 flex items-center gap-3">
            <a
              href="https://github.com"
              className="flex items-center gap-1.5 text-sm text-zinc-400"
            >
              <Github size={15} /> GitHub
            </a>
            <button className="ml-auto px-4 py-2 text-sm font-semibold bg-white text-black rounded-lg">
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Mini Dashboard (Hero) ────────────────────────────────────────────────────

function MiniDashboard() {
  return (
    <div className="relative w-full">
      <div className="bg-[#111113] rounded-2xl border border-white/[0.09] overflow-hidden shadow-2xl shadow-black/70">
        {/* Window chrome */}
        <div className="flex items-center px-4 py-3 border-b border-white/[0.06] bg-[#0d0d0f]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-4 text-[10px] font-mono text-zinc-500 flex-1">
            BinWatch — Admin Dashboard
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
          </div>
        </div>

        <div className="flex" style={{ height: 400 }}>
          {/* Sidebar */}
          <div className="w-36 border-r border-white/[0.05] p-3 flex-shrink-0 flex flex-col">
            <div className="space-y-0.5 flex-1">
              {[
                { icon: Activity, label: "Overview", active: true },
                { icon: Trash2, label: "Dustbins", active: false },
                { icon: MapPin, label: "Map", active: false },
                { icon: BarChart2, label: "Analytics", active: false },
                { icon: Bell, label: "Alerts", active: false },
                { icon: Users, label: "Users", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map(({ icon: Icon, label, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[10px] cursor-pointer transition-colors ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  <Icon size={11} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-bold text-emerald-400">A</span>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-300">Admin</p>
                  <p className="text-[8px] text-zinc-600">admin@city.gov</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-3 overflow-hidden flex flex-col gap-3">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total Bins", val: "24", sub: "+2 this week", color: "text-white" },
                { label: "Need Collection", val: "4", sub: ">80% fill level", color: "text-red-400" },
                { label: "Online Now", val: "22", sub: "91.6% uptime", color: "text-emerald-400" },
              ].map(({ label, val, sub, color }) => (
                <div
                  key={label}
                  className="bg-white/[0.03] rounded-xl p-2.5 border border-white/[0.05]"
                >
                  <p className="text-[9px] text-zinc-600 mb-1">{label}</p>
                  <p className={`text-xl font-bold font-mono leading-none ${color}`}>
                    {val}
                  </p>
                  <p className="text-[9px] text-zinc-700 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white/[0.03] rounded-xl p-2.5 border border-white/[0.05] flex-shrink-0">
              <p className="text-[9px] text-zinc-600 mb-2">Fill Level Trend — Today</p>
              <ResponsiveContainer width="100%" height={72}>
                <AreaChart
                  data={areaData}
                  margin={{ top: 2, right: 2, bottom: 0, left: -32 }}
                >
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 7, fill: "#52525b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="fill"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="url(#heroGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bin list */}
            <div className="space-y-1 flex-1">
              {bins.slice(0, 4).map((bin) => (
                <div
                  key={bin.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      bin.online ? "bg-emerald-400" : "bg-zinc-600"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-zinc-500 flex-shrink-0 w-12">
                    {bin.id}
                  </span>
                  <span className="text-[9px] text-zinc-400 flex-1 truncate">
                    {bin.location}
                  </span>
                  <div className="w-14 h-1.5 bg-white/[0.07] rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className={`h-full rounded-full ${fillBg(bin.fill, bin.online)}`}
                      style={{ width: `${bin.fill}%` }}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-mono flex-shrink-0 w-7 text-right ${fillColor(bin.fill, bin.online)}`}
                  >
                    {bin.online ? `${bin.fill}%` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating hardware cards */}
      <div className="absolute -left-16 top-12 bg-[#18181b] border border-white/[0.1] rounded-xl p-3 shadow-2xl shadow-black/50 hidden xl:block">
        <Cpu size={14} className="text-blue-400 mb-2" />
        <p className="text-[10px] font-mono font-semibold text-white">ESP8266</p>
        <p className="text-[9px] text-zinc-500">80MHz · WiFi</p>
      </div>

      <div className="absolute -right-16 top-16 bg-[#18181b] border border-white/[0.1] rounded-xl p-3 shadow-2xl shadow-black/50 hidden xl:block">
        <MapPin size={14} className="text-blue-400 mb-2" />
        <p className="text-[10px] font-mono font-semibold text-white">GPS Module</p>
        <p className="text-[9px] text-zinc-500">±2m accuracy</p>
      </div>

      <div className="absolute -left-14 bottom-20 bg-[#18181b] border border-white/[0.1] rounded-xl p-3 shadow-2xl shadow-black/50 hidden xl:block">
        <Radio size={14} className="text-emerald-400 mb-2" />
        <p className="text-[10px] font-mono font-semibold text-white">HC-SR04</p>
        <p className="text-[9px] text-zinc-500">Ultrasonic</p>
      </div>

      <div className="absolute -right-14 bottom-16 bg-[#18181b] border border-white/[0.1] rounded-xl p-3 shadow-2xl shadow-black/50 hidden xl:block">
        <Zap size={14} className="text-amber-400 mb-2" />
        <p className="text-[10px] font-mono font-semibold text-white">WebSocket</p>
        <p className="text-[9px] text-zinc-500">Real-time push</p>
      </div>

      <div className="absolute -right-16 top-[240px] bg-[#18181b] border border-white/[0.1] rounded-xl p-3 shadow-2xl shadow-black/50 hidden xl:block">
        <Mail size={14} className="text-purple-400 mb-2" />
        <p className="text-[10px] font-mono font-semibold text-white">Email Alerts</p>
        <p className="text-[9px] text-zinc-500">via Resend</p>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen pt-20 pb-24 px-6 relative overflow-hidden flex items-center"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      {/* Radial glow — emerald */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 xl:gap-28 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              v2.0 · Live IoT Monitoring Active
            </div>

            <h1 className="text-5xl xl:text-[64px] font-bold text-white tracking-tight leading-[1.06]">
              Smart Waste<br />
              Management,<br />
              <span className="text-zinc-500">Powered by</span>
              <br />
              <span className="text-emerald-400">Real-Time</span>
              <br />
              <span className="text-zinc-500">Intelligence.</span>
            </h1>

            <p className="text-[17px] text-zinc-400 leading-relaxed max-w-[440px]">
              Connect IoT-enabled dustbins to a live cloud dashboard. Monitor
              fill levels, GPS coordinates, and operational status — across your
              entire campus or city, from one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-white text-black text-[14px] font-semibold rounded-xl hover:bg-zinc-100 transition-all hover:shadow-lg hover:shadow-white/8 group">
                View Dashboard
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </button>
              <a
                href="https://github.com"
                className="flex items-center gap-2 px-5 py-3 border border-white/[0.12] text-zinc-300 text-[14px] font-medium rounded-xl hover:border-white/25 hover:text-white transition-all"
              >
                <Github size={15} />
                View on GitHub
              </a>
            </div>

            <div className="flex items-center gap-10 pt-1">
              {[
                { val: "100%", label: "Real-time" },
                { val: "<2s", label: "Response time" },
                { val: "24/7", label: "Monitoring" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold font-mono text-white">{val}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="relative xl:pl-10">
            <MiniDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trusted By ───────────────────────────────────────────────────────────────

function TrustedBy() {
  const orgs = [
    "Smart Cities",
    "Municipal Corporations",
    "Universities",
    "Campus Management",
    "Hospitals",
    "Airports",
    "Industrial Parks",
    "Private Organizations",
  ];

  return (
    <section className="border-t border-white/[0.06] py-14 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[10px] font-mono text-zinc-700 tracking-[0.18em] uppercase mb-8">
          Trusted by organizations that manage waste at scale
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
          {orgs.map((org) => (
            <span
              key={org}
              className="text-[13px] font-medium text-zinc-700 hover:text-zinc-500 transition-colors cursor-default"
            >
              {org}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Previews ─────────────────────────────────────────────────────────

function FillLevelPreview() {
  return (
    <div className="bg-[#111113] rounded-2xl border border-white/[0.08] p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-[11px] font-mono text-zinc-500">Live Fill Levels</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
        </div>
      </div>
      <div className="space-y-4">
        {bins.map((bin) => (
          <div key={bin.id} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    bin.online ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                />
                <span className="font-mono text-zinc-400">{bin.id}</span>
                <span className="text-zinc-600">{bin.location}</span>
              </div>
              <span className={`font-mono font-semibold ${fillColor(bin.fill, bin.online)}`}>
                {bin.online ? `${bin.fill}%` : "Offline"}
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${fillBg(bin.fill, bin.online)}`}
                style={{ width: bin.online ? `${bin.fill}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapPreview() {
  const markers = [
    { x: 20, y: 22, fill: 91, id: "BIN-001", online: true },
    { x: 58, y: 38, fill: 63, id: "BIN-002", online: true },
    { x: 22, y: 64, fill: 18, id: "BIN-003", online: true },
    { x: 78, y: 68, fill: 0, id: "BIN-004", online: false },
    { x: 52, y: 56, fill: 47, id: "BIN-005", online: true },
    { x: 82, y: 28, fill: 82, id: "BIN-006", online: true },
  ];

  const markerColor = (fill: number, online: boolean) => {
    if (!online) return "#52525b";
    if (fill >= 80) return "#ef4444";
    if (fill >= 50) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="bg-[#111113] rounded-2xl border border-white/[0.08] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-500">Live Map View</span>
        <div className="flex items-center gap-4 text-[10px]">
          {[
            { c: "bg-emerald-400", l: "Low" },
            { c: "bg-amber-400", l: "Medium" },
            { c: "bg-red-400", l: "High" },
            { c: "bg-zinc-600", l: "Offline" },
          ].map(({ c, l }) => (
            <span key={l} className="flex items-center gap-1.5 text-zinc-500">
              <span className={`w-1.5 h-1.5 rounded-full ${c} inline-block`} />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div
        className="relative bg-[#0d0f10]"
        style={{ height: 260 }}
      >
        {/* Grid lines */}
        <svg width="100%" height="100%" className="absolute inset-0 opacity-[0.07]">
          {Array.from({ length: 7 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={`${(i + 1) * 12.5}%`}
              x2="100%"
              y2={`${(i + 1) * 12.5}%`}
              stroke="#fff"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={`${(i + 1) * 10}%`}
              y1="0"
              x2={`${(i + 1) * 10}%`}
              y2="100%"
              stroke="#fff"
              strokeWidth="0.5"
            />
          ))}
        </svg>
        {/* Roads */}
        <svg width="100%" height="100%" className="absolute inset-0">
          <line x1="0" y1="45%" x2="100%" y2="45%" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <line x1="55%" y1="0" x2="55%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        </svg>
        {/* Markers */}
        {markers.map((m) => {
          const c = markerColor(m.fill, m.online);
          return (
            <div
              key={m.id}
              className="absolute group cursor-pointer"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125"
                style={{
                  borderColor: c,
                  backgroundColor: `${c}18`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c }}
                />
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#1c1c1e] border border-white/[0.1] rounded-lg px-3 py-2 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                <p className="font-mono font-semibold text-white">{m.id}</p>
                <p style={{ color: c }}>
                  {m.online ? `${m.fill}% full` : "Offline"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertPreview() {
  return (
    <div className="bg-[#111113] rounded-2xl border border-white/[0.08] p-6">
      <div className="flex items-center gap-2 mb-5">
        <Bell size={13} className="text-amber-400" />
        <span className="text-[11px] font-mono text-zinc-500">Recent Alerts</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-mono">
          3 new
        </span>
      </div>
      <div className="space-y-3">
        {[
          {
            id: "BIN-001",
            loc: "Main Entrance",
            fill: 91,
            time: "2 min ago",
            type: "critical",
          },
          {
            id: "BIN-006",
            loc: "Parking Zone A",
            fill: 82,
            time: "14 min ago",
            type: "high",
          },
          {
            id: "BIN-002",
            loc: "Cafeteria East",
            fill: 63,
            time: "1h ago",
            type: "medium",
          },
        ].map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${
              alert.type === "critical"
                ? "bg-red-500/[0.06] border-red-500/20"
                : alert.type === "high"
                ? "bg-amber-500/[0.06] border-amber-500/20"
                : "bg-white/[0.03] border-white/[0.06]"
            }`}
          >
            <AlertTriangle
              size={13}
              className={`mt-0.5 flex-shrink-0 ${
                alert.type === "critical"
                  ? "text-red-400"
                  : alert.type === "high"
                  ? "text-amber-400"
                  : "text-zinc-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-white">
                  {alert.id}
                </span>
                <span className="text-[10px] text-zinc-600">{alert.time}</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {alert.loc} — {alert.fill}% fill level
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <p className="text-[10px] text-zinc-600">Email notification sent</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPreview() {
  return (
    <div className="bg-[#111113] rounded-2xl border border-white/[0.08] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-500">
          Weekly Collections
        </span>
        <span className="text-[10px] text-zinc-600 border border-white/[0.08] px-2 py-0.5 rounded">
          This Week
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart
          data={weeklyData}
          margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
        >
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#52525b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#52525b" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              fontSize: 11,
              color: "#fff",
            }}
            labelStyle={{ color: "#a1a1aa" }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar
            dataKey="collections"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            opacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-white/[0.05]">
        {[
          { label: "Avg. Fill Rate", val: "67%", delta: "+8%" },
          { label: "Collections", val: "110", delta: "+12" },
          { label: "Alerts Sent", val: "23", delta: "-4" },
        ].map(({ label, val, delta }) => (
          <div key={label} className="text-center">
            <p className="text-xl font-bold font-mono text-white">{val}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">{label}</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">{delta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      desc: "Every dustbin pushes fill level, distance, and status data to the backend every 30 seconds via HTTP POST. The dashboard updates instantly via WebSocket broadcast — no page reload, no polling.",
      preview: <FillLevelPreview />,
      accent: "emerald" as const,
    },
    {
      icon: MapPin,
      title: "GPS Tracking",
      desc: "Each bin transmits GPS coordinates with every payload. View live pin locations on Google Maps, filter by zone, and plan optimal collection routes to cut fuel costs.",
      preview: <MapPreview />,
      accent: "blue" as const,
    },
    {
      icon: Mail,
      title: "Instant Email Alerts",
      desc: "Configure per-bin fill thresholds. When a bin exceeds its limit, the system fires an email via Resend with bin ID, fill percentage, GPS coordinates, and a direct Google Maps link.",
      preview: <AlertPreview />,
      accent: "amber" as const,
    },
    {
      icon: BarChart2,
      title: "Analytics & Reporting",
      desc: "Interactive charts surface fill trends, peak collection windows, per-zone statistics, and historical data. Export as CSV for municipal reporting and compliance audits.",
      preview: <AnalyticsPreview />,
      accent: "emerald" as const,
    },
  ];

  const accentMap = {
    emerald: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-400",
      label: "text-emerald-400",
    },
    blue: {
      bg: "bg-blue-500/10",
      icon: "text-blue-400",
      label: "text-blue-400",
    },
    amber: {
      bg: "bg-amber-500/10",
      icon: "text-amber-400",
      label: "text-amber-400",
    },
  };

  return (
    <section id="features" className="py-32 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <p className="text-[10px] font-mono text-emerald-400 tracking-[0.15em] uppercase mb-4">
            Capabilities
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight max-w-lg leading-tight">
            Everything you need to manage waste intelligently
          </h2>
        </div>

        <div className="space-y-28">
          {features.map((feat, i) => {
            const ac = accentMap[feat.accent];
            return (
              <div
                key={feat.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-center`}
              >
                <div
                  className={
                    i % 2 === 1 ? "lg:order-2" : ""
                  }
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${ac.bg} mb-6`}
                  >
                    <feat.icon size={18} className={ac.icon} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-[15px] max-w-md">
                    {feat.desc}
                  </p>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  {feat.preview}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Large Dashboard Preview ──────────────────────────────────────────────────

function DashboardSection() {
  return (
    <section id="dashboard" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-[10px] font-mono text-blue-400 tracking-[0.15em] uppercase mb-4">
              Live Dashboard
            </p>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Command center for your<br />entire waste network
            </h2>
          </div>
          <button className="flex items-center gap-2 text-[13px] text-zinc-400 border border-white/[0.1] px-4 py-2.5 rounded-xl hover:text-white hover:border-white/20 transition-colors">
            View Live Demo <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="bg-[#0d0d0f] rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/60">
          {/* Top bar */}
          <div className="flex items-center px-5 py-3.5 border-b border-white/[0.06] bg-[#111113] gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-xs font-mono text-zinc-400">BinWatch Admin</span>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                <Search size={11} className="text-zinc-500" />
                <span className="text-[11px] text-zinc-600">
                  Search bins, locations, alerts...
                </span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="relative p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                <Bell size={15} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-400">A</span>
              </div>
            </div>
          </div>

          <div className="flex" style={{ minHeight: 580 }}>
            {/* Sidebar */}
            <div className="w-52 flex-shrink-0 border-r border-white/[0.05] p-4 flex flex-col">
              <div className="space-y-0.5 flex-1">
                {[
                  { icon: Activity, label: "Overview", active: true, badge: null },
                  { icon: Trash2, label: "Dustbins", active: false, badge: "24" },
                  { icon: MapPin, label: "Map", active: false, badge: null },
                  { icon: BarChart2, label: "Analytics", active: false, badge: null },
                  { icon: Bell, label: "Alerts", active: false, badge: "3" },
                  { icon: Users, label: "Users", active: false, badge: null },
                  { icon: Settings, label: "Settings", active: false, badge: null },
                ].map(({ icon: Icon, label, active, badge }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} />
                      <span className="text-xs">{label}</span>
                    </div>
                    {badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          label === "Alerts"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/[0.07] text-zinc-400"
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 space-y-5 overflow-hidden">
              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Bins",
                    val: "24",
                    sub: "2 added this week",
                    icon: Trash2,
                    color: "zinc",
                  },
                  {
                    label: "Online Now",
                    val: "22",
                    sub: "91.6% uptime",
                    icon: Wifi,
                    color: "emerald",
                  },
                  {
                    label: "Need Collection",
                    val: "4",
                    sub: ">80% fill level",
                    icon: AlertTriangle,
                    color: "red",
                  },
                  {
                    label: "Alerts Today",
                    val: "8",
                    sub: "3 unresolved",
                    icon: Bell,
                    color: "amber",
                  },
                ].map(({ label, val, sub, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-zinc-500">{label}</span>
                      <Icon
                        size={13}
                        className={
                          color === "emerald"
                            ? "text-emerald-400"
                            : color === "red"
                            ? "text-red-400"
                            : color === "amber"
                            ? "text-amber-400"
                            : "text-zinc-600"
                        }
                      />
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">{val}</p>
                    <p className="text-[10px] text-zinc-700 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-zinc-500">
                      Avg. Fill Level — Last 24h
                    </span>
                    <div className="flex gap-1">
                      {["24h", "7d", "30d"].map((p, i) => (
                        <button
                          key={p}
                          className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                            i === 0
                              ? "bg-white/[0.1] text-white"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={130}>
                    <AreaChart
                      data={areaData}
                      margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                    >
                      <defs>
                        <linearGradient
                          id="dashGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="t"
                        tick={{ fontSize: 10, fill: "#52525b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#18181b",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#fff",
                        }}
                        labelStyle={{ color: "#a1a1aa" }}
                        cursor={{ stroke: "rgba(255,255,255,0.06)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="fill"
                        stroke="#10b981"
                        strokeWidth={1.5}
                        fill="url(#dashGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                  <span className="text-[11px] font-mono text-zinc-500 block mb-4">
                    Status Distribution
                  </span>
                  <div className="flex justify-center">
                    <PieChart width={130} height={130}>
                      <Pie
                        data={pieData}
                        cx={65}
                        cy={65}
                        innerRadius={38}
                        outerRadius={58}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                  <div className="space-y-2 mt-2">
                    {pieData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-[11px] text-zinc-400">
                            {d.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-300">
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <span className="text-[11px] font-mono text-zinc-500">
                    All Dustbins
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 border border-white/[0.08] px-2.5 py-1 rounded-lg transition-colors">
                      <Filter size={10} /> Filter
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 border border-white/[0.08] px-2.5 py-1 rounded-lg transition-colors">
                      <Download size={10} /> Export
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        {[
                          "Bin ID",
                          "Location",
                          "Fill Level",
                          "Status",
                          "Last Seen",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[10px] font-medium text-zinc-600 px-4 py-2.5 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bins.map((bin) => {
                        const s = statusLabel(bin.fill, bin.online);
                        return (
                          <tr
                            key={bin.id}
                            className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span className="text-xs font-mono text-white">
                                {bin.id}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-zinc-400">
                                {bin.location}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${fillBg(bin.fill, bin.online)}`}
                                    style={{
                                      width: bin.online ? `${bin.fill}%` : "0%",
                                    }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-mono ${fillColor(bin.fill, bin.online)}`}
                                >
                                  {bin.online ? `${bin.fill}%` : "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full ${s.cls}`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${s.dot} flex-shrink-0`}
                                />
                                {s.text}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs text-zinc-700 font-mono">
                                {bin.online ? "Just now" : "2h ago"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
                                <Eye size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function ArchitectureSection() {
  const steps = [
    {
      icon: Radio,
      label: "HC-SR04",
      sub: "Ultrasonic Sensor",
      color: "#3b82f6",
    },
    {
      icon: Cpu,
      label: "ESP8266",
      sub: "Microcontroller",
      color: "#8b5cf6",
    },
    {
      icon: Wifi,
      label: "WiFi",
      sub: "IEEE 802.11 b/g/n",
      color: "#06b6d4",
    },
    {
      icon: Globe,
      label: "REST API",
      sub: "HTTP POST",
      color: "#10b981",
    },
    {
      icon: Server,
      label: "Node.js",
      sub: "Backend Server",
      color: "#84cc16",
    },
    {
      icon: Database,
      label: "MongoDB",
      sub: "Data Storage",
      color: "#22c55e",
    },
    {
      icon: Zap,
      label: "WebSocket",
      sub: "Realtime Push",
      color: "#f59e0b",
    },
    {
      icon: BarChart2,
      label: "Dashboard",
      sub: "Admin Interface",
      color: "#3b82f6",
    },
  ];

  return (
    <section
      id="architecture"
      className="py-32 px-6 border-t border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[10px] font-mono text-purple-400 tracking-[0.15em] uppercase mb-4">
            System Architecture
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-5">
            From sensor to screen
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto text-[15px] leading-relaxed">
            Every component in the BinWatch stack communicates with precision.
            Data flows from hardware to cloud to dashboard in under 2 seconds.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-wrap justify-center items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="group flex flex-col items-center w-24 sm:w-28">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/[0.08] bg-[#111113] mb-3 group-hover:border-white/20 transition-all duration-300"
                  style={{
                    boxShadow: `0 0 24px ${step.color}12`,
                  }}
                >
                  <step.icon size={22} style={{ color: step.color }} />
                </div>
                <p className="text-xs font-semibold text-white text-center">
                  {step.label}
                </p>
                <p className="text-[10px] text-zinc-600 text-center mt-0.5">
                  {step.sub}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="w-6 sm:w-8 flex-shrink-0 -mt-8 flex items-center justify-center">
                  <div className="w-full h-px bg-white/[0.1] relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-t-transparent border-b-transparent border-l-white/20" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Code sample */}
        <div className="mt-20 bg-[#0d0d0f] rounded-2xl border border-white/[0.08] p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
            <Terminal size={13} className="text-zinc-500" />
            <span className="text-[11px] font-mono text-zinc-500">
              Sample payload — POST /api/bins/update
            </span>
            <span className="ml-auto text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 rounded">
              200 OK
            </span>
          </div>
          <pre className="text-[12px] font-mono text-zinc-300 leading-relaxed overflow-x-auto">
            <span className="text-zinc-600">{"{"}</span>
            {`
  `}
            <span className="text-blue-400">"binId"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-emerald-400">"BIN-001"</span>
            <span className="text-zinc-600">,</span>
            {`
  `}
            <span className="text-blue-400">"fillLevel"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-amber-400">91</span>
            <span className="text-zinc-600">,</span>
            {`
  `}
            <span className="text-blue-400">"distance"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-amber-400">4.5</span>
            <span className="text-zinc-600">,</span>
            {`
  `}
            <span className="text-blue-400">"location"</span>
            <span className="text-zinc-600">{": {"}</span>
            {`
    `}
            <span className="text-blue-400">"lat"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-amber-400">12.9716</span>
            <span className="text-zinc-600">,</span>
            {`
    `}
            <span className="text-blue-400">"lng"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-amber-400">77.5946</span>
            {`
  `}
            <span className="text-zinc-600">{"}"}</span>
            <span className="text-zinc-600">,</span>
            {`
  `}
            <span className="text-blue-400">"timestamp"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-emerald-400">"2025-01-15T14:32:10Z"</span>
            <span className="text-zinc-600">,</span>
            {`
  `}
            <span className="text-blue-400">"online"</span>
            <span className="text-zinc-600">: </span>
            <span className="text-purple-400">true</span>
            {`
`}
            <span className="text-zinc-600">{"}"}</span>
          </pre>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "Sensor Reads Level",
      desc: "HC-SR04 fires ultrasonic pulses, measures the echo return time, and calculates the exact distance to the trash surface.",
    },
    {
      n: "02",
      title: "ESP8266 Processes",
      desc: "Microcontroller converts distance to fill percentage, appends GPS coordinates, and queues the HTTP POST request.",
    },
    {
      n: "03",
      title: "Backend Stores Data",
      desc: "Node.js validates the JWT token, writes the payload to MongoDB, and acknowledges the device with a 200 response.",
    },
    {
      n: "04",
      title: "Dashboard Updates",
      desc: "WebSocket broadcasts the update to all connected clients. Cards, charts, and tables refresh instantly — no polling needed.",
    },
    {
      n: "05",
      title: "Alert if Full",
      desc: "Threshold check triggers the Resend API. Admin receives an email with bin ID, fill level, GPS coordinates, and a Maps link.",
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[10px] font-mono text-emerald-400 tracking-[0.15em] uppercase mb-4">
            Process
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.n} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-1/2 w-full h-px bg-white/[0.06] z-0" />
              )}
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#111113] border border-white/[0.1] text-[11px] font-mono text-zinc-500 mb-5 group-hover:border-white/20 group-hover:text-white transition-all">
                  {step.n}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────

function TechStackSection() {
  return (
    <section id="technology" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[10px] font-mono text-blue-400 tracking-[0.15em] uppercase mb-4">
            Technology
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Built with the right tools
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {techStack.map(({ name, icon: Icon, label }) => (
            <div
              key={name}
              className="group bg-[#111113] rounded-xl border border-white/[0.06] p-4 flex flex-col items-center gap-3 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all cursor-default"
            >
              <Icon
                size={20}
                className="text-zinc-500 group-hover:text-zinc-200 transition-colors"
              />
              <div className="text-center">
                <p className="text-xs font-medium text-zinc-200">{name}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {[
            { val: "100%", label: "Real-time Updates", sub: "WebSocket push" },
            { val: "<2s", label: "Response Time", sub: "Sensor to dashboard" },
            { val: "24/7", label: "Monitoring", sub: "Zero planned downtime" },
            { val: "±2m", label: "GPS Accuracy", sub: "Under open sky" },
          ].map(({ val, label, sub }) => (
            <div
              key={label}
              className="bg-[#09090b] px-8 py-12 text-center hover:bg-[#0f0f11] transition-colors"
            >
              <p className="text-5xl font-bold font-mono text-white mb-3">
                {val}
              </p>
              <p className="text-sm font-medium text-zinc-300">{label}</p>
              <p className="text-xs text-zinc-600 mt-1.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Use Cases ────────────────────────────────────────────────────────────────

function UseCasesSection() {
  const cases = [
    {
      title: "Smart Cities",
      desc: "Monitor thousands of public bins across districts. Optimize collection routes and reduce fuel costs by up to 40%.",
    },
    {
      title: "Universities",
      desc: "Keep campuses pristine without over-collecting. Automate maintenance alerts to facilities teams automatically.",
    },
    {
      title: "Hospitals",
      desc: "Mission-critical cleanliness. Instant alerts for bins in high-traffic clinical zones and sterile areas.",
    },
    {
      title: "Airports",
      desc: "Manage hundreds of terminals and gates. Prevent overflows during peak passenger hours with predictive alerts.",
    },
    {
      title: "Industrial Parks",
      desc: "Separate hazardous and general waste streams. Audit-ready logs for environmental compliance reporting.",
    },
    {
      title: "Municipal Corporations",
      desc: "City-wide deployment with department dashboards, role-based access controls, and automated daily digests.",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-[10px] font-mono text-zinc-600 tracking-[0.15em] uppercase mb-4">
            Use Cases
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight max-w-lg leading-tight">
            Designed for every organization that manages waste at scale
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c, i) => (
            <div
              key={c.title}
              className="group bg-[#111113] rounded-xl border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-mono text-zinc-700">
                  0{i + 1}
                </span>
                <ArrowUpRight
                  size={14}
                  className="text-zinc-700 group-hover:text-zinc-500 transition-colors"
                />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                {c.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-2xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-[10px] font-mono text-zinc-600 tracking-[0.15em] uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Questions answered
          </h2>
        </div>
        <div>
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-white/[0.06]">
              <button
                className="w-full flex items-center justify-between py-5 text-left gap-6 group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className={`text-[14px] font-medium transition-colors leading-snug ${
                    open === i
                      ? "text-white"
                      : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                >
                  {item.q}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-zinc-600 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180 text-zinc-400" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  open === i ? "max-h-48 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-[14px] text-zinc-500 leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section id="contact" className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-400 text-[11px] font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Open Source · MIT License
        </div>
        <h2 className="text-5xl font-bold text-white tracking-tight leading-tight mb-6">
          Ready to make your<br />city smarter?
        </h2>
        <p className="text-zinc-400 text-[16px] leading-relaxed mb-10 max-w-lg mx-auto">
          BinWatch is open source and free to deploy. Star the repo, fork it,
          and build on top of it. Or reach out for enterprise support.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white text-black text-[14px] font-semibold rounded-xl hover:bg-zinc-100 transition-colors group">
            View Dashboard
            <ArrowRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
          <a
            href="https://github.com"
            className="flex items-center gap-2 px-6 py-3.5 border border-white/[0.12] text-zinc-300 text-[14px] font-medium rounded-xl hover:border-white/25 hover:text-white transition-all"
          >
            <Github size={15} /> Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Trash2 size={12} className="text-black" />
              </div>
              <span className="text-sm font-semibold text-white">BinWatch</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-[200px]">
              Real-time IoT waste management platform for smart organizations.
            </p>
            <p className="text-[11px] text-zinc-800 mt-5">Powered by Ares</p>
          </div>

          {[
            {
              title: "Quick Links",
              links: [
                "Home",
                "Features",
                "Dashboard",
                "Architecture",
                "Contact",
              ],
            },
            {
              title: "Resources",
              links: [
                "Documentation",
                "GitHub",
                "REST API Docs",
                "Hardware Guide",
                "Changelog",
              ],
            },
            {
              title: "Legal",
              links: [
                "Privacy Policy",
                "Terms of Service",
                "MIT License",
                "Open Source",
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-[10px] font-semibold text-zinc-500 mb-4 tracking-[0.12em] uppercase">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-700">
            © 2025 BinWatch. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              className="text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              <Github size={16} />
            </a>
            <a
              href="mailto:contact@binwatch.io"
              className="text-zinc-700 hover:text-zinc-400 transition-colors"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      className="min-h-screen bg-[#09090b] text-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Navbar />
      <HeroSection />
      <TrustedBy />
      <FeaturesSection />
      <DashboardSection />
      <ArchitectureSection />
      <HowItWorksSection />
      <TechStackSection />
      <StatsSection />
      <UseCasesSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
