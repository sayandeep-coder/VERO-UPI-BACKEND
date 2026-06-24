export interface SendMoneyCommand {
  senderUserId: string;
  receiverUpiId: string;
  amount: string;
  remarks?: string | null;
  authorizationHeader?: string;
}
