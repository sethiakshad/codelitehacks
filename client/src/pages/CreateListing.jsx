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
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        waste_type: "",
        category: "Mineral Waste",
        average_quantity_per_month: "",
        unit: "Tons / month",
        frequency: "Continuous / Recurring",
        hazardous: "no",
        storage_condition: "dry",
        available_from: "",
        pickup_required: "Yes, buyer must arrange transport",
        location: "",
        expected_price: ""
    })

    const handleNext = () => setStep((s) => s + 1)
    const handleBack = () => setStep((s) => s - 1)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            const token = localStorage.getItem("token")
            // Fetch the user's factory profile to get the factory_id
            const userRes = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const userData = await userRes.json()

            if (!userRes.ok) {
                setError(userData.message || "Failed to authenticate.")
                setIsSubmitting(false)
                return
            }

            const factory_id = userData.user.factory_id || userData.user.id

            // Note: Our DB schema currently supports only these fields:
            // factory_id, waste_type, average_quantity_per_month, hazardous, storage_condition
            // Sending the additional fields from UI to backend for future usage
            const payload = {
                ...formData,
                factory_id,
                hazardous: formData.hazardous === "no" ? false : true
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/waste-profiles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Server error.")
            } else {
                setIsSuccess(true)
            }
        } catch (err) {
            setError("Network error. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
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
                                            <input type="text" name="waste_type" value={formData.waste_type} onChange={handleChange} placeholder="e.g., Fly Ash" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Category</label>
                                            <select name="category" value={formData.category} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
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
                                            <input type="number" name="average_quantity_per_month" value={formData.average_quantity_per_month} onChange={handleChange} placeholder="e.g. 200" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Unit</label>
                                            <select name="unit" value={formData.unit} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option>Tons / month</option>
                                                <option>kg / month</option>
                                                <option>Liters / month</option>
                                                <option>MWh (for heat)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Frequency</label>
                                        <select name="frequency" value={formData.frequency} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                                        <select name="hazardous" value={formData.hazardous} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="no">No - Non Hazard</option>
                                            <option value="low">Yes - Low Risk</option>
                                            <option value="high">Yes - High/Toxic</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Storage Condition Required</label>
                                        <select name="storage_condition" value={formData.storage_condition} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                                        <input type="month" name="available_from" value={formData.available_from} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pickup Required?</label>
                                        <select name="pickup_required" value={formData.pickup_required} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>Yes, buyer must arrange transport</option>
                                            <option>No, we will deliver to buyer</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Nagpur" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Expected Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">₹</span>
                                            <input type="number" name="expected_price" value={formData.expected_price} onChange={handleChange} placeholder="per unit (leave blank if zero)" className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <div className="bg-red-500/10 border-red-500/50 text-red-500 border p-3 rounded-md text-sm mt-4">
                                {error}
                            </div>
                        )}

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
