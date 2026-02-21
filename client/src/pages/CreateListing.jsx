/* eslint-disable no-unused-vars */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { CheckCircle2, Factory, Calendar, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"

export default function CreateListing() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleNext = () => setStep((s) => s + 1)
    const handleBack = () => setStep((s) => s - 1)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSuccess(true)
        }, 1500)
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto mt-20 text-center space-y-6"
            >
                <div className="mx-auto w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold">Advanced Listing Created!</h2>
                <p className="text-muted-foreground">Your industrial waste material is now live. Our AI matching engine is factoring in distance, volume, and material ontology mappings to find buyers.</p>
                <div className="pt-6">
                    <Link to="/producer" className="w-full inline-block">
                        <Button className="w-full">Return to Dashboard</Button>
                    </Link>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Advanced Waste Listing</h1>
                <p className="text-muted-foreground mt-2">Provide precise details so our AI can find optimal circular economy matches.</p>
            </div>

            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={step < 3 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <Factory className="text-primary w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Material Core Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Material Type</label>
                                            <input type="text" placeholder="e.g., Fly Ash" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Category</label>
                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                                <option>Mineral Waste</option>
                                                <option>Organic</option>
                                                <option>Metals</option>
                                                <option>Heat / Exothermic</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Quantity</label>
                                            <input type="number" placeholder="e.g. 200" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Unit</label>
                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option>Tons / month</option>
                                                <option>kg / month</option>
                                                <option>Liters / month</option>
                                                <option>MWh (for heat)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Frequency</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>Continuous / Recurring</option>
                                            <option>One-time bulk</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <ShieldAlert className="text-primary w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Safety & Storage</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Hazardous Material?</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="no">No - Non Hazard</option>
                                            <option value="low">Yes - Low Risk</option>
                                            <option value="high">Yes - High/Toxic</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Storage Condition Required</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="dry">Dry / Covered Area</option>
                                            <option value="sealed">Sealed Containers / Barrels</option>
                                            <option value="open">Open Yard</option>
                                            <option value="temp">Temperature Controlled</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <Calendar className="text-primary w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Logistics & Availability</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Available From</label>
                                        <input type="month" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pickup Required?</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>Yes, buyer must arrange transport</option>
                                            <option>No, we will deliver to buyer</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <input type="text" placeholder="e.g. Nagpur" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Expected Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">₹</span>
                                            <input type="number" placeholder="per unit (leave blank if zero)" className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between mt-8 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 1 || isSubmitting}>
                                Back
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Processing..." : step < 3 ? "Next Step" : "Publish Listing"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
