import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { Truck, MapPin, PackageCheck, Phone, Clock, AlertCircle } from "lucide-react"

export default function Logistics() {
    const steps = [
        { label: "Pickup Scheduled", time: "Oct 24, 09:00 AM", completed: true },
        { label: "Material Loaded", time: "Oct 24, 11:30 AM", completed: true },
        { label: "In Transit", time: "Est. arrival 04:00 PM", completed: false, current: true },
        { label: "Delivered", time: "Pending", completed: false },
    ]

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Logistics Tracking</h1>
                    <p className="text-muted-foreground mt-2">Monitor active waste transit and delivery schedules.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <AlertCircle className="w-4 h-4" /> Report Issue
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Tracking Unit */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl">Shipment #TRK-8921</CardTitle>
                                <CardDescription>Steel Offcuts (12 Tons)</CardDescription>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-medium">
                                On Schedule
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Visual Stepper */}
                        <div className="relative py-4">
                            <div className="absolute top-1/2 left-4 right-4 h-1 bg-muted -translate-y-1/2 rounded-full z-0 overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "66%" }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                />
                            </div>
                            <div className="relative z-10 flex justify-between">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-4 border-background flex items-center justify-center transition-colors duration-500 ${i < 2 ? 'bg-primary' : i === 2 ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Step Details */}
                        <div className="space-y-6">
                            {steps.map((step, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className={`flex gap-4 ${step.completed ? 'opacity-100' : step.current ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className={`p-2 rounded-full ${step.completed || step.current ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                            {i === 0 ? <PackageCheck className="w-5 h-5" /> :
                                                i === 1 ? <PackageCheck className="w-5 h-5" /> :
                                                    i === 2 ? <Truck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                        </div>
                                        {i !== steps.length - 1 && <div className="w-px h-10 bg-border mt-2" />}
                                    </div>
                                    <div className="pt-1">
                                        <p className={`font-medium ${step.current ? 'text-primary' : ''}`}>{step.label}</p>
                                        <p className="text-sm text-muted-foreground">{step.time}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="h-48 rounded-xl bg-muted/30 border border-border flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/40 via-background to-background" />
                            <div className="text-center z-10 flex flex-col items-center">
                                <MapPin className="w-8 h-8 text-primary mb-2 opacity-80" />
                                <p className="text-sm font-medium">Live Map Integration Unavailable in Demo</p>
                                <p className="text-xs text-muted-foreground">Coordinates: 21.1458° N, 79.0882° E</p>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transporter Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                                    SK
                                </div>
                                <div>
                                    <p className="font-semibold">Sumit Kumar</p>
                                    <p className="text-sm text-muted-foreground">GreenHaul Logistics</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vehicle</span>
                                    <span className="font-medium">Tata Signa 2825 (10-Wheel)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Route</span>
                                    <span className="font-medium">Tata Motors → EcoSteel Refineries</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4" /> ETA</span>
                                    <span className="font-medium">04:00 PM</span>
                                </div>
                            </div>
                            <Button className="w-full mt-2 gap-2"><Phone className="w-4 h-4" /> Contact Driver</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
