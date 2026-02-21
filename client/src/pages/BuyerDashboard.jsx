/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BadgeCheck, Filter, ArrowRight, Truck, Loader2 } from "lucide-react"
import { Button } from "../components/Button"
import { api } from "../lib/api"

export default function BuyerDashboard() {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/api/waste-profiles")
            .then(data => {
                const profiles = data.data || []
                // Mock AI match scores for demo purposes
                const withScores = profiles.map(p => ({
                    ...p,
                    match: Math.floor(Math.random() * 20) + 80,
                    eco: `${(p.average_quantity_per_month * 0.2).toFixed(1)}t CO2 saved`,
                    seller: `Factory ID ${p.factory_id}`,
                    distance: `${Math.floor(Math.random() * 50) + 5} km`
                })).sort((a, b) => b.match - a.match)
                setMatches(withScores)
            })
            .catch(err => console.error("Failed to fetch matches", err))
            .finally(() => setLoading(false))
    }, [])
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Buyer Dashboard</h1>
                    <p className="text-muted-foreground">Find secondary raw materials and track your open deals.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filter Matches
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>AI Match Suggestions</CardTitle>
                        <CardDescription>Based on your required materials: <strong>Steel, High-Density Polyethylene, Heat</strong></CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                            ) : matches.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">No matches found for your criteria.</div>
                            ) : matches.map((match, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    key={match.id || i}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between p-5 border rounded-xl bg-card hover:border-primary/50 transition-all shadow-sm"
                                >
                                    <div className="space-y-1 w-full">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{match.waste_type}</h3>
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                {match.match}% Match
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{match.seller} • {match.distance} away</p>
                                        <div className="flex items-center gap-3 mt-2 text-sm">
                                            <span className="font-medium text-foreground bg-muted px-2 py-1 rounded">Qty: {match.average_quantity_per_month} {match.unit || "units/mo"}</span>
                                            <span className="flex items-center gap-1 text-emerald-500 font-medium">
                                                <BadgeCheck className="w-4 h-4" /> {match.eco}
                                            </span>
                                        </div>
                                    </div>
                                    <a href="#" className="w-full sm:w-auto flex-shrink-0 block">
                                        <Button className="w-full gap-1">Initiate Deal <ArrowRight className="w-4 h-4" /></Button>
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
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
                                    <div key={i} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{deal.id}</p>
                                            <p className="text-xs text-muted-foreground">{deal.status}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </div>
                                ))}
                            </div>
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
                                        Steel offcut pickup from AutoCorp is arriving in <strong>2 hours</strong>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
