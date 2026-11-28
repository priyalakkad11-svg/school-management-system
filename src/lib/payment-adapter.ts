export interface GatewayCheckoutRequest {
  invoiceId: string;
  invoiceNumber: string;
  schoolCode: string;
  amountInr: number;
}

export interface GatewayCheckoutResponse {
  mode: "stub";
  supported: boolean;
  message: string;
  referencePreview: string;
}

/**
 * Isolated SaaS payment gateway adapter stub (Razorpay / Cashfree / Stripe India).
 * Manual UPI / NEFT / Cash / Cheque settlement is live via recordManualPaymentAction.
 */
export function createSaaSGatewayCheckoutStub(
  req: GatewayCheckoutRequest,
): GatewayCheckoutResponse {
  return {
    mode: "stub",
    supported: false,
    message:
      "Online gateway webhook keys are not configured yet. Collect via UPI/Bank Transfer/Cheque and record the reference below to mark this GST invoice paid.",
    referencePreview: `GW-STUB-${req.schoolCode}-${req.invoiceNumber}`,
  };
}
