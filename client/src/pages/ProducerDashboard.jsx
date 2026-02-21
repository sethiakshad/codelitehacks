/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BarChart3, Package, TrendingUp, AlertCircle, FileText, Loader2 } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"

export default function ProducerDashboard() {
    const { user } = useAuth()
    const [wasteProfiles, setWasteProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!user?.id) return;
        api.get(`/api/waste-profiles?factory_id=${user.id}`)
            .then(data => setWasteProfiles(data.data || []))
            .catch(err => setError("Failed to load waste profiles."))
            .finally(() => setLoading(false))
    }, [user])

    const stats = [
        { title: "Active Listings", value: wasteProfiles.length.toString(), icon: Package, trend: "Waste profiles added" },
        { title: "Hazardous Items", value: wasteProfiles.filter(p => p.hazardous).length.toString(), icon: AlertCircle, trend: "Require special handling", urgent: true },
        { title: "CO2 Offset", value: "—", icon: BarChart3, trend: "Coming soon" },
        { title: "Total Listings", value: wasteProfiles.length.toString(), icon: TrendingUp, trend: "All time" },
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Factory Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="text-foreground font-medium">{user?.name || user?.email}</span>
                    </p>
                </div>
                <Link to="/list-waste">
                    <Button>+ New Waste Listing</Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((item, i) => (
                    <Card key={i} animate={false} className="border-l-4 border-l-primary" data-urgent={item.urgent}>
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

            {/* Waste Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Waste Profiles</CardTitle>
                        <CardDescription>Your registered industrial waste materials.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" /> Loading...
                            </div>
                        ) : error ? (
                            <p className="text-sm text-destructive text-center py-8">{error}</p>
                        ) : wasteProfiles.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No waste profiles yet.</p>
                                <Link to="/list-waste">
                                    <Button variant="outline" size="sm" className="mt-4">Add First Listing</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {wasteProfiles.map((profile, i) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold">{profile.waste_type}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {profile.average_quantity_per_month} units/month · {profile.storage_condition || "No storage info"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${profile.hazardous ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                                {profile.hazardous ? "Hazardous" : "Non-Hazardous"}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks for your factory.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link to="/list-waste" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Package className="h-4 w-4" /> Add Waste Profile
                            </Button>
                        </Link>
                        <Link to="/impact" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <BarChart3 className="h-4 w-4" /> Impact Calculator
                            </Button>
                        </Link>
                        <Link to="/docs" className="block">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <FileText className="h-4 w-4" /> Compliance Docs
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
