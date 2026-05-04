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
  addToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackPayment = ({ amount, email, jobId, jobTitle, studentId, onSuccess, onClose, addToast }: PaystackPaymentProps) => {
  const [processing, setProcessing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (addToast) {
      addToast(message, type);
    } else {
      // Fallback to console if toast function not provided
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };

  const handlePayment = async () => {
    if (!window.PaystackPop) {
      showToast("Payment system is loading. Please try again in a moment.", "error");
      return;
    }

    setProcessing(true);
    
    const ref = `ESCROW-${jobId}-${Date.now()}`;
    
    try {
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
        },
        callback: (response: any) => {
          console.log("Payment successful:", response);
          handleSuccessfulPayment(response);
        },
        onClose: () => {
          console.log("Payment window closed");
          setProcessing(false);
          onClose();
        },
      });
      
      handler.openIframe();
    } catch (error) {
      console.error("Error setting up Paystack:", error);
      showToast("Failed to initialize payment. Please try again.", "error");
      setProcessing(false);
    }
  };

  const handleSuccessfulPayment = async (response: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showToast("User not found. Please login again.", "error");
        setProcessing(false);
        return;
      }
      
      // Check if transaction already exists
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', response.reference)
        .maybeSingle();
      
      if (existingTx) {
        console.log("Transaction already recorded");
        showToast("Transaction already recorded successfully!", "success");
        onSuccess();
        setProcessing(false);
        return;
      }
      
      // Insert transaction with 'held' status (in escrow) - NOT released to student yet
      const { error: txError } = await supabase.from('transactions').insert({
        job_id: jobId,
        amount: amount,
        reference: response.reference,
        status: 'held', 
        payer_id: user.id,
        payee_id: studentId,
        paystack_charge_id: response.transaction,
      });
      
      if (txError) {
        console.error("Error saving transaction:", txError);
        showToast("Payment successful but failed to save transaction. Please contact support.", "error");
        setProcessing(false);
        return;
      }
      
      // Update job status and payment status
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: 'in_progress',
          payment_status: 'paid',
          escrow_amount: amount,
          transaction_reference: response.reference
        })
        .eq('id', jobId);
      
      if (jobError) {
        console.error("Error updating job:", jobError);
        showToast("Payment saved but job update failed. Please contact support.", "error");
      }
      
      // Update the accepted bid status
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('job_id', jobId)
        .eq('student_id', studentId);
      
      if (bidError) {
        console.error("Error updating bid:", bidError);
      }
      
      // Reject all other bids for this job
      await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('student_id', studentId);
      
      // Insert into escrow_transactions table
      const { error: escrowError } = await supabase
        .from('escrow_transactions')
        .insert({
          job_id: jobId,
          sme_id: user.id,
          student_id: studentId,
          amount: amount,
          reference: response.reference,
          status: 'held'
        });
      
      if (escrowError) {
        console.error("Error saving escrow transaction:", escrowError);
      } else {
        console.log("Escrow transaction saved successfully");
      }
      
      // Send notification to student
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'payment_escrow',
        title: 'Payment Held in Escrow! 💰',
        message: `Payment for "${jobTitle}" (₦${amount.toLocaleString()}) is secured in escrow. Complete the job to receive payment.`,
        related_id: jobId,
        is_read: false
      });
      
      if (notifError) {
        console.error("Error sending notification:", notifError);
      }
      
      showToast(`Payment successful! ₦${amount.toLocaleString()} is now held in escrow. The student will receive it after job completion.`, "success");
      onSuccess();
      
    } catch (error) {
      console.error("Error in handleSuccessfulPayment:", error);
      showToast("Payment processed but there was an error updating the system. Please contact support.", "error");
    } finally {
      setProcessing(false);
    }
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