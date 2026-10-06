# Privacy Policy — TVote

**Last Updated:** _2026-10-01_

This Privacy Policy explains how **TVote** (“Service”) handles personal information when used within Microsoft Teams. TVote is available at <https://github.com/Marvin-Brouwer/TeamsVote> and operates solely as a Microsoft Teams plugin.

By using the Service, you acknowledge that you have read and understood this Privacy Policy.

---

## 1. Information We Process

TVote processes minimal personal data strictly for the purpose of enabling live voting functionality within Microsoft Teams. Specifically, TVote may process the following data provided by Microsoft Teams:

- Microsoft Teams display name
- Microsoft Entra user object identifier, and the Teams user identifier, as provided by Microsoft Teams (the latter so Teams can show you your own view of the vote card)
- the identifier of the Teams conversation (meeting chat or group chat) the vote was started in, and of the vote card message
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

TVote does **not** store personal data. Session-related data is held temporarily **in-memory only**, and discarded automatically after two hours without activity, or when the backend restarts, whichever comes first.

The vote cards themselves are ordinary messages in the Teams chat. Once the votes are shown, the card shows who voted what and the estimate, and keeps showing it like any other message. It is kept by Microsoft Teams, under your organisation's retention settings, not by TVote.

The backend keeps a technical log with the request method, path, response status and duration, and the kind of Teams activity it handled. It contains no names, identifiers, tokens or votes, and is deleted after three days.

The TVote tab in a meeting caches its own program files in your browser (service worker), so it opens faster. That cache contains no personal data.

No data is:

- written to disk
- logged persistently
- exported
- made available to third parties
- used for secondary purposes

---

## 4. Backend Processing & Hosting Location

Voting happens on cards in the Teams chat. The TVote backend (the bot) posts and updates those cards, and handles every click on them. This backend:

- is hosted on **Microsoft Azure App Service, in the European Union (West Europe, the Netherlands)**
- processes session data **in-memory only**
- does **not** persist or log personal data
- does **not** transfer data outside the EU

Messages between Teams and the bot are relayed by Microsoft's Bot Framework Service, as for every Teams bot, under your organisation's existing agreements with Microsoft.

The web pages (home, privacy, terms and the meeting tab) are static files served by Microsoft Azure Static Web Apps. TVote sends no personal data there. As with any website, Microsoft may process technical data such as IP addresses in its own platform logs.

---

## 5. Data Sharing & Disclosure

TVote does **not** sell, share, or otherwise disclose personal data to third parties. No third-party analytics or tracking services are used.

Data remains contained within:

1. Microsoft Teams, and  
2. the TVote backend on Microsoft Azure, located in the EU

The static pages are hosted by Microsoft as well (Azure Static Web Apps), see section 4.

---

## 6. Security Measures

All communication between Microsoft Teams clients and the backend is encrypted in transit via HTTPS/TLS. Because no data is stored or logged, no data exists at rest.

Who you are is established by Microsoft Teams, which authenticates every message and every click to the TVote bot. TVote has no sign-in, keys or passwords of its own. Only the person who started a vote can show the votes or start a re-vote. The bot signs in to Teams as an Azure managed identity, so there is no secret that could leak.

Security and access control are additionally governed by:

- Microsoft Teams
- your organization’s Microsoft 365 tenant
- applicable organizational security policies

---

## 7. Children’s Privacy

TVote is not specifically targeted at children. Access requires a Microsoft Teams account provisioned by an organization. TVote does not independently identify or track minors.

---

## 8. Third-Party Dependencies

Aside from Microsoft (Teams, the Bot Framework Service, and Azure for the backend and the static pages), no third-party services are used for personal data processing or storage.

---

## 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Continued use of the Service after changes become effective constitutes acceptance of the updated version.

---

## 10. Contact

For privacy or data protection inquiries, please refer to the project repository at:  
<https://github.com/Marvin-Brouwer/TeamsVote/issues>
