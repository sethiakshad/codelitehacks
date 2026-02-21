/* eslint-disable no-unused-vars */
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { motion } from "framer-motion"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center w-10 h-10"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <Sun className="h-5 w-5 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90 text-yellow-500" />
                <Moon className="h-5 w-5 absolute transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0 text-blue-400" />
            </div>
        </motion.button>
    )
}
