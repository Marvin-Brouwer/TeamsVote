# GDPR Compliance Statement — TVote

**Last Updated:** _2026-10-01_

TVote is designed with privacy and data minimization in mind and operates in accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679.

---

## Lawful Basis for Processing

TVote processes limited personal data supplied by Microsoft Teams (display name, Entra user object ID, and the identifier of the conversation the vote runs in), together with the topic and votes entered, for the legitimate interest of enabling real-time voting functionality within Teams (Article 6(1)(f) GDPR).

No further secondary processing occurs.

---

## Data Minimization & Purpose Limitation

In alignment with Articles 5(1)(b) and 5(1)(c), TVote:

- does not collect additional personal data beyond what Microsoft Teams provides
- does not perform analytics, profiling, or tracking
- does not store, log, or retain personal data after a voting session ends
- does not use personal data for marketing or unrelated purposes

---

## Data Storage & Retention

TVote does **not** persist personal data. All session data is processed **in-memory only** and discarded after two hours without activity, or when the backend restarts. Once the votes are shown, the vote card in the chat shows who voted what; that card is an ordinary Teams message, kept by Microsoft Teams under the organisation's retention settings.

No personal data exists at rest, and no logs containing personal data are created. The backend's request log holds only method, path, status and duration.

---

## Data Processor & Hosting Location

The TVote backend (the bot) posts the vote cards in Teams and handles every click on them. This backend:

- is hosted on **Microsoft Azure App Service, in the European Union (West Europe, the Netherlands)**
- processes data **in-memory**
- does **not** store or log personal data
- does **not** transfer data outside the EU

Hosting the backend within the EU keeps it within the GDPR restrictions on international data transfers (Chapter V). Messages between Teams and the bot are relayed by Microsoft's Bot Framework Service, as for every Teams bot.

The web pages (home, privacy, terms and the meeting tab) are static files served by Microsoft Azure Static Web Apps. TVote sends no personal data there; Microsoft may process technical data such as IP addresses in its platform logs. All of this falls under the organisation's existing agreements with Microsoft.

---

## Controller / Processor Roles

Under GDPR:

- The user’s organization (Microsoft 365 tenant) is the **data controller** for identity and account data
- Microsoft is a **processor** for Teams account and identity services
- TVote functions as a **sub-processor** for the duration of a voting session but does not store personal data or act as a controller for persistent data

---

## Data Subject Rights

Because TVote does not persist personal data:

- access
- rectification
- erasure
- portability
- objection
- restriction of processing

do not generally apply directly to TVote (Articles 15–21). Data subject requests should be directed to the user’s Microsoft 365 administrator.

---

## Security Measures

TVote employs appropriate technical measures in accordance with Article 32:

- all communications are encrypted in transit via HTTPS/TLS
- no data is stored at rest
- no external third-party analytics or tracking services are used

Access control and identity management remain governed by Microsoft Teams and the user’s organization.

---

## DPIA Considerations

Due to the lack of persistent storage, profiling, or sensitive data categories, TVote does not require a Data Protection Impact Assessment (DPIA) under Article 35.

---

## Contact for GDPR Inquiries

GDPR-related questions may be directed through the project repository:  
<https://github.com/Marvin-Brouwer/TeamsVote/issues>
