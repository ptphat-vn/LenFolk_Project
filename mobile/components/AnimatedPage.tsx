import React from "react";
import { useIsFocused } from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  Layout,
  ZoomIn,
} from "react-native-reanimated";

type AnimationVariant =
  | "header"
  | "panel"
  | "card"
  | "listItem"
  | "listContainer"
  | "slideRight"
  | "chip"
  | "hero"
  | "button";

type AnimatedBlockProps = React.PropsWithChildren<{
  delay?: number;
  direction?: "up" | "down";
  variant?: AnimationVariant;
  className?: string;
  style?: any;
}>;

const variantConfig = {
  header: { entering: FadeInDown, duration: 320 },
  panel: { entering: FadeIn, duration: 360 },
  card: { entering: FadeInUp, duration: 420 },
  listItem: { entering: FadeInRight, duration: 360 },
  listContainer: { entering: FadeInUp, duration: 420 },
  slideRight: { entering: FadeInLeft, duration: 420 },
  chip: { entering: ZoomIn, duration: 260 },
  hero: { entering: ZoomIn, duration: 460 },
  button: { entering: FadeInUp, duration: 300 },
} as const;

export function AnimatedBlock({
  children,
  delay = 0,
  direction = "up",
  variant,
  className,
  style,
}: AnimatedBlockProps) {
  const isFocused = useIsFocused();
  const wasFocused = React.useRef(isFocused);
  const [focusCycle, setFocusCycle] = React.useState(0);
  const config = variant ? variantConfig[variant] : undefined;
  const entering = config?.entering ?? (direction === "down" ? FadeInDown : FadeInUp);
  const duration = config?.duration ?? 420;

  React.useEffect(() => {
    if (isFocused && !wasFocused.current) {
      setFocusCycle((cycle) => cycle + 1);
    }

    wasFocused.current = isFocused;
  }, [isFocused]);

  return (
    <Animated.View
      key={focusCycle}
      entering={entering.delay(delay).duration(duration).springify()}
      layout={Layout.springify()}
      className={className}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
