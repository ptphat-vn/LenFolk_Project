import React from "react";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

type AnimatedBlockProps = React.PropsWithChildren<{
  delay?: number;
  direction?: "up" | "down";
  className?: string;
  style?: any;
}>;

export function AnimatedBlock({
  children,
  delay = 0,
  direction = "up",
  className,
  style,
}: AnimatedBlockProps) {
  const entering = direction === "down" ? FadeInDown : FadeInUp;

  return (
    <Animated.View
      entering={entering.delay(delay).duration(420).springify()}
      layout={Layout.springify()}
      className={className}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
