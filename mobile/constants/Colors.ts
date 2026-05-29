/**
 * Bảng màu nhận diện thương hiệu của LenFolk Project
 * Bao gồm các mã màu từ bảng màu thiết kế:
 * - #8E9E6E: Xanh xô thơm đậm (Primary / Brand Green)
 * - #D6DDC6: Xanh xô thơm nhạt (Secondary / Brand Light)
 * - #F4E0AC: Vàng kem pastel (Accent / Brand Cream)
 * - #10120C: Đen lá ô liu / Charcoal (Dark / Brand Dark)
 * - #FFFFFF: Trắng tinh khiết (White / Light)
 */
export const Colors = {
  light: {
    primary: "#8E9E6E",       // Sage Green
    secondary: "#D6DDC6",     // Light Sage
    accent: "#F4E0AC",        // Cream / Amber
    text: "#10120C",          // Dark Charcoal
    background: "#FFFFFF",    // White
    border: "#D6DDC6",        // Light Sage
    tint: "#8E9E6E",          // Sage Green
    tabIconDefault: "#8E9E6E80", // 50% opacity
    tabIconSelected: "#8E9E6E",
  },
  dark: {
    primary: "#8E9E6E",
    secondary: "#8E9E6E",
    accent: "#F4E0AC",
    text: "#FFFFFF",          // White text
    background: "#10120C",    // Charcoal background
    border: "#8E9E6E",
    tint: "#FFFFFF",
    tabIconDefault: "#FFFFFF80",
    tabIconSelected: "#FFFFFF",
  },
  // Các mã màu thuần túy (Raw Hex) để lập trình viên sử dụng bất kỳ đâu
  raw: {
    sageGreen: "#8E9E6E",
    lightSage: "#D6DDC6",
    cream: "#F4E0AC",
    charcoal: "#10120C",
    white: "#FFFFFF",
  }
} as const;

export type AppColors = typeof Colors;
