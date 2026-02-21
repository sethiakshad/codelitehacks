/* eslint-disable no-unused-vars */
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BarChart3, Package, TrendingUp, AlertCircle, FileText } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"

export default function ProducerDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Producer Dashboard</h1>
                    <p className="text-muted-foreground">Manage your waste listings and track environmental impact.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Listings</CardTitle>
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
