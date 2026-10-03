# TVote — AppSource Certification Answers

**Repository / Website:** <https://github.com/Marvin-Brouwer/TeamsVote>  
**App Platform:** Microsoft Teams  
**Version:** 1.0.0  
**App Category:** Productivity / Collaboration  
**Publisher:** Marvin Brouwer

---

## 1. General Information

- **App Name:** TVote  
- **Supported Platforms:** Microsoft Teams  
- **Description:** TVote is a Microsoft Teams plugin that enables ephemeral, real-time voting sessions in meetings or group chats. All data is processed in-memory and discarded at the end of each session.  

---

## 2. Data Collection & Privacy

1. **Does your app collect any user data?**  
   `YES` Minimal personal data from Microsoft Teams is processed, in memory only:
   - Display name  
   - Entra user object ID  
   - Teams conversation ID (group chat, meeting chat or channel)  
   - The topic and the votes  
2. **Does your app transmit or store personal data outside Microsoft Teams?**  
   `YES` Temporarily to an externally hosted backend for real-time coordination. All data is in-memory only and discarded at the end of the session. Backend is hosted in the EU (Render, Frankfurt).
3. **Do you store personal data?**  
   `NO` No persistent storage exists.
4. **Do you share data with third parties?**  
   `NO`
5. **Do you use analytics or tracking?**  
   `NO`
6. **Does your app comply with GDPR?**  
   `YES` See `GDPR.md` and `DPIA.md`. DPIA not required due to ephemeral processing.

---

## 3. Authentication & Security

1. **How is user authentication handled?**  
   - Authentication is handled by Microsoft Teams through the bot. No sign-in or separate credentials are required. The bot issues a short-lived signed key per vote to the person opening it, and only the person who started a vote can reveal, reset or accept it.
2. **How is personal data protected?**  
   - All communications are encrypted via HTTPS/TLS  
   - No personal data is stored or logged  
   - Access control managed by Microsoft Teams and the tenant
3. **Does your app require elevated permissions?**  
   - No. A bot and a message extension only. No Microsoft Graph permissions, no resource-specific consent.
4. **Does your app handle financial information?**  
   - No. TVote is free and does not process payments.

---

## 4. Functionality & Reliability

1. **Core functionality:**  
   - Enables ephemeral live voting sessions in Teams meetings or group chats.
2. **Offline behavior:**  
   - Not supported. Requires Microsoft Teams connectivity.
3. **External dependencies:**  
   - Externally hosted backend in EU (Render, Frankfurt) for ephemeral session coordination.  
   - Static dialog pages on Microsoft Azure Static Web Apps (no personal data).
4. **Error/downtime handling:**  
   - Votes cannot be cast if the backend is unavailable.  
   - No persistent data is lost since data is only in-memory per session.

---

## 5. Compliance & Certification

1. **GDPR compliance:**  
   `YES` Minimal personal data, EU-only hosting, ephemeral in-memory processing, no profiling or tracking.
2. **DPIA required?**  
   `NO` See `DPIA.md`.
3. **Microsoft Teams platform compliance:**  
   `YES` Fully compliant with Teams TOS and policies.
4. **Sensitive data collection:**  
   `NO`  Only display name, user ID, conversation ID, the topic and the votes.
5. **Data exposure outside tenant:**  
   `NO` Except ephemeral in-memory processing in EU-hosted backend during active sessions.

---

## 6. Marketing & Listing

- **App Description:**  
  TVote is a Microsoft Teams plugin that enables ephemeral, real-time voting sessions within meetings or group chats. No persistent personal data is stored. All processing occurs securely in-memory on an EU-hosted backend.
- **Keywords:** voting, poll, Teams plugin, collaboration, ephemeral, GDPR compliant
- **Screenshots / Videos:** [TODO]
