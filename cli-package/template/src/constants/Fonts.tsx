import { Dimensions, PixelRatio } from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) / 420;

export const Fonts = {
  outfitBold: "Outfit-Bold",
  outfitRegular: "Outfit-Regular",
  outfitMedium: "Outfit-Medium",
  outfitSemiBold: "Outfit-SemiBold",
  outfitLight: "Outfit-Light",
} as const;

export type FontFamily = (typeof Fonts)[keyof typeof Fonts];

export const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const applyTypography = (
  fontFamily: FontFamily,
  fontSize: number,
  color: string
) => {
  return {
    fontFamily: fontFamily,
    fontSize: normalize(fontSize),
    color: color,
  };
};
