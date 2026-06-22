import React, { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { reportAppError } from "@/lib/errors/reportAppError";

type FeatureErrorBoundaryProps = {
  children: ReactNode;
  fallbackMessage?: string;
  featureName: string;
  onRetry?: () => void;
};

type FeatureErrorBoundaryState = {
  error: Error | null;
};

export class FeatureErrorBoundary extends React.Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  state: FeatureErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    reportAppError(error, {
      feature: this.props.featureName,
      operation: "render",
    });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View className="rounded-[22px] bg-[#FFF1F5] px-4 py-4">
        <Text className="text-[16px] font-bold leading-6 text-[#9F1239]">
          {this.props.featureName} is unavailable right now.
        </Text>
        <Text className="mt-2 text-[14px] leading-6 text-[#71717B]">
          {this.props.fallbackMessage ??
            "This part of DearDiary ran into a problem. The rest of the screen is still available."}
        </Text>
        {this.props.onRetry ? (
          <Pressable
            accessibilityRole="button"
            className="mt-4 min-h-11 items-center justify-center rounded-full bg-white px-4"
            onPress={() => {
              this.setState({ error: null });
              this.props.onRetry?.();
            }}
          >
            <Text className="text-[14px] font-bold leading-5 text-[#FF2056]">
              Retry
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
}
