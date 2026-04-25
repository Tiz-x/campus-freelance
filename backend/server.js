// backend/server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Verify Paystack signature
const verifySignature = (req) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
  return hash === req.headers['x-paystack-signature'];
};

app.post('/webhook/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send('Unauthorized');
  }

  const event = req.body;
  
  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;
    
    // Update transaction status to 'held' (in escrow)
    await supabase
      .from('transactions')
      .update({ status: 'held' })
      .eq('reference', reference);
    
    // Update job status
    await supabase
      .from('jobs')
      .update({ status: 'in_progress' })
      .eq('id', metadata.job_id);
    
    // Notify student that payment is in escrow
    await supabase.from('notifications').insert({
      user_id: metadata.student_id,
      type: 'payment_escrow',
      title: 'Payment Held in Escrow! 💰',
      message: `Payment for "${metadata.job_title}" is secured in escrow. Complete the job to receive payment.`,
      related_id: metadata.job_id,
      is_read: false
    });
  }
  
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));