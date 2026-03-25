// ============================================
// ASAAS API Client — Server-only
// Docs: https://docs.asaas.com/reference
// ============================================

// --- Types ---

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  object: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
  value: number;
  nextDueDate: string;
  status: string;
  cycle: "MONTHLY";
  description?: string;
  object: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  subscription?: string;
  billingType: string;
  value: number;
  netValue?: number;
  status: string;
  dueDate: string;
  paymentDate?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
  object: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasList<T> {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: T[];
}

export class AsaasError extends Error {
  status: number;
  errors: Array<{ code: string; description: string }>;

  constructor(
    message: string,
    status: number,
    errors: Array<{ code: string; description: string }> = []
  ) {
    super(message);
    this.name = "AsaasError";
    this.status = status;
    this.errors = errors;
  }
}

// --- Client ---

class AsaasClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.ASAAS_BASE_URL || "https://sandbox.asaas.com/api/v3";
    this.apiKey = process.env.ASAAS_API_KEY || "";
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        access_token: this.apiKey,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new AsaasError(
        data.errors?.[0]?.description || `ASAAS API error: ${res.status}`,
        res.status,
        data.errors || []
      );
    }

    return data as T;
  }

  // --- Customers ---

  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
  }): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>("POST", "/customers", data);
  }

  async getCustomer(id: string): Promise<AsaasCustomer> {
    return this.request<AsaasCustomer>("GET", `/customers/${id}`);
  }

  // --- Subscriptions ---

  async createSubscription(data: {
    customer: string;
    billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
    value: number;
    nextDueDate: string;
    cycle: "MONTHLY";
    description: string;
  }): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>("POST", "/subscriptions", data);
  }

  async getSubscription(id: string): Promise<AsaasSubscription> {
    return this.request<AsaasSubscription>("GET", `/subscriptions/${id}`);
  }

  async cancelSubscription(id: string): Promise<void> {
    await this.request("DELETE", `/subscriptions/${id}`);
  }

  async listSubscriptionPayments(
    subscriptionId: string
  ): Promise<AsaasList<AsaasPayment>> {
    return this.request<AsaasList<AsaasPayment>>(
      "GET",
      `/subscriptions/${subscriptionId}/payments`
    );
  }

  // --- Payments ---

  async getPayment(id: string): Promise<AsaasPayment> {
    return this.request<AsaasPayment>("GET", `/payments/${id}`);
  }

  async getPaymentPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.request<AsaasPixQrCode>(
      "GET",
      `/payments/${paymentId}/pixQrCode`
    );
  }
}

export const asaas = new AsaasClient();
