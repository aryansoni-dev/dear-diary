import {
  createContext,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Modal, Pressable, Text, View } from "react-native";

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

export const AppDialogContext =
  createContext<AppDialogContextValue | undefined>(undefined);

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<AppDialogOptions[]>([]);
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

  function handleCancel() {
    const onCancel = dialog?.onCancel;
    hideDialog();
    onCancel?.();
  }

  function handleConfirm() {
    const onConfirm = dialog?.onConfirm;
    hideDialog();
    onConfirm?.();
  }

  function handleActionPress(action: AppDialogAction) {
    hideDialog();
    action.onPress?.();
  }

  const actions = dialog?.actions ?? [];

  return (
    <AppDialogContext.Provider value={value}>
      {children}

      <Modal
        animationType="fade"
        onRequestClose={handleCancel}
        transparent
        visible={dialog !== null}
      >
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "rgba(39, 39, 42, 0.34)" }}
        >
          <View
            className="w-full max-w-[360px] rounded-[28px] px-6 pb-5 pt-6"
            style={{
              backgroundColor: theme.backgroundColor,
              borderCurve: "continuous",
              boxShadow: "0 18px 45px -14px rgba(39, 39, 42, 0.32)",
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
                    className="h-[52px] items-center justify-center rounded-full"
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
                  className="h-[52px] items-center justify-center rounded-full"
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
                  className="h-12 items-center justify-center rounded-full bg-[#F4F4F5]"
                  onPress={handleCancel}
                >
                  <Text className="text-[15px] font-semibold leading-5 text-[#51515B]">
                    {dialog.cancelText ?? "Cancel"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
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
