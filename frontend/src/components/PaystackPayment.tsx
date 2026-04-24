import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FiCreditCard, FiLock } from 'react-icons/fi';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackPayment = ({ amount, email, jobId, jobTitle, onSuccess, onClose }: PaystackPaymentProps) => {
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    
    const ref = new Date().getTime().toString();
    
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100,
      currency: 'NGN',
      ref: ref,
      metadata: {
        custom_fields: [
          {
            display_name: "Job ID",
            variable_name: "job_id",
            value: jobId,
          },
          {
            display_name: "Job Title",
            variable_name: "job_title",
            value: jobTitle,
          }
        ]
      },
      callback: (response: any) => {
        console.log("Payment successful:", response);
        
        // Save transaction to database
        const saveTransaction = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { error } = await supabase.from('transactions').insert({
              job_id: jobId,
              amount: amount,
              reference: response.reference,
              status: 'held',
              payer_id: user.id,
              paystack_charge_id: response.transaction,
            });
            
            if (error) {
              console.error("Error saving transaction:", error);
              alert("Payment successful but failed to save transaction. Please contact support.");
            } else {
              await supabase
                .from('jobs')
                .update({ status: 'payment_pending' })
                .eq('id', jobId);
              
              alert("Payment successful! Funds are held in escrow until job completion.");
            }
          }
          
          onSuccess();
        };
        
        saveTransaction();
        setProcessing(false);
        handler.close();
      },
      onClose: () => {
        console.log("Payment window closed");
        onClose();
        setProcessing(false);
      },
    });
    
    handler.openIframe();
  };

  return (
    <button
      onClick={handlePayment}
      disabled={processing}
      style={{
        width: "100%",
        padding: "0.75rem",
        background: processing ? "#ccc" : "#1a9c6e",
        color: "white",
        border: "none",
        borderRadius: "12px",
        fontWeight: 600,
        cursor: processing ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        marginTop: "0.5rem",
      }}
    >
      {processing ? <FiLock /> : <FiCreditCard />}
      {processing ? "Processing..." : `Pay ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)}`}
    </button>
  );
};

export default PaystackPayment;