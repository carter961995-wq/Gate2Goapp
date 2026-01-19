//
//  ProposalGenerator.swift
//  Gate2Go
//

import SwiftUI
import PDFKit

struct ProposalGenerator {
    
    static func generatePDF(design: GateDesignModel, project: ProjectModel, settings: Gate2GoSettings) -> Data? {
        let pageWidth: CGFloat = 612
        let pageHeight: CGFloat = 792
        let margin: CGFloat = 50
        
        let pdfMetaData = [
            kCGPDFContextCreator: "Gate2Go",
            kCGPDFContextAuthor: settings.companyName.isEmpty ? "Gate2Go" : settings.companyName,
            kCGPDFContextTitle: "Gate Proposal - \(project.name)"
        ]
        
        let format = UIGraphicsPDFRendererFormat()
        format.documentInfo = pdfMetaData as [String: Any]
        
        let pageRect = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)
        let renderer = UIGraphicsPDFRenderer(bounds: pageRect, format: format)
        
        let data = renderer.pdfData { context in
            context.beginPage()
            
            var yPosition: CGFloat = margin
            
            // Company Header
            if !settings.companyName.isEmpty {
                let companyFont = UIFont.boldSystemFont(ofSize: 24)
                let companyAttrs: [NSAttributedString.Key: Any] = [.font: companyFont]
                settings.companyName.draw(at: CGPoint(x: margin, y: yPosition), withAttributes: companyAttrs)
                yPosition += 35
            }
            
            // Company contact info
            var contactParts: [String] = []
            if !settings.companyPhone.isEmpty { contactParts.append(settings.companyPhone) }
            if !settings.companyEmail.isEmpty { contactParts.append(settings.companyEmail) }
            if !contactParts.isEmpty {
                let contactFont = UIFont.systemFont(ofSize: 12)
                let contactAttrs: [NSAttributedString.Key: Any] = [.font: contactFont, .foregroundColor: UIColor.darkGray]
                contactParts.joined(separator: " | ").draw(at: CGPoint(x: margin, y: yPosition), withAttributes: contactAttrs)
                yPosition += 25
            }
            
            // Divider line
            yPosition += 10
            let linePath = UIBezierPath()
            linePath.move(to: CGPoint(x: margin, y: yPosition))
            linePath.addLine(to: CGPoint(x: pageWidth - margin, y: yPosition))
            UIColor.lightGray.setStroke()
            linePath.lineWidth = 1
            linePath.stroke()
            yPosition += 20
            
            // Proposal Title
            let titleFont = UIFont.boldSystemFont(ofSize: 20)
            let titleAttrs: [NSAttributedString.Key: Any] = [.font: titleFont]
            "Gate Proposal".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: titleAttrs)
            yPosition += 35
            
            // Project Info
            let labelFont = UIFont.boldSystemFont(ofSize: 12)
            let valueFont = UIFont.systemFont(ofSize: 12)
            let labelAttrs: [NSAttributedString.Key: Any] = [.font: labelFont]
            let valueAttrs: [NSAttributedString.Key: Any] = [.font: valueFont]
            
            "Project:".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: labelAttrs)
            project.name.draw(at: CGPoint(x: margin + 80, y: yPosition), withAttributes: valueAttrs)
            yPosition += 20
            
            if let clientName = project.clientName, !clientName.isEmpty {
                "Client:".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: labelAttrs)
                clientName.draw(at: CGPoint(x: margin + 80, y: yPosition), withAttributes: valueAttrs)
                yPosition += 20
            }
            
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .long
            "Date:".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: labelAttrs)
            dateFormatter.string(from: Date()).draw(at: CGPoint(x: margin + 80, y: yPosition), withAttributes: valueAttrs)
            yPosition += 35
            
            // Gate Specifications Section
            let sectionFont = UIFont.boldSystemFont(ofSize: 16)
            let sectionAttrs: [NSAttributedString.Key: Any] = [.font: sectionFont]
            "Gate Specifications".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: sectionAttrs)
            yPosition += 25
            
            let specs = [
                ("Style:", design.gateStyle.displayName),
                ("Material:", design.material.displayName),
                ("Width:", "\(Int(design.widthFeet)) feet"),
                ("Height:", "\(Int(design.heightFeet)) feet")
            ]
            
            for (label, value) in specs {
                label.draw(at: CGPoint(x: margin, y: yPosition), withAttributes: labelAttrs)
                value.draw(at: CGPoint(x: margin + 100, y: yPosition), withAttributes: valueAttrs)
                yPosition += 18
            }
            yPosition += 20
            
            // Add-ons Section
            if !design.addons.isEmpty {
                "Add-ons".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: sectionAttrs)
                yPosition += 25
                
                for addon in design.addons {
                    let addonText = "\(addon.title) (qty: \(addon.quantity))"
                    let addonPrice = MoneyFormatting.dollarsString(cents: addon.contractorCost.amountCents * addon.quantity)
                    addonText.draw(at: CGPoint(x: margin, y: yPosition), withAttributes: valueAttrs)
                    addonPrice.draw(at: CGPoint(x: pageWidth - margin - 80, y: yPosition), withAttributes: valueAttrs)
                    yPosition += 18
                }
                yPosition += 20
            }
            
            // Pricing Section
            "Pricing".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: sectionAttrs)
            yPosition += 25
            
            let priceItems = [
                ("Base Price:", MoneyFormatting.dollarsString(cents: design.basePriceCents))
            ]
            
            for (label, value) in priceItems {
                label.draw(at: CGPoint(x: margin, y: yPosition), withAttributes: labelAttrs)
                value.draw(at: CGPoint(x: pageWidth - margin - 80, y: yPosition), withAttributes: valueAttrs)
                yPosition += 18
            }
            
            // Add-ons total
            if !design.addons.isEmpty {
                let addonsTotal = design.addons.reduce(0) { $0 + ($1.contractorCost.amountCents * $1.quantity) }
                "Add-ons:".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: labelAttrs)
                MoneyFormatting.dollarsString(cents: addonsTotal).draw(at: CGPoint(x: pageWidth - margin - 80, y: yPosition), withAttributes: valueAttrs)
                yPosition += 18
            }
            
            yPosition += 10
            
            // Total line
            let totalLinePath = UIBezierPath()
            totalLinePath.move(to: CGPoint(x: margin, y: yPosition))
            totalLinePath.addLine(to: CGPoint(x: pageWidth - margin, y: yPosition))
            UIColor.black.setStroke()
            totalLinePath.lineWidth = 1
            totalLinePath.stroke()
            yPosition += 15
            
            let totalFont = UIFont.boldSystemFont(ofSize: 16)
            let totalAttrs: [NSAttributedString.Key: Any] = [.font: totalFont]
            "Total:".draw(at: CGPoint(x: margin, y: yPosition), withAttributes: totalAttrs)
            MoneyFormatting.dollarsString(cents: design.totalPriceCents).draw(at: CGPoint(x: pageWidth - margin - 80, y: yPosition), withAttributes: totalAttrs)
            yPosition += 40
            
            // Footer
            let footerFont = UIFont.italicSystemFont(ofSize: 10)
            let footerAttrs: [NSAttributedString.Key: Any] = [.font: footerFont, .foregroundColor: UIColor.gray]
            let footer = "Generated by Gate2Go on \(dateFormatter.string(from: Date()))"
            footer.draw(at: CGPoint(x: margin, y: pageHeight - margin), withAttributes: footerAttrs)
        }
        
        return data
    }
    
    static func shareProposal(design: GateDesignModel, project: ProjectModel, settings: Gate2GoSettings) {
        guard let pdfData = generatePDF(design: design, project: project, settings: settings) else { return }
        
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("Gate_Proposal_\(project.name.replacingOccurrences(of: " ", with: "_")).pdf")
        
        do {
            try pdfData.write(to: tempURL)
            
            let activityVC = UIActivityViewController(activityItems: [tempURL], applicationActivities: nil)
            
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
               let rootVC = windowScene.windows.first?.rootViewController {
                if let popover = activityVC.popoverPresentationController {
                    popover.sourceView = rootVC.view
                    popover.sourceRect = CGRect(x: rootVC.view.bounds.midX, y: rootVC.view.bounds.midY, width: 0, height: 0)
                }
                rootVC.present(activityVC, animated: true)
            }
        } catch {
            print("Failed to save PDF: \(error)")
        }
    }
}
