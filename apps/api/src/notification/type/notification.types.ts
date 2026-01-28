export interface NotificationBatchMessage {
  notifyDatas: NotificationData[];
  attempt: number;
}

export interface NotificationData {
  userId: string;
  token: string;
}
