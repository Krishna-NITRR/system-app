import type { PaymentRequest, PaymentResult, PaymentProvider } from '../types/payment';

export const initiatePayment: PaymentProvider = async (request: PaymentRequest): Promise<PaymentResult> => {
  console.log('Initiating payment', request);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    status: 'success',
    transactionId: 'txn_placeholder_123',
  };
};
