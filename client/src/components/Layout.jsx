import { Outlet, Link, useNavigate } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { Recycle, LogOut, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Button } from "./Button"

export default function Layout() {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen flex flex-col items-center">
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md justify-center flex">
                <div className="container flex h-16 items-center justify-between px-4 w-full">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <Recycle className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">IndusCycle</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Dashboard
                                </Link>
                                <Link to="/list-waste" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    New Listing
                                </Link>
                                <Link to="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Docs
                                </Link>
                                <div className="h-4 w-px bg-border" />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-foreground">{user?.name || user?.email}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-destructive">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Login
                                </Link>
                                <Link to="/register">
                                    <Button size="sm">Register Factory</Button>
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl px-4 py-8">
                <Outlet />
            </main>

            <footer className="border-t py-6 md:py-0 w-full flex justify-center mt-auto">
                <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
                    <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built for Circular Economy. Reducing landfill waste by monetizing industrial byproducts.
                    </p>
                </div>
            </footer>
        </div>
    )
}
