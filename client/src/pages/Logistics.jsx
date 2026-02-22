import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/Card"
import { Button } from "../components/Button"
import { Truck, MapPin, PackageCheck, Phone, CheckCircle2, User, Building2, ExternalLink, Loader2, AlertTriangle } from "lucide-react"
import { api, BASE_URL } from "../lib/api"

// ── Mappls Credentials (moved to backend) ──────────────────────────────────────

// ── Deals (with lat/lng for source) ─────────────────────────────────────────────
const DEALS = [
    {
        id: "M-092",
        material: "Fly Ash",
        quantity: "200 Tons",
        source: {
            name: "Tata Power",
            address: "Trombay, Mumbai, Maharashtra",
            lat: 19.0544,
            lng: 72.8402,
            distance: "4.2 km away"
        },
        destination: {
            name: "Ambuja Cements",
            address: "Chandrapur, Maharashtra"
        },
        date: "Oct 24, 2026",
        status: "Transport Pending"
    },
    {
        id: "M-084",
        material: "Steel Offcuts",
        quantity: "12 Tons",
        source: {
            name: "Tata Motors",
            address: "Pimpri-Chinchwad, Pune, Maharashtra",
            lat: 18.6298,
            lng: 73.7997,
            distance: "1.5 km away"
        },
        destination: {
            name: "EcoSteel Refineries",
            address: "Nagpur, Maharashtra"
        },
        date: "Oct 22, 2026",
        status: "Transport Pending"
    }
]

// ── Mappls API helpers ──────────────────────────────────────────────────────────
let cachedToken = null
let tokenExpiry = 0

async function getMapplsToken() {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken

    const res = await fetch(`${BASE_URL}/api/mappls/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error(`Token request failed: ${res.status}`)

    const data = await res.json()
    cachedToken = data.access_token
    // expire 5 minutes early to be safe
    tokenExpiry = Date.now() + (data.expires_in ? (data.expires_in - 300) * 1000 : 23 * 60 * 60 * 1000)
    return cachedToken
}

// ── Known courier brand contacts (publicly available) ───────────────────────────
const KNOWN_COURIER_CONTACTS = [
    { match: ["dtdc"], phone: "1800-209-3282", website: "dtdc.in" },
    { match: ["fedex", "fed ex"], phone: "1800-209-6161", website: "fedex.com/in" },
    { match: ["professional couriers", "professional courier"], phone: "1800-112-345", website: "tpcindia.com" },
    { match: ["blue dart"], phone: "1860-233-1234", website: "bluedart.com" },
    { match: ["delhivery"], phone: "011-4004-4004", website: "delhivery.com" },
    { match: ["ekart", "flipkart"], phone: "1800-208-9898", website: "ekartlogistics.com" },
    { match: ["india post", "speed post"], phone: "1800-111-363", website: "indiapost.gov.in" },
    { match: ["first flight"], phone: "022-2827-1334", website: "firstflight.net" },
    { match: ["trackon"], phone: "011-4141-4141", website: "trackon.in" },
    { match: ["xpressbees"], phone: "1800-419-8888", website: "xpressbees.com" },
    { match: ["ecom express"], phone: "011-4141-2345", website: "ecomexpress.in" },
    { match: ["shree anjani"], phone: "079-2657-2100", website: "shreeanjanicourier.com" },
    { match: ["shree maruti"], phone: "079-2220-2983", website: "shreemaruticourier.com" },
    { match: ["gati"], phone: "1860-123-4284", website: "gati.com" },
    { match: ["safexpress"], phone: "011-2626-0000", website: "safexpress.com" },
    { match: ["vrl logistics", "vrl"], phone: "0836-237-4114", website: "vrlgroup.in" },
    { match: ["rivigo"], phone: "1800-102-9888", website: "rivigo.com" },
    { match: ["spoton"], phone: "1800-113-113", website: "spoton.co.in" },
    { match: ["dp international"], phone: "022-6691-5555", website: "dpex.com" },
    { match: ["konnellion"], phone: null, website: null },
]

// ── Mock Transporters (Fallback for API suspension) ───────────────────────────
const MOCK_TRANSPORTERS = [
    {
        id: "T-MOCK-1",
        name: "DTDC Express - Mumbai Central",
        driver: "Rajesh Kumar",
        vehicle: "Eicher 14ft Container",
        rating: "4.8",
        phone: "1800-209-3282",
        website: "dtdc.in",
        distance: "1.2 km from Source",
        address: "Industrial Area, Mumbai, Maharashtra",
    },
    {
        id: "T-MOCK-2",
        name: "Blue Dart Aviation Ltd",
        driver: "Anita Sharma",
        vehicle: "Tata 407",
        rating: "4.5",
        phone: "1860-233-1234",
        website: "bluedart.com",
        distance: "2.5 km from Source",
        address: "Near Airport, Mumbai, Maharashtra",
    },
    {
        id: "T-MOCK-3",
        name: "Delhivery Logistics",
        driver: "Suresh P.",
        vehicle: "Mahindra Bolero Pickup",
        rating: "4.2",
        phone: "011-4004-4004",
        website: "delhivery.com",
        distance: "3.8 km from Source",
        address: "Warehouse Complex, Mumbai",
    },
    {
        id: "T-MOCK-4",
        name: "VRL Logistics Ltd",
        driver: "Mahesh Yadav",
        vehicle: "10-Wheeler Truck",
        rating: "4.6",
        phone: "0836-237-4114",
        website: "vrlgroup.in",
        distance: "4.5 km from Source",
        address: "Logistic Park, Panvel Highway",
    }
]

function matchKnownContact(placeName) {
    const lower = (placeName || "").toLowerCase()
    for (const entry of KNOWN_COURIER_CONTACTS) {
        if (entry.match.some(m => lower.includes(m))) {
            return { phone: entry.phone, website: entry.website }
        }
    }
    return null
}

async function fetchNearbyTransporters(lat, lng, radius = 5000) {
    const token = await getMapplsToken()

    const params = new URLSearchParams({
        keywords: "courier;logistics;cargo;transport;freight",
        refLocation: `${lat},${lng}`,
        radius: String(radius),
        explain: "true",
        richData: "true",
    })

    try {
        const res = await fetch(`${BASE_URL}/api/mappls/search?${params}`, {
            headers: { Authorization: `bearer ${token}` },
        })

        if (!res.ok) {
            if (res.status === 403) {
                console.warn("Mappls API suspended, falling back tracks to mock data.");
                return MOCK_TRANSPORTERS;
            }
            throw new Error(`Nearby search failed: ${res.status}`)
        }

        const data = await res.json()
        const places = data.suggestedLocations || data.results || []

        if (places.length === 0) return MOCK_TRANSPORTERS;

        return places.map((p, i) => {
            const known = matchKnownContact(p.placeName || p.name)
            return {
                id: p.eLoc || `T-${i}`,
                name: p.placeName || p.name || "Unknown Service",
                driver: p.addressTokens?.houseNumber || "Contact for details",
                vehicle: p.typeName || p.keywords || "Logistics Service",
                rating: p.rating || "—",
                phone: p.pds?.mobile || p.richInfo?.contact || p.phone || p.mobile || known?.phone || "Not available",
                website: known?.website || null,
                distance: p.distance ? `${(p.distance / 1000).toFixed(1)} km from Source` : "Nearby",
                address: p.placeAddress || p.address || "",
            }
        })
    } catch (error) {
        console.error("Mappls Search failed, using mock fallback:", error);
        return MOCK_TRANSPORTERS;
    }
}


// ── Component ───────────────────────────────────────────────────────────────────
export default function Logistics() {
    const [selectedDealId, setSelectedDealId] = useState(DEALS[0].id)
    const [transporters, setTransporters] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const selectedDeal = DEALS.find(d => d.id === selectedDealId) || DEALS[0]

    const loadTransporters = useCallback(async (deal) => {
        if (!deal) return
        setLoading(true)
        setError(null)
        setTransporters([])
        try {
            const results = await fetchNearbyTransporters(deal.source.lat, deal.source.lng)
            setTransporters(results)
        } catch (err) {
            console.error("Failed to fetch transporters:", err)
            // Error handling is now internal to fetchNearbyTransporters for fallback
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTransporters(selectedDeal)
    }, [selectedDealId, selectedDeal, loadTransporters])

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Logistics Hub</h1>
                    <p className="text-muted-foreground mt-2">Manage your agreed deals and find nearby transport partners to fulfill them.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Deals List */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Agreed Deals
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">Select a deal to view nearby logistics options.</p>

                    <div className="flex flex-col gap-4">
                        {DEALS.map((deal) => (
                            <motion.div
                                key={deal.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-colors border-2 ${selectedDealId === deal.id ? 'border-primary bg-primary/5 shadow-md pl-4' : 'border-border/50 hover:border-primary/50'}`}
                                    onClick={() => setSelectedDealId(deal.id)}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-primary opacity-0 transition-opacity" style={{ opacity: selectedDealId === deal.id ? 1 : 0 }} />
                                    <CardContent className="p-4 space-y-2 relative">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-lg">{deal.material}</p>
                                                <p className="text-sm text-muted-foreground">Match #{deal.id}</p>
                                            </div>
                                            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md text-xs font-bold whitespace-nowrap">
                                                {deal.quantity}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm pt-2 text-muted-foreground">
                                            <Building2 className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{deal.source.name}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Deal Details & Nearby Transporters */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDealId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Selected Deal Details Card */}
                            <Card className="border-border">
                                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">Deal {selectedDeal?.id || "N/A"}</CardTitle>
                                            <CardDescription>Shipping {selectedDeal?.quantity} of {selectedDeal?.material}</CardDescription>
                                        </div>
                                        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                                            {selectedDeal?.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pickup From</p>
                                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                                <div className="p-2 bg-primary/10 rounded-full"><Building2 className="w-4 h-4 text-primary" /></div>
                                                <div>
                                                    <p className="font-semibold text-foreground">{selectedDeal?.source?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{selectedDeal?.source?.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center px-4 w-full md:w-auto">
                                            <Truck className="w-6 h-6 text-muted-foreground mb-1" />
                                            <div className="w-full md:w-32 h-[2px] bg-border relative">
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-2 text-center md:text-right">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Deliver To</p>
                                            <div className="flex items-center gap-2 justify-center md:justify-end">
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="font-semibold text-foreground">{selectedDeal?.destination?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{selectedDeal?.destination?.address}</p>
                                                </div>
                                                <div className="p-2 bg-muted rounded-full"><MapPin className="w-4 h-4 text-muted-foreground" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Nearby Transporters Section */}
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Nearby Transporters in {selectedDeal?.source?.address?.split(',')[0] || "Your Area"}
                                </h3>

                                {/* Loading State */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-sm text-muted-foreground">Searching nearby transporters via Mappls...</p>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !loading && (
                                    <Card className="border-red-500/30 bg-red-500/5">
                                        <CardContent className="p-6 flex items-center gap-4">
                                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-red-600">Failed to load transporters</p>
                                                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                                            </div>
                                            <Button variant="outline" className="ml-auto" onClick={() => loadTransporters(selectedDeal)}>
                                                Retry
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Empty State */}
                                {!loading && !error && transporters.length === 0 && (
                                    <Card className="border-border">
                                        <CardContent className="p-8 text-center">
                                            <Truck className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="font-medium">No courier/logistics services found nearby</p>
                                            <p className="text-sm text-muted-foreground mt-1">Try increasing the search radius or checking a different location.</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Results Grid */}
                                {!loading && !error && transporters.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {transporters.map((transporter) => (
                                            <Card key={transporter.id} className="hover:shadow-md transition-shadow border-border">
                                                <CardContent className="p-5 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <User className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{transporter.name}</p>
                                                                <p className="text-xs text-muted-foreground">{transporter.vehicle}</p>
                                                            </div>
                                                        </div>
                                                        {transporter.rating !== "—" && (
                                                            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-sm flex items-center gap-1">
                                                                ★ {transporter.rating}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {transporter.address && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{transporter.address}</p>
                                                    )}

                                                    <div className="space-y-1.5 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Distance:</span>
                                                            <span className="font-medium text-amber-600">{transporter.distance}</span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 flex flex-col gap-2">
                                                        {transporter.phone && transporter.phone !== "Not available" ? (
                                                            <Button variant="outline" className="w-full gap-2 justify-center border-primary/20 hover:bg-primary hover:text-primary-foreground group"
                                                                onClick={() => window.location.href = `tel:${transporter.phone.replace(/[^0-9+]/g, '')}`}
                                                            >
                                                                <Phone className="w-4 h-4 text-primary group-hover:text-primary-foreground" />
                                                                {transporter.phone}
                                                            </Button>
                                                        ) : (
                                                            <p className="text-xs text-center text-muted-foreground italic">Contact info not available</p>
                                                        )}
                                                        {transporter.website && (
                                                            <Button variant="outline" className="w-full gap-2 justify-center border-border/50 text-muted-foreground hover:text-foreground"
                                                                onClick={() => window.open(`https://${transporter.website}`, '_blank')}
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                {transporter.website}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                                    <ExternalLink className="w-5 h-5 flex-shrink-0" />
                                    <p>As the sender, please contact a logistics partner directly to negotiate rates and schedule the pickup for this deal.</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}