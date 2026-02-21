
import { motion } from "framer-motion"
import { ArrowRight, Leaf, ShieldCheck, Zap } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"

export default function Landing() {
    return (
        <div className="flex flex-col gap-24 py-12">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center space-y-8 mt-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted/50"
                >
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                    Revolutionizing Industrial Waste
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    Turn Byproducts into <span className="text-primary">Raw Materials</span>
                </motion.h1>

                <motion.p
                    className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    The intelligent B2B marketplace that matches factory waste outputs with businesses that need them. Save costs, reduce landfills, and automate compliance.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link to="/dashboard" className="w-full">
                        <Button size="lg" className="w-full text-base h-12 gap-2">
                            Start Listing <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link to="/dashboard" className="w-full">
                        <Button size="lg" variant="outline" className="w-full text-base h-12">
                            Find Materials
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
                {[
                    { icon: Leaf, label: "CO2 Saved", value: "14.2M", unit: "tonnes" },
                    { icon: ShieldCheck, label: "Landfill Diverted", value: "8.5M", unit: "tonnes" },
                    { icon: Zap, label: "Energy Saved", value: "240", unit: "GWh" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex flex-col items-center p-8 rounded-2xl bg-card border shadow-sm text-card-foreground"
                    >
                        <div className="p-3 bg-primary/10 text-primary rounded-xl mb-4">
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-4xl font-bold tracking-tight mb-1">{stat.value}</h3>
                        <p className="text-muted-foreground font-medium">{stat.label}</p>
                        <p className="text-sm text-muted-foreground/70">{stat.unit}</p>
                    </motion.div>
                ))}
            </section>
        </div>
    )
}
