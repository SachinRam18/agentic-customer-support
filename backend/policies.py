"""
Structured policy documents for the RAG (Retrieval-Augmented Generation) engine.
Contains support FAQs and core policies.
"""

from typing import List, Dict, Any

support_faqs: List[Dict[str, Any]] = [
    {
        "id": "faq_1",
        "category": "Subscription",
        "question": "How do I cancel my subscription?",
        "answer": "Customers can cancel subscriptions anytime from account settings. After canceling, you will continue to have access to your space and all full premium features until the end of your current billing period."
    },
    {
        "id": "faq_2",
        "category": "Refunds",
        "question": "What is the refund policy?",
        "answer": "Refund requests are accepted within 7 days of purchase. Only first-time purchases of any plan are eligible for a refund. Auto-renewals and team plan add-ons are strictly non-refundable."
    },
    {
        "id": "faq_3",
        "category": "Billing",
        "question": "How do I update my billing email?",
        "answer": "Users can update their billing email through the accounts profile section under 'Billing Information'. This redirects all invoices, payment alerts, and dynamic receipts to the designated address."
    },
    {
        "id": "faq_4",
        "category": "Technical Issues",
        "question": "How can I contact support?",
        "answer": "You can contact support through email (support@cloudbox.com), our live AI web helper, or submit a support ticket in our interactive Support Portal. Priority support is provided to Professional and Enterprise customers."
    },
    {
        "id": "faq_5",
        "category": "Refunds",
        "question": "How long does refund processing take?",
        "answer": "Refunds are processed within 5-7 business days using the original payment channel. Bank clearing processes might add an additional 2-3 business days depending on your financial institution."
    },
    {
        "id": "faq_6",
        "category": "Subscription",
        "question": "Is there a cancellation or termination fee?",
        "answer": "No, there are no cancellation or termination fees on CloudBox. We support honest, user-first cloud storage with simple monthly and yearly scheduling. You cancel free of charge at any time."
    },
    {
        "id": "faq_7",
        "category": "Subscription",
        "question": "Will I lose my files immediately after canceling?",
        "answer": "No. Your subscription remains fully dynamic with existing quota benefits until the end of the current cycle. At the end of the cycle, your quota is stepped down, but we preserve your files intact for 30 consecutive days before archival purging."
    },
    {
        "id": "faq_8",
        "category": "Billing",
        "question": "How can I toggle between monthly and yearly billing?",
        "answer": "Customers can toggle billing plans inside the Account portal. Switching to yearly offers a 20% flat discount on our plans, calculated dynamically and adjusted prorated on your current storage balance."
    },
    {
        "id": "faq_9",
        "category": "Billing",
        "question": "What payment methods does CloudBox accept?",
        "answer": "We support a wide array of payment methods, including all major Credit/Debit Cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe), and secure Internet Net Banking nodes."
    },
    {
        "id": "faq_10",
        "category": "Billing",
        "question": "What happens if a subscription payment fails?",
        "answer": "If auto-renewal failing triggers, we grant a 14-day grace period. During this window, we make up to three retry attempts. If payment is still overdue after 14 days, your account workspace shifts to a read-only suspended mode."
    },
    {
        "id": "faq_11",
        "category": "Account Management",
        "question": "How do I reset my security password?",
        "answer": "If you forgot your password or want to reset it, visit our website login page, select 'Forgot Password', and enter your secure account email. A cryptographic verification token will be sent instantly."
    },
    {
        "id": "faq_12",
        "category": "Account Management",
        "question": "Can I update my login email address?",
        "answer": "Yes, you can update your primary login profile email by sending the request in the Profile Portal. To secure your account, a confirmation link is dispatched to both your old and new email addresses."
    },
    {
        "id": "faq_13",
        "category": "Account Management",
        "question": "Is multi-factor authentication (MFA) supported?",
        "answer": "Yes, CloudBox strongly supports MFA security. You can configure MFA using standard authenticator apps (like Google Authenticator or Microsoft Authenticator) in the Account Security Hub."
    },
    {
        "id": "faq_14",
        "category": "Technical Issues",
        "question": "Are files encrypted in transit and at rest?",
        "answer": "Absolutely. All CloudBox data is encrypted in transit using TLS 1.3 tunnels and encrypted at rest on our secure cloud nodes using industry-leading AES-256 blocks with full customer-held keys."
    },
    {
        "id": "faq_15",
        "category": "Technical Issues",
        "question": "Is there a single-file size upload limit?",
        "answer": "File limit filters are based on your subscription tier: Starter plan hosts allow files up to 5GB, Professional tier allows files up to 50GB, and Enterprise clients are enabled to upload single files up to 250GB."
    },
    {
        "id": "faq_16",
        "category": "Technical Issues",
        "question": "How do I review file version history?",
        "answer": "You can review history by right-clicking any file inside the web canvas or explorer app. We keep version histories for 30 days (Starter), 90 days (Professional), and 365 days (Enterprise)."
    },
    {
        "id": "faq_17",
        "category": "Billing",
        "question": "Where can I download my previous tax invoices?",
        "answer": "Tax invoices are accessible under 'Invoices & Billing History' in the member dashboard. You can download pdf variants of all past payments instantly with clear breakdown summaries."
    },
    {
        "id": "faq_18",
        "category": "Refunds",
        "question": "Are taxes and gateway fees fully refundable?",
        "answer": "Under first-purchase cancellations approved within 7 days, the full base fee and standard taxes are fully refunded. Any international currency conversion or gateway transaction hub surcharges might be non-refundable."
    },
    {
        "id": "faq_19",
        "category": "Technical Issues",
        "question": "Is there an offline sync app for Windows and macOS?",
        "answer": "Yes, CloudBox offers dedicated native sync applications for Windows, macOS, and Linux, which mount a local path on your machine mapping directly to your secure cloud volume."
    },
    {
        "id": "faq_20",
        "category": "Technical Issues",
        "question": "How do I restore a permanently deleted folder?",
        "answer": "Folders thrown into the cloud trash can are preserved for 30 storage days. Within this period, you can click 'Restore' next to the folder inside Trash. After 30 days, folders are permanently purged."
    }
]

support_policies: List[Dict[str, Any]] = [
    {
        "id": "pol_refund",
        "section": "1. Refund Policy",
        "title": "Terms of Cancellation and Financial Reclaim",
        "content": [
            "Eligibility Threshold: Refund requests on subscription plans are accepted if submitted within exactly seven (7) solar days of the initial plan transaction timestamp. Renewals, periodic plans, and automatic billing rollovers are strictly excluded.",
            "First-Time Purchase Proviso: Refund queries only apply to first-time customer purchases. Creating duplicate dummy accounts to exploit multiple refund cycles violates terms and triggers a lifetime hardware block.",
            "Refund Processing Timetable: Once approved by our team or our Agentic AI billing controller, refunds are cleared and processed within five (5) to seven (7) business days. Funding returns exclusively to the original payment mechanism.",
            "Fees Exclusions: Any currency conversion surcharges, international bank processing fees, or payment processing gateway surcharges are outside CloudBox control and are non-refundable."
        ]
    },
    {
        "id": "pol_subscription",
        "section": "2. Subscription Policy",
        "title": "Account Plan Tiers and Termination Rights",
        "content": [
            "Anytime Termination: Users can cancel their subscription at any moment. CloudBox does not charge cancellation fees, early exit surcharges, or server teardown fees.",
            "Billing Period Duration: Upon active cancellation, client premium quotas (Starter, Professional, or Enterprise) remain fully operational until the end of the current active billing period. No credit adjustments are refunded for remaining active days.",
            "Data Retention Window limit: After subscription period expiration, your storage matches the 10GB free tier. If your active storage footprint exceeds this free threshold, we lock file upload permissions but safely buffer your file vaults for thirty (30) days as a safe margin. If no renewal occurs within 30 days, files are permanently pruned.",
            "Tier Adjustments (Upgrades/Downgrades): Mid-cycle plan upgrades are executed instantly and prorated. Downgrades take effect of-right at the next scheduled cycle billing timestamp."
        ]
    },
    {
        "id": "pol_billing",
        "section": "3. Billing Policy",
        "title": "Invoicing, Auto-Renewals, and Grace Margins",
        "content": [
            "Automated Cycle Renewal: Standard monthly and annual subscription plans automatically renew by default at the end of each period using stored customer payment credit profiles.",
            "Grace Period and Overdue Retry: Upon renewal transaction failures, CloudBox assigns a system alert and implements a fourteen (14) day payment grace period. We attempt billing retries at days 3, 7, and 12 during this state.",
            "Account Restriction Stage: If overdue subscription remains unpaid after the 14-day grace threshold, write privileges are frozen instantly (files remain visible but no new files can be written). The account shifts to suspension status after 30 total delayed days.",
            "Billing Data Modification: Customers hold the right to modify their primary billing email, entity tax IDs, or card credentials in the Accounts dashboard instantly. Invoices are dispatched to the new billing address automatically."
        ]
    },
    {
        "id": "pol_privacy",
        "section": "4. Privacy Policy",
        "title": "Storage Security, Access Auditing, and Data Rights",
        "content": [
            "Zero-Knowledge Infrastructure: CloudBox operates client encryption using client-side generated keys. We maintain no server-side access to customer keys. Employees can never view, index, or index client storage directories.",
            "Authentication Integrity: Standard account logins require cryptographic hashing. Sessions are generated with short-lived access tokens. Customer login logs (IP address, device metadata, country locations) are saved for security monitoring.",
            "Third-Party Audits and GDPR: In compliance with standard data protection acts, users can request complete data footprint archives or register a 'Right to Be Forgotten' account deletion via direct customer team ticket escalation.",
            "No Data Selling: CloudBox does not sell, exchange, rent, or lease customer storage telemetry, registration profiles, or file statistics to third-party ad networks or brokers."
        ]
    },
    {
        "id": "pol_account",
        "section": "5. Account Management Policy",
        "title": "User Profile Control, Verification, and Lockout Procedures",
        "content": [
            "Email Address Modifications: Customers can update their active portal email. Security guidelines dictate that validation requests are issued to both the retired email block and the newly registered address as a anti-hijack precaution.",
            "Password Cryptographic Retries: After five (5) consecutive invalid login attempts, account login features are temporarily locked for thirty (30) minutes. Users can bypass this lock by resetting passwords using validated emails.",
            "Account Ownership Disputes: In rare cases of corporate account ownership disputes, the cloud admin keys belong strictly to the billing controller cardholder registered under primary Billing profiles.",
            "Dormancy Term Purge: Accounts with zero logins, zero API sync requests, and zero billing actions for twelve (12) consecutive months are class-classified as dormant and scheduled for safety cleanup. Prior alerts are sent 30, 15, and 3 days before."
        ]
    }
]
