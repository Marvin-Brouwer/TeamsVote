# Privacy Policy — TVote

**Last Updated:** _2026-10-01_

This Privacy Policy explains how **TVote** (“Service”) handles personal information when used within Microsoft Teams. TVote is available at <https://github.com/Marvin-Brouwer/TeamsVote> and operates solely as a Microsoft Teams plugin.

By using the Service, you acknowledge that you have read and understood this Privacy Policy.

---

## 1. Information We Process

TVote processes minimal personal data strictly for the purpose of enabling live voting functionality within Microsoft Teams. Specifically, TVote may process the following data provided by Microsoft Teams:

- Microsoft Teams display name
- Microsoft Entra user object identifier, as provided by Microsoft Teams
- the identifier of the Teams conversation (group chat, meeting chat or channel) the vote was started in, and of the vote card message
- the topic you enter and the votes cast

TVote does **not** create separate user accounts and does not collect additional personal information.

---

## 2. Purpose of Processing

The above data is processed solely to:

- manage participation in a voting session
- coordinate votes in real-time
- ensure that votes are associated with the correct Teams meeting or group chat

This data is not used for analytics, behavioral profiling, tracking, or marketing.

---

## 3. Data Storage & Retention

TVote does **not** store personal data. Session-related data is held temporarily **in-memory only**, and discarded automatically when the vote is accepted, after two hours without activity, or when the backend restarts, whichever comes first.

The backend keeps a technical request log with the request method, path, response status and duration. It contains no names, identifiers, tokens or votes.

In your browser, TVote remembers which card deck you picked last (local storage) and caches its own program files (service worker) so dialogs open faster. Neither contains personal data.

No data is:

- written to disk
- logged persistently
- exported
- made available to third parties
- used for secondary purposes

---

## 4. Backend Processing & Hosting Location

To enable real-time voting, TVote communicates with an externally hosted backend. This backend:

- is hosted in the **European Union (Frankfurt, Germany)**
- processes session data **in-memory only**
- does **not** persist or log personal data
- does **not** transfer data outside the EU

The backend is hosted on Render within the EU Central region, ensuring compliance with GDPR requirements.

The dialogs and web pages themselves are static files served by Microsoft Azure Static Web Apps. They receive no personal data from TVote: the key that opens a vote travels in the part of the address browsers don't send to servers. As with any website, Microsoft may process technical data such as IP addresses in its own platform logs.

---

## 5. Data Sharing & Disclosure

TVote does **not** sell, share, or otherwise disclose personal data to third parties. No third-party analytics or tracking services are used.

Data remains contained within:

1. Microsoft Teams, and  
2. the TVote backend processor located in the EU

The static pages are hosted by Microsoft (Azure Static Web Apps), see section 4.

---

## 6. Security Measures

All communication between Microsoft Teams clients and the backend is encrypted in transit via HTTPS/TLS. Because no data is stored or logged, no data exists at rest.

Who you are is established by Microsoft Teams, which authenticates every message to the TVote bot. When you open a vote, the bot gives your dialog a short-lived signed key for that one vote. Only the person who started a vote can reveal, reset or accept it.

Security and access control are additionally governed by:

- Microsoft Teams
- your organization’s Microsoft 365 tenant
- applicable organizational security policies

---

## 7. Children’s Privacy

TVote is not specifically targeted at children. Access requires a Microsoft Teams account provisioned by an organization. TVote does not independently identify or track minors.

---

## 8. Third-Party Dependencies

Aside from Microsoft Teams, Microsoft Azure Static Web Apps for the static pages, and the externally hosted backend processor located in the EU, no third-party services are used for personal data processing or storage.

---

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Continued use of the Service after changes become effective constitutes acceptance of the updated version.

---

## 10. Contact

For privacy or data protection inquiries, please refer to the project repository at:  
<https://github.com/Marvin-Brouwer/TeamsVote/issues>
