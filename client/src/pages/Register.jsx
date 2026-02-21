import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, Briefcase, MapPin, FileCheck, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { Link, useNavigate } from "react-router-dom"

export default function Register() {
    const [step, setStep] = useState(1)
    const [role, setRole] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setTimeout(() => {
            setIsSubmitting(false)
            setStep(4) // Success step
        }, 1500)
    }

    const roleCards = [
        {
            id: "producer",
            title: "Waste Producer",
            description: "I am a factory looking to list my industrial byproducts and monetize waste.",
            icon: Building2,
        },
        {
            id: "buyer",
            title: "Material Buyer",
            description: "I am looking to buy secondary raw materials to reduce production costs.",
            icon: Briefcase,
        }
    ]

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
                <p className="text-muted-foreground mt-2">Join the Circular Economy Marketplace</p>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-center">Select your primary role</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {roleCards.map((r) => (
                                <Card
                                    key={r.id}
                                    className={`cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden ${role === r.id ? 'border-primary shadow-sm bg-primary/5' : ''}`}
                                    onClick={() => setRole(r.id)}
                                >
                                    <CardHeader>
                                        <div className={`p-3 rounded-xl mb-2 inline-flex ${role === r.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <r.icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-lg">{r.title}</CardTitle>
                                        <CardDescription className="text-sm">{r.description}</CardDescription>
                                    </CardHeader>
                                    {role === r.id && (
                                        <motion.div layoutId="active-indicator" className="absolute top-4 right-4 text-primary">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </motion.div>
                                    )}
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button onClick={handleNext} disabled={!role} className="w-full sm:w-auto">
                                Continue
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Already have an account? <Link to="#" className="text-primary hover:underline">Log in</Link>
                        </p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                                <CardDescription>We need some basic information about your {role === 'producer' ? 'factory' : 'business'}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Company Name</label>
                                        <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Tata Steel Plant" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Industry Type</label>
                                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                                            <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm" placeholder="City, State" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email Address</label>
                                            <input type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="admin@company.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Password</label>
                                            <input type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                            <div className="flex justify-between p-6 pt-0">
                                <Button variant="ghost" onClick={handleBack}>Back</Button>
                                <Button onClick={handleNext}>Next Step</Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance & Verification</CardTitle>
                                <CardDescription>Upload necessary licenses to ensure regulatory compliance.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6" onSubmit={handleSubmit}>

                                    {role === 'producer' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Primary Waste Categories Generated</label>
                                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" multiple size={3}>
                                                <option>Mineral Waste</option>
                                                <option>Chemical / Hazardous</option>
                                                <option>Organic / Biomass</option>
                                                <option>Heat / Thermal Exothermic</option>
                                                <option>Metals</option>
                                            </select>
                                            <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple.</p>
                                        </div>
                                    )}

                                    <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-4 bg-muted/20">
                                        <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                            <FileCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">Upload Regulatory Licenses</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Upload State Pollution Control Board clearance documents (PDF).</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm">Select Files</Button>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="terms" className="rounded border-input text-primary focus:ring-primary h-4 w-4" required />
                                        <label htmlFor="terms" className="text-sm font-medium leading-none required">
                                            I agree to the terms of the Circular Economy Marketplace.
                                        </label>
                                    </div>

                                    <div className="flex justify-between pt-4 border-t">
                                        <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>Back</Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? "Creating Account..." : "Complete Registration"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 pb-12"
                    >
                        <div className="mx-auto w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold">Registration Successful!</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Your account is pending verification. Once approved, you can start trading on the marketplace.</p>
                        <div className="pt-6">
                            <Button onClick={() => navigate(role === 'producer' ? '/producer' : '/buyer')}>
                                Go to {role === 'producer' ? 'Producer' : 'Buyer'} Dashboard
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
