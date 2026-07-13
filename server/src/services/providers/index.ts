/**
 * Provider Factory
 * ================
 * Instantiates the correct provider adapter based on provider type
 */

import { BaseProvider, ProviderCredentials } from './BaseProvider';
import { StripeProvider } from './StripeProvider';
import { PayPalProvider } from './PayPalProvider';
import { SquareProvider } from './SquareProvider';
import { CustomProvider } from './CustomProvider';

export class ProviderFactory {
  static createProvider(
    provider: string,
    credentials: ProviderCredentials
  ): BaseProvider {
    switch (provider.toLowerCase()) {
      case 'stripe':
        return new StripeProvider(credentials as any);
      case 'paypal':
        return new PayPalProvider(credentials as any);
      case 'square':
        return new SquareProvider(credentials as any);
      case 'custom':
        return new CustomProvider(credentials as any);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}

export {
  BaseProvider,
  ProviderCredentials,
} from './BaseProvider';
export { StripeProvider } from './StripeProvider';
export { PayPalProvider } from './PayPalProvider';
export { SquareProvider } from './SquareProvider';
export { CustomProvider } from './CustomProvider';
