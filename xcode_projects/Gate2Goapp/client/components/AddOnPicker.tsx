import React from "react";
import { StyleSheet, View, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AddonLineItem, AddonType, ADDON_OPTIONS } from "@/types/gate2go";
import { formatMoney } from "@/lib/pricing";

interface AddOnPickerProps {
  addons: AddonLineItem[];
  onAddonsChange: (addons: AddonLineItem[]) => void;
}

export function AddOnPicker({ addons, onAddonsChange }: AddOnPickerProps) {
  const { theme } = useTheme();

  const isAddonEnabled = (type: AddonType): boolean => {
    return addons.some((a) => a.type === type);
  };

  const getAddonQuantity = (type: AddonType): number => {
    const addon = addons.find((a) => a.type === type);
    return addon?.quantity ?? 1;
  };

  const toggleAddon = (type: AddonType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const option = ADDON_OPTIONS.find((o) => o.type === type);
    if (!option) return;

    if (isAddonEnabled(type)) {
      onAddonsChange(addons.filter((a) => a.type !== type));
    } else {
      const newAddon: AddonLineItem = {
        id: `addon_${Date.now()}_${type}`,
        type,
        title: option.label,
        quantity: 1,
        contractorCost: { amountCents: option.defaultCostCents, currency: "USD" },
      };
      onAddonsChange([...addons, newAddon]);
    }
  };

  const updateQuantity = (type: AddonType, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddonsChange(
      addons.map((a) => {
        if (a.type === type) {
          const newQty = Math.max(1, Math.min(10, a.quantity + delta));
          return { ...a, quantity: newQty };
        }
        return a;
      })
    );
  };

  return (
    <View style={styles.container}>
      {ADDON_OPTIONS.map((option) => {
        const enabled = isAddonEnabled(option.type);
        const quantity = getAddonQuantity(option.type);

        return (
          <View
            key={option.type}
            style={[
              styles.addonRow,
              { backgroundColor: theme.backgroundSecondary },
              enabled && { borderColor: theme.accent, borderWidth: 1 },
            ]}
          >
            <View style={styles.addonInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: enabled ? theme.accent : theme.backgroundTertiary },
                ]}
              >
                <Feather
                  name={option.icon as any}
                  size={18}
                  color={enabled ? "#FFFFFF" : theme.textSecondary}
                />
              </View>
              <View style={styles.addonText}>
                <ThemedText style={styles.addonLabel}>{option.label}</ThemedText>
                <ThemedText style={[styles.addonPrice, { color: theme.textSecondary }]}>
                  {formatMoney(option.defaultCostCents)} each
                </ThemedText>
              </View>
            </View>

            <View style={styles.addonControls}>
              {enabled ? (
                <View style={styles.quantityControls}>
                  <Pressable
                    onPress={() => updateQuantity(option.type, -1)}
                    style={[styles.qtyButton, { backgroundColor: theme.backgroundTertiary }]}
                  >
                    <Feather name="minus" size={16} color={theme.text} />
                  </Pressable>
                  <ThemedText style={styles.qtyValue}>{quantity}</ThemedText>
                  <Pressable
                    onPress={() => updateQuantity(option.type, 1)}
                    style={[styles.qtyButton, { backgroundColor: theme.backgroundTertiary }]}
                  >
                    <Feather name="plus" size={16} color={theme.text} />
                  </Pressable>
                </View>
              ) : null}
              <Switch
                value={enabled}
                onValueChange={() => toggleAddon(option.type)}
                trackColor={{ false: theme.backgroundTertiary, true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addonInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  addonText: {
    flex: 1,
  },
  addonLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  addonPrice: {
    fontSize: 13,
  },
  addonControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
});
