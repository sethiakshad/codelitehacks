/* eslint-disable no-unused-vars */
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BarChart3, Package, TrendingUp, AlertCircle, FileText, BadgeCheck, ArrowRight, Truck, ClipboardList, Plus, Pencil } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"

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
    const requirements = [
        { material: "Fly Ash (Grade I)", qty: "40 tons/mo", priority: "High", matched: true },
        { material: "Recycled Steel Rebar", qty: "8 tons/mo", priority: "Medium", matched: true },
        { material: "HDPE Granules", qty: "2 tons/mo", priority: "High", matched: false },
        { material: "Waste Heat (>200°C)", qty: "Continuous", priority: "Low", matched: false },
    ]

    return (
        <div className="space-y-8">
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
                    { title: "Active Listings", value: "12", icon: Package, trend: "+2 this week" },
                    { title: "Matches Found", value: "8", icon: TrendingUp, trend: "3 pending review" },
                    { title: "CO2 Offset", value: "450 t", icon: BarChart3, trend: "+12% vs last month" },
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
                    <Button size="sm" variant="outline" className="gap-1"><Plus className="w-3.5 h-3.5" /> Add Requirement</Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requirements.map((req, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 * i }}
                                key={i}
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
                                    <p className="text-xs text-muted-foreground">{req.qty}</p>
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${req.matched ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                        {req.matched ? <><BadgeCheck className="w-3 h-3" /> Supplier matched</> : "Searching..."}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

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
                        <CardDescription>AI-matched materials based on your requirements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { material: "Steel Offcuts (Premium Grade)", seller: "Tata Motors Plant C", distance: "45 km", qty: "12 tons/mo", match: 98, eco: "2.4t CO2 saved" },
                                { material: "HDPE Packaging Waste", seller: "Reliance Retail Dist", distance: "12 km", qty: "500 kg/mo", match: 92, eco: "0.8t CO2 saved" },
                                { material: "Industrial Heat Exchanger Output", seller: "ChemCorp Refinery", distance: "8 km", qty: "Continuous", match: 86, eco: "12 MWh saved" },
                            ].map((item, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    key={i}
                                    className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:border-primary/50 transition-all shadow-sm"
                                >
                                    <MatchRing percent={item.match} />
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <h3 className="font-semibold text-sm leading-tight">{item.material}</h3>
                                        <p className="text-xs text-muted-foreground">{item.seller} • {item.distance} away</p>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${item.match >= 90 ? 'bg-emerald-500' : item.match >= 75 ? 'bg-amber-400' : 'bg-orange-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.match}%` }}
                                                transition={{ duration: 0.6, delay: 0.15 * i }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="font-medium bg-muted px-2 py-0.5 rounded">Qty: {item.qty}</span>
                                            <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                                <BadgeCheck className="w-3 h-3" /> {item.eco}
                                            </span>
                                        </div>
                                    </div>
                                    <Button size="sm" className="flex-shrink-0 gap-1 self-center">Deal <ArrowRight className="w-3 h-3" /></Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Open Deals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { id: "#D-102", status: "Awaiting Docs" },
                                { id: "#D-098", status: "Logistics Scheduled" },
                            ].map((deal, i) => (
                                <div key={i} className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{deal.id}</p>
                                        <p className="text-xs text-muted-foreground">{deal.status}</p>
                                    </div>
                                    <Button variant="ghost" size="sm">View</Button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6">
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
                    </CardContent>
                </Card>

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
        </div>
    )
}
