import sys
import os

# Add parent directory to sys.path so 'backend' can be imported when running from either root or backend folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load .env from the parent directory (root directory)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(title="magbot.ai Agentic Support API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Optional
from backend.models import ChatRequest, ChatResponse, AnalyticsDashboardData

import logging
import requests

logger = logging.getLogger("uvicorn.error")

class OpenRouterGeminiClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.models = OpenRouterModels(api_key)

class OpenRouterModels:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_content(self, model: str, contents: str, config = None):
        or_model = model
        if not or_model.startswith("google/"):
            or_model = f"google/{or_model}"
            
        logger.info(f"[OpenRouter LLM] Sending generation request to {or_model}...")
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response_format = None
        if config and hasattr(config, "response_mime_type") and config.response_mime_type == "application/json":
            response_format = {"type": "json_object"}
            
        max_tokens = 500
        if config and hasattr(config, "max_output_tokens") and config.max_output_tokens:
            max_tokens = config.max_output_tokens
            
        data = {
            "model": or_model,
            "messages": [
                {"role": "user", "content": contents}
            ],
            "max_tokens": max_tokens
        }
        if response_format:
            data["response_format"] = response_format
            
        try:
            response = requests.post(url, headers=headers, json=data)
            if response.status_code != 200:
                error_msg = f"[OpenRouter LLM] Error response {response.status_code}: {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
                
            res_json = response.json()
            text = res_json['choices'][0]['message']['content']
            logger.info(f"[OpenRouter LLM] Response successfully generated.")
            
            class ResponseWrapper:
                def __init__(self, text):
                    self.text = text
                    
            return ResponseWrapper(text)
        except Exception as e:
            logger.error(f"[OpenRouter LLM] Failed to generate response: {e}")
            raise

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_key_here":
        raise ValueError("GEMINI_API_KEY is not configured or is the default placeholder. Please update the .env file in the project root.")
    
    if api_key.startswith("sk-or-v1-"):
        logger.info("[get_gemini_client] Using OpenRouter API wrapper client.")
        return OpenRouterGeminiClient(api_key)
        
    logger.info("[get_gemini_client] Using standard Google GenAI SDK client.")
    return genai.Client(
        http_options=types.HttpOptions(
            timeout=10000,
            retry_options=types.HttpRetryOptions(attempts=1)
        )
    )

# ─────────────────────────────────────────────────────────────
# COMPREHENSIVE LOCAL FALLBACK: Intent Classification
# ─────────────────────────────────────────────────────────────
def classify_intent_local_fallback(message: str) -> str:
    msg = message.lower()

    # ── Greetings & Farewells ──
    if any(k in msg for k in ["hello", "hi ", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings", "yo "]):
        if len(msg.split()) <= 4:
            return "greeting"
    if any(k in msg for k in ["bye", "goodbye", "see you", "take care", "thanks for helping", "that's all", "nothing else"]):
        return "farewell"
    if any(k in msg for k in ["thank", "thanks", "appreciate", "grateful"]):
        if len(msg.split()) <= 6:
            return "gratitude"

    # ── Account Actions (order matters — check specific before general) ──
    if any(k in msg for k in ["cancel", "terminate", "unsubscribe", "stop plan", "close account", "end my plan",
                               "stop subscription", "deactivate", "discontinue", "opt out", "don't renew", "do not renew",
                               "stop auto-renew", "stop autorenewal", "turn off renewal", "stop billing"]):
        return "cancel_subscription"

    if any(k in msg for k in ["refund", "double charge", "double bill", "charge back", "chargeback", "money back",
                               "reimburse", "overcharged", "over charged", "billed twice", "charged twice",
                               "duplicate charge", "duplicate payment", "wrong charge", "incorrect charge",
                               "incorrect billing", "unauthorized charge", "fraudulent charge", "dispute charge",
                               "get my money", "return my money", "credit back"]):
        return "trigger_refund"

    if any(k in msg for k in ["update email", "change email", "modify email", "new email", "change address",
                               "update address", "switch email", "update my mail", "change my mail",
                               "edit email", "billing email", "notification email"]):
        return "update_email"

    if any(k in msg for k in ["ticket", "escalat", "human", "representative", "agent", "support person",
                               "talk to someone", "real person", "live agent", "live support", "live chat",
                               "customer service", "speak to", "talk to a", "connect me", "transfer me",
                               "supervisor", "manager", "senior agent", "complaint department"]):
        return "escalate_ticket"

    # ── Upgrade / Downgrade ──
    if any(k in msg for k in ["upgrade", "higher plan", "bigger plan", "more storage", "switch to professional",
                               "switch to enterprise", "switch to starter", "move to pro", "move to enterprise",
                               "change plan", "change my plan", "switch plan", "better plan"]):
        return "upgrade_downgrade"

    if any(k in msg for k in ["downgrade", "lower plan", "smaller plan", "reduce plan", "cheaper plan",
                               "less storage", "go to starter"]):
        return "upgrade_downgrade"

    # ── Password & Account Security ──
    if any(k in msg for k in ["password", "forgot password", "reset password", "change password", "locked out",
                               "can't login", "cannot login", "can't log in", "cannot log in", "login issue",
                               "sign in problem", "account locked", "unlock account", "unlock my account",
                               "two factor", "2fa", "mfa", "multi-factor", "authenticator", "otp",
                               "verification code", "security code"]):
        return "account_security"

    # ── Account Management (general) ──
    if any(k in msg for k in ["delete account", "delete my account", "remove account", "close my account permanently",
                               "erase my data", "right to be forgotten", "gdpr", "data deletion",
                               "deactivate account", "dormant", "inactive account"]):
        return "account_deletion"

    if any(k in msg for k in ["profile", "update name", "change name", "update phone", "change phone",
                               "account details", "account info", "account settings", "my account",
                               "personal info", "personal information", "edit profile"]):
        return "account_management"

    # ── Billing & Invoices ──
    if any(k in msg for k in ["invoice", "receipt", "tax invoice", "billing history", "payment history",
                               "download invoice", "download receipt", "past payments", "transaction history",
                               "billing statement", "billing record"]):
        return "billing_invoice"

    if any(k in msg for k in ["payment method", "update card", "change card", "add card", "remove card",
                               "credit card", "debit card", "upi", "net banking", "payment option",
                               "payment gateway", "accepted payments", "how to pay", "pay with"]):
        return "payment_method"

    if any(k in msg for k in ["payment fail", "payment decline", "payment rejected", "transaction fail",
                               "card declined", "card rejected", "billing error", "charge fail",
                               "auto-renew fail", "renewal fail", "grace period", "overdue"]):
        return "payment_failure"

    if any(k in msg for k in ["yearly", "annual", "monthly", "switch billing", "billing cycle",
                               "change billing", "yearly discount", "annual discount", "billing frequency"]):
        return "billing_cycle"

    # ── Technical Issues ──
    if any(k in msg for k in ["sync", "syncing", "not syncing", "sync delay", "sync issue", "sync problem",
                               "sync error", "sync stuck", "sync slow", "files not updating",
                               "files not appearing", "not uploading"]):
        return "tech_sync"

    if any(k in msg for k in ["upload", "upload fail", "upload error", "upload limit", "upload size",
                               "file size", "file limit", "max file", "maximum file", "too large",
                               "size limit", "upload speed"]):
        return "tech_upload"

    if any(k in msg for k in ["download", "download fail", "download error", "download speed",
                               "can't download", "cannot download", "export", "export file"]):
        return "tech_download"

    if any(k in msg for k in ["delete file", "deleted file", "recover file", "restore file", "file gone",
                               "file missing", "lost file", "trash", "recycle bin", "accidentally deleted",
                               "undelete", "file recovery", "recover folder", "restore folder",
                               "deleted folder", "folder missing"]):
        return "tech_file_recovery"

    if any(k in msg for k in ["version", "version history", "file version", "previous version",
                               "old version", "rollback", "revert file", "file changed"]):
        return "tech_versioning"

    if any(k in msg for k in ["app", "desktop app", "mobile app", "windows app", "mac app", "macos",
                               "linux", "android", "ios", "iphone", "ipad", "install app",
                               "update app", "app crash", "app not working", "app error",
                               "app slow", "offline", "offline access", "offline mode"]):
        return "tech_app"

    if any(k in msg for k in ["slow", "loading", "performance", "lag", "latency", "timeout",
                               "takes too long", "very slow", "speed issue", "buffering"]):
        return "tech_performance"

    if any(k in msg for k in ["error", "bug", "crash", "not working", "broken", "issue", "problem",
                               "glitch", "malfunction", "something went wrong", "doesn't work",
                               "500 error", "404", "page not found"]):
        if "refund" not in msg and "charge" not in msg:
            return "tech_general"

    # ── Storage & Space ──
    if any(k in msg for k in ["storage", "space", "capacity", "quota", "how much storage",
                               "storage limit", "storage full", "running out of space",
                               "need more space", "disk space", "out of storage", "storage used",
                               "usage", "consumption"]):
        return "storage_info"

    # ── Sharing & Collaboration ──
    if any(k in msg for k in ["share", "sharing", "shared folder", "shared file", "collaborate",
                               "collaboration", "team", "workspace", "team workspace", "invite",
                               "add member", "add user", "remove member", "remove user",
                               "permission", "access control", "read only", "read-only",
                               "edit access", "view access", "shared link", "public link"]):
        return "sharing_collaboration"

    # ── Security & Privacy & Compliance ──
    if any(k in msg for k in ["encrypt", "encryption", "security", "secure", "safe", "privacy",
                               "data protection", "complian", "hipaa", "soc2", "soc 2", "iso",
                               "audit", "data breach", "breach", "hack", "hacked",
                               "suspicious", "unauthorized access", "zero knowledge",
                               "e2ee", "end-to-end", "end to end", "aes", "tls"]):
        return "security_privacy"

    # ── Pricing & Plans (general info) ──
    if any(k in msg for k in ["pricing", "price", "cost", "how much", "fee", "charges",
                               "starter", "professional", "enterprise", "which plan",
                               "plan comparison", "compare plans", "best plan", "recommend plan",
                               "free trial", "trial", "free tier", "free plan"]):
        return "pricing_info"

    # ── Features & Product Info ──
    if any(k in msg for k in ["feature", "what is cloudbox", "what does cloudbox", "what do you offer",
                               "tell me about", "how does cloudbox", "capabilities", "functionality",
                               "service", "product", "about cloudbox", "what can you do"]):
        return "features_info"

    # ── FAQ & Help ──
    if any(k in msg for k in ["faq", "frequently asked", "help", "documentation", "docs", "guide",
                               "tutorial", "how to", "how do i", "how can i", "getting started",
                               "onboarding", "setup", "set up", "getting help"]):
        return "faq_help"

    # ── Contact Info ──
    if any(k in msg for k in ["contact", "reach", "phone number", "email address", "support email",
                               "support hours", "working hours", "office hours", "business hours",
                               "response time", "sla", "how long", "when will"]):
        return "contact_info"

    # ── Login / Registration ──
    if any(k in msg for k in ["login", "log in", "sign in", "register", "sign up", "signup",
                               "create account", "new account", "join", "get started"]):
        return "login_register"

    # ── Complaints ──
    if any(k in msg for k in ["terrible", "bad", "worst", "hate", "suck", "useless", "awful",
                               "horrible", "disgusting", "annoyed", "angry", "frustrated",
                               "disappointed", "unacceptable", "ridiculous", "pathetic",
                               "waste of money", "scam", "rip off", "ripoff", "not satisfied",
                               "dissatisfied", "unhappy", "poor service", "poor quality"]):
        return "complaint"

    # ── Fallback ──
    return "ambiguous"


# ─────────────────────────────────────────────────────────────
# COMPREHENSIVE LOCAL FALLBACK: Response Generator
# ─────────────────────────────────────────────────────────────
def generate_reply_local_fallback(intent: str, message: str) -> str:
    msg = message.lower()

    # ── Greetings ──
    if intent == "greeting":
        return ("👋 Hello! Welcome to CloudBox Support. I'm Cloudbot, your virtual assistant.\n\n"
                "I can help you with:\n"
                "• 📋 Account management (email updates, password resets)\n"
                "• 💳 Billing & invoices\n"
                "• 🔄 Subscription changes (upgrades, downgrades, cancellations)\n"
                "• 💰 Refund requests\n"
                "• 🔧 Technical support (sync issues, uploads, app problems)\n"
                "• 📂 Storage & file management\n"
                "• 🔒 Security & privacy questions\n"
                "• 👥 Sharing & collaboration\n\n"
                "How can I help you today?")

    if intent == "farewell":
        return ("Thank you for contacting CloudBox Support! 😊\n\n"
                "If you need help again, feel free to reach out anytime. "
                "We're here 24/7 to assist you. Have a great day!")

    if intent == "gratitude":
        return ("You're welcome! 😊 I'm glad I could help.\n\n"
                "If you have any other questions or need further assistance, "
                "don't hesitate to ask. We're always here for you!")

    # ── Subscription Cancellation ──
    if intent == "cancel_subscription":
        return ("I understand you'd like to cancel your subscription. Here's what you should know:\n\n"
                "• ❌ **No cancellation fees** — CloudBox never charges exit or termination fees.\n"
                "• ✅ **Access continues** — You'll retain full premium access until the end of your current billing period.\n"
                "• 📁 **File preservation** — After expiration, your files are safely preserved for 30 days before archival.\n"
                "• 🔄 **Reactivation** — You can re-subscribe anytime within 30 days to restore full access.\n\n"
                "I'll process your cancellation request now.")

    # ── Refunds ──
    if intent == "trigger_refund":
        if any(k in msg for k in ["double", "twice", "duplicate", "overcharged"]):
            return ("I'm sorry to hear about the duplicate charge! Let me investigate.\n\n"
                    "• 🔍 I'll check your billing records for duplicate transactions.\n"
                    "• 💰 If confirmed, a full refund will be initiated for the extra charge.\n"
                    "• ⏱️ Refunds typically process in **5-7 business days**.\n"
                    "• 💳 The amount will be returned to your original payment method.\n\n"
                    "Let me process this refund for you right away.")
        elif any(k in msg for k in ["unauthorized", "fraudulent", "didn't authorize", "not me"]):
            return ("I take unauthorized charges very seriously. Here's what I'll do:\n\n"
                    "• 🔒 I'll flag this transaction for immediate security review.\n"
                    "• 💰 A refund will be initiated pending investigation.\n"
                    "• 🛡️ I recommend enabling Multi-Factor Authentication (MFA) on your account.\n"
                    "• ⚠️ I'll also escalate this to our security team for a thorough audit.\n\n"
                    "Would you also like me to reset your password as a precaution?")
        else:
            return ("I can help you with a refund request. Here's our refund policy:\n\n"
                    "• ✅ **Eligible**: First-time purchases within 7 days of transaction.\n"
                    "• ❌ **Not eligible**: Auto-renewals, add-ons, and team plan upgrades.\n"
                    "• ⏱️ **Processing time**: 5-7 business days to original payment method.\n"
                    "• 💱 **Note**: Currency conversion and gateway fees may be non-refundable.\n\n"
                    "Let me check your billing records and process this now.")

    # ── Email Update ──
    if intent == "update_email":
        if any(k in msg for k in ["billing", "invoice"]):
            return ("I can update your billing/invoice email address.\n\n"
                    "• 📧 Future invoices and payment receipts will be sent to the new address.\n"
                    "• 🔒 A confirmation will be sent to both old and new email for security.\n\n"
                    "Please provide the new billing email address you'd like to use.")
        else:
            return ("I can help you update your account email address securely.\n\n"
                    "• 🔒 A verification link will be sent to both your current and new email.\n"
                    "• ✅ Both must be confirmed to complete the change.\n"
                    "• 📧 All notifications will redirect to your new address after confirmation.\n\n"
                    "Please enter your new email address now (e.g., name@example.com).")

    # ── Escalation ──
    if intent == "escalate_ticket":
        if any(k in msg for k in ["supervisor", "manager", "senior"]):
            return ("I understand you'd like to speak with a senior support representative.\n\n"
                    "• 🎫 I'll create a **high-priority** support ticket immediately.\n"
                    "• 👤 A senior support specialist will be assigned to your case.\n"
                    "• ⏱️ Priority response time: within **2 hours** for Professional/Enterprise plans.\n"
                    "• 📧 You'll receive email updates on your ticket progress.\n\n"
                    "Let me escalate this for you right now.")
        else:
            return ("I'll connect you with our support team right away.\n\n"
                    "• 🎫 Creating a support ticket with **high priority**.\n"
                    "• 👤 A live specialist will be assigned to your case.\n"
                    "• ⏱️ Expected response: **4 hours** (Starter), **2 hours** (Professional), **30 min** (Enterprise).\n"
                    "• 💬 You can track progress in your 'Tickets' panel.\n\n"
                    "Processing your escalation now.")

    # ── Upgrade / Downgrade ──
    if intent == "upgrade_downgrade":
        if any(k in msg for k in ["downgrade", "lower", "smaller", "cheaper", "reduce"]):
            return ("I can help you downgrade your plan. Here's what to know:\n\n"
                    "• 📅 Downgrades take effect at the **next billing cycle**.\n"
                    "• 📁 If your stored data exceeds the new tier's limit, you'll need to free up space first.\n"
                    "• 💰 No partial refund for the current cycle, but you keep full access until renewal.\n\n"
                    "**Available Plans:**\n"
                    "• Starter — $199/mo (100 GB)\n"
                    "• Professional — $499/mo (1 TB)\n"
                    "• Enterprise — $999/mo (Unlimited)\n\n"
                    "Which plan would you like to switch to?")
        else:
            return ("Great choice! Upgrading unlocks more storage and premium features.\n\n"
                    "• ⚡ Upgrades are applied **instantly** with prorated billing.\n"
                    "• 📁 Your existing files remain untouched.\n"
                    "• 💎 Higher tiers unlock priority support and advanced features.\n\n"
                    "**Available Plans:**\n"
                    "• Starter — $199/mo (100 GB)\n"
                    "• Professional — $499/mo (1 TB, priority support, 90-day version history)\n"
                    "• Enterprise — $999/mo (Unlimited, 30-min SLA, 365-day version history)\n\n"
                    "Which plan would you like to upgrade to?")

    # ── Account Security ──
    if intent == "account_security":
        if any(k in msg for k in ["forgot", "reset", "can't login", "cannot login", "can't log in", "cannot log in", "locked"]):
            return ("I can help you regain access to your account.\n\n"
                    "• 🔑 Visit the login page and click **'Forgot Password'**.\n"
                    "• 📧 A secure reset link will be sent to your registered email.\n"
                    "• ⏱️ The link expires in **30 minutes** for security.\n"
                    "• 🔒 After **5 failed login attempts**, accounts are locked for 30 minutes.\n\n"
                    "If you don't receive the email, check your spam folder or contact us for manual verification.")
        elif any(k in msg for k in ["2fa", "mfa", "multi-factor", "authenticator", "two factor", "otp"]):
            return ("CloudBox fully supports Multi-Factor Authentication (MFA)! 🔐\n\n"
                    "**How to enable MFA:**\n"
                    "1. Go to **Account Settings → Security Hub**.\n"
                    "2. Click **Enable MFA**.\n"
                    "3. Scan the QR code with Google Authenticator, Microsoft Authenticator, or Authy.\n"
                    "4. Enter the 6-digit verification code to confirm.\n\n"
                    "• 🔄 **Backup codes** are generated — store them safely!\n"
                    "• 📱 MFA is required on every new device login.\n\n"
                    "Would you like me to walk you through the setup?")
        else:
            return ("I can help with your account security concerns.\n\n"
                    "**Security features available:**\n"
                    "• 🔑 Password reset via secure email link\n"
                    "• 🔐 Multi-Factor Authentication (MFA) with authenticator apps\n"
                    "• 📊 Login activity logs (IP, device, location)\n"
                    "• 🚫 Auto-lockout after 5 failed attempts (30-min cooldown)\n"
                    "• 🔒 Session management — revoke active sessions anytime\n\n"
                    "What specific security concern can I help you with?")

    # ── Account Deletion ──
    if intent == "account_deletion":
        if any(k in msg for k in ["gdpr", "right to be forgotten", "erase", "data deletion"]):
            return ("We respect your data rights under GDPR and global privacy regulations.\n\n"
                    "• 📋 You can request a **complete data export** before deletion.\n"
                    "• 🗑️ A 'Right to Be Forgotten' request permanently removes all your data.\n"
                    "• ⏱️ Processing takes **up to 30 days** as required by law.\n"
                    "• ⚠️ This action is **irreversible** — all files, settings, and history will be erased.\n\n"
                    "I'll need to escalate this to our compliance team. Would you like to proceed?")
        else:
            return ("I understand you'd like to delete your account. Please be aware:\n\n"
                    "• ⚠️ Account deletion is **permanent and irreversible**.\n"
                    "• 📁 All files, folders, shared links, and version history will be permanently removed.\n"
                    "• 💰 Any active subscription will be canceled with no refund for remaining days.\n"
                    "• 📋 We recommend downloading your data first via **Settings → Export Data**.\n\n"
                    "For security, account deletion requires ticket escalation. Would you like me to create one?")

    # ── Account Management ──
    if intent == "account_management":
        return ("I can help you manage your account settings.\n\n"
                "**Available profile actions:**\n"
                "• ✏️ Update display name\n"
                "• 📧 Change email address\n"
                "• 📱 Update phone number\n"
                "• 🖼️ Change profile avatar\n"
                "• 🔐 Security settings (password, MFA)\n"
                "• 🔔 Notification preferences\n"
                "• 🌍 Language & timezone settings\n\n"
                "Most changes can be made in **Account Settings** on your dashboard. "
                "What specific update would you like to make?")

    # ── Billing & Invoices ──
    if intent == "billing_invoice":
        if any(k in msg for k in ["download", "get invoice", "get receipt"]):
            return ("You can download your invoices from your dashboard.\n\n"
                    "**Steps to download:**\n"
                    "1. Go to your **Dashboard → Billing & Invoices** section.\n"
                    "2. Find the invoice you need in the history table.\n"
                    "3. Click the **Download PDF** button next to it.\n\n"
                    "• 📄 All invoices include itemized breakdowns with tax details.\n"
                    "• 📊 You can filter by date range or payment status.\n"
                    "• 📧 Invoices are also automatically emailed to your billing address.")
        else:
            return ("Here's an overview of your billing information:\n\n"
                    "• 📄 **Invoices** are generated automatically after each payment.\n"
                    "• 📧 Copies are sent to your billing email address.\n"
                    "• 📥 You can download PDF invoices from **Dashboard → Billing**.\n"
                    "• 🏷️ Tax invoices include GST/VAT breakdowns where applicable.\n"
                    "• 📊 Full payment history is available in your account.\n\n"
                    "Need help with a specific invoice or billing question?")

    # ── Payment Methods ──
    if intent == "payment_method":
        return ("CloudBox accepts a wide range of payment methods:\n\n"
                "**Accepted Payment Options:**\n"
                "• 💳 Credit/Debit Cards — Visa, Mastercard, American Express\n"
                "• 📱 UPI — Google Pay, PhonePe, Paytm\n"
                "• 🏦 Net Banking — All major banks supported\n"
                "• 🌐 International cards with auto currency conversion\n\n"
                "**To update your payment method:**\n"
                "1. Go to **Account Settings → Payment Methods**.\n"
                "2. Click **Add New** or **Update Existing**.\n"
                "3. Enter your card/UPI details securely.\n\n"
                "All payment data is encrypted with PCI-DSS Level 1 compliance.")

    # ── Payment Failures ──
    if intent == "payment_failure":
        return ("I'm sorry to hear about the payment issue. Here's how we handle this:\n\n"
                "**Grace Period & Retry Schedule:**\n"
                "• ⏱️ **14-day grace period** is automatically activated.\n"
                "• 🔄 Retry attempts at **Day 3, Day 7, and Day 12**.\n"
                "• ✅ Full access continues during the grace period.\n"
                "• ⚠️ After 14 days: write privileges are frozen (files remain readable).\n"
                "• 🚫 After 30 days: account enters suspension mode.\n\n"
                "**Quick fixes:**\n"
                "• Verify your card hasn't expired\n"
                "• Check for sufficient balance\n"
                "• Try an alternative payment method\n"
                "• Contact your bank to authorize the transaction\n\n"
                "Would you like to update your payment method now?")

    # ── Billing Cycle ──
    if intent == "billing_cycle":
        return ("You can switch between monthly and annual billing anytime.\n\n"
                "**Billing Options:**\n"
                "• 📅 **Monthly**: Pay as you go, cancel anytime.\n"
                "• 📆 **Annual**: Get a **20% discount** — saves you significantly!\n\n"
                "**Annual Pricing:**\n"
                "• Starter: $199/mo → **$159/mo** billed annually ($1,908/yr)\n"
                "• Professional: $499/mo → **$399/mo** billed annually ($4,788/yr)\n"
                "• Enterprise: $999/mo → **$799/mo** billed annually ($9,588/yr)\n\n"
                "• 🔄 Switching to annual is prorated from your current balance.\n"
                "• 📅 Changes take effect at the next billing cycle.\n\n"
                "Would you like to switch your billing frequency?")

    # ── Technical: Sync Issues ──
    if intent == "tech_sync":
        return ("I can help troubleshoot your sync issues. Let's try these steps:\n\n"
                "**Immediate Fixes:**\n"
                "1. 🔄 **Force-restart** the CloudBox sync daemon/app.\n"
                "2. 🌐 Check your **internet connection** stability.\n"
                "3. 📁 Verify the **sync folder path** hasn't been moved or renamed.\n"
                "4. 💾 Ensure you have sufficient **local disk space**.\n"
                "5. 🔥 Clear the **local cache**: Settings → Advanced → Clear Cache.\n\n"
                "**Advanced Steps:**\n"
                "• Check if any files have **special characters** in names (these can cause sync conflicts).\n"
                "• Verify no **antivirus/firewall** is blocking CloudBox.\n"
                "• Try **unlinking and re-linking** your account in the desktop app.\n\n"
                "If the issue persists, I can escalate this to our technical team. Would you like that?")

    # ── Technical: Upload Issues ──
    if intent == "tech_upload":
        return ("Here's information about upload capabilities and troubleshooting:\n\n"
                "**File Size Limits by Plan:**\n"
                "• Starter: Up to **5 GB** per file\n"
                "• Professional: Up to **50 GB** per file\n"
                "• Enterprise: Up to **250 GB** per file\n\n"
                "**Upload Troubleshooting:**\n"
                "1. ✅ Check if the file is within your plan's size limit.\n"
                "2. 🌐 Ensure stable internet — uploads resume automatically if interrupted.\n"
                "3. 📁 Verify you haven't exceeded your **storage quota**.\n"
                "4. 🚫 Some file types may be restricted (e.g., executable files on Starter).\n"
                "5. 🔄 Try the **web uploader** if the desktop app has issues.\n\n"
                "Need to upload larger files? Consider upgrading your plan!")

    # ── Technical: Download Issues ──
    if intent == "tech_download":
        return ("I can help with download issues. Let's troubleshoot:\n\n"
                "**Common Solutions:**\n"
                "1. 🌐 Check your **internet connection** and speed.\n"
                "2. 💾 Verify sufficient **local disk space**.\n"
                "3. 🔄 Try downloading via the **web interface** instead of the app.\n"
                "4. 🚫 Check if your browser/network is **blocking downloads**.\n"
                "5. 📂 For large files, try the **desktop app** for more reliable downloads.\n\n"
                "**Bulk Downloads:**\n"
                "• Select multiple files → Right-click → **Download as ZIP**.\n"
                "• Maximum bulk download: 10 GB per ZIP archive.\n\n"
                "If downloads are consistently failing, I can create a support ticket.")

    # ── Technical: File Recovery ──
    if intent == "tech_file_recovery":
        return ("I can help you recover deleted files!\n\n"
                "**Trash Recovery:**\n"
                "• 🗑️ Deleted files go to **Trash** and are kept for **30 days**.\n"
                "• To restore: Go to **Trash → Select file → Click 'Restore'**.\n"
                "• Files are restored to their original location.\n\n"
                "**Version History:**\n"
                "• 📋 Right-click any file → **Version History** to see past versions.\n"
                "• Starter: **30 days** of history\n"
                "• Professional: **90 days** of history\n"
                "• Enterprise: **365 days** of history\n\n"
                "⚠️ **After 30 days in Trash**, files are **permanently purged** and cannot be recovered.\n\n"
                "If you need to recover a permanently deleted file, I can escalate to our data recovery team.")

    # ── Technical: Version History ──
    if intent == "tech_versioning":
        return ("CloudBox maintains version history for all your files.\n\n"
                "**Version History by Plan:**\n"
                "• Starter: **30 days** of version history\n"
                "• Professional: **90 days** of version history\n"
                "• Enterprise: **365 days** of version history\n\n"
                "**How to access:**\n"
                "1. Right-click any file in the web or desktop app.\n"
                "2. Select **'Version History'**.\n"
                "3. Browse through previous versions with timestamps.\n"
                "4. Click **'Restore'** to revert to any previous version.\n\n"
                "• 📋 Each save creates a new version automatically.\n"
                "• 💾 Restored versions don't delete the current version — it becomes a new entry.\n"
                "• 📊 Version history doesn't count against your storage quota.")

    # ── Technical: App Issues ──
    if intent == "tech_app":
        if any(k in msg for k in ["offline", "offline access", "offline mode"]):
            return ("CloudBox supports offline access on desktop and mobile apps.\n\n"
                    "**Offline Mode:**\n"
                    "• 📁 Mark files/folders as **'Available Offline'** to sync them locally.\n"
                    "• ✏️ You can **view and edit** offline files normally.\n"
                    "• 🔄 Changes **auto-sync** when you reconnect to the internet.\n"
                    "• ⚠️ Offline files count against your **local disk space**.\n\n"
                    "**To enable:** Right-click a file → **'Make Available Offline'**.")
        elif any(k in msg for k in ["install", "download app", "get app"]):
            return ("CloudBox has native apps for all major platforms:\n\n"
                    "**Desktop Apps:**\n"
                    "• 💻 Windows 10/11 — Download from cloudbox.com/download\n"
                    "• 🍎 macOS 12+ — Available on Mac App Store\n"
                    "• 🐧 Linux — .deb and .rpm packages available\n\n"
                    "**Mobile Apps:**\n"
                    "• 📱 iOS — Available on App Store\n"
                    "• 🤖 Android — Available on Google Play Store\n\n"
                    "All apps feature real-time sync, offline access, and E2EE encryption.")
        else:
            return ("I can help with app-related issues. Try these steps:\n\n"
                    "**General Troubleshooting:**\n"
                    "1. 🔄 **Update** the app to the latest version.\n"
                    "2. 🗑️ **Clear app cache**: Settings → Clear Cache.\n"
                    "3. 🔁 **Restart** the application.\n"
                    "4. 📲 **Reinstall** the app if issues persist.\n"
                    "5. 🖥️ Check **system requirements** compatibility.\n\n"
                    "**System Requirements:**\n"
                    "• Windows 10+ / macOS 12+ / Ubuntu 20.04+\n"
                    "• iOS 15+ / Android 12+\n"
                    "• Minimum 2 GB RAM, 500 MB disk space for app\n\n"
                    "If the issue continues, I can create a technical support ticket.")

    # ── Technical: Performance ──
    if intent == "tech_performance":
        return ("I'm sorry you're experiencing performance issues. Let's optimize:\n\n"
                "**Quick Performance Fixes:**\n"
                "1. 🌐 Test your **internet speed** — we recommend 10+ Mbps for optimal experience.\n"
                "2. 🔄 **Clear browser cache** if using the web app.\n"
                "3. 💻 Close unnecessary **background applications**.\n"
                "4. 📁 If syncing many files, try **pausing and resuming** sync.\n"
                "5. 🔌 Use a **wired connection** instead of WiFi for large transfers.\n\n"
                "**Server-Side:**\n"
                "• Our data centers operate at 99.99% uptime SLA.\n"
                "• Enterprise customers get dedicated performance tiers.\n\n"
                "If slowness persists, I can run a diagnostic and escalate to our infrastructure team.")

    # ── Technical: General ──
    if intent == "tech_general":
        return ("I'm sorry you're experiencing technical difficulties.\n\n"
                "**General Troubleshooting Steps:**\n"
                "1. 🔄 **Refresh** the page or restart the app.\n"
                "2. 🗑️ **Clear cache and cookies** in your browser.\n"
                "3. 🌐 Try a **different browser** (Chrome, Firefox, Edge recommended).\n"
                "4. 📲 Try accessing via the **mobile app** as an alternative.\n"
                "5. ⏱️ Check our **status page** for any ongoing incidents.\n\n"
                "If the problem continues, I can create a detailed technical support ticket. "
                "Could you describe the exact error message you're seeing?")

    # ── Storage Information ──
    if intent == "storage_info":
        if any(k in msg for k in ["full", "running out", "out of", "need more", "exceeded"]):
            return ("It looks like you may be running low on storage.\n\n"
                    "**Options to free up space:**\n"
                    "• 🗑️ Empty your **Trash** — deleted files still count against quota.\n"
                    "• 📁 Remove **duplicate files** using our smart scan.\n"
                    "• 📊 Check **Storage Analytics** in your dashboard to see largest files.\n"
                    "• 📤 Download and remove rarely accessed files.\n\n"
                    "**Or upgrade your plan:**\n"
                    "• Starter: 100 GB → Professional: 1 TB (+900 GB)\n"
                    "• Professional: 1 TB → Enterprise: Unlimited\n\n"
                    "Would you like help upgrading or managing your storage?")
        else:
            return ("Here are the storage allocations by plan:\n\n"
                    "**CloudBox Storage Tiers:**\n"
                    "• 📦 Starter — **100 GB** ($199/mo)\n"
                    "• 📦 Professional — **1 TB** ($499/mo)\n"
                    "• 📦 Enterprise — **Unlimited** ($999/mo)\n\n"
                    "**What counts toward storage:**\n"
                    "• ✅ All uploaded files and folders\n"
                    "• ✅ Files in Trash (until permanently deleted)\n"
                    "• ❌ Version history does NOT count\n"
                    "• ❌ Shared files owned by others do NOT count\n\n"
                    "You can check your current usage in **Dashboard → Storage Overview**.")

    # ── Sharing & Collaboration ──
    if intent == "sharing_collaboration":
        if any(k in msg for k in ["permission", "access control", "read only", "edit access"]):
            return ("CloudBox offers granular permission controls for shared content:\n\n"
                    "**Permission Levels:**\n"
                    "• 👁️ **Viewer** — Can view and download only\n"
                    "• ✏️ **Editor** — Can view, edit, and add files\n"
                    "• 👤 **Admin** — Full control including sharing and deletion\n\n"
                    "**How to set permissions:**\n"
                    "1. Right-click the file/folder → **Share**.\n"
                    "2. Add members by email address.\n"
                    "3. Set their permission level from the dropdown.\n"
                    "4. Optionally set an **expiration date** for access.\n\n"
                    "• 🔗 **Shared links** can be set to view-only with optional password protection.\n"
                    "• 📊 Track who accessed shared files in the **Activity Log**.")
        elif any(k in msg for k in ["team", "workspace", "invite", "add member"]):
            return ("CloudBox team workspaces make collaboration seamless!\n\n"
                    "**Team Features:**\n"
                    "• 👥 Create **team workspaces** with shared folders.\n"
                    "• ✉️ **Invite members** via email — they get instant access.\n"
                    "• 📊 **Admin dashboard** to manage members and permissions.\n"
                    "• 💬 **File comments** and @mentions for discussions.\n"
                    "• 📋 **Activity feed** showing all team actions.\n\n"
                    "**Team Storage:**\n"
                    "• Team workspace storage comes from the admin's plan quota.\n"
                    "• Professional and Enterprise plans include advanced team features.\n\n"
                    "Would you like help setting up a team workspace?")
        else:
            return ("CloudBox makes sharing and collaboration easy!\n\n"
                    "**Sharing Options:**\n"
                    "• 🔗 **Share links** — Generate view-only or editable links.\n"
                    "• 📧 **Email invites** — Share directly with specific people.\n"
                    "• 🔒 **Password protection** — Add passwords to shared links.\n"
                    "• ⏱️ **Expiring links** — Set auto-expiration dates.\n"
                    "• 👥 **Team workspaces** — Collaborate in shared folders.\n\n"
                    "**How to share:**\n"
                    "Right-click any file/folder → **Share** → Choose your method.\n\n"
                    "Would you like help with a specific sharing task?")

    # ── Security & Privacy ──
    if intent == "security_privacy":
        if any(k in msg for k in ["breach", "hack", "hacked", "unauthorized", "suspicious"]):
            return ("I take security concerns very seriously. Let's secure your account immediately.\n\n"
                    "**Immediate Steps:**\n"
                    "1. 🔑 **Change your password** right now.\n"
                    "2. 🔐 **Enable MFA** if not already active.\n"
                    "3. 📊 Review **Login Activity** in Settings → Security for unrecognized sessions.\n"
                    "4. 🚫 **Revoke** any suspicious active sessions.\n\n"
                    "**CloudBox Security Measures:**\n"
                    "• 🔒 All data encrypted with AES-256 (client-side E2EE)\n"
                    "• 🌐 TLS 1.3 for all data in transit\n"
                    "• 🚫 Zero-knowledge architecture — we can never see your files\n\n"
                    "I'll also escalate this to our security team for investigation. Would you like me to proceed?")
        elif any(k in msg for k in ["complian", "hipaa", "soc", "iso", "audit", "gdpr"]):
            return ("CloudBox maintains enterprise-grade compliance certifications:\n\n"
                    "**Compliance & Certifications:**\n"
                    "• 🏛️ **SOC 2 Type II** — Audited annually\n"
                    "• 🇪🇺 **GDPR Compliant** — Full data protection rights\n"
                    "• 🔒 **ISO 27001** — Information security management\n"
                    "• 🏥 **HIPAA Ready** — Available on Enterprise plans\n\n"
                    "**Privacy Commitments:**\n"
                    "• Zero-knowledge encryption — We never access your data\n"
                    "• No data selling to third parties\n"
                    "• Right to data export and deletion\n"
                    "• Regular third-party security audits\n\n"
                    "Need compliance documentation? I can connect you with our compliance team.")
        else:
            return ("CloudBox is built on industry-leading security infrastructure:\n\n"
                    "**Encryption:**\n"
                    "• 🔐 **AES-256** client-side End-to-End Encryption (E2EE)\n"
                    "• 🌐 **TLS 1.3** for all data in transit\n"
                    "• 🔑 **Client-held keys** — CloudBox employees can never access your files\n\n"
                    "**Account Security:**\n"
                    "• Multi-Factor Authentication (MFA)\n"
                    "• Auto-lockout after 5 failed login attempts\n"
                    "• Session management and activity logs\n"
                    "• IP-based login alerts\n\n"
                    "**Infrastructure:**\n"
                    "• SOC 2 Type II certified\n"
                    "• GDPR compliant\n"
                    "• 99.99% uptime SLA\n"
                    "• No data selling — ever\n\n"
                    "Any specific security questions I can help with?")

    # ── Pricing Information ──
    if intent == "pricing_info":
        if any(k in msg for k in ["free", "trial"]):
            return ("CloudBox offers a free tier for you to get started:\n\n"
                    "**Free Tier:**\n"
                    "• 📦 **10 GB** of storage\n"
                    "• 📁 Basic file sync and sharing\n"
                    "• 🔒 Full E2EE encryption\n"
                    "• ❌ No priority support\n\n"
                    "**Premium Plans (with free 7-day refund window):**\n"
                    "• 📦 Starter — **$199/mo** (100 GB, 5 GB file limit)\n"
                    "• 📦 Professional — **$499/mo** (1 TB, 50 GB file limit, priority support)\n"
                    "• 📦 Enterprise — **$999/mo** (Unlimited, 250 GB file limit, 30-min SLA)\n\n"
                    "💡 **Save 20%** with annual billing! Ready to upgrade?")
        elif any(k in msg for k in ["compare", "which plan", "best plan", "recommend"]):
            return ("Here's a comparison to help you choose the right plan:\n\n"
                    "| Feature | Starter | Professional | Enterprise |\n"
                    "|---|---|---|---|\n"
                    "| Storage | 100 GB | 1 TB | Unlimited |\n"
                    "| File Limit | 5 GB | 50 GB | 250 GB |\n"
                    "| Version History | 30 days | 90 days | 365 days |\n"
                    "| Support SLA | 4 hours | 2 hours | 30 minutes |\n"
                    "| Team Features | Basic | Advanced | Full |\n"
                    "| Price | $199/mo | $499/mo | $999/mo |\n\n"
                    "💡 **Recommendation:**\n"
                    "• Individual users → **Starter**\n"
                    "• Small teams → **Professional**\n"
                    "• Large orgs with compliance needs → **Enterprise**\n\n"
                    "Would you like to upgrade or learn more about a specific plan?")
        else:
            return ("Here are our subscription plans:\n\n"
                    "**📦 Starter — $199/month**\n"
                    "100 GB storage, 5 GB file limit, 30-day version history, basic support\n\n"
                    "**📦 Professional — $499/month** ⭐ Most Popular\n"
                    "1 TB storage, 50 GB file limit, 90-day version history, priority support (2hr SLA)\n\n"
                    "**📦 Enterprise — $999/month**\n"
                    "Unlimited storage, 250 GB file limit, 365-day version history, premium SLA (30 min)\n\n"
                    "💰 **Save 20%** with annual billing on any plan!\n"
                    "✅ All plans include E2EE encryption, sync apps, and sharing.\n\n"
                    "Would you like to subscribe or have questions about a specific plan?")

    # ── Features Information ──
    if intent == "features_info":
        return ("CloudBox is an enterprise-grade cloud storage and collaboration platform!\n\n"
                "**Core Features:**\n"
                "• ☁️ **Secure Cloud Storage** — Store files with military-grade encryption\n"
                "• 🔄 **Real-Time Sync** — Instant sync across all devices\n"
                "• 👥 **Team Workspaces** — Collaborate with granular permissions\n"
                "• 🔗 **Smart Sharing** — Password-protected and expiring links\n"
                "• 📱 **Cross-Platform Apps** — Windows, macOS, Linux, iOS, Android\n"
                "• 📋 **Version History** — Up to 365 days of file versions\n"
                "• 🗑️ **Trash Recovery** — 30-day recovery window for deleted files\n"
                "• 📴 **Offline Access** — Work without internet, auto-sync when connected\n\n"
                "**Security:**\n"
                "• 🔐 AES-256 End-to-End Encryption (E2EE)\n"
                "• 🔒 Zero-knowledge architecture\n"
                "• 🛡️ SOC 2 Type II, GDPR, and ISO 27001 compliance\n\n"
                "Would you like to know more about any specific feature?")

    # ── FAQ & Help ──
    if intent == "faq_help":
        return ("I'm here to help! Here are our most popular support topics:\n\n"
                "**📋 Frequently Asked Questions:**\n"
                "• How do I cancel my subscription? → Type 'cancel'\n"
                "• What is the refund policy? → Type 'refund'\n"
                "• How do I update my email? → Type 'update email'\n"
                "• What payment methods are accepted? → Type 'payment methods'\n"
                "• How do I reset my password? → Type 'reset password'\n"
                "• What are the storage limits? → Type 'storage'\n"
                "• How do I recover deleted files? → Type 'recover files'\n"
                "• Is my data encrypted? → Type 'security'\n"
                "• How do I share files? → Type 'sharing'\n"
                "• What are the pricing plans? → Type 'pricing'\n\n"
                "**📚 Resources:**\n"
                "• Full FAQ page available on our website\n"
                "• Video tutorials in our Help Center\n"
                "• Email us at support@cloudbox.com\n\n"
                "What topic would you like to explore?")

    # ── Contact Information ──
    if intent == "contact_info":
        if any(k in msg for k in ["how long", "response time", "sla", "when will"]):
            return ("Here are our support response time commitments:\n\n"
                    "**Response Time by Plan:**\n"
                    "• Starter: **4 hours** (business hours)\n"
                    "• Professional: **2 hours** (24/7)\n"
                    "• Enterprise: **30 minutes** (24/7 dedicated SLA)\n\n"
                    "**Support Channels:**\n"
                    "• 💬 Live chatbot (me!) — Instant 24/7\n"
                    "• 📧 Email: support@cloudbox.com\n"
                    "• 🎫 Support tickets — tracked in your dashboard\n"
                    "• 📞 Phone support — Enterprise plans only\n\n"
                    "Would you like to submit a ticket for faster resolution?")
        else:
            return ("Here's how you can reach our support team:\n\n"
                    "**Support Channels:**\n"
                    "• 💬 **Live Chat** — You're already here! I'm available 24/7.\n"
                    "• 📧 **Email**: support@cloudbox.com\n"
                    "• 🎫 **Support Tickets** — Create and track in your dashboard.\n"
                    "• 📞 **Phone**: Available for Enterprise customers.\n"
                    "• 🌐 **Help Center**: docs.cloudbox.com\n\n"
                    "**Business Hours:** Our human agents are available Mon-Fri, 9 AM - 6 PM IST.\n"
                    "**AI Support (me!):** Available 24/7, 365 days.\n\n"
                    "How would you like to reach us?")

    # ── Login / Registration ──
    if intent == "login_register":
        if any(k in msg for k in ["register", "sign up", "signup", "create account", "new account", "join", "get started"]):
            return ("Welcome! Creating a CloudBox account is quick and easy.\n\n"
                    "**How to Register:**\n"
                    "1. Click **'Sign In'** in the top-right corner.\n"
                    "2. Select **'Create Account'** or **'Register'**.\n"
                    "3. Enter your name, email, and choose a password.\n"
                    "4. Select your preferred plan (you can start with our Free tier).\n"
                    "5. Verify your email address via the confirmation link.\n\n"
                    "• 🎁 All new accounts start with a **10 GB free tier**.\n"
                    "• 💳 No credit card required for the free plan.\n"
                    "• ⬆️ You can upgrade to a premium plan anytime.\n\n"
                    "Ready to get started?")
        else:
            return ("I can help you with login access.\n\n"
                    "**To Sign In:**\n"
                    "1. Click **'Sign In'** in the top-right header.\n"
                    "2. Enter your registered email and password.\n"
                    "3. Complete MFA verification (if enabled).\n\n"
                    "**Trouble logging in?**\n"
                    "• 🔑 Forgot password? Click 'Forgot Password' for a reset link.\n"
                    "• 🔒 Account locked? Wait 30 minutes or reset your password.\n"
                    "• 📧 Not receiving emails? Check your spam/junk folder.\n\n"
                    "• 🆕 Don't have an account? Type 'register' to learn how to create one.")

    # ── Complaints ──
    if intent == "complaint":
        return ("I'm truly sorry about your experience. Your feedback matters to us deeply.\n\n"
                "I want to make sure this gets resolved properly. Here's what I'll do:\n\n"
                "• 🎫 I'll create a **high-priority complaint ticket** right now.\n"
                "• 👤 A **senior support specialist** will be assigned to your case.\n"
                "• ⏱️ You'll receive a response within **2 hours** (or sooner for Premium plans).\n"
                "• 📧 Updates will be sent to your registered email.\n\n"
                "**In the meantime**, could you share more details about what went wrong? "
                "This helps our team investigate and resolve the issue faster.\n\n"
                "We're committed to making this right for you. 💙")

    # ── Ambiguous / General ──
    return ("Thank you for reaching out to CloudBox Support! 😊\n\n"
            "I can assist you with a wide range of topics:\n\n"
            "**Account & Billing:**\n"
            "• 📧 Update email address\n"
            "• 🔑 Reset password / MFA setup\n"
            "• 💳 Payment methods & billing\n"
            "• 📄 Invoices & receipts\n\n"
            "**Subscription:**\n"
            "• ⬆️ Upgrade or downgrade plans\n"
            "• ❌ Cancel subscription\n"
            "• 💰 Request a refund\n"
            "• 💎 View pricing & plans\n\n"
            "**Technical Support:**\n"
            "• 🔄 Sync issues\n"
            "• 📤 Upload/download problems\n"
            "• 🗑️ File recovery\n"
            "• 📱 App troubleshooting\n\n"
            "**Other:**\n"
            "• 🔒 Security & privacy\n"
            "• 👥 Sharing & collaboration\n"
            "• 🎫 Escalate to human agent\n\n"
            "Please describe your issue or select one of the topics above!")

def classify_intent(message: str) -> str:
    gemini_client = get_gemini_client()
    prompt = f"""Classify this support chat message into exactly one of these categories:
- cancel_subscription
- trigger_refund
- update_email
- escalate_ticket
- information_query
- complaint
- ambiguous

Definitions:
- cancel_subscription: user wants to cancel, terminate, or unsubscribe from their plan.
- trigger_refund: user wants a refund, credit, or dispute a charge.
- update_email: user wants to update, change, or modify their account email address.
- escalate_ticket: user wants to talk to a human, open a support ticket, or escalate the case.
- information_query: user is asking a general question about features, pricing, FAQ, storage, security, etc.
- complaint: user is expressing frustration, anger, or complaints about the service.
- ambiguous: none of the above or unclear.

Message: "{message}"
Reply with only the category name."""

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=50,
            temperature=0.1
        )
    )
    return response.text.strip().lower()

# Initialize agent orchestrator lazily
orchestrator = None

def get_orchestrator():
    global orchestrator
    if orchestrator is None:
        try:
            client = get_gemini_client()
        except Exception as e:
            print(f"Warning: Gemini client could not be created: {e}. Fallback logic will be used.")
            client = None
        from backend.agents import AgentOrchestrator
        orchestrator = AgentOrchestrator(client)
    return orchestrator

from fastapi import HTTPException

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        orch = get_orchestrator()
        return orch.process(request)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions")
async def get_sessions():
    from backend.memory import memory_store
    results = []
    for sid, s in memory_store.sessions.items():
        results.append({
            "session_id": s.session_id,
            "customer_context": s.customer_context,
            "is_escalated": s.is_escalated,
            "pending_action": s.pending_action,
            "last_message": s.messages[-1] if s.messages else None,
            "messages_count": len(s.messages),
            "created_at": s.created_at
        })
    return results

@app.get("/sessions/{session_id}/timeline")
async def get_timeline(session_id: str):
    from backend.memory import memory_store
    return memory_store.get_timeline(session_id)


@app.get("/sessions/{session_id}/history")
async def get_history(session_id: str):
    from backend.memory import memory_store
    session = memory_store.get_or_create_session(session_id)
    return session.messages

@app.get("/audit/logs")
async def get_audit_logs(customer_id: Optional[str] = None):
    from backend.audit import audit_logger
    return audit_logger.get_logs(customer_id=customer_id)

@app.get("/audit/stats")
async def get_audit_stats():
    from backend.audit import audit_logger
    return audit_logger.get_stats()

@app.get("/analytics/dashboard", response_model=AnalyticsDashboardData)
async def get_analytics_dashboard():
    from backend.memory import memory_store
    from backend.audit import audit_logger
    from backend.notifications import notification_service
    
    # Base stats + dynamic stats
    total_sessions = len(memory_store.sessions)
    escalated_count = sum(1 for s in memory_store.sessions.values() if s.is_escalated)
    
    # Calculate distributions from memory/audit logs
    intent_dist = {}
    sentiment_dist = {"positive": 5, "neutral": 12, "negative": 3}  # Initial base mock
    risk_dist = {"low": 8, "medium": 4, "high": 1}
    
    for session in memory_store.sessions.values():
        # Update sentiment from memory
        for lvl in session.sentiment_history:
            sentiment_dist[lvl] = sentiment_dist.get(lvl, 0) + 1
            
        # Update intents from timeline
        for event in session.timeline:
            if event.event_type == "intent_detected":
                intent = event.metadata.get("intent", "unknown")
                intent_dist[intent] = intent_dist.get(intent, 0) + 1

    # Base counts for display
    stats = audit_logger.get_stats()
    
    return AnalyticsDashboardData(
        tickets_created=escalated_count + 3,
        tickets_resolved=2,
        escalations=escalated_count,
        avg_resolution_time_hours=1.8,
        action_success_rate=stats.get("success_rate", 100.0),
        intent_distribution={**{"cancel_subscription": 2, "trigger_refund": 4, "update_email": 3}, **intent_dist},
        sentiment_distribution=sentiment_dist,
        risk_distribution=risk_dist,
        notifications_sent=len(notification_service.history),
        active_sessions=total_sessions
    )

@app.get("/notifications")
async def get_notifications(customer_id: Optional[str] = None):
    from backend.notifications import notification_service
    return notification_service.get_notification_history(customer_id=customer_id)

@app.post("/sessions/{session_id}/confirm", response_model=ChatResponse)
async def confirm_action(session_id: str):
    from backend.memory import memory_store
    session = memory_store.get_or_create_session(session_id)
    if not session.pending_action:
        raise HTTPException(status_code=400, detail="No pending action found for this session")
    
    request = ChatRequest(
        message="yes",
        session_id=session_id,
        customer_context=session.customer_context
    )
    orch = get_orchestrator()
    return orch.process(request)

@app.post("/sessions/{session_id}/cancel", response_model=ChatResponse)
async def cancel_action(session_id: str):
    from backend.memory import memory_store
    session = memory_store.get_or_create_session(session_id)
    if not session.pending_action:
        raise HTTPException(status_code=400, detail="No pending action found for this session")
        
    request = ChatRequest(
        message="no",
        session_id=session_id,
        customer_context=session.customer_context
    )
    orch = get_orchestrator()
    return orch.process(request)

@app.get("/risk/{customer_id}")
async def get_customer_risk(customer_id: str):
    from backend.risk import calculate_risk_score
    from backend.memory import memory_store
    
    cust_context = None
    messages = []
    for session in memory_store.sessions.values():
        if session.customer_context and session.customer_context.customer_id == customer_id:
            cust_context = session.customer_context
            messages = session.messages
            break
            
    return calculate_risk_score(customer_id, cust_context, messages)

@app.get("/agents/workflow")
async def get_agents_workflow():
    return [
        {"id": "intent", "label": "Intent Classifier", "agent_type": "intent", "status": "idle", "connections": ["rag"]},
        {"id": "rag", "label": "RAG Knowledge Retrieval", "agent_type": "rag", "status": "idle", "connections": ["orchestrator"]},
        {"id": "orchestrator", "label": "Routing Orchestrator", "agent_type": "support", "status": "idle", "connections": ["confirmation", "escalation", "support"]},
        {"id": "confirmation", "label": "Confirmation Guard", "agent_type": "confirmation", "status": "idle", "connections": ["tool_execution"]},
        {"id": "tool_execution", "label": "Tool Execution Engine", "agent_type": "support", "status": "idle", "connections": ["audit"]},
        {"id": "escalation", "label": "Escalation Specialist", "agent_type": "escalation", "status": "idle", "connections": ["audit"]},
        {"id": "support", "label": "Support Core Agent", "agent_type": "support", "status": "idle", "connections": ["audit"]},
        {"id": "audit", "label": "Audit Logs Officer", "agent_type": "audit", "status": "idle", "connections": []}
    ]

@app.get("/")
def root():
    return {"status": "magbot.ai backend is running with Gemini and Multi-Agent orchestrator! 🚀"}