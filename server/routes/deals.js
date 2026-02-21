import { Router } from "express";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");
import Deal from "../models/deals.model.js";
import Formula from "../models/formulas.model.js";
import FactoryWasteProfile from "../models/factoryWasteProfiles.model.js";
import Factory from "../models/factories.model.js";
import User from "../models/users.model.js";
import auth from "../middleware/auth.js";

export default function (io) {
    const router = Router();

    // POST /api/deals — Initiate a new deal
    router.post("/", auth, async (req, res) => {
        const { listing_id, quantity } = req.body;

        try {
            const listing = await FactoryWasteProfile.findById(listing_id).populate("factory_id");
            if (!listing) return res.status(404).json({ message: "Listing not found." });

            let sellerUser = null;
            if (listing.user_id) {
                sellerUser = await User.findById(listing.user_id);
            } else if (listing.factory_id) {
                // Fallback for older listings: find the user who manages this factory by matching emails
                const factory = await Factory.findById(listing.factory_id);
                if (factory && factory.email) {
                    sellerUser = await User.findOne({ email: factory.email });
                }
            }

            // Fetch new Formula Factors for the material
            let virgin_ef = 2.5; // fallbacks if missing
            let recycled_ef = 0.8;

            const formulaObj = await Formula.findOne({ material: listing.waste_type });
            if (formulaObj && formulaObj.virgin && formulaObj.recycled) {
                virgin_ef = formulaObj.virgin;
                recycled_ef = formulaObj.recycled;
            }

            // CO2 Saved Calculation
            // CO2 Saved = (Virgin - Recycled) * Quantity
            const co2_saved = (virgin_ef - recycled_ef) * Number(quantity);
            const landfill_diverted = Number(quantity);

            const deal = await Deal.create({
                buyer_id: req.user.id,
                seller_id: sellerUser ? sellerUser._id : (listing.user_id || listing.factory_id),
                listing_id: listing._id,
                quantity: Number(quantity),
                co2_saved,
                landfill_diverted,
                status: "Pending"
            });

            // Populate the deal
            await deal.populate("buyer_id", "name email");
            await deal.populate("listing_id", "waste_type");

            // REAL-TIME WEBSOCKET: Notify the Seller
            if (sellerUser) {
                io.to(sellerUser._id.toString()).emit("new_deal", {
                    message: `New deal initiated for ${listing.waste_type}!`,
                    deal
                });
            }

            res.status(201).json({ data: deal, message: "Deal initiated successfully." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error creating deal." });
        }
    });

    // GET /api/deals — Get deals for logged-in user (bought or sold)
    router.get("/", auth, async (req, res) => {
        try {
            const deals = await Deal.find({
                $or: [{ buyer_id: req.user.id }, { seller_id: req.user.id }]
            })
                .populate("buyer_id", "name")
                .populate("seller_id", "name")
                .populate("listing_id")
                .sort({ createdAt: -1 });

            res.status(200).json(deals);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error fetching deals." });
        }
    });

    // PUT /api/deals/:id/status — Update deal status (e.g. Seller approves)
    router.put("/:id/status", auth, async (req, res) => {
        const { status } = req.body;

        try {
            const deal = await Deal.findById(req.params.id);
            if (!deal) return res.status(404).json({ message: "Deal not found." });

            // Only the seller can approve/complete the deal
            if (deal.seller_id.toString() !== req.user.id && status === "Completed") {
                return res.status(403).json({ message: "Only the seller can approve this deal." });
            }

            deal.status = status;
            await deal.save();

            // Notify both buyer and seller of the status change
            const updatedDeal = await deal.populate([
                { path: "buyer_id", select: "name" },
                { path: "seller_id", select: "name" },
                { path: "listing_id" }
            ])
            const dealPayload = { message: `Deal status updated to ${status}!`, deal: updatedDeal }
            io.to(deal.buyer_id.toString()).emit("deal_updated", dealPayload)
            io.to(deal.seller_id.toString()).emit("deal_updated", dealPayload)

            res.status(200).json(deal);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error updating deal." });
        }
    });

    // GET /api/deals/:id/compliance-pdf — Generate and stream Compliance Document
    router.get("/:id/compliance-pdf", auth, async (req, res) => {
        try {
            const deal = await Deal.findById(req.params.id)
                .populate("buyer_id", "name email")
                .populate("seller_id", "name email")
                .populate("listing_id");

            if (!deal) return res.status(404).json({ message: "Deal not found." });

            const listing = deal.listing_id;
            const buyer = deal.buyer_id;
            const seller = deal.seller_id;
            const pickupDate = new Date(deal.createdAt).toLocaleDateString("en-IN", {
                year: "numeric", month: "long", day: "numeric"
            });

            // Stream PDF
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="Compliance_Doc_${deal._id.toString().slice(-6)}.pdf"`);

            const doc = new PDFDocument({ margin: 50, size: "A4" });
            doc.pipe(res);

            // ── Header Bar ──────────────────────────────────────────────────
            doc.rect(0, 0, doc.page.width, 80).fill("#16a34a");
            doc.fillColor("white").fontSize(22).font("Helvetica-Bold")
                .text("IndusCycle", 50, 22);
            doc.fontSize(10).font("Helvetica")
                .text("Certified Compliance Document", 50, 50);
            doc.fillColor("black");

            // ── Title ───────────────────────────────────────────────────────
            doc.moveDown(3);
            doc.fontSize(16).font("Helvetica-Bold")
                .text("WASTE TRANSFER COMPLIANCE CERTIFICATE", { align: "center" });
            doc.moveDown(0.3);
            doc.fontSize(9).font("Helvetica").fillColor("#6b7280")
                .text(`Document ID: INDUS-${deal._id.toString().toUpperCase().slice(-10)}   |   Generated: ${new Date().toLocaleString("en-IN")}`, { align: "center" });
            doc.fillColor("black");

            // ── Divider ─────────────────────────────────────────────────────
            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#d1fae5").lineWidth(2).stroke();
            doc.moveDown(1);

            const sectionTitle = (text) => {
                const y = doc.y + 4;                          // small top padding
                doc.rect(50, y, 495, 22).fill("#f0fdf4");    // draw background rect
                doc.fillColor("#15803d").fontSize(10).font("Helvetica-Bold")
                    .text(text, 56, y + 5, { lineBreak: false }); // text inside rect
                doc.fillColor("black");
                doc.y = y + 30;                              // advance past rect + padding
            };

            const ROW_H = 18;
            const row = (label, value) => {
                const y = doc.y;
                doc.fontSize(9).font("Helvetica-Bold").fillColor("#374151")
                    .text(label, 56, y, { width: 180, lineBreak: false });
                doc.fontSize(9).font("Helvetica").fillColor("#111827")
                    .text(String(value || "N/A"), 240, y, { width: 300, lineBreak: false });
                doc.y = y + ROW_H;                           // fixed line height, no drift
            };

            // ── Section 1: Producer ─────────────────────────────────────────
            sectionTitle("1. PRODUCER (SELLER) DETAILS");
            row("Name", seller?.name || "—");
            row("Email", seller?.email || "—");
            row("License ID", `PROD-${seller?._id?.toString().slice(-8).toUpperCase() || "N/A"}`);
            doc.y += 10;

            // ── Section 2: Buyer ─────────────────────────────────────────────
            sectionTitle("2. BUYER DETAILS");
            row("Name", buyer?.name || "—");
            row("Email", buyer?.email || "—");
            row("License ID", `BUYER-${buyer?._id?.toString().slice(-8).toUpperCase() || "N/A"}`);
            doc.y += 10;

            // ── Section 3: Waste Details ─────────────────────────────────────
            sectionTitle("3. WASTE TRANSFER DETAILS");
            row("Waste Category", listing?.waste_type || "—");
            row("Quantity Transferred", `${deal.quantity} tonnes`);
            row("Hazard Level", listing?.hazardous ? "Hazardous" : "Non-Hazardous");
            row("CO2 Saved", `${deal.co2_saved?.toFixed(2) || 0} tonnes`);
            row("Landfill Diverted", `${deal.landfill_diverted || deal.quantity} tonnes`);
            doc.y += 10;

            // ── Section 4: Logistics ─────────────────────────────────────────
            sectionTitle("4. LOGISTICS & TRANSPORTER");
            row("Pickup Date", pickupDate);
            row("Transporter Name", "IndusCycle Logistics Pvt Ltd");
            row("Transporter License", "TRP-2024-IND-00192");
            row("Vehicle Number", `MH-${Math.floor(1000 + Math.random() * 9000)}-XY`);
            row("Route", "Factory to Processing Facility");
            doc.y += 10;

            // ── Section 5: Deal Info ─────────────────────────────────────────
            sectionTitle("5. DEAL INFORMATION");
            row("Deal ID", deal._id.toString());
            row("Deal Status", deal.status);
            row("Transport Status", "Completed");
            row("Initiated On", new Date(deal.createdAt).toLocaleString("en-IN"));
            doc.y += 16;

            // ── Divider ──────────────────────────────────────────────────────
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#d1fae5").lineWidth(1).stroke();
            doc.moveDown(1.5);

            // ── Section 6: Signatures ─────────────────────────────────────────
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#15803d")
                .text("6. SIGNATURES & CERTIFICATION", 50);
            doc.fillColor("black").moveDown(0.5);

            doc.fontSize(9).font("Helvetica")
                .text("By signing below, both parties certify that the waste transfer described in this document has been completed lawfully and in accordance with IndusCycle platform guidelines.", 50, doc.y, { width: 495 });
            doc.moveDown(2);

            // Signature boxes
            const sigY = doc.y;
            // Producer
            doc.rect(50, sigY, 200, 70).strokeColor("#d1d5db").lineWidth(1).stroke();
            doc.fontSize(8).fillColor("#6b7280").text("Producer Signature", 60, sigY + 8);
            doc.moveTo(60, sigY + 50).lineTo(240, sigY + 50).strokeColor("#9ca3af").lineWidth(0.5).stroke();
            doc.fontSize(8).fillColor("#374151").text(seller?.name || "Producer", 60, sigY + 55);

            // Buyer
            doc.rect(290, sigY, 200, 70).strokeColor("#d1d5db").lineWidth(1).stroke();
            doc.fontSize(8).fillColor("#6b7280").text("Buyer Signature", 300, sigY + 8);
            doc.moveTo(300, sigY + 50).lineTo(480, sigY + 50).strokeColor("#9ca3af").lineWidth(0.5).stroke();
            doc.fontSize(8).fillColor("#374151").text(buyer?.name || "Buyer", 300, sigY + 55);

            doc.moveDown(5.5);

            // ── Footer ────────────────────────────────────────────────────────
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#d1fae5").lineWidth(1).stroke();
            doc.moveDown(0.5);
            doc.fontSize(7.5).fillColor("#9ca3af").font("Helvetica")
                .text(
                    "This document is auto-generated by IndusCycle Platform. It is legally binding upon digital acceptance by both parties. | induścycle.io",
                    50, doc.y, { align: "center", width: 495 }
                );

            doc.end();
        } catch (err) {
            console.error("PDF generation error:", err);
            if (!res.headersSent) res.status(500).json({ message: "Failed to generate compliance document." });
        }
    });

    return router;
}
