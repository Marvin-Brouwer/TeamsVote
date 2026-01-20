# GDPR Compliance Statement — TeamsVote

**Last Updated:** _2026-01-26_

TeamsVote is designed with privacy and data minimization in mind and operates in accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679.

---

## Lawful Basis for Processing

TeamsVote processes limited personal data supplied by Microsoft Teams (username, user ID, and meeting or group chat identifier) for the legitimate interest of enabling real-time voting functionality within Teams (Article 6(1)(f) GDPR).

No further secondary processing occurs.

---

## Data Minimization & Purpose Limitation

In alignment with Articles 5(1)(b) and 5(1)(c), TeamsVote:

- does not collect additional personal data beyond what Microsoft Teams provides
- does not perform analytics, profiling, or tracking
- does not store, log, or retain personal data after a voting session ends
- does not use personal data for marketing or unrelated purposes

---

## Data Storage & Retention

TeamsVote does **not** persist personal data. All session data is processed **in-memory only** and discarded at the end of the session.

No personal data exists at rest, and no logs containing personal data are created.

---

## Data Processor & Hosting Location

TeamsVote communicates with an externally hosted backend for real-time coordination. This backend:

- is hosted in the **European Union (Frankfurt, Germany)**
- processes data **in-memory**
- does **not** store or log data
- does **not** transfer data outside the EU

The backend is hosted on Render within the EU Central region, ensuring compliance with GDPR restrictions on international data transfers (Chapter V).

---

## Controller / Processor Roles

Under GDPR:

- The user’s organization (Microsoft 365 tenant) is the **data controller** for identity and account data
- Microsoft is a **processor** for Teams account and identity services
- TeamsVote functions as a **sub-processor** for the duration of a voting session but does not store personal data or act as a controller for persistent data

---

## Data Subject Rights

Because TeamsVote does not persist personal data:

- access
- rectification
- erasure
- portability
- objection
- restriction of processing

do not generally apply directly to TeamsVote (Articles 15–21). Data subject requests should be directed to the user’s Microsoft 365 administrator.

---

## Security Measures

TeamsVote employs appropriate technical measures in accordance with Article 32:

- all communications are encrypted in transit via HTTPS/TLS
- no data is stored at rest
- no external third-party analytics or tracking services are used

Access control and identity management remain governed by Microsoft Teams and the user’s organization.

---

## DPIA Considerations

Due to the lack of persistent storage, profiling, or sensitive data categories, TeamsVote does not require a Data Protection Impact Assessment (DPIA) under Article 35.

---

## Contact for GDPR Inquiries

GDPR-related questions may be directed through the project repository:  
<https://github.com/Marvin-Brouwer/TeamsVote/issues>
