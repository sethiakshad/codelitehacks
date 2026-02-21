import { useState } from "react"
import { motion } from "framer-motion"
import { Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || "Login failed.")
            } else {
                localStorage.setItem("token", data.token)
                navigate("/dashboard")
            }
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-12">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Building2 className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Factory Login</h1>
                <p className="text-muted-foreground mt-2">Sign in to your factory account</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="admin@factory.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <input
                                    type="password" name="password" value={formData.password} onChange={handleChange} required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground pt-2">
                                Don't have an account?{" "}
                                <Link to="/register" className="text-primary hover:underline">
                                    Register your factory
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
