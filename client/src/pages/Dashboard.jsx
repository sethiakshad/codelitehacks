import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BarChart3, Package, TrendingUp, AlertCircle, FileText, BadgeCheck, ArrowRight, Truck, ClipboardList, Plus, Pencil, X, Trash2, MessageSquare, Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"
import { api, BASE_URL } from "../lib/api"
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
    const [myListings, setMyListings] = useState([])
    const [marketplaceListings, setMarketplaceListings] = useState([])
    const [deals, setDeals] = useState([])
    const [totalCO2, setTotalCO2] = useState(0)
    const [transportStatus, setTransportStatus] = useState({}) // dealId -> "Pending" | "Completed"

    // Socket.IO state
    const [socket, setSocket] = useState(null)
    const fetchDealsRef = useRef(null)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editId, setEditId] = useState(null)

    // Chat state
    const [activeChat, setActiveChat] = useState(null) // Deal object
    const activeChatRef = useRef(null)
    useEffect(() => {
        activeChatRef.current = activeChat
    }, [activeChat])

    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const [newMessage, setNewMessage] = useState("")
    const [formData, setFormData] = useState({ material: "", qty: "", priority: "Medium" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // AI Matches state
    const [aiMatchesModal, setAiMatchesModal] = useState({ open: false, reqId: null, material: null })
    const [aiMatchesData, setAiMatchesData] = useState([])
    const [aiMatchesLoading, setAiMatchesLoading] = useState(false)

    useEffect(() => {
        const socketUrl = BASE_URL
        const newSocket = io(socketUrl)
        setSocket(newSocket)

        if (user) {
            newSocket.emit("identify", user.id || user._id)
        }

        newSocket.on("new_deal", (data) => {
            // Use ref to avoid stale closure
            fetchDealsRef.current?.()
        })

        newSocket.on("deal_updated", (data) => {
            // Optimistically update the deal status in state, then refetch
            if (data.deal) {
                setDeals(prev => prev.map(d =>
                    d._id === data.deal._id ? { ...d, status: data.deal.status } : d
                ))
            }
            fetchDealsRef.current?.()
        })

        // Chat messages delivered via deal-specific rooms — no user ID matching needed
        newSocket.on("chat_message", (message) => {
            setMessages(prev => {
                // Avoid appending duplicates (optimistic msg vs server msg)
                if (prev.some(m => m._id && m._id === message._id)) return prev
                // Replace matching optimistic message (same text, sender)
                const optimisticIdx = prev.findIndex(m =>
                    m._id?.startsWith("opt-") &&
                    m.sender_id === message.sender_id &&
                    m.text === message.text
                )
                if (optimisticIdx !== -1) {
                    const next = [...prev]
                    next[optimisticIdx] = message
                    return next
                }
                return [...prev, message]
            })
        })

        return () => newSocket.disconnect()
    }, [user])

    useEffect(() => {
        fetchRequirements()
        fetchMyListings()
        fetchMarketplace()
        fetchDeals()
    }, [user])

    const fetchRequirements = async () => {
        try {
            const res = await api.get("/api/requirements")
            setRequirements(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch requirements:", err)
        } finally {
            setLoadingReqs(false)
        }
    }

    const fetchMyListings = async () => {
        if (!user) return
        try {
            const res = await api.get(`/api/waste-profiles?user_id=${user.id || user._id}`)
            setMyListings(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch my listings:", err)
        }
    }

    const fetchMarketplace = async () => {
        try {
            const res = await api.get("/api/marketplace")
            setMarketplaceListings(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch marketplace listings:", err)
        }
    }

    const fetchDeals = async () => {
        try {
            const openDeals = await api.get("/api/deals")
            const dealsArr = Array.isArray(openDeals) ? openDeals : []
            setDeals(dealsArr)

            // Calculate Total CO2 from deals
            const co2Sum = dealsArr.reduce((acc, deal) => acc + (deal.co2_saved || 0), 0)
            setTotalCO2(co2Sum)
        } catch (err) {
            console.error("Failed to fetch deals:", err)
        }
    }

    // Keep ref always pointing to latest fetchDeals to avoid stale closures in socket handlers
    useEffect(() => {
        fetchDealsRef.current = fetchDeals
    })

    const handleInitiateDeal = async (listingId, quantityStr) => {
        const numQty = parseFloat(quantityStr) || 1;
        try {
            await api.post("/api/deals", { listing_id: listingId, quantity: numQty })
            alert("Deal initiated! The seller has been notified in real-time.")
            fetchDealsRef.current?.()
        } catch (err) {
            console.error(err)
            alert("Failed to initiate deal.")
        }
    }

    const handleApproveDeal = async (dealId) => {
        // Optimistic update — change status immediately in UI
        setDeals(prev => prev.map(d =>
            d._id === dealId ? { ...d, status: "Completed" } : d
        ))
        try {
            await api.put(`/api/deals/${dealId}/status`, { status: "Completed" })
            fetchDealsRef.current?.()
        } catch (err) {
            console.error(err)
            alert("Failed to approve deal.")
            fetchDealsRef.current?.()
        }
    }

    const handleOpenAiMatches = async (req) => {
        setAiMatchesModal({ open: true, reqId: req._id, material: req.material })
        setAiMatchesLoading(true)
        setAiMatchesData([])
        try {
            const res = await api.get(`/api/requirements/${req._id}/matches`)
            setAiMatchesData(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch AI matches:", err)
            alert("AI matching is currently unavailable. Please try again later.")
        } finally {
            setAiMatchesLoading(false)
        }
    }

    const closeAiMatches = () => {
        setAiMatchesModal({ open: false, reqId: null, material: null })
        setAiMatchesData([])
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

    // --- Chat Functions ---
    const fetchChatHistory = async (dealId) => {
        try {
            const res = await api.get(`/api/messages/${dealId}`)
            setMessages(res || [])
        } catch (err) {
            console.error("Failed to fetch chat:", err)
            setMessages([])
        }
    }

    const handleOpenChat = (deal) => {
        setActiveChat(deal)
        fetchChatHistory(deal._id)
        // Join the deal-specific socket room so messages are pushed directly
        if (socket) {
            socket.emit("join_chat", deal._id)
        }
    }

    const handleCloseChat = () => {
        if (socket && activeChat) {
            socket.emit("leave_chat", activeChat._id)
        }
        setActiveChat(null)
        setMessages([])
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !socket || !activeChat || !user) return

        const dealId = activeChat._id
        const senderId = user.id || user._id
        const text = newMessage

        // Optimistic update — add message immediately to UI
        const optimisticMsg = {
            _id: `opt-${Date.now()}`,
            deal_id: dealId,
            sender_id: senderId,
            text,
            createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])
        setNewMessage("")

        // Server will save and broadcast to the deal room
        socket.emit("send_message", { deal_id: dealId, sender_id: senderId, text })
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

    const handleMarkTransportComplete = async (dealId) => {
        // Mark transport as complete in local state
        setTransportStatus(prev => ({ ...prev, [dealId]: "Completed" }))
    }

    const handleOpenCompliancePdf = async (dealId) => {
        // Open the server-generated PDF in a new tab — token is included via fetch then blob URL
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${BASE_URL}/api/deals/${dealId}/compliance-pdf`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch PDF")
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            window.open(url, "_blank")
        } catch (err) {
            console.error("Failed to open compliance PDF:", err)
            alert("Could not open compliance document. Please try again.")
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
                    { title: "Active Listings", value: myListings.length.toString(), icon: Package, trend: "Created by you" },
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
                            {Array.isArray(requirements) && requirements.map((req, i) => (
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
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${req.matched ? 'text-emerald-500' : 'text-primary/80'}`}>
                                            {req.matched ? <><BadgeCheck className="w-3 h-3" /> Supplier matched</> : "Matching available"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <Button size="sm" variant="default" className="h-8 gap-1 shadow-sm px-3" onClick={() => handleOpenAiMatches(req)}>
                                            <Sparkles className="w-3.5 h-3.5" /> AI Match
                                        </Button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 border border-transparent" onClick={() => handleOpenModal(req)}>
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRequirement(req._id)}>
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
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
                                        <select
                                            name="material"
                                            value={formData.material}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="" disabled>Select Material</option>
                                            <option value="Plastic">Plastic</option>
                                            <option value="Aluminum">Aluminum</option>
                                            <option value="Steel">Steel</option>
                                            <option value="Paper">Paper</option>
                                            <option value="Glass">Glass</option>
                                            <option value="Copper">Copper</option>
                                            <option value="Cement">Cement</option>
                                            <option value="FlyAsh">Fly Ash</option>
                                            <option value="TextileWaste">Textile Waste</option>
                                            <option value="ElectronicWaste">Electronic Waste</option>
                                            <option value="Rubber">Rubber</option>
                                            <option value="Wood">Wood</option>
                                            <option value="Slag">Slag</option>
                                            <option value="BatteryWaste">Battery Waste</option>
                                            <option value="ChemicalSolvent">Chemical Solvent</option>
                                        </select>
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

            {/* AI Matches Modal */}
            <AnimatePresence>
                {aiMatchesModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-card border rounded-xl shadow-lg flex flex-col max-h-[85vh]"
                        >
                            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="font-semibold text-base leading-tight">AI Matches</h2>
                                        <p className="text-xs text-muted-foreground">Marketplace results for {aiMatchesModal.material}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={closeAiMatches}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="p-4 overflow-y-auto flex-1 bg-muted/5">
                                {aiMatchesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm">AI is analyzing marketplace patterns...</p>
                                    </div>
                                ) : aiMatchesData.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg border-muted">
                                        <p className="font-medium text-foreground">No circular matches found yet.</p>
                                        <p className="text-xs mt-1">Check back later as new factories list waste.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {Array.isArray(aiMatchesData) && aiMatchesData.map((match, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                                                key={match._id}
                                                className={`p-4 border rounded-xl bg-card shadow-sm transition-all hover:border-primary/40 ${i === 0 ? 'ring-1 ring-primary/40' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-bold text-base flex items-center gap-2">
                                                                {match.waste_type}
                                                                {i === 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Top Match</span>}
                                                            </h3>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className="text-2xl font-black text-emerald-500 tracking-tighter">{match.match_percentage}%</span>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-muted-foreground/90 border-l-2 border-primary/40 pl-2 py-0.5 italic mb-2">
                                                            "{match.match_reason}"
                                                        </p>

                                                        <div className="grid grid-cols-2 gap-y-2 text-xs">
                                                            <div className="text-muted-foreground">Supplier: <span className="font-medium text-foreground">{match.factory_id?.name || match.user_id?.name || "Independent"}</span></div>
                                                            <div className="text-muted-foreground">Location: <span className="font-medium text-foreground">{match.factory_id?.city || "Verified"}</span></div>
                                                            <div className="text-muted-foreground">Quantity: <span className="font-medium text-foreground">{match.average_quantity_per_month} {match.unit}</span></div>
                                                            <div className="text-emerald-500 font-medium flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5" /> ~{match.potential_co2_savings_per_ton?.toFixed(2)}t CO₂ Saved/t</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t">
                                                    <Button size="sm" className="w-full gap-2 shadow-sm" onClick={() => { closeAiMatches(); handleInitiateDeal(match._id, match.average_quantity_per_month); }}>
                                                        Initiate Fast Deal <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Your Listings (Selling)</CardTitle>
                            <CardDescription>Your recently added industrial byproducts.</CardDescription>
                        </div>
                        {myListings.length > 0 && (
                            <Link to="/list-waste">
                                <Button size="sm" variant="outline" className="h-8 gap-1 hidden sm:flex">
                                    <Plus className="w-4 h-4" /> Add Listing
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {myListings.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                <p className="mb-3">You haven't added any waste listings to sell.</p>
                                <Link to="/list-waste">
                                    <Button size="sm" variant="outline">Create a Listing</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Array.isArray(myListings) && myListings.map((listing, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        key={listing._id}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div>
                                            <p className="font-semibold">{listing.waste_type}</p>
                                            <p className="text-sm text-muted-foreground">{listing.average_quantity_per_month} {listing.unit}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-sm font-medium text-primary">Active</p>
                                            <p className="text-xs text-muted-foreground">{listing.createdAt?.substring(0, 10)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
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
                                {Array.isArray(marketplaceListings) && marketplaceListings.map((item, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        key={item._id}
                                        className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:border-primary/50 transition-all shadow-sm"
                                    >
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <h3 className="font-semibold text-sm leading-tight">{item.waste_type}</h3>
                                            <p className="text-xs text-muted-foreground">{item.user_id?.name || item.factory_id?.name || "Independent Seller"} • {item.factory_id?.city || "Verified Source"}</p>
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
                                {Array.isArray(deals) && deals.map((deal, i) => {
                                    const isSeller = user && deal.seller_id && (deal.seller_id._id === user.id || deal.seller_id._id === user._id)
                                    const isPending = deal.status === "Pending"
                                    const isCompleted = deal.status === "Completed"
                                    const transport = transportStatus[deal._id] || "Pending"
                                    const transportDone = transport === "Completed"

                                    return (
                                        <div key={deal._id} className="flex flex-col gap-2 pb-3 border-b last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    {isSeller ? (
                                                        <p className="font-medium text-sm">Sale: {deal.listing_id?.waste_type}</p>
                                                    ) : (
                                                        <p className="font-medium text-sm">Purchase: {deal.listing_id?.waste_type}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {deal.quantity} diverted • {deal.co2_saved?.toFixed(1)}t CO2 saved
                                                    </p>
                                                    <p className="text-xs text-primary mt-0.5">Status: {deal.status}</p>

                                                    {/* Transport status — only shown when deal is Completed */}
                                                    {isCompleted && (
                                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${transportDone ? "bg-emerald-500/15 text-emerald-500" : "bg-orange-400/15 text-orange-500"}`}>
                                                                <Truck className="w-3 h-3" />
                                                                Transport: {transport}
                                                            </span>

                                                            {/* Compliance Document — visible only when transport is completed */}
                                                            {transportDone && (
                                                                <button
                                                                    onClick={() => handleOpenCompliancePdf(deal._id)}
                                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                    Compliance Document
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                                    {isSeller && isPending && (
                                                        <Button size="sm" className="h-8" onClick={() => handleApproveDeal(deal._id)}>Approve</Button>
                                                    )}
                                                    {/* Mark transport complete button — only for completed deals with pending transport */}
                                                    {isCompleted && !transportDone && (
                                                        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => handleMarkTransportComplete(deal._id)}>
                                                            <Truck className="w-3 h-3" /> Mark Transport Done
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => handleOpenChat(deal)}>
                                                        <MessageSquare className="w-4 h-4" /> Chat
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
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

            {/* Chat Slide-out / Modal */}
            <AnimatePresence>
                {activeChat && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-full max-w-md bg-card border-l shadow-2xl flex flex-col h-full"
                        >
                            {/* Chat Header */}
                            <div className="flex items-center justify-between p-4 border-b bg-muted/40 text-card-foreground">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Deal Chat
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {activeChat.listing_id?.waste_type} • {activeChat.quantity}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleCloseChat} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 bg-background/50">
                                {messages.map((msg) => {
                                    const isMe = user && (msg.sender_id === (user.id || user._id))
                                    return (
                                        <div key={msg._id} className={`flex flex-col max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm border"}`}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t bg-card text-card-foreground">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <Button type="submit" size="icon" className="rounded-full flex-shrink-0" disabled={!newMessage.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
