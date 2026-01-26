//
//  AddOnPickerView.swift
//  Gate2Go
//

import SwiftUI

struct AddOnOption: Identifiable {
    let id: String
    let type: AddonType
    let label: String
    let icon: String
    let defaultCostCents: Int
}

let ADDON_OPTIONS: [AddOnOption] = [
    AddOnOption(id: "keypad", type: .keypad, label: "Keypad", icon: "keyboard", defaultCostCents: 35000),
    AddOnOption(id: "drop_rod", type: .dropRod, label: "Drop Rod", icon: "arrow.down.to.line", defaultCostCents: 8500),
    AddOnOption(id: "latch", type: .latch, label: "Latch", icon: "lock", defaultCostCents: 4500),
    AddOnOption(id: "opener", type: .opener, label: "Gate Opener", icon: "gear", defaultCostCents: 110_000),
]

struct AddOnPickerView: View {
    @Binding var addons: [AddonLineItem]
    let gateStyle: GateStyle
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(ADDON_OPTIONS) { option in
                let openerType = resolvedOpenerType()
                let displayCost = displayCostCents(for: option, openerType: openerType)
                AddOnRow(
                    option: option,
                    isEnabled: isAddonEnabled(option.type),
                    quantity: getAddonQuantity(option.type),
                    displayCostCents: displayCost,
                    onToggle: { toggleAddon(option) },
                    onQuantityChange: { delta in updateQuantity(option.type, delta: delta) }
                )

                if option.type == .opener, isAddonEnabled(option.type) {
                    Picker("Opener Type", selection: Binding(
                        get: { resolvedOpenerType() },
                        set: { newType in
                            updateOpenerType(newType)
                        }
                    )) {
                        ForEach(OpenerOperatorType.allCases) { type in
                            Text(type.displayName).tag(type)
                        }
                    }
                    .pickerStyle(.menu)
                    .padding(.horizontal, 12)
                }
            }
        }
    }
    
    private func isAddonEnabled(_ type: AddonType) -> Bool {
        addons.contains { $0.type == type }
    }
    
    private func getAddonQuantity(_ type: AddonType) -> Int {
        addons.first { $0.type == type }?.quantity ?? 1
    }
    
    private func toggleAddon(_ option: AddOnOption) {
        if isAddonEnabled(option.type) {
            addons.removeAll { $0.type == option.type }
        } else {
            let openerType = option.type == .opener ? gateStyle.defaultOpenerType : nil
            let defaultCost = option.type == .opener
                ? (openerType?.defaultCostCents ?? option.defaultCostCents)
                : option.defaultCostCents
            let newAddon = AddonLineItem(
                type: option.type,
                title: option.label,
                operatorType: openerType,
                quantity: 1,
                contractorCost: Money(amountCents: defaultCost)
            )
            addons.append(newAddon)
        }
    }
    
    private func updateQuantity(_ type: AddonType, delta: Int) {
        guard let index = addons.firstIndex(where: { $0.type == type }) else { return }
        let newQty = max(1, min(10, addons[index].quantity + delta))
        addons[index].quantity = newQty
    }

    private func resolvedOpenerType() -> OpenerOperatorType {
        addons.first { $0.type == .opener }?.operatorType ?? gateStyle.defaultOpenerType
    }

    private func updateOpenerType(_ newType: OpenerOperatorType) {
        guard let index = addons.firstIndex(where: { $0.type == .opener }) else { return }
        addons[index].operatorType = newType
        addons[index].contractorCost = Money(amountCents: newType.defaultCostCents)
    }

    private func displayCostCents(for option: AddOnOption, openerType: OpenerOperatorType) -> Int {
        if option.type == .opener {
            if let addon = addons.first(where: { $0.type == .opener }) {
                return addon.contractorCost.amountCents
            }
            return openerType.defaultCostCents
        }
        return option.defaultCostCents
    }
}

struct AddOnRow: View {
    let option: AddOnOption
    let isEnabled: Bool
    let quantity: Int
    let displayCostCents: Int
    let onToggle: () -> Void
    let onQuantityChange: (Int) -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: option.icon)
                .font(.title3)
                .frame(width: 40, height: 40)
                .background(isEnabled ? Color.accentColor : Color(uiColor: .systemGray5))
                .foregroundStyle(isEnabled ? .white : .secondary)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(option.label)
                    .font(.subheadline.weight(.medium))
                Text(MoneyFormatting.dollarsString(cents: displayCostCents) + " each")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            if isEnabled {
                HStack(spacing: 8) {
                    Button {
                        onQuantityChange(-1)
                    } label: {
                        Image(systemName: "minus")
                            .font(.caption.weight(.medium))
                            .frame(width: 28, height: 28)
                            .background(Color(uiColor: .systemGray5))
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                    .buttonStyle(.plain)
                    
                    Text("\(quantity)")
                        .font(.subheadline.weight(.semibold))
                        .monospacedDigit()
                        .frame(minWidth: 24)
                    
                    Button {
                        onQuantityChange(1)
                    } label: {
                        Image(systemName: "plus")
                            .font(.caption.weight(.medium))
                            .frame(width: 28, height: 28)
                            .background(Color(uiColor: .systemGray5))
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                    .buttonStyle(.plain)
                }
            }
            
            Toggle("", isOn: Binding(
                get: { isEnabled },
                set: { _ in onToggle() }
            ))
            .labelsHidden()
        }
        .padding(12)
        .background(Color(uiColor: .secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isEnabled ? Color.accentColor : Color.clear, lineWidth: 1)
        )
    }
}

#Preview {
    AddOnPickerView(addons: .constant([]), gateStyle: .singleSwing)
        .padding()
}
