import mongoose from 'mongoose';

const PolicySchema = new mongoose.Schema({
    partner_id: { type: String, required: true }, // e.g. "919123456789"
    policyNumber: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    premium: { type: Number, required: true },
    periodStart: { type: Date, default: Date.now },
    periodEnd: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' }
}, { timestamps: true });

const ClaimSchema = new mongoose.Schema({
    claimNumber: { type: String, required: true, unique: true },
    policyNumber: { type: String, required: true },
    partner_id: { type: String, required: true },
    amount: { type: Number, required: true },
    triggerType: { type: String, required: true }, 
    zone: { type: String, required: true },
    status: { type: String, enum: ['PAID', 'PENDING', 'FLAGGED'], default: 'PAID' },
    gateway_tx_id: { type: String } // Transaction ID from Razorpay/UPI mock
}, { timestamps: true });

export const Policy = mongoose.model('Policy', PolicySchema);
export const Claim = mongoose.model('Claim', ClaimSchema);
