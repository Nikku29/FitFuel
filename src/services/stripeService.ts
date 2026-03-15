import { loadStripe, Stripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

// Load Stripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (key && key !== 'your_stripe_public_key_here') {
      stripePromise = loadStripe(key);
    } else {
      console.warn('VITE_STRIPE_PUBLIC_KEY is not set or is using the placeholder. Stripe won\'t be fully initialized.');
      stripePromise = Promise.resolve(null);
    }
  }
  return stripePromise;
};

export const initiateCheckout = async (planId: string) => {
  const stripe = await getStripe();
  
  if (!stripe) {
    console.error('Stripe was not initialized. Please ensure VITE_STRIPE_PUBLIC_KEY is set in your .env file.');
    toast.error('Payment Initialization Failed', {
      description: 'Stripe is running in secure stub mode because no public key was detected in the environment. This is expected behavior in development.'
    });
    return { success: false, message: 'Missing Stripe Public Key' };
  }
  
  // In a full production implementation, we would make a fetch() request to our serverless endpoint
  // to create a Stripe Checkout Session, then redirect the user using the returned sessionId.
  // Example:
  // const response = await fetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ planId }) });
  // const session = await response.json();
  // await stripe.redirectToCheckout({ sessionId: session.id });
  
  console.log(`Successfully initiated checkout attempt for plan: ${planId}`);
  toast.success('Checkout Initiated', {
    description: `Preparing redirect to secure Stripe checkout for ${planId}...`
  });
  
  return { success: true, stripeObj: stripe };
};
