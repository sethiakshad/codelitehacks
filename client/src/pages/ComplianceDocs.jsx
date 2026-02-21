import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/Card"
import { Button } from "../components/Button"
import { FileText, Download, CheckCircle2, FileWarning, Eye } from "lucide-react"

export default function ComplianceDocs() {
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const documents = [
        { id: "WTN-2026-0891", type: "Waste Transfer Note", date: "Oct 24, 2026", status: "Generated", party: "EcoSteel Refineries", hazard: "Low" },
        { id: "HWM-2026-0442", type: "Hazardous Waste Manifest", date: "Oct 22, 2026", status: "Pending Signature", party: "ChemCorp India", hazard: "High" },
        { id: "EIC-2026-1102", type: "Env. Impact Certificate", date: "Oct 15, 2026", status: "Generated", party: "Tata Motors", hazard: "None" },
        { id: "INV-2026-8839", type: "Tax Invoice", date: "Oct 15, 2026", status: "Paid", party: "Tata Motors", hazard: "None" },
    ]

    const handleGenerate = (doc) => {
        setIsGenerating(true)
        setTimeout(() => {
            setIsGenerating(false)
            setSelectedDoc(doc)
        }, 1500)
    }

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Compliance & Documentation</h1>
                <p className="text-muted-foreground mt-2">Auto-generate and manage regulatory documents for circular economy transfers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Document List */}
                <div className="lg:col-span-2 space-y-4">
                    {documents.map((doc, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={doc.id}
                        >
                            <Card className={`transition-all hover:border-primary/50 ${selectedDoc?.id === doc.id ? 'border-primary ring-1 ring-primary' : ''}`}>
                                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${doc.hazard === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                            {doc.hazard === 'High' ? <FileWarning className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{doc.type}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                <span>{doc.id}</span>
                                                <span>•</span>
                                                <span>{doc.party}</span>
                                                <span>•</span>
                                                <span>{doc.date}</span>
                                            </div>
                                            <div className="mt-2 text-xs font-medium inline-block px-2 py-1 rounded bg-muted/50">
                                                Status: <span className={doc.status === 'Generated' || doc.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}>{doc.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleGenerate(doc)}>
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
                                        <Button size="sm" className="w-full sm:w-auto" disabled={doc.status === 'Pending Signature'}>
                                            <Download className="w-4 h-4 mr-2" /> PDF
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Document Preview Drawer/Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="h-full min-h-[500px] sticky top-24 bg-muted/10">
                        <CardHeader>
                            <CardTitle>Document Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AnimatePresence mode="wait">
                                {isGenerating ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-64 space-y-4"
                                    >
                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Compiling regulatory data...</p>
                                    </motion.div>
                                ) : selectedDoc ? (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-background border rounded-lg p-6 shadow-sm text-sm space-y-4"
                                    >
                                        <div className="border-b pb-4 text-center">
                                            <h4 className="font-bold text-lg uppercase">{selectedDoc.type}</h4>
                                            <p className="text-muted-foreground text-xs mt-1">Govt. Form 13-B Equivalent</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <span className="text-muted-foreground">Document ID:</span>
                                                <span className="font-mono">{selectedDoc.id}</span>

                                                <span className="text-muted-foreground">Date of Transfer:</span>
                                                <span>{selectedDoc.date}</span>

                                                <span className="text-muted-foreground">Generator:</span>
                                                <span className="font-medium">Origin Factory Ltd.</span>

                                                <span className="text-muted-foreground">Receiver:</span>
                                                <span className="font-medium">{selectedDoc.party}</span>
                                            </div>

                                            <div className="p-3 bg-muted/50 rounded text-xs space-y-1">
                                                <p className="font-semibold mb-2">Material Declaration</p>
                                                <p>Description: Industrial byproducts as specified.</p>
                                                <p>EWC Code: 10 02 02</p>
                                                <p>Quantity: 12.00 Metric Tons</p>
                                            </div>

                                            <div className="flex items-center gap-2 pt-4 border-t text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-medium">Digital Signature Valid</span>
                                            </div>
                                        </div>

                                        <Button className="w-full mt-4"><Download className="w-4 h-4 mr-2" /> Download Official PDF</Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-64 text-center"
                                    >
                                        <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                        <p className="text-muted-foreground">Select a document to preview the auto-generated compliance form.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
