// example-usage.ts
import AirtimeNigeriaSDK from "airtimenigeria-sdk";
// import AirtimeNigeriaSDK from "airtime-nigeria-sdk";
// or for CommonJS: const AirtimeNigeriaSDK = require('airtime-nigeria-sdk');

async function demonstrateSDK() {
  // Initialize the SDK with your API token
  const sdk = new AirtimeNigeriaSDK("your-api-token-here", {
    timeout: 30000, // Optional: 30 second timeout
    baseURL: "https://www.airtimenigeria.com/api/v1", // Optional: custom base URL
  });

  try {
    // 1. Check wallet balance
    console.log("Checking wallet balance...");
    const balance = await sdk.getWalletBalance();
    console.log("Balance:", balance);

    // 2. Get all data plans
    console.log("Fetching data plans...");
    const dataPlans = await sdk.getDataPlans();
    console.log("Available plans:", dataPlans.data?.length || 0);

    // 3. Get MTN data plans only
    console.log("Fetching MTN data plans...");
    const mtnPlans = await sdk.getDataPlansByOperator("mtn"); // IntelliSense will suggest: 'mtn' | 'airtel' | 'glo' | '9mobile'
    console.log("MTN plans:", mtnPlans.length);

    // 4. Purchase airtime
    console.log("Purchasing airtime...");
    const airtimePurchase = await sdk.purchaseAirtime({
      networkOperator: "mtn", // IntelliSense will show available options
      phone: "08012345678",
      amount: 100, // Will show validation: must be between 50-50000
      maxAmount: "150",
      callbackUrl: "https://yourapp.com/callback", // Optional
      customerReference: "ref-123", // Optional
    });
    console.log("Airtime purchase result:", airtimePurchase);

    // 5. Purchase data bundle
    console.log("Purchasing data bundle...");
    const dataPurchase = await sdk.purchaseData({
      phone: "08012345678",
      packageCode: "MTN_1GB_30DAYS", // You can get this from data plans
      maxAmount: "500", // Optional
      callbackUrl: "https://yourapp.com/callback", // Optional
      customerReference: "data-ref-123", // Optional
    });
    console.log("Data purchase result:", dataPurchase);

    // 6. Vend data from wallet
    console.log("Vending data from wallet...");
    const dataVend = await sdk.vendDataFromWallet({
      phone: "08012345678",
      planId: 123, // Alternative to packageCode
      processType: "instant", // IntelliSense will show: 'queue' | 'instant'
      callbackUrl: "https://yourapp.com/callback", // Optional
    });
    console.log("Data vend result:", dataVend);

    // 7. Find specific data plan
    console.log("Finding specific data plan...");
    const specificPlan = await sdk.findDataPlan("MTN_1GB_30DAYS");
    if (specificPlan) {
      // console.log("Found plan:", specificPlan.name);

      // 8. Get pricing for different customer types
      const regularPrice = await sdk.getDataPlanPrice(
        "MTN_1GB_30DAYS",
        "regular",
      );
      const agentPrice = await sdk.getDataPlanPrice("MTN_1GB_30DAYS", "agent");
      const dealerPrice = await sdk.getDataPlanPrice(
        "MTN_1GB_30DAYS",
        "dealer",
      );

      console.log("Pricing:", { regularPrice, agentPrice, dealerPrice });
    }

    // 9. Using static utility methods
    const phoneToValidate = "08012345678";
    if (AirtimeNigeriaSDK.isValidPhone(phoneToValidate)) {
      const formattedPhone = AirtimeNigeriaSDK.formatPhone(phoneToValidate);
      console.log("Phone is valid. Formatted:", formattedPhone);
    }
  } catch (error) {
    console.error(
      "Error occurred:",
      error instanceof Error ? error.message : error,
    );
  }
}

// Example with error handling and type safety
async function purchaseAirtimeWithValidation(
  networkOperator: "mtn" | "airtel" | "glo" | "9mobile",
  phone: string,
  amount: number,
) {
  const sdk = new AirtimeNigeriaSDK(process.env.AIRTIME_NIGERIA_API_TOKEN!);

  try {
    // Validate phone number first
    if (!AirtimeNigeriaSDK.isValidPhone(phone)) {
      throw new Error("Invalid phone number format");
    }

    // Check if amount is within valid range
    if (amount < 50 || amount > 50000) {
      throw new Error("Amount must be between 50 and 50000 NGN");
    }

    // Format phone number
    const formattedPhone = AirtimeNigeriaSDK.formatPhone(phone);

    // Purchase airtime
    const result = await sdk.purchaseAirtime({
      networkOperator,
      phone: formattedPhone,
      amount,
      maxAmount: (amount * 1.1).toString(), // 10% buffer
      customerReference: `purchase-${Date.now()}`,
    });

    return result;
  } catch (error) {
    console.error("Purchase failed:", error);
    throw error;
  }
}

// Export for use in other modules
export { demonstrateSDK, purchaseAirtimeWithValidation };
