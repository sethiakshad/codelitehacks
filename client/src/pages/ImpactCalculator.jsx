import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { Leaf, ArrowRight, TrendingDown, Factory, Truck } from "lucide-react"

export default function ImpactCalculator() {
    const [material, setMaterial] = useState("fly_ash")
    const [quantity, setQuantity] = useState(100)
    const [distance, setDistance] = useState(50)

    // Simulation data based on standard emission factors
    const factors = {
        fly_ash: { name: "Fly Ash", virginEmissions: 0.85, recycleEmissions: 0.1, unit: "ton" },
        steel: { name: "Steel Offcuts", virginEmissions: 1.85, recycleEmissions: 0.4, unit: "ton" },
        plastic: { name: "HDPE Plastic", virginEmissions: 2.5, recycleEmissions: 0.8, unit: "ton" },
    }

    const transportEmissionsPerKmTon = 0.0001 // 100g CO2 per km per ton

    const impactData = useMemo(() => {
        const selected = factors[material]
        const q = Number(quantity) || 0
        const d = Number(distance) || 0

        const virginCO2 = selected.virginEmissions * q
        const recycleCO2 = selected.recycleEmissions * q
        const transportCO2 = transportEmissionsPerKmTon * d * q

        const co2Saved = Math.max(0, virginCO2 - (recycleCO2 + transportCO2))

        return {
            virginCO2: virginCO2.toFixed(1),
            recycleCO2: recycleCO2.toFixed(1),
            transportCO2: transportCO2.toFixed(1),
            co2Saved: co2Saved.toFixed(1),
            landfillDiverted: q.toFixed(1),
        }
    }, [material, quantity, distance, factors])

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Environmental Impact Calculator</h1>
                <p className="text-muted-foreground mt-2">Simulate the ESG benefits of secondary material trading using IPCC emission factors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Controls */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Simulation Parameters</CardTitle>
                        <CardDescription>Adjust variables to see impact.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Material Type</label>
                            <select
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {Object.entries(factors).map(([key, val]) => (
                                    <option key={key} value={key}>{val.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                <span>Quantity To Transfer</span>
                                <span className="text-muted-foreground">{quantity} tons</span>
                            </label>
                            <input
                                type="range" min="10" max="1000" step="10"
                                value={quantity} onChange={(e) => setQuantity(e.target.value)}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex justify-between">
                                <span>Transport Distance</span>
                                <span className="text-muted-foreground">{distance} km</span>
                            </label>
                            <input
                                type="range" min="5" max="500" step="5"
                                value={distance} onChange={(e) => setDistance(e.target.value)}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <Button className="w-full mt-4" variant="secondary">Reset Calculator</Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:col-span-2 gap-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={`co2-${impactData.co2Saved}`}
                        className="sm:col-span-2 p-6 rounded-2xl bg-primary text-primary-foreground shadow flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
                                <Leaf className="w-5 h-5" />
                                <h3 className="font-semibold text-lg">Net CO₂ Emissions Saved</h3>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold tracking-tight">{impactData.co2Saved}</span>
                                <span className="text-xl font-medium text-primary-foreground/80">tonnes</span>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto p-4 rounded-xl bg-black/10 backdrop-blur-sm self-stretch flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm font-medium opacity-80 mb-1">Equivalent to planting</p>
                                <p className="text-2xl font-bold">~{Math.round(impactData.co2Saved * 45)} trees</p>
                            </div>
                        </div>
                    </motion.div>

                    <Card animate={false}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-emerald-500" />
                                Landfill Diverted
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{impactData.landfillDiverted} t</div>
                        </CardContent>
                    </Card>

                    <Card animate={false}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Factory className="w-4 h-4 text-red-500" />
                                Avoided Virgin Prod.
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{impactData.virginCO2} t <span className="text-sm font-normal text-muted-foreground">CO₂</span></div>
                        </CardContent>
                    </Card>

                    <Card animate={false} className="sm:col-span-2">
                        <CardHeader>
                            <CardTitle>Emission Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Virgin Material Production <span className="text-muted-foreground">(Baseline)</span></span>
                                        <span>{impactData.virginCO2} t</span>
                                    </div>
                                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-red-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium flex items-center gap-1"><Factory className="w-3 h-3" /> Recycling Processing</span>
                                        <span>{impactData.recycleCO2} t</span>
                                    </div>
                                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-orange-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(impactData.recycleCO2 / impactData.virginCO2) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> Transport Emissions</span>
                                        <span>{impactData.transportCO2} t</span>
                                    </div>
                                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-yellow-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(impactData.transportCO2 / impactData.virginCO2) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
