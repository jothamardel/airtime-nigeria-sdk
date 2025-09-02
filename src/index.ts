/**
 * AirtimeNigeria SDK for Node.js
 * A comprehensive JavaScript SDK for the AirtimeNigeria.com API
 *
 * @author AirtimeNigeria SDK
 * @version 1.0.0
 */

import * as https from "https";
import * as http from "http";
import { URL } from "url";

// Import types from the type definitions
import {
  AirtimeNigeriaOptions,
  AirtimePurchaseParams,
  DataPurchaseParams,
  DataWalletVendParams,
  AirtimeResponse,
  DataResponse,
  DataPlansResponse,
  WalletBalanceResponse,
  DataPlan,
  APIResponse,
} from "../index";

class AirtimeNigeriaSDK {
  // Declare class properties
  private apiToken: string;
  private baseURL: string;
  private timeout: number;

  constructor(apiToken: string, options: AirtimeNigeriaOptions = {}) {
    if (!apiToken) {
      throw new Error("API token is required");
    }

    this.apiToken = apiToken;
    this.baseURL = options.baseURL || "https://www.airtimenigeria.com/api/v1";
    this.timeout = options.timeout || 30000;
  }

  /**
   * Make HTTP request to the API
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} API response
   */
  async makeRequest<T = any>(
    endpoint: string,
    method = "GET",
    data: any = null,
  ): Promise<APIResponse<T>> {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      const isHttps = url.protocol === "https:";
      const client = isHttps ? https : http;

      const postData = data ? JSON.stringify(data) : null;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(postData && { "Content-Length": Buffer.byteLength(postData) }),
        },
        timeout: this.timeout,
      };

      const req = client.request(options, (res: http.IncomingMessage) => {
        let responseData = "";

        res.on("data", (chunk: Buffer) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve({
              statusCode: res.statusCode || 200,
              data: parsedData,
            });
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown parsing error";
            reject(new Error(`Failed to parse response: ${errorMessage}`));
          }
        });
      });

      req.on("error", (error: Error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }

  /**
   * Purchase airtime for one or multiple phone numbers
   * @param {Object} params - Purchase parameters
   * @param {string} params.networkOperator - Network operator ('mtn', 'airtel', 'glo', '9mobile')
   * @param {string} params.phone - Single phone number or comma-separated list
   * @param {number} params.amount - Airtime amount (50-50000 NGN)
   * @param {string} params.maxAmount - Maximum amount willing to pay
   * @param {string} [params.callbackUrl] - Callback URL for delivery reports
   * @param {string} [params.customerReference] - Unique internal identifier
   * @returns {Promise<Object>} Purchase response
   */
  async purchaseAirtime(
    params: AirtimePurchaseParams,
  ): Promise<AirtimeResponse> {
    const {
      networkOperator,
      phone,
      amount,
      maxAmount,
      callbackUrl,
      customerReference,
    } = params;

    if (!networkOperator || !phone || !amount || !maxAmount) {
      throw new Error(
        "networkOperator, phone, amount, and maxAmount are required",
      );
    }

    if (!["mtn", "airtel", "glo", "9mobile"].includes(networkOperator)) {
      throw new Error(
        "Invalid network operator. Must be one of: mtn, airtel, glo, 9mobile",
      );
    }

    if (amount < 50 || amount > 50000) {
      throw new Error("Amount must be between 50 and 50000 NGN");
    }

    const requestData = {
      network_operator: networkOperator,
      phone: phone,
      amount: amount,
      max_amount: maxAmount,
      ...(callbackUrl && { callback_url: callbackUrl }),
      ...(customerReference && { customer_reference: customerReference }),
    };

    const response = await this.makeRequest<AirtimeResponse>(
      "/airtime",
      "POST",
      requestData,
    );
    return response.data;
  }

  /**
   * Purchase data bundle with Naira balance
   * @param {Object} params - Purchase parameters
   * @param {string} params.phone - Single phone number or comma-separated list
   * @param {string} [params.packageCode] - Package code for the data plan
   * @param {number} [params.planId] - Plan ID (alternative to packageCode)
   * @param {string} [params.maxAmount] - Maximum amount willing to pay
   * @param {string} [params.callbackUrl] - Callback URL for delivery reports
   * @param {string} [params.customerReference] - Unique internal identifier
   * @returns {Promise<Object>} Purchase response
   */
  async purchaseData(params: DataPurchaseParams): Promise<DataResponse> {
    const {
      phone,
      packageCode,
      planId,
      maxAmount,
      callbackUrl,
      customerReference,
    } = params;

    if (!phone) {
      throw new Error("phone is required");
    }

    if (!packageCode && !planId) {
      throw new Error("Either packageCode or planId is required");
    }

    const requestData = {
      phone: phone,
      ...(packageCode && { package_code: packageCode }),
      ...(planId && !packageCode && { plan_id: planId }),
      ...(maxAmount && { max_amount: maxAmount }),
      ...(callbackUrl && { callback_url: callbackUrl }),
      ...(customerReference && { customer_reference: customerReference }),
    };

    const response = await this.makeRequest<DataResponse>(
      "/data",
      "POST",
      requestData,
    );
    return response.data;
  }

  /**
   * Vend data from data wallet balance
   * @param {Object} params - Vend parameters
   * @param {string} params.phone - Single phone number or comma-separated list
   * @param {string} [params.packageCode] - Package code for the data plan
   * @param {number} [params.planId] - Plan ID (alternative to packageCode)
   * @param {string} [params.processType] - Processing type ('queue' or 'instant')
   * @param {string} [params.callbackUrl] - Callback URL for delivery reports
   * @param {string} [params.customerReference] - Unique internal identifier
   * @returns {Promise<Object>} Vend response
   */
  async vendDataFromWallet(
    params: DataWalletVendParams,
  ): Promise<DataResponse> {
    const {
      phone,
      packageCode,
      planId,
      processType,
      callbackUrl,
      customerReference,
    } = params;

    if (!phone) {
      throw new Error("phone is required");
    }

    if (!packageCode && !planId) {
      throw new Error("Either packageCode or planId is required");
    }

    if (processType && !["queue", "instant"].includes(processType)) {
      throw new Error('processType must be either "queue" or "instant"');
    }

    const requestData = {
      phone: phone,
      ...(packageCode && { package_code: packageCode }),
      ...(planId && !packageCode && { plan_id: planId }),
      ...(processType && { process_type: processType }),
      ...(callbackUrl && { callback_url: callbackUrl }),
      ...(customerReference && { customer_reference: customerReference }),
    };

    const response = await this.makeRequest<DataResponse>(
      "/data/wallet",
      "POST",
      requestData,
    );
    return response.data;
  }

  /**
   * Get all available data plans
   * @returns {Promise<Object>} Data plans response
   */
  async getDataPlans(): Promise<DataPlansResponse> {
    const response = await this.makeRequest<DataPlansResponse>(
      "/data/plans",
      "GET",
    );
    return response.data;
  }

  /**
   * Get wallet balance information
   * @returns {Promise<Object>} Wallet balance response
   */
  async getWalletBalance(): Promise<WalletBalanceResponse> {
    const response = await this.makeRequest<WalletBalanceResponse>(
      "/balance",
      "GET",
    );
    return response.data;
  }

  /**
   * Get data plans filtered by network operator
   * @param {string} networkOperator - Network operator to filter by
   * @returns {Promise<Array>} Filtered data plans
   */
  async getDataPlansByOperator(
    networkOperator: "mtn" | "airtel" | "glo" | "9mobile",
  ): Promise<DataPlan[]> {
    if (!["mtn", "airtel", "glo", "9mobile"].includes(networkOperator)) {
      throw new Error(
        "Invalid network operator. Must be one of: mtn, airtel, glo, 9mobile",
      );
    }

    const response = await this.getDataPlans();
    if (response.success && response.data) {
      return response.data.filter(
        (plan: DataPlan) => plan.network_operator === networkOperator,
      );
    }
    return [];
  }

  /**
   * Find a specific data plan by package code
   * @param {string} packageCode - Package code to search for
   * @returns {Promise<Object|null>} Data plan or null if not found
   */
  async findDataPlan(packageCode: string): Promise<DataPlan | null> {
    const response = await this.getDataPlans();
    if (response.success && response.data) {
      return (
        response.data.find(
          (plan: DataPlan) => plan.package_code === packageCode,
        ) || null
      );
    }
    return null;
  }

  /**
   * Get pricing for a specific data plan
   * @param {string} packageCode - Package code
   * @param {string} [priceType='regular'] - Price type ('regular', 'agent', 'dealer')
   * @returns {Promise<number|null>} Price or null if not found
   */
  async getDataPlanPrice(
    packageCode: string,
    priceType: "regular" | "agent" | "dealer" = "regular",
  ): Promise<number | null> {
    const plan = await this.findDataPlan(packageCode);
    if (!plan) return null;

    const priceKey = `${priceType}_price` as keyof Pick<
      DataPlan,
      "regular_price" | "agent_price" | "dealer_price"
    >;
    return plan[priceKey] || null;
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   */
  static isValidPhone(phone: string): boolean {
    // Basic validation for Nigerian phone numbers
    const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Format phone number to Nigerian format
   * @param {string} phone - Phone number to format
   * @returns {string} Formatted phone number
   */
  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\s/g, "");
    if (cleaned.startsWith("+234")) {
      return cleaned.substring(4);
    }
    if (cleaned.startsWith("234")) {
      return cleaned.substring(3);
    }
    if (cleaned.startsWith("0")) {
      return cleaned.substring(1);
    }
    return cleaned;
  }
}

// Export for CommonJS and ES6 modules
export = AirtimeNigeriaSDK;
