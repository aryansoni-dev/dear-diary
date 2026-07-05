import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

const morningReminderId = "dear-diary-morning-reminder";
const eveningReminderId = "dear-diary-evening-reminder";
const reminderChannelId = "dear-diary-reflection-reminders";

const morningReminderContent = {
  body: "Take a quiet moment to set your intention for the day.",
  sound: true,
  title: "Morning intention",
};

const eveningReminderContent = {
  body: "Take a quiet moment to reflect on your day.",
  sound: true,
  title: "Evening reflection",
};

type NotificationsModule = typeof import("expo-notifications");

let notificationHandlerConfigured = false;

export async function enableJournalReminders({
  eveningTime,
  morningTime,
}: {
  eveningTime: string;
  morningTime: string;
}) {
  const Notifications = await getNotificationsModule();
  configureNotificationHandler(Notifications);
  await configureAndroidNotificationChannel(Notifications);

  const hasPermission = await requestNotificationPermission(Notifications);

  if (!hasPermission) {
    throw new Error("Notifications permission was not granted.");
  }

  await scheduleJournalReminders({ eveningTime, morningTime, Notifications });
}

export async function disableJournalReminders() {
  const Notifications = await getNotificationsModule();

  await cancelJournalReminders(Notifications);
}

export async function scheduleJournalReminders({
  eveningTime,
  morningTime,
  Notifications,
}: {
  eveningTime: string;
  morningTime: string;
  Notifications?: NotificationsModule;
}) {
  const notificationModule = Notifications ?? (await getNotificationsModule());
  const morningParts = parseReminderTime(morningTime);
  const eveningParts = parseReminderTime(eveningTime);

  await cancelJournalReminders(notificationModule);

  await notificationModule.scheduleNotificationAsync({
    content: morningReminderContent,
    identifier: morningReminderId,
    trigger: {
      channelId: reminderChannelId,
      hour: morningParts.hour,
      minute: morningParts.minute,
      type: notificationModule.SchedulableTriggerInputTypes.DAILY,
    },
  });

  await notificationModule.scheduleNotificationAsync({
    content: eveningReminderContent,
    identifier: eveningReminderId,
    trigger: {
      channelId: reminderChannelId,
      hour: eveningParts.hour,
      minute: eveningParts.minute,
      type: notificationModule.SchedulableTriggerInputTypes.DAILY,
    },
  });
}

async function getNotificationsModule(): Promise<NotificationsModule> {
  if (Platform.OS === "android" && isRunningInExpoGo()) {
    throw new Error(
      "Notification reminders need a development build on Android. Expo Go no longer supports expo-notifications on Android.",
    );
  }

  return import("expo-notifications");
}

function configureNotificationHandler(Notifications: NotificationsModule) {
  if (notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  notificationHandlerConfigured = true;
}

async function requestNotificationPermission(
  Notifications: NotificationsModule,
) {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return requestedPermission.granted;
}

async function cancelJournalReminders(Notifications: NotificationsModule) {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(morningReminderId),
    Notifications.cancelScheduledNotificationAsync(eveningReminderId),
  ]);
}

async function configureAndroidNotificationChannel(
  Notifications: NotificationsModule,
) {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(reminderChannelId, {
    importance: Notifications.AndroidImportance.DEFAULT,
    name: "Reflection reminders",
  });
}

function parseReminderTime(value: string) {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: 8, minute: 0 };
  }

  return { hour, minute };
}
