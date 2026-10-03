# TVote — IT Admin & Security Overview

**Last Updated:** _2026-10-01_

**Purpose:**  
TVote is a Microsoft Teams plugin that enables ephemeral, real-time voting sessions within meetings or group chats. It is designed with privacy and security in mind, ensuring minimal exposure of personal or organizational data.

---

## Data Handling

- **Personal Data Processed:** Display name, Entra user object ID, Teams conversation ID, the topic and the votes  
- **Processing:** Data is transmitted to an externally hosted backend for session coordination **in-memory only**  
- **Storage:** No persistent storage; data is discarded when the vote is accepted, after two hours idle, or on restart. Request logs hold no personal data  
- **Web hosting:** The dialogs are static files on Microsoft Azure Static Web Apps; no personal data is sent there  
- **Third-Party Sharing:** None  
- **Analytics/Tracking:** None  

All backend processing occurs in the **European Union (Render, Frankfurt)**, ensuring GDPR-compliant jurisdiction.

---

## Security & Compliance

- **Encryption:** All communication between Teams clients and the backend is encrypted via HTTPS/TLS  
- **Identity & Authentication:** Handled by Microsoft Teams through the bot; no sign-in, no SSO consent, no separate credentials. The bot issues a short-lived key per vote to the person who opens it  
- **Permissions:** A bot and a message extension. No Microsoft Graph permissions and no resource-specific consent are requested  
- **GDPR Alignment:** Minimal data collection, EU-only processing, no persistent storage, DPIA not required  
- **AppSource Compliance:** Fully compliant with Microsoft Teams platform policies and AppSource submission requirements  

---

## Administration Notes

- Admins maintain full control through Microsoft Teams deployment policies and Microsoft 365 tenant management tools.  
- No configuration is required beyond standard installation.  
- For enterprise review or GDPR inquiries, reference the following documentation:  
  - [`privacy-policy.md`](https://github.com/Marvin-Brouwer/TeamsVote/blob/main/doc/privacy-policy.md)  
  - [`gdpr.md`](https://github.com/Marvin-Brouwer/TeamsVote/blob/main/doc/gdpr.md)  
  - [`dpia-exemption.md`](https://github.com/Marvin-Brouwer/TeamsVote/blob/main/doc/dpia-exemption.md)  
  - [`appsource-compliance.md`](https://github.com/Marvin-Brouwer/TeamsVote/blob/main/doc/appsource-compliance.md)  

---

**Contact / Support:**  
For security or compliance questions, refer to the project repository:  
<https://github.com/Marvin-Brouwer/TeamsVote/blob/main/doc/>
