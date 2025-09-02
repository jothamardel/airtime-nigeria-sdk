export interface AirtimeNigeriaOptions {
  baseURL?: string;
  timeout?: number;
}

export interface AirtimePurchaseParams {
  networkOperator: "mtn" | "airtel" | "glo" | "9mobile";
  phone: string;
  amount: number;
  maxAmount: string;
  callbackUrl?: string;
  customerReference?: string;
}

export interface DataPurchaseParams {
  phone: string;
  packageCode?: string;
  planId?: number;
  maxAmount?: string;
  callbackUrl?: string;
  customerReference?: string;
}

export interface DataWalletVendParams {
  phone: string;
  packageCode?: string;
  planId?: number;
  processType?: "queue" | "instant";
  callbackUrl?: string;
  customerReference?: string;
}

export interface AirtimeResponse {
  success: boolean;
  status: string;
  message: string;
  details?: {
    reference: string;
    customer_reference: string | null;
    package: string;
    recipients: string;
    number_of_recipients: number;
    airtime_amount: number;
    unit_cost: number;
    total_cost: number;
    currency: string;
  };
}

export interface DataResponse {
  success: boolean;
  status: string;
  message: string;
  details?: {
    reference: string;
    customer_reference: string | null;
    package: string;
    recipients: string;
    number_of_recipients: number;
    unit_cost: number;
    total_cost: number;
    currency: string;
    gateway_response?: string;
    delivery_status?: string;
    order_status?: string;
  };
}

export interface DataPlan {
  network_operator: string;
  plan_summary: string;
  package_code: string;
  plan_id: number;
  validity: string;
  regular_price: number;
  agent_price: number;
  dealer_price: number;
  currency: string;
}

export interface DataPlansResponse {
  success: boolean;
  status: string;
  data: DataPlan[];
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  status: string;
  universal_wallet: WalletBalance;
  sms_wallet: WalletBalance;
  mtn_data_wallet: WalletBalance;
  airtel_eds_wallet: WalletBalance;
  glo_cg_wallet: WalletBalance;
}

export interface CallbackPayload {
  reference: string;
  customer_reference: string;
  recipient: string;
  gateway_response: string;
  delivery_status: string;
  data: {
    recipient: string;
    gateway_response: string;
    status: string;
    delivery_status: string;
  }[];
}

export interface APIResponse<T = any> {
  statusCode: number;
  data: T;
}

declare class AirtimeNigeriaSDK {
  constructor(apiToken: string, options?: AirtimeNigeriaOptions);

  makeRequest<T = any>(
    endpoint: string,
    method?: string,
    data?: any,
  ): Promise<APIResponse<T>>;

  purchaseAirtime(params: AirtimePurchaseParams): Promise<AirtimeResponse>;

  purchaseData(params: DataPurchaseParams): Promise<DataResponse>;

  vendDataFromWallet(params: DataWalletVendParams): Promise<DataResponse>;

  getDataPlans(): Promise<DataPlansResponse>;

  getWalletBalance(): Promise<WalletBalanceResponse>;

  getDataPlansByOperator(
    networkOperator: "mtn" | "airtel" | "glo" | "9mobile",
  ): Promise<DataPlan[]>;

  findDataPlan(packageCode: string): Promise<DataPlan | null>;

  getDataPlanPrice(
    packageCode: string,
    priceType?: "regular" | "agent" | "dealer",
  ): Promise<number | null>;

  static isValidPhone(phone: string): boolean;

  static formatPhone(phone: string): string;
}

export = AirtimeNigeriaSDK;
