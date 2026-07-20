export interface PaymentRequest {
  productId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  error?: string;
}

export type PaymentProvider = (request: PaymentRequest) => Promise<PaymentResult>;
