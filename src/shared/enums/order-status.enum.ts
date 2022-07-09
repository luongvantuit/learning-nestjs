export enum ORDER_STATUS_ENUM {
  PENDING_PAYMENT = 'PP',
  CANCELED = 'CA',
  FAILED = 'FA',
  COMPLETE = 'CO',
  SHIPPING = 'SH',
  PROGRESSING = 'PR',
  REFUNDED = 'RE',
}

export type OrderStatusType = 'PP' | 'CA' | 'FA' | 'CO' | 'SH' | 'PR' | 'RE';
