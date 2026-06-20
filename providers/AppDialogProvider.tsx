import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";

export type AppDialogVariant = "default" | "success" | "destructive";

export type AppDialogAction = {
  onPress?: () => void;
  text: string;
  variant?: "primary" | "secondary" | "destructive";
};

export type AppDialogOptions = {
  actions?: AppDialogAction[];
  cancelText?: string;
  confirmText?: string;
  icon?: string;
  message: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  showCancel?: boolean;
  subtitle?: string;
  title: string;
  variant?: AppDialogVariant;
};

type AppDialogContextValue = {
  hideDialog: () => void;
  showDialog: (options: AppDialogOptions) => void;
};

type DialogTheme = {
  backgroundColor: string;
  confirmColor: string;
  icon: string;
  iconBackgroundColor: string;
  iconColor: string;
};

const dialogThemes: Record<AppDialogVariant, DialogTheme> = {
  default: {
    backgroundColor: "#FFFFFF",
    confirmColor: "#FF2056",
    icon: "✦",
    iconBackgroundColor: "#FFDDE8",
    iconColor: "#FF2056",
  },
  destructive: {
    backgroundColor: "#FFFFFF",
    confirmColor: "#EF4444",
    icon: "!",
    iconBackgroundColor: "#FEE2E2",
    iconColor: "#DC2626",
  },
  success: {
    backgroundColor: "#FFFFFF",
    confirmColor: "#16A34A",
    icon: "✓",
    iconBackgroundColor: "#DCFCE7",
    iconColor: "#15803D",
  },
};

const dialogAnimationEasing = Easing.bezier(0.39, 0.575, 0.565, 1);

export const AppDialogContext =
  createContext<AppDialogContextValue | undefined>(undefined);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<AppDialogOptions[]>([]);
  const [isDismissing, setIsDismissing] = useState(false);
  const isDismissingRef = useRef(false);
  const dialogAnimation = useRef(new Animated.Value(0)).current;
  const dialog = dialogs[0] ?? null;

  const hideDialog = useCallback(() => {
    setDialogs((currentDialogs) => currentDialogs.slice(1));
  }, []);

  const showDialog = useCallback((options: AppDialogOptions) => {
    setDialogs((currentDialogs) => [...currentDialogs, options]);
  }, []);

  const value = useMemo(
    () => ({
      hideDialog,
      showDialog,
    }),
    [hideDialog, showDialog],
  );

  const variant = dialog?.variant ?? "default";
  const theme = dialogThemes[variant];
  const backdropOpacity = dialogAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const dialogScale = dialogAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  useEffect(() => {
    if (!dialog) {
      return;
    }

    isDismissingRef.current = false;
    setIsDismissing(false);
    dialogAnimation.setValue(0);
    Animated.timing(dialogAnimation, {
      duration: 400,
      easing: dialogAnimationEasing,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [dialog, dialogAnimation]);

  const dismissDialog = useCallback(
    (onDismiss?: () => void) => {
      if (isDismissingRef.current) {
        return;
      }

      isDismissingRef.current = true;
      setIsDismissing(true);
      Animated.timing(dialogAnimation, {
        duration: 180,
        easing: dialogAnimationEasing,
        toValue: 0,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          isDismissingRef.current = false;
          setIsDismissing(false);
          return;
        }

        hideDialog();
        isDismissingRef.current = false;
        setIsDismissing(false);
        onDismiss?.();
      });
    },
    [dialogAnimation, hideDialog],
  );

  function handleCancel() {
    const onCancel = dialog?.onCancel;
    dismissDialog(onCancel);
  }

  function handleConfirm() {
    const onConfirm = dialog?.onConfirm;
    dismissDialog(onConfirm);
  }

  function handleActionPress(action: AppDialogAction) {
    dismissDialog(action.onPress);
  }

  const actions = dialog?.actions ?? [];

  return (
    <AppDialogContext.Provider value={value}>
      {children}

      <Modal
        animationType="none"
        onRequestClose={handleCancel}
        transparent
        visible={dialog !== null}
      >
        <Animated.View
          className="flex-1 items-center justify-center px-6"
          style={{
            backgroundColor: "rgba(39, 39, 42, 0.34)",
            opacity: backdropOpacity,
          }}
        >
          <Animated.View
            className="w-full max-w-[360px] rounded-[28px] px-6 pb-5 pt-6"
            style={{
              backgroundColor: theme.backgroundColor,
              borderCurve: "continuous",
              boxShadow: "0 18px 45px -14px rgba(39, 39, 42, 0.32)",
              transform: [{ scale: dialogScale }],
            }}
          >
            <View className="items-center gap-4">
              <View
                className="size-14 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.iconBackgroundColor }}
              >
                <Text
                  className="text-center text-[25px] font-bold leading-8"
                  style={{ color: theme.iconColor }}
                >
                  {dialog?.icon ?? theme.icon}
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-center text-[22px] font-bold leading-7 text-[#27272A]">
                  {dialog?.title}
                </Text>
                {dialog?.subtitle ? (
                  <Text className="text-center text-[17px] font-semibold leading-6 text-[#27272A]">
                    {dialog.subtitle}
                  </Text>
                ) : null}
                <Text className="text-center text-[15px] leading-6 text-[#71717B]">
                  {dialog?.message}
                </Text>
              </View>
            </View>

            <View className="mt-6 gap-3">
              {actions.length > 0 ? (
                actions.map((action) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isDismissing }}
                    className="h-[52px] items-center justify-center rounded-full"
                    disabled={isDismissing}
                    key={action.text}
                    onPress={() => handleActionPress(action)}
                    style={{
                      backgroundColor: getActionBackgroundColor(action, theme),
                    }}
                  >
                    <Text
                      className="text-[16px] font-bold leading-5"
                      style={{ color: getActionTextColor(action) }}
                    >
                      {action.text}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDismissing }}
                  className="h-[52px] items-center justify-center rounded-full"
                  disabled={isDismissing}
                  onPress={handleConfirm}
                  style={{ backgroundColor: theme.confirmColor }}
                >
                  <Text className="text-[16px] font-bold leading-5 text-white">
                    {dialog?.confirmText ?? "Continue"}
                  </Text>
                </Pressable>
              )}

              {dialog?.showCancel ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDismissing }}
                  className="h-12 items-center justify-center rounded-full bg-[#F4F4F5]"
                  disabled={isDismissing}
                  onPress={handleCancel}
                >
                  <Text className="text-[15px] font-semibold leading-5 text-[#51515B]">
                    {dialog.cancelText ?? "Cancel"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AppDialogContext.Provider>
  );
}

function getActionBackgroundColor(
  action: AppDialogAction,
  theme: DialogTheme,
) {
  switch (action.variant) {
    case "destructive":
      return "#EF4444";
    case "secondary":
      return "#F4F4F5";
    case "primary":
    default:
      return theme.confirmColor;
  }
}

function getActionTextColor(action: AppDialogAction) {
  return action.variant === "secondary" ? "#51515B" : "#FFFFFF";
}
