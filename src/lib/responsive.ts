import { useWindowDimensions } from "react-native";

export type Device = "phone" | "tablet" | "desktop";

/** Layout values based on the available window, so rotation and split-screen update automatically. */
export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();
  const device: Device = width >= 900 ? "desktop" : width >= 600 ? "tablet" : "phone";

  return {
    device,
    width,
    height,
    fontScale,
    isWide: device !== "phone",
    isLandscape: width > height,
    columns: device === "phone" ? 1 : device === "tablet" ? 2 : 3,
    maxContent: device === "phone" ? 600 : device === "tablet" ? 820 : 1120,
    pad: width < 360 ? 16 : device === "phone" ? 20 : device === "tablet" ? 28 : 40,
  };
}
