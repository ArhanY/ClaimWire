import { v4 as uuidv4 } from 'uuid';

export class ClaimWirePCAdapter {
    /**
     * Mocks ClaimWire PolicyCenter Cloud API for Account creation
     */
    static async createAccount(partnerData) {
        console.log(`[CW-PC] Creating Account for ${partnerData.name} `);
        // In real world, POST /common/v1/accounts
        return {
            accountId: `CW-ACC-${Math.floor(Math.random() * 100000)}`,
            status: "Created"
        };
    }

    /**
     * Mocks ClaimWire PolicyCenter for Creating a Policy (Submission)
     */
    static async createWeeklyPolicy(accountId, premiumAmount) {
        console.log(`[CW-PC] Creating Weekly Gig Policy for Account: ${accountId}`);
        // In real world, POST /job/v1/jobs (Submission) -> Quote -> Bind
        return {
            policyNumber: `CW2026-${Math.floor(Math.random() * 1000000)}`,
            premium: premiumAmount,
            periodStart: new Date().toISOString(),
            periodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Bound"
        };
    }
}

export class ClaimWireCCAdapter {
    /**
     * Mocks ClaimWire ClaimCenter Cloud API for FNOL (First Notice of Loss)
     */
    static async createFNOL(policyNumber, triggerData) {
        console.log(`[CW-CC] Creating Automation FNOL for Policy: ${policyNumber} based on Trigger: ${triggerData.type}`);
        // Real world: POST /claim/v1/claims
        return {
            claimNumber: `CLM-${uuidv4().substring(0,8)}`,
            lossDate: new Date().toISOString(),
            lossType: "Parametric_IncomeLoss",
            status: "Draft",
            estimatedLossAmount: 300.0 // Flat or dynamic payout
        };
    }

    /**
     * Approves the claim and issues a payment mock
     */
    static async approveAndPayClaim(claimNumber) {
        console.log(`[CW-CC] Approving Claim: ${claimNumber} and staging Payment.`);
        return {
            claimNumber: claimNumber,
            status: "Approved",
            paymentStatus: "Sent to Gateway"
        };
    }
}
