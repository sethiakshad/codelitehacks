import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { BarChart3, TrendingUp, Handshake, Leaf, IndianRupee } from "lucide-react"

export default function DealFlow() {
    const metrics = [
        { title: "Value Generated", value: "₹45,200", icon: IndianRupee, trend: "+12% this month" },
        { title: "Net CO2 Offset", value: "128 t", icon: Leaf, trend: "+4t from last week" },
        { title: "Active Matches", value: "14", icon: Handshake, trend: "3 awaiting approval" },
        { title: "Waste Diverted", value: "850 t", icon: TrendingUp, trend: "92% diversion rate" },
    ]

    const pipeline = [
        {
            stage: "Negotiating",
            deals: [
                { id: "D-891", material: "Plastic Scrap", qty: "2t", buyer: "PolyRecycle Ltd", value: "₹6,000" },
                { id: "D-894", material: "Fly Ash", qty: "40t", buyer: "UltraCement", value: "₹12,000" }
            ]
        },
        {
            stage: "Logistics Scheduled",
            deals: [
                { id: "D-882", material: "Steel Offcuts", qty: "12t", buyer: "EcoSteel", value: "₹18,500" }
            ]
        },
        {
            stage: "Completed & Certified",
            deals: [
                { id: "D-870", material: "Chemical Sludge", qty: "500L", buyer: "ChemSafe", value: "₹4,200" },
                { id: "D-868", material: "Wood Pallets", qty: "50 units", buyer: "BioMass Energy", value: "₹1,500" }
            ]
        }
    ]

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Deal Flow & Impact Analytics</h1>
                <p className="text-muted-foreground mt-2">Executive overview of your circular economy performance and active negotiations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                    >
                        <Card className="h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                <item.icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{item.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{item.trend}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Active Pipeline</CardTitle>
                    <CardDescription>Drag and drop deals to update status (Simulation)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pipeline.map((column, i) => (
                            <div key={i} className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-sm">{column.stage}</h3>
                                    <span className="text-xs font-medium bg-background px-2 py-1 rounded shadow-sm">{column.deals.length}</span>
                                </div>

                                <div className="space-y-3">
                                    {column.deals.map((deal, j) => (
                                        <motion.div
                                            key={j}
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-card border rounded-lg p-4 cursor-pointer shadow-sm hover:shadow"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-primary">{deal.id}</span>
                                                <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">{deal.value}</span>
                                            </div>
                                            <p className="font-medium text-sm leading-tight">{deal.material}</p>
                                            <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                                                <span>{deal.qty}</span>
                                                <span>{deal.buyer}</span>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {column.deals.length === 0 && (
                                        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
                                            No deals in this stage
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
