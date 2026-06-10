import React from "react";
import { ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export function useScrollToTopOnFocus() {
  const scrollRef = React.useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );

  return scrollRef;
}
