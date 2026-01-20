# Microsoft AppSource Compliance Statement — TeamsVote

**Last Updated:** _2026-01-26_

TeamsVote is designed to comply with Microsoft AppSource requirements for security, privacy, and data handling. This document summarizes how TeamsVote meets relevant criteria for listing within the Microsoft 365 ecosystem.

---

## 1. Application Category & Integration

TeamsVote is a Microsoft Teams plugin that:

- runs entirely within Microsoft Teams
- does not function as a standalone service
- does not require separate user accounts
- does not collect, transmit, or store personal data outside the Microsoft environment

---

## 2. Identity, Authentication & Authorization

TeamsVote relies exclusively on Microsoft’s identity platform for authentication and authorization:

- no external authentication services are used
- no custom credentials are collected or stored
- permissions are governed by the organization's Microsoft 365 tenant

---

## 3. Data Handling & Privacy

TeamsVote processes only transient session data required for running a vote. To meet AppSource privacy expectations:

- **No personal data is stored**
- **No data is written to disk**
- **No data is transmitted to third-party services**
- **No analytics, tracking, or telemetry is performed**
- **No persistent logs containing user data are produced**

All data is processed **in-memory only** and discarded at the end of the session.

---

## 4. GDPR & Regulatory Alignment

TeamsVote aligns with applicable privacy regulations (including GDPR) through data minimization and non-storage practices. See the GDPR compliance section for detail.

---

## 5. Security

TeamsVote does not introduce new identity providers or network endpoints. All data remains within the Microsoft Teams infrastructure. The application does not:

- expose external network services
- perform outbound data transfers
- rely on third-party service providers
- require elevated permissions beyond normal Teams operation

Security controls are inherited from Microsoft Teams and the organization’s Microsoft 365 tenant.

---

## 6. Financial & Billing Compliance

TeamsVote:

- is free to use
- does not process payments
- does not handle financial information

---

## 7. Organizational Control & Admin Configuration

No administrative configuration is required beyond installation within the Microsoft Teams environment. Admins retain full control through:

- Microsoft Teams deployment policies
- Microsoft 365 compliance tools
- Tenant-level access controls

---

## 8. Third-Party Dependencies

TeamsVote does **not** depend on external third-party processing services for personal data. No third-party APIs, tracking libraries, or SaaS providers are used for data handling.

---

## 9. Support & Contact

For compliance questions, security inquiries, or AppSource-related support, users may refer to the project repository:

**https://github.com/Marvin-Brouwer/TeamsVote/issues**
