# DPIA Exemption Note — TVote

**Last Updated:** _2026-10-01_

This note explains why a formal Data Protection Impact Assessment (DPIA) is not required for the use of **TVote** under GDPR (Article 35, EU 2016/679).

---

## 1. Minimal Personal Data Processing

TVote processes only the following personal data supplied by Microsoft Teams:

- Microsoft Teams display name  
- Microsoft Entra user object ID, as provided by Teams  
- Microsoft Teams conversation identifier (group chat, meeting chat or channel)  
- the topic and the votes entered

No sensitive data categories are processed.

---

## 2. Purpose Limitation

Personal data is processed solely to:

- enable real-time voting functionality within Teams  
- associate votes with the correct session and meeting/group chat

No secondary processing occurs.

---

## 3. Data Retention

- All session data is held **in-memory only**  
- Data is discarded automatically after two hours without activity, or when the backend restarts  
- No personal data is persisted, logged, or exported

---

## 4. Risk Assessment

Given that:

- Data is minimal and ephemeral  
- No profiling or behavioral tracking occurs  
- No sensitive categories are processed  
- Data is processed entirely within the EU (Microsoft Azure, West Europe, the Netherlands)  

TVote poses **low or negligible risk** to the rights and freedoms of data subjects.

---

## 5. Conclusion

Under Article 35 of GDPR, a full DPIA is **not required** for TVote.

---

## 6. Contact

For DPIA or data protection inquiries, please refer to:  
<https://github.com/Marvin-Brouwer/TeamsVote/issues>
