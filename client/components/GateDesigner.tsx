import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Line, Path, Circle, G } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius } from "@/constants/theme";

export interface GateDesignerProps {
  widthFeet: number;
  heightFeet: number;
  material: "wood" | "steel" | "chain_link" | "aluminum";
  gateStyle: string;
  picketOrientation?: "vertical" | "horizontal";
  finialStyle?: "none" | "spear" | "ball" | "fleur_de_lis" | "trident";
  archStyle?: "flat" | "convex" | "concave" | "double_arch";
  archHeight?: number;
  picketSpacing?: number;
  picketWidth?: number;
}

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 220;
const PADDING = 16;
const FRAME_WIDTH = 4;

const MATERIAL_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  wood: { primary: "#8B6914", secondary: "#A67C00", accent: "#D4A84B" },
  steel: { primary: "#4A4A4A", secondary: "#6B6B6B", accent: "#8C8C8C" },
  chain_link: { primary: "#9CA3AF", secondary: "#D1D5DB", accent: "#E5E7EB" },
  aluminum: { primary: "#A8A8A8", secondary: "#C4C4C4", accent: "#DCDCDC" },
};

export function GateDesigner({
  widthFeet,
  heightFeet,
  material,
  gateStyle,
  picketOrientation = "vertical",
  finialStyle = "none",
  archStyle = "flat",
  archHeight = 20,
  picketSpacing = 4,
  picketWidth = 3,
}: GateDesignerProps) {
  const { theme } = useTheme();
  const colors = MATERIAL_COLORS[material] || MATERIAL_COLORS.steel;

  const aspectRatio = widthFeet / heightFeet;
  const maxWidth = CANVAS_WIDTH - PADDING * 2;
  const maxHeight = CANVAS_HEIGHT - PADDING * 2;
  
  let gateWidth = maxWidth;
  let gateHeight = gateWidth / aspectRatio;
  
  if (gateHeight > maxHeight) {
    gateHeight = maxHeight;
    gateWidth = gateHeight * aspectRatio;
  }

  const gateX = (CANVAS_WIDTH - gateWidth) / 2;
  const gateY = (CANVAS_HEIGHT - gateHeight) / 2;

  const isDoubleDoor = gateStyle === "double_swing" || gateStyle === "cantilever_slide";

  const pickets = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const picketCount = Math.floor(gateWidth / (picketWidth + picketSpacing));
    const actualSpacing = (gateWidth - picketCount * picketWidth) / (picketCount + 1);
    
    for (let i = 0; i < picketCount; i++) {
      const x = gateX + actualSpacing + i * (picketWidth + actualSpacing);
      
      if (picketOrientation === "vertical") {
        let topY = gateY + FRAME_WIDTH;
        let bottomY = gateY + gateHeight - FRAME_WIDTH;
        let path = "";

        if (archStyle === "convex") {
          const midX = gateX + gateWidth / 2;
          const progress = Math.abs(x + picketWidth / 2 - midX) / (gateWidth / 2);
          topY = gateY + FRAME_WIDTH + (1 - progress) * archHeight;
        } else if (archStyle === "concave") {
          const midX = gateX + gateWidth / 2;
          const progress = Math.abs(x + picketWidth / 2 - midX) / (gateWidth / 2);
          topY = gateY + FRAME_WIDTH + progress * archHeight;
        } else if (archStyle === "double_arch" && isDoubleDoor) {
          const halfWidth = gateWidth / 2;
          const leftMid = gateX + halfWidth / 2;
          const rightMid = gateX + halfWidth + halfWidth / 2;
          const picketCenter = x + picketWidth / 2;
          
          if (picketCenter < gateX + halfWidth) {
            const progress = Math.abs(picketCenter - leftMid) / (halfWidth / 2);
            topY = gateY + FRAME_WIDTH + (1 - progress) * archHeight;
          } else {
            const progress = Math.abs(picketCenter - rightMid) / (halfWidth / 2);
            topY = gateY + FRAME_WIDTH + (1 - progress) * archHeight;
          }
        }

        elements.push(
          <Rect
            key={`picket-${i}`}
            x={x}
            y={topY}
            width={picketWidth}
            height={bottomY - topY}
            fill={colors.primary}
            stroke={colors.secondary}
            strokeWidth={0.5}
          />
        );

        if (finialStyle !== "none" && material === "steel") {
          elements.push(renderFinial(x + picketWidth / 2, topY, finialStyle, colors));
        }
      } else {
        const slotHeight = picketWidth;
        const slotCount = Math.floor((gateHeight - FRAME_WIDTH * 2) / (slotHeight + actualSpacing));
        
        for (let j = 0; j < slotCount; j++) {
          const y = gateY + FRAME_WIDTH + actualSpacing / 2 + j * (slotHeight + actualSpacing);
          elements.push(
            <Rect
              key={`slot-${i}-${j}`}
              x={gateX + FRAME_WIDTH}
              y={y}
              width={gateWidth - FRAME_WIDTH * 2}
              height={slotHeight}
              fill={colors.primary}
              stroke={colors.secondary}
              strokeWidth={0.5}
            />
          );
        }
        break;
      }
    }
    
    return elements;
  }, [
    gateWidth,
    gateHeight,
    gateX,
    gateY,
    picketWidth,
    picketSpacing,
    picketOrientation,
    archStyle,
    archHeight,
    finialStyle,
    material,
    colors,
    isDoubleDoor,
  ]);

  const renderFinial = (cx: number, cy: number, style: string, colors: any) => {
    const size = 6;
    
    switch (style) {
      case "spear":
        return (
          <Path
            key={`finial-${cx}`}
            d={`M${cx},${cy - size * 2} L${cx - size / 2},${cy} L${cx + size / 2},${cy} Z`}
            fill={colors.accent}
            stroke={colors.primary}
            strokeWidth={0.5}
          />
        );
      case "ball":
        return (
          <Circle
            key={`finial-${cx}`}
            cx={cx}
            cy={cy - size}
            r={size / 1.5}
            fill={colors.accent}
            stroke={colors.primary}
            strokeWidth={0.5}
          />
        );
      case "fleur_de_lis":
        return (
          <G key={`finial-${cx}`}>
            <Path
              d={`M${cx},${cy - size * 2} 
                 C${cx - size / 2},${cy - size * 1.5} ${cx - size},${cy - size} ${cx},${cy}
                 C${cx + size},${cy - size} ${cx + size / 2},${cy - size * 1.5} ${cx},${cy - size * 2}
                 Z`}
              fill={colors.accent}
              stroke={colors.primary}
              strokeWidth={0.5}
            />
          </G>
        );
      case "trident":
        return (
          <G key={`finial-${cx}`}>
            <Line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - size * 1.5}
              stroke={colors.primary}
              strokeWidth={1}
            />
            <Path
              d={`M${cx - size / 2},${cy - size} L${cx - size / 2},${cy - size * 2} M${cx},${cy - size} L${cx},${cy - size * 2.5} M${cx + size / 2},${cy - size} L${cx + size / 2},${cy - size * 2}`}
              stroke={colors.primary}
              strokeWidth={1}
              fill="none"
            />
          </G>
        );
      default:
        return null;
    }
  };

  const archPath = useMemo(() => {
    if (archStyle === "flat") return null;
    
    const startX = gateX + FRAME_WIDTH;
    const endX = gateX + gateWidth - FRAME_WIDTH;
    const baseY = gateY + FRAME_WIDTH;
    
    if (archStyle === "convex") {
      const midX = gateX + gateWidth / 2;
      const topY = baseY + archHeight;
      return `M${startX},${topY} Q${midX},${baseY - archHeight / 2} ${endX},${topY}`;
    } else if (archStyle === "concave") {
      const midX = gateX + gateWidth / 2;
      const topY = baseY;
      return `M${startX},${topY + archHeight} Q${midX},${topY + archHeight * 2} ${endX},${topY + archHeight}`;
    } else if (archStyle === "double_arch" && isDoubleDoor) {
      const midX = gateX + gateWidth / 2;
      const q1 = gateX + gateWidth / 4;
      const q3 = gateX + 3 * gateWidth / 4;
      return `M${startX},${baseY + archHeight} Q${q1},${baseY - archHeight / 2} ${midX},${baseY + archHeight} Q${q3},${baseY - archHeight / 2} ${endX},${baseY + archHeight}`;
    }
    
    return null;
  }, [archStyle, archHeight, gateX, gateY, gateWidth, isDoubleDoor]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
        <Rect
          x={gateX}
          y={gateY}
          width={gateWidth}
          height={gateHeight}
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth={FRAME_WIDTH}
          rx={2}
        />
        
        {pickets}
        
        {archPath ? (
          <Path
            d={archPath}
            stroke={colors.secondary}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
        
        {isDoubleDoor ? (
          <Line
            x1={gateX + gateWidth / 2}
            y1={gateY + FRAME_WIDTH}
            x2={gateX + gateWidth / 2}
            y2={gateY + gateHeight - FRAME_WIDTH}
            stroke={colors.secondary}
            strokeWidth={2}
          />
        ) : null}
        
        <Circle
          cx={gateX + (isDoubleDoor ? gateWidth / 2 - 10 : gateWidth - 15)}
          cy={gateY + gateHeight / 2}
          r={4}
          fill={colors.accent}
          stroke={colors.secondary}
          strokeWidth={1}
        />
        {isDoubleDoor ? (
          <Circle
            cx={gateX + gateWidth / 2 + 10}
            cy={gateY + gateHeight / 2}
            r={4}
            fill={colors.accent}
            stroke={colors.secondary}
            strokeWidth={1}
          />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
