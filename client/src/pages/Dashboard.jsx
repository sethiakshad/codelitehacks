import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BarChart3, Package, TrendingUp, AlertCircle, FileText, BadgeCheck, ArrowRight, Truck, ClipboardList, Plus, Pencil, X, Trash2 } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"
import { api } from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { io } from "socket.io-client"

function MatchRing({ percent }) {
    const radius = 20
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference
    const color = percent >= 90 ? "text-emerald-500" : percent >= 75 ? "text-amber-400" : "text-orange-500"
    return (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/40" />
                <motion.circle
                    cx="28" cy="28" r={radius} fill="none" strokeWidth="4" strokeLinecap="round"
                    className={color}
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </svg>
            <span className={`absolute text-xs font-bold ${color}`}>{percent}%</span>
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [requirements, setRequirements] = useState([])
    const [loadingReqs, setLoadingReqs] = useState(true)

    // Deals & Marketplace state
    const [marketplaceListings, setMarketplaceListings] = useState([])
    const [deals, setDeals] = useState([])
    const [totalCO2, setTotalCO2] = useState(0)

    // Socket.IO state
    const [socket, setSocket] = useState(null)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [formData, setFormData] = useState({ material: "", qty: "", priority: "Medium" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        // Initialize Socket.IO connection
        const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:4000")
        setSocket(newSocket)

        if (user) {
            newSocket.emit("identify", user.id || user._id)
        }

        newSocket.on("new_deal", (data) => {
            // New deal notification received!
            alert(`Real-Time Update: ${data.message}`)
            fetchDeals() // Refresh deals to compute new offsets
        })

        return () => newSocket.disconnect()
    }, [user])

    useEffect(() => {
        fetchRequirements()
        fetchMarketplace()
        fetchDeals()
    }, [])

    const fetchRequirements = async () => {
        try {
            const res = await api.get("/api/requirements")
            setRequirements(res.data)
        } catch (err) {
            console.error("Failed to fetch requirements:", err)
        } finally {
            setLoadingReqs(false)
        }
    }

    const fetchMarketplace = async () => {
        try {
            const res = await api.get("/api/marketplace")
            setMarketplaceListings(res.data)
        } catch (err) {
            console.error("Failed to fetch marketplace listings:", err)
        }
    }

    const fetchDeals = async () => {
        try {
            const res = await api.get("/api/deals")
            const openDeals = res.data
            setDeals(openDeals)

            // Calculate Total CO2 from deals
            const co2Sum = openDeals.reduce((acc, deal) => acc + (deal.co2_saved || 0), 0)
            setTotalCO2(co2Sum)
        } catch (err) {
            console.error("Failed to fetch deals:", err)
        }
    }

    const handleInitiateDeal = async (listingId, quantityStr) => {
        // Simple extraction of number from qty string like "12 tons/mo"
        const numQty = parseFloat(quantityStr) || 1;

        try {
            await api.post("/api/deals", { listing_id: listingId, quantity: numQty })
            alert("Deal initiated! The seller has been notified in real-time.")
            fetchDeals() // refresh my deals view
        } catch (err) {
            console.error(err)
            alert("Failed to initiate deal.")
        }
    }

    const handleOpenModal = (req = null) => {
        if (req) {
            setEditId(req._id)
            setFormData({ material: req.material, qty: req.qty, priority: req.priority })
        } else {
            setEditId(null)
            setFormData({ material: "", qty: "", priority: "Medium" })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditId(null)
    }

    const handleSaveRequirement = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editId) {
                await api.put(`/api/requirements/${editId}`, formData)
            } else {
                await api.post("/api/requirements", formData)
            }
            await fetchRequirements()
            handleCloseModal()
        } catch (err) {
            console.error("Failed to save requirement:", err)
            alert(err.message || "Failed to save requirement.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteRequirement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this requirement?")) return
        try {
            await api.delete(`/api/requirements/${id}`)
            await fetchRequirements()
        } catch (err) {
            console.error("Failed to delete requirement:", err)
            alert(err.message || "Failed to delete requirement.")
        }
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">EcoMarket Dashboard</h1>
                    <p className="text-muted-foreground">Manage your waste listings, track impact, and buy raw materials.</p>
                </div>
                <Link to="/list-waste">
                    <Button>Create New Listing</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: "Active Listings", value: "12", icon: Package, trend: "Static mock" },
                    { title: "Open Deals", value: deals.length.toString(), icon: TrendingUp, trend: "Real-time updates" },
                    { title: "CO2 Offset", value: `${totalCO2.toFixed(1)} t`, icon: BarChart3, trend: "Calculated from deals" },
                    { title: "Missing Docs", value: "1", icon: AlertCircle, trend: "Requires attention", urgent: true },
                ].map((item, i) => (
                    <Card key={i} animate={false} className="border-l-4 border-l-primary data-[urgent=true]:border-l-destructive" data-urgent={item.urgent}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <item.icon className={`h-4 w-4 ${item.urgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">{item.trend}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* My Requirements Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary" />
                        <div>
                            <CardTitle>My Requirements</CardTitle>
                            <CardDescription>Raw materials your factory needs. AI matches suppliers automatically.</CardDescription>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleOpenModal()}>
                        <Plus className="w-3.5 h-3.5" /> Add Requirement
                    </Button>
                </CardHeader>
                <CardContent>
                    {loadingReqs ? (
                        <div className="text-sm text-muted-foreground py-4">Loading requirements...</div>
                    ) : requirements.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="text-sm mb-2">No requirements added yet.</p>
                            <Button variant="outline" size="sm" onClick={() => handleOpenModal()}>
                                Add Your First Requirement
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {requirements.map((req, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 * i }}
                                    key={req._id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{req.material}</p>
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${req.priority === "High" ? "bg-red-500/10 text-red-500" :
                                                req.priority === "Medium" ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-blue-500/10 text-blue-500"
                                                }`}>{req.priority}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Qty: {req.qty}</p>
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${req.matched ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                            {req.matched ? <><BadgeCheck className="w-3 h-3" /> Supplier matched</> : "Searching..."}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-transparent" onClick={() => handleOpenModal(req)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRequirement(req._id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-card border rounded-xl shadow-lg"
                        >
                            <form onSubmit={handleSaveRequirement}>
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h2 className="font-semibold">{editId ? "Edit" : "Add"} Requirement</h2>
                                    <Button type="button" variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={handleCloseModal}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Material / Waste Needed</label>
                                        <input
                                            required
                                            type="text"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="e.g. Fly Ash, Steel Scrap"
                                            value={formData.material}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Monthly Quantity</label>
                                        <input
                                            required
                                            type="text"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="e.g. 50 tons, 1000 L"
                                            value={formData.qty}
                                            onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Priority</label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 p-4 border-t bg-muted/20">
                                    <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Requirement"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Listings (Selling)</CardTitle>
                        <CardDescription>Your recently added industrial byproducts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { material: "Steel Offcuts", qty: "5 tons/mo", match: "98%", status: "Matched" },
                                { material: "Chemical Sludge", qty: "200 L/mo", match: "Pending", status: "Active" },
                                { material: "Plastic Packaging", qty: "1 ton/mo", match: "85%", status: "Negotiating" },
                            ].map((listing, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    key={i}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-semibold">{listing.material}</p>
                                        <p className="text-sm text-muted-foreground">{listing.qty}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-primary">{listing.status}</p>
                                        <p className="text-xs text-muted-foreground">Match: {listing.match}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Marketplace (Buying)</CardTitle>
                        <CardDescription>Industrial byproducts listed by other factories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {marketplaceListings.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">No marketplace listings available.</div>
                        ) : (
                            <div className="space-y-4">
                                {marketplaceListings.map((item, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        key={item._id}
                                        className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:border-primary/50 transition-all shadow-sm"
                                    >
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <h3 className="font-semibold text-sm leading-tight">{item.waste_type}</h3>
                                            <p className="text-xs text-muted-foreground">{item.factory_id?.name || "Unknown Factory"} • {item.factory_id?.city || "Location unknown"}</p>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="font-medium bg-muted px-2 py-0.5 rounded">Avg Qty: {item.average_quantity_per_month} /mo</span>
                                                <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                                    <BadgeCheck className="w-3 h-3" /> Potential: {item.potential_co2_savings_per_ton?.toFixed(2)}t CO2/ton saved
                                                </span>
                                            </div>
                                        </div>
                                        <Button size="sm" className="flex-shrink-0 gap-1 self-center" onClick={() => handleInitiateDeal(item._id, item.average_quantity_per_month)}>Deal <ArrowRight className="w-3 h-3" /></Button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Open Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deals.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">No active deals.</div>
                        ) : (
                            <div className="space-y-4">
                                {deals.map((deal, i) => (
                                    <div key={deal._id} className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium text-sm">Sale: {deal.listing_id?.waste_type || "Unknown Listing"}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {deal.quantity} diverted • {deal.co2_saved?.toFixed(1)}t CO2 saved
                                            </p>
                                            <p className="text-xs text-primary mt-0.5">{deal.status}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground border-none">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/20 rounded-lg">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Logistics Active</h3>
                                <p className="text-sm text-primary-foreground/80 mt-1">
                                    Pickup arriving in <strong>2 hours</strong>.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Compliance Docs</CardTitle>
                    <CardDescription>Auto-generated transfer notes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((doc) => (
                            <div key={doc} className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors group">
                                <div className="p-2 bg-primary/10 rounded group-hover:bg-primary/20 text-primary">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Transfer_Note_#80{doc}</p>
                                    <p className="text-xs text-muted-foreground">Generated 2d ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">View All Archive</Button>
                </CardContent>
            </Card>
        </div>
    )
}
