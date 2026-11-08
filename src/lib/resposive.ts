import { useWindowDimensions } from "react-native";

export type Device = "phone" | "tablet" | "desktop";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const device: Device = width >= 1024 ? "desktop" : width >= 600 ? "tablet" : "phone";

  return {
    device,
    width,
    isWide: device !== "phone",
    isLandscape: width > height,
    columns: device === "phone" ? 1 : device === "tablet" ? 2 : 3,
    maxContent: device === "phone" ? 640 : device === "tablet" ? 900 : 1120,
    pad: device === "phone" ? 20 : device === "tablet" ? 32 : 40,
    fs: device === "phone" ? 1 : device === "tablet" ? 1.12 : 1.2,
    heroHeight: device === "phone" ? 220 : device === "tablet" ? 320 : 380,
  };
}