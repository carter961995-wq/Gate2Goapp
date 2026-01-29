# SafeRestore Concierge - Product Spec

## Vision
Create the most trusted, consent-based iOS recovery concierge. SafeRestore guides owners through official recovery steps, reduces confusion during device loss/damage, and connects users to authorized repair partners. We do **not** bypass security or access locked data.

## Target
- Platform: iOS (global consumer focus)
- Audience: individuals recovering personal data (photos, contacts, notes)
- Positioning: trusted recovery concierge + AI guidance

## Service Promise
1. Always owner-authorized, consent-based recovery
2. Only official recovery paths and authorized service providers
3. Transparent case tracking and audit trails
4. Privacy-first defaults with user-controlled data retention

## Core Features
### 1) Guided Intake
- Device model + iOS version
- Damage type and power state
- Apple ID access status
- Backup status and last backup date
- Ownership consent confirmation
- Optional proof-of-ownership uploads

### 2) AI Recovery Plan
- Personalized recovery steps based on intake
- Clear next actions with official Apple links
- Explains why each step is recommended
- Plan status tracking (To Do / In Progress / Done)

### 3) Concierge Support
- AI concierge for triage and FAQs
- Escalation to a human specialist
- Authorized repair referral pathway

### 4) Trust Center
- Transparent policies and recovery limits
- Compliance roadmap (SOC 2, ISO 27001)
- Data handling and retention controls

### 5) Post-Recovery Protection
- Backup setup guidance
- Recovery readiness checklist
- Security hygiene reminders

## Key User Journeys
1. **Broken screen, device powers on**
   - Intake -> AI plan -> Quick Start transfer -> iCloud restore
2. **No power / water damage**
   - Intake -> Authorized repair referral -> Backup recovery
3. **Apple ID access lost**
   - Intake -> Apple account recovery -> iCloud sync check
4. **Lost device**
   - iCloud data check -> Account hardening -> new device setup

## Information Architecture
**Tabs**
- Cases: list, search, case detail
- Support: AI concierge + escalation
- Settings: membership, trust center, privacy

**Stack Screens**
- New Case
- Case Detail
- Recovery Plan
- Plan Step
- Trust Center
- Membership

## Data Model Summary
- `RecoveryCase`: device info, owner info, status, consent, notes
- `RecoveryStep`: plan step + official link + status
- `RecoverySettings`: region, language, retention, tier

## Pricing (Initial)
- Starter (Free): AI plan + official links
- Plus ($29/mo): priority support + reminders
- Premier ($99/mo): white-glove specialist + audit trail

## Success Metrics
- Case completion rate
- Time-to-next-step
- Backup enablement rate post-recovery
- NPS / CSAT
- Support ticket resolution time

## Out of Scope (Safety)
- Passcode bypasses
- Encryption circumvention
- Accessing locked device data
- Unauthorized third-party extraction tools

## Roadmap
1. **MVP**: iOS intake + AI plan + trust center
2. **Phase 2**: human escalation + partner routing
3. **Phase 3**: insurance/repair integrations + compliance audits
