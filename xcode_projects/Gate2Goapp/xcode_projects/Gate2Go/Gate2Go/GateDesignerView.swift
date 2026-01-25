//
//  GateDesignerView.swift
//  Gate2Go
//

import SwiftUI

struct GateMaterialColors {
    let primary: Color
    let secondary: Color
    let accent: Color
    
    static func colors(for material: Material) -> GateMaterialColors {
        switch material {
        case .wood:
            return GateMaterialColors(
                primary: Color(red: 0.545, green: 0.412, blue: 0.078),
                secondary: Color(red: 0.651, green: 0.486, blue: 0.0),
                accent: Color(red: 0.831, green: 0.659, blue: 0.294)
            )
        case .steel:
            return GateMaterialColors(
                primary: Color(red: 0.29, green: 0.29, blue: 0.29),
                secondary: Color(red: 0.42, green: 0.42, blue: 0.42),
                accent: Color(red: 0.55, green: 0.55, blue: 0.55)
            )
        case .chainLink:
            return GateMaterialColors(
                primary: Color(red: 0.61, green: 0.64, blue: 0.69),
                secondary: Color(red: 0.82, green: 0.84, blue: 0.86),
                accent: Color(red: 0.90, green: 0.91, blue: 0.91)
            )
        case .aluminum:
            return GateMaterialColors(
                primary: Color(red: 0.66, green: 0.66, blue: 0.66),
                secondary: Color(red: 0.77, green: 0.77, blue: 0.77),
                accent: Color(red: 0.86, green: 0.86, blue: 0.86)
            )
        }
    }
}

struct GateDesignerView: View {
    let widthFeet: Double
    let heightFeet: Double
    let material: Material
    let gateStyle: GateStyle
    var picketOrientation: GatePicketOrientation = .vertical
    var finialStyle: GateFinialStyle = .none
    var archStyle: GateArchStyle = .flat
    var archHeight: CGFloat = 20
    var picketSpacing: CGFloat = 4
    var picketWidth: CGFloat = 3
    
    private let canvasWidth: CGFloat = 320
    private let canvasHeight: CGFloat = 220
    private let padding: CGFloat = 16
    private let frameWidth: CGFloat = 4
    
    private var colors: GateMaterialColors {
        GateMaterialColors.colors(for: material)
    }
    
    private var aspectRatio: CGFloat {
        CGFloat(widthFeet / heightFeet)
    }
    
    private var gateSize: CGSize {
        let maxWidth = canvasWidth - padding * 2
        let maxHeight = canvasHeight - padding * 2
        
        var gateWidth = maxWidth
        var gateHeight = gateWidth / aspectRatio
        
        if gateHeight > maxHeight {
            gateHeight = maxHeight
            gateWidth = gateHeight * aspectRatio
        }
        
        return CGSize(width: gateWidth, height: gateHeight)
    }
    
    private var gateOrigin: CGPoint {
        CGPoint(
            x: (canvasWidth - gateSize.width) / 2,
            y: (canvasHeight - gateSize.height) / 2
        )
    }
    
    private var isDoubleDoor: Bool {
        gateStyle == .doubleSwing || gateStyle == .cantileverSlide
    }
    
    var body: some View {
        Canvas { context, size in
            let gateRect = CGRect(origin: gateOrigin, size: gateSize)
            
            let framePath = RoundedRectangle(cornerRadius: 2)
                .path(in: gateRect)
            context.fill(framePath, with: .color(colors.primary))
            context.stroke(framePath, with: .color(colors.secondary), lineWidth: frameWidth)
            
            drawPickets(context: context, gateRect: gateRect)
            
            if isDoubleDoor {
                let centerX = gateRect.midX
                var centerPath = Path()
                centerPath.move(to: CGPoint(x: centerX, y: gateRect.minY + frameWidth))
                centerPath.addLine(to: CGPoint(x: centerX, y: gateRect.maxY - frameWidth))
                context.stroke(centerPath, with: .color(colors.secondary), lineWidth: 2)
            }
            
            drawHandles(context: context, gateRect: gateRect)
        }
        .frame(width: canvasWidth, height: canvasHeight)
        .background(Color(uiColor: .secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    private func drawPickets(context: GraphicsContext, gateRect: CGRect) {
        let picketCount = Int(gateSize.width / (picketWidth + picketSpacing))
        let actualSpacing = (gateSize.width - CGFloat(picketCount) * picketWidth) / CGFloat(picketCount + 1)
        
        if picketOrientation == .vertical {
            for i in 0..<picketCount {
                let x = gateRect.minX + actualSpacing + CGFloat(i) * (picketWidth + actualSpacing)
                var topY = gateRect.minY + frameWidth
                let bottomY = gateRect.maxY - frameWidth
                
                topY = calculateArchOffset(x: x + picketWidth / 2, gateRect: gateRect, baseY: topY)
                
                let picketRect = CGRect(x: x, y: topY, width: picketWidth, height: bottomY - topY)
                context.fill(Path(picketRect), with: .color(colors.primary))
                context.stroke(Path(picketRect), with: .color(colors.secondary), lineWidth: 0.5)
                
                if finialStyle != .none && material == .steel {
                    drawFinial(context: context, x: x + picketWidth / 2, y: topY)
                }
            }
        } else {
            let slotHeight = picketWidth
            let slotCount = Int((gateSize.height - frameWidth * 2) / (slotHeight + actualSpacing))
            
            for j in 0..<slotCount {
                let y = gateRect.minY + frameWidth + actualSpacing / 2 + CGFloat(j) * (slotHeight + actualSpacing)
                let slotRect = CGRect(
                    x: gateRect.minX + frameWidth,
                    y: y,
                    width: gateSize.width - frameWidth * 2,
                    height: slotHeight
                )
                context.fill(Path(slotRect), with: .color(colors.primary))
                context.stroke(Path(slotRect), with: .color(colors.secondary), lineWidth: 0.5)
            }
        }
    }
    
    private func calculateArchOffset(x: CGFloat, gateRect: CGRect, baseY: CGFloat) -> CGFloat {
        switch archStyle {
        case .flat:
            return baseY
        case .convex:
            let midX = gateRect.midX
            let progress = abs(x - midX) / (gateSize.width / 2)
            return baseY + (1 - progress) * archHeight
        case .concave:
            let midX = gateRect.midX
            let progress = abs(x - midX) / (gateSize.width / 2)
            return baseY + progress * archHeight
        case .doubleArch:
            if isDoubleDoor {
                let halfWidth = gateSize.width / 2
                let leftMid = gateRect.minX + halfWidth / 2
                let rightMid = gateRect.minX + halfWidth + halfWidth / 2
                
                if x < gateRect.minX + halfWidth {
                    let progress = abs(x - leftMid) / (halfWidth / 2)
                    return baseY + (1 - progress) * archHeight
                } else {
                    let progress = abs(x - rightMid) / (halfWidth / 2)
                    return baseY + (1 - progress) * archHeight
                }
            }
            return baseY
        }
    }
    
    private func drawFinial(context: GraphicsContext, x: CGFloat, y: CGFloat) {
        let size: CGFloat = 6
        
        switch finialStyle {
        case .none:
            break
        case .spear:
            var path = Path()
            path.move(to: CGPoint(x: x, y: y - size * 2))
            path.addLine(to: CGPoint(x: x - size / 2, y: y))
            path.addLine(to: CGPoint(x: x + size / 2, y: y))
            path.closeSubpath()
            context.fill(path, with: .color(colors.accent))
            context.stroke(path, with: .color(colors.primary), lineWidth: 0.5)
        case .ball:
            let ballRect = CGRect(x: x - size / 1.5 / 2, y: y - size - size / 1.5, width: size / 1.5 * 2, height: size / 1.5 * 2)
            context.fill(Path(ellipseIn: ballRect), with: .color(colors.accent))
            context.stroke(Path(ellipseIn: ballRect), with: .color(colors.primary), lineWidth: 0.5)
        case .fleurDeLis:
            var path = Path()
            path.move(to: CGPoint(x: x, y: y - size * 1.5))
            path.addCurve(
                to: CGPoint(x: x, y: y),
                control1: CGPoint(x: x - size, y: y - size),
                control2: CGPoint(x: x - size / 2, y: y - size / 2)
            )
            path.addCurve(
                to: CGPoint(x: x, y: y - size * 1.5),
                control1: CGPoint(x: x + size / 2, y: y - size / 2),
                control2: CGPoint(x: x + size, y: y - size)
            )
            context.fill(path, with: .color(colors.accent))
            context.stroke(path, with: .color(colors.primary), lineWidth: 0.5)
        case .trident:
            var path = Path()
            path.move(to: CGPoint(x: x, y: y))
            path.addLine(to: CGPoint(x: x, y: y - size * 2.5))
            path.move(to: CGPoint(x: x - size / 2, y: y - size))
            path.addLine(to: CGPoint(x: x - size / 2, y: y - size * 2))
            path.move(to: CGPoint(x: x + size / 2, y: y - size))
            path.addLine(to: CGPoint(x: x + size / 2, y: y - size * 2))
            path.move(to: CGPoint(x: x - size / 2, y: y - size))
            path.addLine(to: CGPoint(x: x + size / 2, y: y - size))
            context.stroke(path, with: .color(colors.primary), lineWidth: 1)
        }
    }
    
    private func drawHandles(context: GraphicsContext, gateRect: CGRect) {
        let handleRadius: CGFloat = 4
        
        if isDoubleDoor {
            let leftHandle = CGRect(
                x: gateRect.midX - 10 - handleRadius,
                y: gateRect.midY - handleRadius,
                width: handleRadius * 2,
                height: handleRadius * 2
            )
            context.fill(Path(ellipseIn: leftHandle), with: .color(colors.accent))
            context.stroke(Path(ellipseIn: leftHandle), with: .color(colors.secondary), lineWidth: 1)
            
            let rightHandle = CGRect(
                x: gateRect.midX + 10 - handleRadius,
                y: gateRect.midY - handleRadius,
                width: handleRadius * 2,
                height: handleRadius * 2
            )
            context.fill(Path(ellipseIn: rightHandle), with: .color(colors.accent))
            context.stroke(Path(ellipseIn: rightHandle), with: .color(colors.secondary), lineWidth: 1)
        } else {
            let handle = CGRect(
                x: gateRect.maxX - 15 - handleRadius,
                y: gateRect.midY - handleRadius,
                width: handleRadius * 2,
                height: handleRadius * 2
            )
            context.fill(Path(ellipseIn: handle), with: .color(colors.accent))
            context.stroke(Path(ellipseIn: handle), with: .color(colors.secondary), lineWidth: 1)
        }
    }
}

#Preview {
    VStack(spacing: 20) {
        GateDesignerView(
            widthFeet: 12,
            heightFeet: 6,
            material: .steel,
            gateStyle: .doubleSwing,
            finialStyle: .spear,
            archStyle: .convex
        )
        
        GateDesignerView(
            widthFeet: 10,
            heightFeet: 5,
            material: .wood,
            gateStyle: .singleSwing
        )
    }
    .padding()
}
