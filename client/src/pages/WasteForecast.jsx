/* eslint-disable no-unused-vars */
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import {
    Package, TrendingUp, TrendingDown, AlertTriangle, Users,
    Upload, Loader2, CheckCircle, Zap, MapPin, Clock, Leaf,
    BarChart3, ChevronRight, Star
} from "lucide-react"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const allData = {
    "3M": [
        { month: "Oct", historical: 4.2, forecast: null, upper: null, lower: null },
        { month: "Nov", historical: 4.8, forecast: null, upper: null, lower: null },
        { month: "Dec", historical: 5.1, forecast: null, upper: null, lower: null },
        { month: "Jan", historical: null, forecast: 5.8, upper: 6.3, lower: 5.3 },
        { month: "Feb", historical: null, forecast: 6.1, upper: 6.8, lower: 5.4 },
        { month: "Mar", historical: null, forecast: 5.9, upper: 6.7, lower: 5.1 },
    ],
    "6M": [
        { month: "Aug", historical: 3.5, forecast: null, upper: null, lower: null },
        { month: "Sep", historical: 3.9, forecast: null, upper: null, lower: null },
        { month: "Oct", historical: 4.2, forecast: null, upper: null, lower: null },
        { month: "Nov", historical: 4.8, forecast: null, upper: null, lower: null },
        { month: "Dec", historical: 5.1, forecast: null, upper: null, lower: null },
        { month: "Jan", historical: null, forecast: 5.8, upper: 6.3, lower: 5.3 },
        { month: "Feb", historical: null, forecast: 6.1, upper: 6.8, lower: 5.4 },
        { month: "Mar", historical: null, forecast: 5.9, upper: 6.7, lower: 5.1 },
        { month: "Apr", historical: null, forecast: 6.4, upper: 7.2, lower: 5.6 },
        { month: "May", historical: null, forecast: 6.0, upper: 6.9, lower: 5.1 },
    ],
    "12M": [
        { month: "Feb'24", historical: 2.8, forecast: null, upper: null, lower: null },
        { month: "Mar", historical: 3.0, forecast: null, upper: null, lower: null },
        { month: "Apr", historical: 3.3, forecast: null, upper: null, lower: null },
        { month: "May", historical: 3.1, forecast: null, upper: null, lower: null },
        { month: "Jun", historical: 3.6, forecast: null, upper: null, lower: null },
        { month: "Jul", historical: 3.4, forecast: null, upper: null, lower: null },
        { month: "Aug", historical: 3.5, forecast: null, upper: null, lower: null },
        { month: "Sep", historical: 3.9, forecast: null, upper: null, lower: null },
        { month: "Oct", historical: 4.2, forecast: null, upper: null, lower: null },
        { month: "Nov", historical: 4.8, forecast: null, upper: null, lower: null },
        { month: "Dec", historical: 5.1, forecast: null, upper: null, lower: null },
        { month: "Jan'25", historical: null, forecast: 5.8, upper: 6.3, lower: 5.3 },
        { month: "Feb", historical: null, forecast: 6.1, upper: 6.8, lower: 5.4 },
        { month: "Mar", historical: null, forecast: 5.9, upper: 6.7, lower: 5.1 },
    ],
}

const kpiCards = [
    {
        icon: Package,
        label: "Predicted Waste Next Month",
        value: "5.8 tons",
        sub: "Based on 6-month trend",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: TrendingUp,
        label: "Expected Growth Rate",
        value: "+14.2%",
        sub: "↑ vs last month",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        up: true,
    },
    {
        icon: AlertTriangle,
        label: "Capacity Risk",
        value: "Safe",
        badge: true,
        safe: true,
        sub: "Within storage limits",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        icon: Users,
        label: "Pre-Match Opportunities",
        value: "7 buyers",
        sub: "Ready to negotiate",
        color: "text-violet-500",
        bg: "bg-violet-500/10",
    },
]

const buyers = [
    {
        name: "GreenTech Industries",
        score: 96,
        distance: 42,
        quantity: "5–8 tons",
        emissions: "0.21 t CO₂",
        contract: "6 months",
        top: true,
    },
    {
        name: "EcoFusion Pvt Ltd",
        score: 88,
        distance: 78,
        quantity: "4–6 tons",
        emissions: "0.38 t CO₂",
        contract: "3 months",
        top: false,
    },
    {
        name: "Recyclax Corp",
        score: 81,
        distance: 120,
        quantity: "3–5 tons",
        emissions: "0.59 t CO₂",
        contract: "1 month",
        top: false,
    },
    {
        name: "BlueSky Materials",
        score: 74,
        distance: 195,
        quantity: "6–10 tons",
        emissions: "0.92 t CO₂",
        contract: "12 months",
        top: false,
    },
]

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border bg-card shadow-lg p-3 text-sm min-w-[150px]">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span style={{ color: p.color }}>●</span>
                    <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
                    <span className="font-medium">{p.value != null ? `${p.value} t` : "—"}</span>
                </div>
            ))}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WasteForecast() {
    const [range, setRange] = useState("6M")
    const [dragOver, setDragOver] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [generated, setGenerated] = useState(false)
    const [form, setForm] = useState({ production: "", wasteRatio: "", seasonality: "" })
    const fileRef = useRef()

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) setUploadedFile(file)
    }

    const handleGenerate = () => {
        setGenerating(true)
        setGenerated(false)
        setTimeout(() => { setGenerating(false); setGenerated(true) }, 2200)
    }

    const chartData = allData[range]

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Waste Forecast &amp; Pre-Match Intelligence
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Predict upcoming waste output and secure buyers before generation.
                    </p>
                </div>
                <Button className="gap-2 shrink-0" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Upload Production Data
                </Button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <Card animate={false} className="h-full">
                            <CardContent className="p-5 flex flex-col gap-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.bg}`}>
                                    <k.icon className={`h-5 w-5 ${k.color}`} />
                                </div>
                                <p className="text-sm text-muted-foreground leading-tight">{k.label}</p>
                                {k.badge ? (
                                    <span className={`text-lg font-bold px-2 py-0.5 rounded-full w-fit text-sm ${k.safe ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"}`}>
                                        {k.value}
                                    </span>
                                ) : (
                                    <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
                                )}
                                <p className="text-xs text-muted-foreground">{k.sub}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ── Forecast Chart + Insights ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card animate={false} className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <CardTitle className="text-base">Waste Volume Forecast</CardTitle>
                            <div className="flex gap-1 border rounded-lg p-0.5 bg-muted">
                                {["3M", "6M", "12M"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${range === r ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <CardDescription className="text-xs mt-1">
                            Solid = Historical · Dashed = Forecast · Shaded = Confidence interval
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} unit=" t" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                {/* confidence band */}
                                <Area dataKey="upper" stroke="none" fill="url(#confGrad)" name="Upper bound" connectNulls />
                                <Area dataKey="lower" stroke="none" fill="white" name="Lower bound" connectNulls fillOpacity={1} />
                                <Line
                                    dataKey="historical"
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                    dot={{ r: 3 }}
                                    name="Historical"
                                    connectNulls
                                />
                                <Line
                                    dataKey="forecast"
                                    stroke="#22c55e"
                                    strokeWidth={2.5}
                                    strokeDasharray="6 3"
                                    dot={{ r: 3 }}
                                    name="Forecast"
                                    connectNulls
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Insights Panel */}
                <Card animate={false} className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" /> Forecast Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5 flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Based on your production history and current seasonal trends, waste output is projected to <strong className="text-foreground">rise 14.2%</strong> next month. Steel offcut generation dominates the profile.
                        </p>

                        {/* Confidence */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground font-medium">Confidence Score</span>
                                <span className="font-bold text-emerald-500">87%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "87%" }}
                                    transition={{ duration: 1, delay: 0.3 }}
                                />
                            </div>
                        </div>

                        {/* Suggested Action */}
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                            <p className="font-semibold text-primary mb-1">💡 Suggested Action</p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Pre-schedule a pickup with GreenTech Industries for Jan 28 to avoid overflow accumulation.
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="rounded-lg border border-orange-400/30 bg-orange-400/5 p-3 text-sm">
                            <p className="font-semibold text-orange-500 flex items-center gap-1 mb-1">
                                <AlertTriangle className="h-3.5 w-3.5" /> March Overcapacity Risk
                            </p>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Forecast peaks at 6.4 t in April — 8% above max storage. Consider early buyer negotiation.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Production Data Upload ── */}
            <Card animate={false}>
                <CardHeader>
                    <CardTitle className="text-base">Production Data Upload</CardTitle>
                    <CardDescription>Upload a CSV or enter data manually to generate your forecast.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Drop zone */}
                        <div>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                            >
                                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setUploadedFile(e.target.files[0])} />
                                {uploadedFile ? (
                                    <>
                                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                                        <p className="text-sm font-medium text-emerald-500">{uploadedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">Click to replace</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-medium">Drag &amp; drop CSV here</p>
                                        <p className="text-xs text-muted-foreground">or click to browse</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Manual form */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Monthly Production (units)</label>
                                <input
                                    type="number" min="0" placeholder="e.g. 2400"
                                    value={form.production}
                                    onChange={(e) => setForm({ ...form, production: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Waste Ratio (%)</label>
                                <input
                                    type="number" min="0" max="100" step="0.1" placeholder="e.g. 3.2"
                                    value={form.wasteRatio}
                                    onChange={(e) => setForm({ ...form, wasteRatio: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Seasonality Adjustment (%)</label>
                                <input
                                    type="number" step="0.1" placeholder="e.g. +5 or -3"
                                    value={form.seasonality}
                                    onChange={(e) => setForm({ ...form, seasonality: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                            </div>
                            <Button className="w-full gap-2" onClick={handleGenerate} disabled={generating}>
                                {generating ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating Forecast…</>
                                ) : generated ? (
                                    <><CheckCircle className="h-4 w-4 text-emerald-400" /> Forecast Generated!</>
                                ) : (
                                    <><BarChart3 className="h-4 w-4" /> Generate Forecast</>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── AI Pre-Match Recommendations ── */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-bold">AI Pre-Match Recommendations</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {buyers.map((b, i) => (
                        <motion.div
                            key={b.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card
                                animate={false}
                                className={`h-full flex flex-col ${b.top ? "border-emerald-500 ring-2 ring-emerald-500/30" : ""}`}
                            >
                                <CardContent className="p-5 flex flex-col gap-3 flex-1">
                                    {b.top && (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 rounded-full px-2 py-0.5 w-fit">
                                            ⭐ Top Match
                                        </span>
                                    )}
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-sm leading-tight">{b.name}</p>
                                        <span className={`text-sm font-bold shrink-0 ${b.score >= 90 ? "text-emerald-500" : b.score >= 75 ? "text-yellow-500" : "text-muted-foreground"}`}>
                                            {b.score}%
                                        </span>
                                    </div>

                                    {/* Score bar */}
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${b.score >= 90 ? "bg-emerald-500" : b.score >= 75 ? "bg-yellow-500" : "bg-orange-400"}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${b.score}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{b.distance} km</div>
                                        <div className="flex items-center gap-1"><Package className="h-3 w-3" />{b.quantity}</div>
                                        <div className="flex items-center gap-1"><Leaf className="h-3 w-3 text-emerald-500" />{b.emissions}</div>
                                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.contract}</div>
                                    </div>

                                    <div className="flex gap-2 mt-auto pt-2">
                                        <Button size="sm" className="flex-1 text-xs h-8">Lock Contract</Button>
                                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8 gap-1">
                                            View <ChevronRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    )
}
