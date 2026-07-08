import {
  ParamListBase,
  StackNavigationState,
  type EventMapBase,
} from "@react-navigation/native";
import { withLayoutContext } from "expo-router";
import {
  createBlankStackNavigator,
  type BlankStackNavigationEventMap,
  type BlankStackNavigationOptions,
} from "react-native-screen-transitions/blank-stack";

export type PremiumStackNavigationOptions = BlankStackNavigationOptions & {
  headerShown?: boolean;
  title?: string;
};

const BlankStack = createBlankStackNavigator();

export const PremiumStack = withLayoutContext<
  PremiumStackNavigationOptions,
  typeof BlankStack.Navigator,
  StackNavigationState<ParamListBase>,
  BlankStackNavigationEventMap & EventMapBase
>(BlankStack.Navigator);
