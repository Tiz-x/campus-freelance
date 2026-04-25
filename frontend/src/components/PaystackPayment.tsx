import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { FiCreditCard, FiLock } from 'react-icons/fi';

interface PaystackPaymentProps {
  amount: number;
  email: string;
  jobId: string;
  jobTitle: string;
  studentId: string;
  onSuccess: () => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackPayment = ({ amount, email, jobId, jobTitle, studentId, onSuccess, onClose }: PaystackPaymentProps) => {
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    
    const ref = new Date().getTime().toString();
    
    // Define callback functions
    const paymentCallback = async (response: any) => {
      console.log("Payment successful:", response);
      
      // Save transaction to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Insert transaction with 'held' status (in escrow)
        const { error } = await supabase.from('transactions').insert({
          job_id: jobId,
          amount: amount,
          reference: response.reference,
          status: 'held',
          payer_id: user.id,
          payee_id: studentId,
          paystack_charge_id: response.transaction,
        });
        
        if (error) {
          console.error("Error saving transaction:", error);
          alert("Payment successful but failed to save transaction. Please contact support.");
        } else {
          // Update job status to show payment is in escrow
          await supabase
            .from('jobs')
            .update({ status: 'in_progress' })
            .eq('id', jobId);
          
          // Send notification to student
          await supabase.from('notifications').insert({
            user_id: studentId,
            type: 'payment_escrow',
            title: 'Payment Held in Escrow! 💰',
            message: `Payment for "${jobTitle}" (₦${amount.toLocaleString()}) is secured in escrow. Complete the job to receive payment.`,
            related_id: jobId,
            is_read: false
          });
          
          alert(`Payment successful! ₦${amount.toLocaleString()} is now held in escrow.`);
        }
      }
      
      onSuccess();
      setProcessing(false);
    };

    const paymentClose = () => {
      console.log("Payment window closed");
      onClose();
      setProcessing(false);
    };

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amount * 100,
      currency: 'NGN',
      ref: ref,
      metadata: {
        job_id: jobId,
        job_title: jobTitle,
        student_id: studentId,
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
          },
          {
            display_name: "Student ID",
            variable_name: "student_id",
            value: studentId,
          }
        ]
      },
      callback: paymentCallback,
      onClose: paymentClose,
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