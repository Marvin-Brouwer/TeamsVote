# Microsoft AppSource Compliance Statement — TVote

**Last Updated:** _2026-10-01_

TVote is designed to comply with Microsoft AppSource requirements for security, privacy, and data handling. This document summarizes how TVote meets relevant criteria for listing within the Microsoft 365 ecosystem.

---

## 1. Application Category & Integration

TVote is a Microsoft Teams plugin that:

- runs entirely within Microsoft Teams
- does not function as a standalone service
- does not require separate user accounts
- processes minimal personal data only for ephemeral session functionality

---

## 2. Identity, Authentication & Authorization

TVote relies exclusively on Microsoft’s identity platform for authentication and authorization:

- no external authentication services are used
- no custom credentials are collected or stored
- permissions are governed by the organization's Microsoft 365 tenant

---

## 3. Data Handling & Privacy

TVote processes minimal personal data (display name, Entra user object ID and Teams user ID, and the Teams conversation identifier), plus the topic and the votes, in its bot on Microsoft Azure, to show the votes on cards in the Teams chat.  

No personal data is persisted or logged. All session data is processed **in-memory only** and discarded after two hours without activity, or when the backend restarts.  

The web pages (home, privacy, terms and the meeting tab) are static files, served by the same App Service; no personal data is involved.  

Backend hosting:

- Microsoft Azure App Service, West Europe (the Netherlands)  
- Ensures EU-only data jurisdiction and GDPR compliance

No analytics, tracking, or third-party data sharing occurs.

---

## 4. GDPR & Regulatory Alignment

TVote aligns with GDPR and other relevant privacy regulations. See GDPR.md for full details.

---

## 5. Security

- All data is encrypted in transit via HTTPS/TLS  
- No data is stored at rest  
- No external tracking services are used  

Security and access control are governed by Microsoft Teams and the organization’s tenant.

---

## 6. Financial & Billing Compliance

TVote:

- is free to use  
- does not process payments  
- does not handle financial information

---

## 7. Organizational Control & Admin Configuration

Admins retain full control through:

- Microsoft Teams deployment policies  
- Microsoft 365 compliance tools  
- Tenant-level access controls

---

## 8. Third-Party Dependencies

TVote does **not** depend on external third-party services for personal data processing beyond the EU-hosted backend.

---

## 9. Support & Contact

For compliance or security questions, refer to:  
<https://github.com/Marvin-Brouwer/TeamsVote/issues>
