# AirtimeNigeria SDK

[![npm version](https://badge.fury.io/js/airtime-nigeria-sdk.svg)](https://badge.fury.io/js/airtime-nigeria-sdk)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive Node.js SDK for the [AirtimeNigeria.com](https://airtimenigeria.com) API that enables seamless airtime purchases, data bundle purchases, and wallet management for all Nigerian mobile networks.

## ✨ Features

- 🚀 **Full TypeScript Support** - Complete type definitions with IntelliSense
- 📱 **All Networks Supported** - MTN, Airtel, Glo, and 9mobile
- 💰 **Dual Payment Methods** - Naira balance and Data wallet support
- ⚡ **Promise-Based API** - Modern async/await syntax
- 🔒 **Built-in Validation** - Phone number and parameter validation
- 🎯 **Zero Dependencies** - Lightweight with no external dependencies
- 📊 **Comprehensive Error Handling** - Detailed error messages and status codes
- 🔄 **Automatic Retries** - Built-in request timeout and error handling

## 🚀 Installation

```bash
npm install airtime-nigeria-sdk
```

## 📋 Requirements

- Node.js 14.0.0 or higher
- AirtimeNigeria.com API token ([Get one here](https://airtimenigeria.com))

## 🏁 Quick Start

### TypeScript/ES6
```typescript
import AirtimeNigeriaSDK from 'airtime-nigeria-sdk';

const sdk = new AirtimeNigeriaSDK('your-api-token-here');

// Purchase airtime
const result = await sdk.purchaseAirtime({
  networkOperator: 'mtn',
  phone: '08012345678',
  amount: 100,
  maxAmount: '150'
});

console.log('Purchase successful:', result);
```

### CommonJS
```javascript
const AirtimeNigeriaSDK = require('airtime-nigeria-sdk');

const sdk = new AirtimeNigeriaSDK('your-api-token-here');

sdk.purchaseAirtime({
  networkOperator: 'mtn',
  phone: '08012345678',
  amount: 100,
  maxAmount: '150'
}).then(result => {
  console.log('Purchase successful:', result);
}).catch(error => {
  console.error('Purchase failed:', error);
});
```

## 📖 API Reference

### Constructor

```typescript
new AirtimeNigeriaSDK(apiToken: string, options?: AirtimeNigeriaOptions)
```

**Parameters:**
- `apiToken` (string): Your AirtimeNigeria.com API token
- `options` (optional): Configuration options
  - `baseURL` (string): Custom API base URL (default: 'https://www.airtimenigeria.com/api/v1')
  - `timeout` (number): Request timeout in milliseconds (default: 30000)

### Methods

#### `purchaseAirtime(params)`
Purchase airtime for Nigerian mobile numbers.

```typescript
await sdk.purchaseAirtime({
  networkOperator: 'mtn' | 'airtel' | 'glo' | '9mobile',
  phone: '08012345678', // Single number or comma-separated list
  amount: 100, // 50-50000 NGN
  maxAmount: '150', // Maximum amount willing to pay
  callbackUrl: 'https://yourapp.com/callback', // Optional
  customerReference: 'your-ref-123' // Optional
});
```

#### `purchaseData(params)`
Purchase data bundles with Naira balance.

```typescript
await sdk.purchaseData({
  phone: '08012345678',
  packageCode: 'MTN_1GB_30DAYS', // From getDataPlans()
  // OR
  planId: 123, // Alternative to packageCode
  maxAmount: '500', // Optional
  callbackUrl: 'https://yourapp.com/callback', // Optional
  customerReference: 'data-ref-123' // Optional
});
```

#### `vendDataFromWallet(params)`
Vend data using Data wallet balance.

```typescript
await sdk.vendDataFromWallet({
  phone: '08012345678',
  packageCode: 'MTN_1GB_30DAYS',
  processType: 'instant', // 'queue' | 'instant'
  callbackUrl: 'https://yourapp.com/callback', // Optional
  customerReference: 'wallet-ref-123' // Optional
});
```

#### `getDataPlans()`
Get all available data plans.

```typescript
const plans = await sdk.getDataPlans();
console.log('Available plans:', plans.data);
```

#### `getDataPlansByOperator(networkOperator)`
Get data plans for specific network operator.

```typescript
const mtnPlans = await sdk.getDataPlansByOperator('mtn');
console.log('MTN plans:', mtnPlans);
```

#### `getWalletBalance()`
Check your wallet balance.

```typescript
const balance = await sdk.getWalletBalance();
console.log('Naira Balance:', balance.data?.naira_balance);
console.log('Data Wallet:', balance.data?.data_wallet_balance);
```

#### `findDataPlan(packageCode)`
Find specific data plan by package code.

```typescript
const plan = await sdk.findDataPlan('MTN_1GB_30DAYS');
if (plan) {
  console.log('Plan details:', plan);
}
```

#### `getDataPlanPrice(packageCode, priceType?)`
Get pricing for specific data plan.

```typescript
const regularPrice = await sdk.getDataPlanPrice('MTN_1GB_30DAYS', 'regular');
const agentPrice = await sdk.getDataPlanPrice('MTN_1GB_30DAYS', 'agent');
const dealerPrice = await sdk.getDataPlanPrice('MTN_1GB_30DAYS', 'dealer');
```

### Static Utility Methods

#### `AirtimeNigeriaSDK.isValidPhone(phone)`
Validate Nigerian phone number format.

```typescript
const isValid = AirtimeNigeriaSDK.isValidPhone('08012345678');
console.log('Valid phone:', isValid); // true
```

#### `AirtimeNigeriaSDK.formatPhone(phone)`
Format phone number to standard Nigerian format.

```typescript
const formatted = AirtimeNigeriaSDK.formatPhone('+2348012345678');
console.log('Formatted:', formatted); // '8012345678'
```

## 🔥 Advanced Usage Examples

### Bulk Airtime Purchase
```typescript
// Purchase airtime for multiple numbers
await sdk.purchaseAirtime({
  networkOperator: 'mtn',
  phone: '08012345678,08087654321,08011111111', // Comma-separated
  amount: 100,
  maxAmount: '150'
});
```

### Error Handling with Validation
```typescript
async function safePurchaseAirtime(phone: string, amount: number) {
  try {
    // Validate inputs
    if (!AirtimeNigeriaSDK.isValidPhone(phone)) {
      throw new Error('Invalid phone number format');
    }

    if (amount < 50 || amount > 50000) {
      throw new Error('Amount must be between ₦50 and ₦50,000');
    }

    // Check balance first
    const balance = await sdk.getWalletBalance();
    if (balance.data && balance.data.naira_balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Make purchase
    const result = await sdk.purchaseAirtime({
      networkOperator: 'mtn',
      phone: AirtimeNigeriaSDK.formatPhone(phone),
      amount,
      maxAmount: (amount * 1.1).toString(), // 10% buffer
      customerReference: `purchase-${Date.now()}`
    });

    return result;
  } catch (error) {
    console.error('Purchase failed:', error);
    throw error;
  }
}
```

### Data Plan Explorer
```typescript
async function exploreDataPlans() {
  // Get all plans
  const allPlans = await sdk.getDataPlans();

  // Filter MTN plans under ₦1000
  const affordableMtnPlans = allPlans.data?.filter(plan =>
    plan.network_operator === 'mtn' &&
    plan.regular_price < 1000
  );

  console.log('Affordable MTN Plans:', affordableMtnPlans);

  // Get cheapest plan for each network
  const networks = ['mtn', 'airtel', 'glo', '9mobile'] as const;

  for (const network of networks) {
    const plans = await sdk.getDataPlansByOperator(network);
    const cheapest = plans.reduce((prev, current) =>
      prev.regular_price < current.regular_price ? prev : current
    );
    console.log(`Cheapest ${network.toUpperCase()} plan:`, cheapest);
  }
}
```

## 🛠️ Configuration Options

```typescript
const sdk = new AirtimeNigeriaSDK('your-token', {
  baseURL: 'https://custom-api-url.com/api/v1', // Custom API endpoint
  timeout: 60000 // 60 second timeout
});
```

## 🔒 Environment Variables

For production applications, store your API token securely:

```bash
# .env file
AIRTIME_NIGERIA_API_TOKEN=your-secret-token-here
```

```typescript
// In your code
const sdk = new AirtimeNigeriaSDK(process.env.AIRTIME_NIGERIA_API_TOKEN!);
```

## 📊 Response Types

All methods return typed responses. Here are the main response types:

```typescript
interface AirtimeResponse {
  success: boolean;
  message: string;
  data?: {
    transaction_id: string;
    amount: number;
    phone: string;
    network_operator: string;
    status: 'pending' | 'completed' | 'failed';
  };
}

interface DataPlan {
  id: number;
  network_operator: 'mtn' | 'airtel' | 'glo' | '9mobile';
  package_code: string;
  name: string;
  amount: string;
  validity: string;
  regular_price: number;
  agent_price: number;
  dealer_price: number;
}
```

## ❗ Error Handling

The SDK throws descriptive errors for various scenarios:

```typescript
try {
  await sdk.purchaseAirtime({
    networkOperator: 'invalid' as any, // TypeScript will catch this
    phone: 'invalid-phone',
    amount: 25, // Below minimum
    maxAmount: '50'
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Possible errors:
    // - "Invalid network operator. Must be one of: mtn, airtel, glo, 9mobile"
    // - "Amount must be between 50 and 50000 NGN"
    // - "Request timeout"
    // - "Failed to parse response: ..."
  }
}
```

## 🧪 Testing

```bash
# Install the package
npm install airtime-nigeria-sdk

# Test basic functionality
node -e "
const SDK = require('airtime-nigeria-sdk');
const sdk = new SDK('test-token');
console.log('SDK loaded successfully!');
console.log('Valid phone test:', SDK.isValidPhone('08012345678'));
"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

- 📖 [API Documentation](https://airtimenigeria.com)
- 🐛 [Report Issues](https://github.com/jothamardel/airtime-nigeria-sdk/issues)
- 💬 [Discussions](https://github.com/jothamardel/airtime-nigeria-sdk/discussions)
- 📧 Email: support@yourdomain.com

## ⚖️ Legal & Disclaimer

This is an unofficial SDK for AirtimeNigeria.com. Please ensure you comply with their Terms of Service and API usage policies.

---

**Made with ❤️ for the Nigerian developer community**
