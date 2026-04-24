export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_PUBLIC_KEY) {
  console.warn('Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file');
}