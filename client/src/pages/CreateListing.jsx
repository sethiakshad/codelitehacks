/* eslint-disable no-unused-vars */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../components/Card"
import { Button } from "../components/Button"
import { CheckCircle2, Factory, Calendar, ShieldAlert } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"

export default function CreateListing() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { user } = useAuth()

    const [formData, setFormData] = useState({
        waste_type: "",
        waste_category: "Mineral Waste",
        average_quantity_per_month: "",
        unit: "Tons / month",
        frequency: "Continuous / Recurring",
        hazardous: false,
        hazard_level: "no",
        storage_condition: "dry",
        available_from: "",
        transport_required: true,
        location: "",
        expected_price: "",
    })

    const handle = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }

    const handleNext = (e) => { e.preventDefault(); setStep(s => s + 1) }
    const handleBack = () => setStep(s => s - 1)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            await api.post("/api/waste-profiles", {
                factory_id: user.id,
                waste_type: formData.waste_type,
                waste_category: formData.waste_category,
                average_quantity_per_month: parseFloat(formData.average_quantity_per_month) || 0,
                unit: formData.unit,
                hazardous: formData.hazard_level !== "no",
                storage_condition: formData.storage_condition,
            })
            setIsSuccess(true)
        } catch (err) {
            setError(err.message || "Failed to submit listing. Please try again.")
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
                <h2 className="text-3xl font-bold">Listing Created!</h2>
                <p className="text-muted-foreground">Your industrial waste material has been saved to your profile. Our AI matching engine will find optimal buyers.</p>
                <div className="pt-6 flex gap-3 justify-center">
                    <Button onClick={() => { setIsSuccess(false); setStep(1); setFormData({ ...formData, waste_type: "" }) }} variant="outline">
                        Add Another
                    </Button>
                    <Link to="/producer">
                        <Button>Return to Dashboard</Button>
                    </Link>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Add Waste Listing</h1>
                <p className="text-muted-foreground mt-2">Provide precise details so our AI can find optimal circular economy matches.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full">
                    <motion.div className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                        transition={{ duration: 0.3 }} />
                </div>
                {[1, 2, 3].map(n => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{n}</div>
                ))}
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={step < 3 ? handleNext : handleSubmit}>
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <Factory className="text-primary w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Material Core Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Material / Waste Type</label>
                                            <input type="text" name="waste_type" value={formData.waste_type} onChange={handle}
                                                placeholder="e.g., Fly Ash" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Category</label>
                                            <select name="waste_category" value={formData.waste_category} onChange={handle}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option>Mineral Waste</option>
                                                <option>Organic</option>
                                                <option>Metals</option>
                                                <option>Heat / Exothermic</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Quantity / Month</label>
                                            <input type="number" name="average_quantity_per_month" value={formData.average_quantity_per_month} onChange={handle}
                                                placeholder="e.g. 200" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Unit</label>
                                            <select name="unit" value={formData.unit} onChange={handle}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option>Tons / month</option>
                                                <option>kg / month</option>
                                                <option>Liters / month</option>
                                                <option>MWh (for heat)</option>
                                            </select>
                                        </div>
                                    </div>

                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <ShieldAlert className="text-primary w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Safety & Storage</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Hazardous Material?</label>
                                        <select name="hazard_level" value={formData.hazard_level} onChange={handle}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="no">No - Non Hazard</option>
                                            <option value="low">Yes - Low Risk</option>
                                            <option value="high">Yes - High/Toxic</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Storage Condition Required</label>
                                        <select name="storage_condition" value={formData.storage_condition} onChange={handle}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="dry">Dry / Covered Area</option>
                                            <option value="sealed">Sealed Containers / Barrels</option>
                                            <option value="open">Open Yard</option>
                                            <option value="temp">Temperature Controlled</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <Calendar className="text-primary w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Logistics & Availability</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Available From</label>
                                        <input type="month" name="available_from" value={formData.available_from} onChange={handle}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handle}
                                            placeholder="e.g. Nagpur" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Expected Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">₹</span>
                                            <input type="number" name="expected_price" value={formData.expected_price} onChange={handle}
                                                placeholder="per unit (leave blank if zero)"
                                                className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm" />
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <div className="bg-red-500/10 border-red-500/50 text-red-500 border p-3 rounded-md text-sm mt-4">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between mt-8 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 1 || isSubmitting}>Back</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : step < 3 ? "Next Step" : "Publish Listing"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
