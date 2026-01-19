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
    AddOnOption(id: "opener", type: .opener, label: "Gate Opener", icon: "gear", defaultCostCents: 95000),
]

struct AddOnPickerView: View {
    @Binding var addons: [AddonLineItem]
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(ADDON_OPTIONS) { option in
                AddOnRow(
                    option: option,
                    isEnabled: isAddonEnabled(option.type),
                    quantity: getAddonQuantity(option.type),
                    onToggle: { toggleAddon(option) },
                    onQuantityChange: { delta in updateQuantity(option.type, delta: delta) }
                )
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
            let newAddon = AddonLineItem(
                type: option.type,
                title: option.label,
                quantity: 1,
                contractorCost: Money(amountCents: option.defaultCostCents)
            )
            addons.append(newAddon)
        }
    }
    
    private func updateQuantity(_ type: AddonType, delta: Int) {
        guard let index = addons.firstIndex(where: { $0.type == type }) else { return }
        let newQty = max(1, min(10, addons[index].quantity + delta))
        addons[index].quantity = newQty
    }
}

struct AddOnRow: View {
    let option: AddOnOption
    let isEnabled: Bool
    let quantity: Int
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
                Text(MoneyFormatting.dollarsString(cents: option.defaultCostCents) + " each")
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
    AddOnPickerView(addons: .constant([]))
        .padding()
}
