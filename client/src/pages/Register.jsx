import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, MapPin, FileCheck, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"

export default function Register() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [licenseFile, setLicenseFile] = useState(null)
    const [formData, setFormData] = useState({
        name: "", industryType: "", location: "", email: "", password: ""
    })
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            const data = await api.post("/api/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: "factory_manager"
            })
            login(data.token, data.user)

            // Create factory record with file upload
            const factoryData = new FormData();
            factoryData.append("name", formData.name);
            factoryData.append("industry_type", formData.industryType);
            factoryData.append("email", formData.email);
            factoryData.append("city", formData.location.split(",")[0]?.trim() || "");
            factoryData.append("state", formData.location.split(",")[1]?.trim() || "");
            if (licenseFile) {
                factoryData.append("licenseFile", licenseFile);
            }

            await api.post("/api/factories", factoryData)

            setStep(3) // Success
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-12">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Building2 className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Register Your Factory</h1>
                <p className="text-muted-foreground mt-2">Join the Circular Economy Marketplace</p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Factory Details</CardTitle>
                                <CardDescription>Tell us about your factory and facility.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Factory Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="e.g. Tata Steel Plant" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Industry Type</label>
                                        <select name="industryType" value={formData.industryType} onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option value="">Select industry...</option>
                                            <option>Cement</option>
                                            <option>Steel / Metal</option>
                                            <option>Textile</option>
                                            <option>Pharmaceutical</option>
                                            <option>Chemical</option>
                                            <option>Agriculture & Food</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Facility Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <input type="text" name="location" value={formData.location} onChange={handleChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm"
                                                placeholder="City, State" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                placeholder="admin@factory.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Password</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                placeholder="••••••••" />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                            <div className="flex justify-between p-6 pt-0">
                                <p className="text-sm text-muted-foreground self-center">
                                    Already registered? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                                </p>
                                <Button onClick={() => setStep(2)} disabled={!formData.name || !formData.email || !formData.password}>
                                    Next Step
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance & Verification</CardTitle>
                                <CardDescription>Upload necessary licenses to ensure regulatory compliance.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Primary Waste Categories Generated</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" multiple size={4}>
                                            <option>Mineral Waste</option>
                                            <option>Chemical / Hazardous</option>
                                            <option>Organic / Biomass</option>
                                            <option>Heat / Thermal Exothermic</option>
                                            <option>Metals</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple.</p>
                                    </div>

                                    <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-4 bg-muted/20">
                                        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                            <FileCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Upload Regulatory Licenses</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Upload State Pollution Control Board clearance documents (PDF).</p>
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                id="licenseUpload"
                                                className="hidden"
                                                accept=".pdf,.png,.jpg,.jpeg"
                                                onChange={(e) => setLicenseFile(e.target.files[0])}
                                            />
                                            <label htmlFor="licenseUpload">
                                                <Button type="button" variant="outline" size="sm" asChild>
                                                    <span>{licenseFile ? licenseFile.name : "Select Files"}</span>
                                                </Button>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="terms" className="rounded border-input text-primary h-4 w-4" required />
                                        <label htmlFor="terms" className="text-sm font-medium">
                                            I agree to the terms of the Circular Economy Marketplace.
                                        </label>
                                    </div>

                                    {error && (
                                        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">{error}</div>
                                    )}

                                    <div className="flex justify-between pt-4 border-t">
                                        <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>Back</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Creating Account..." : "Complete Registration"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 pb-12">
                        <div className="mx-auto w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold">Registration Successful!</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Your factory account has been created. Welcome to the Circular Economy Marketplace!</p>
                        <div className="pt-6">
                            <Button onClick={() => navigate("/dashboard")}>Go to Factory Dashboard</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
