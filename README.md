# Secure College Portal with Role-Based Access Control (RBAC)

**Cybersecurity Engineering Learning Program — Topic 5: Role-Based Access Control**  
**Author:** Bharath K  
**Specification:** Cybersecurity Engineering Learning Framework  

---

## 1. Project Overview

The **Secure College Portal** is an enterprise-grade full-stack web application demonstrating **Role-Based Access Control (RBAC)** across three explicit university user personas: **Student**, **Faculty**, and **Administrator**. 

In adherence to industry cybersecurity benchmarks (OWASP Access Control, Least Privilege, Deny-by-Default), the system demonstrates that:
1. **Authentication ≠ Authorization**: Knowing *who* a user is (via bcrypt & JWT) does not equate to *what* they are permitted to view or mutate.
2. **Server-Side Enforcement**: Access control decisions are evaluated strictly inside Node.js/Express middleware pipelines. The client (React) never dictates access rules, and hiding buttons is never used as a security mechanism.
3. **Horizontal & Vertical Privilege Protection**: Prevents both vertical privilege escalation (Student attempting Administrator actions) and horizontal privilege escalation (Student A attempting to view Student B's academic marks/attendance).
4. **Session Expiry Governance**: Enforces short-lived JWT tokens (15m expiry), requiring immediate re-authentication upon token expiration.
5. **Auditing & Forensics**: Records every privileged operation and blocked violation into a persistent MongoDB audit collection.

---

## 2. Key Security Features

- **Role-Based Routing Middleware**: Express middleware verifies user roles (`student`, `faculty`, `admin`) against route requirements.
- **Ownership Verification Middleware**: Validates that students can only query their own identity records.
- **Cryptographic Password Security**: Passwords hashed with `bcryptjs` using a salt work factor of 10.
- **Cryptographic Token Verification**: Session tokens signed with HMAC-SHA256 containing expiration timestamps.
- **Safe Error Responses**: Returns standardized JSON error codes without disclosing internal server stack traces.
- **Persistent Security Audit Trail**: Logs user identity, role, IP address, timestamp, status, and forensic reasons.
- **Account Suspension Control**: Allows administrators to instantaneously disable user logins.

---

## 3. Technology Stack & Installed Library Versions

| Component | Technology | Installed Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | Node.js | `v24.19.0` | Server-side JavaScript runtime |
| **Package Manager** | npm | `11.17.0` | Dependency resolution & scripts |
| **Backend Framework** | Express.js | `^4.21.2` | RESTful API server & routing |
| **Database ODM** | Mongoose | `^8.10.1` | MongoDB document modeling & queries |
| **Database Engine** | MongoDB / Embedded Engine | Portable Standalone | Real MongoDB support with resilient embedded fallback |
| **Authentication Token** | jsonwebtoken | `^9.0.2` | Cryptographic JWT issuance & signature verification |
| **Password Hashing** | bcryptjs | `^2.4.3` | One-way cryptographic salt & password hashing |
| **CORS Middleware** | cors | `^2.8.5` | Cross-Origin Resource Sharing control |
| **Configuration** | dotenv | `^16.4.7` | Environment variable management |
| **Frontend Framework** | React.js | `^18.3.1` | Declarative UI dashboards |
| **Build Tool** | Vite | `^5.4.14` | High-speed frontend development & bundling |
| **Icon Library** | Lucide React | `^0.468.0` | Modern SVG iconography |

---

## 4. System Prerequisites

- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** v18.0.0 or higher (Tested on `v24.19.0`)
- **npm:** v9.0.0 or higher (Tested on `11.17.0`)
- **Database:** Local MongoDB daemon OR MongoDB Atlas URI (Note: The application includes an embedded zero-setup document store fallback that runs out of the box if local MongoDB service is not started).

---

## 5. Environment Variables (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/secure_college_portal
JWT_SECRET=cyber_rbac_super_secret_jwt_key_2026
JWT_EXPIRES_IN=15m
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 6. Installation & Execution Guide

### Option A: Quick Start (Running Both Servers)

#### Step 1: Clone or Open Workspace
```powershell
cd c:\Users\bhara\Downloads\CYBER
```

#### Step 2: Install Backend Dependencies & Seed Test Data
```powershell
cd server
npm install
node utils/seedData.js
```

#### Step 3: Start Backend API Server (Port 5000)
```powershell
node server.js
```
*Output: `[SERVER RUNNING] Secure College Portal API listening at http://localhost:5000`*

#### Step 4: Install Frontend & Start Client (Port 5173)
In a second terminal window:
```powershell
cd c:\Users\bhara\Downloads\CYBER\client
npm install
npm run dev
```
*Output: `Local: http://localhost:5173/`*

#### Step 5: Open Browser
Navigate to **`http://localhost:5173`** in your browser.

---

## 7. Synthetic Demonstration Test Accounts

All accounts use synthetic sample data in accordance with the assessment requirements:

| Role | Name | Email | Password | Identifier | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student A** | Bharath K | `student1@college.local` | `Student@12345` | `STU001` | Primary Student User |
| **Student B** | Priya Sharma | `student2@college.local` | `Student@12345` | `STU002` | Peer Student (Horizontal test) |
| **Student C** | Arun Kumar | `student3@college.local` | `Student@12345` | `STU003` | Deactivated Account (TC-09) |
| **Faculty** | Dr. Alan Turing | `faculty@college.local` | `Faculty@12345` | `FAC001` | Faculty Lead & Mentor |
| **Admin** | SecOps Admin | `admin@college.local` | `Admin@12345` | `ADMIN` | Administrator Account |

*Tip: The Login page features quick-select buttons to instantaneously populate any persona.*

---

## 8. Automated Security Test Suite

The project includes an automated test harness validating both positive and negative access control cases:

```powershell
cd server
npm run test:security
```

### Test Case Validation Matrix

| ID | Test Scenario | Category | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Student views own record | Ownership & Data Access | Allowed (200 OK) | Allowed (200 OK) | **PASS** |
| **TC-02** | Student views peer record | Horizontal Escalation | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |
| **TC-03** | Student opens admin route | Vertical Escalation | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |
| **TC-04** | Protected URL without login | Authentication Enforcement | Denied (401 Unauthorized)| Denied (401 Unauthorized)| **PASS** |
| **TC-05** | Expired session | Session Management | Re-auth Required (401) | Re-auth Required (401) | **PASS** |
| **TC-06** | Faculty updates student marks | Faculty Authorization | Allowed (200 OK) | Allowed (200 OK) | **PASS** |
| **TC-07** | Faculty accesses admin route | Vertical Escalation | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |
| **TC-08** | Admin views audit logs | Administrative Oversight| Allowed (200 OK) | Allowed (200 OK) | **PASS** |
| **TC-09** | Deactivated user login | Account Lifecycle | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |

*Automated test suite reports are persisted to `test-results/security-test-report.json` and `test-results/test-results.md`.*

---

## 9. Common Mistakes Avoided (As Required by Assessment)

1. **Relying on Hidden Buttons**: React UI navigation reflects roles for user experience, but **every API route independently validates caller role and data ownership on the server**.
2. **Missing Ownership Checks**: Student A cannot view Student B's grades by modifying the register number in the URL or payload.
3. **Permissive Default Access**: Unmatched routes and unauthenticated requests trigger immediate Deny-by-Default HTTP 401/404 responses.
4. **Role Controlled by Client**: User role is securely signed in the JWT payload by the server and re-verified against the database upon every request.
5. **Long-Lived Sessions**: Tokens expire in 15 minutes, neutralizing session replay and stale credential risks.

---

## 10. Known Limitations

- Multi-Factor Authentication (MFA/TOTP) is outside the scope of Topic 5 but recommended for future hardening.
- Refresh token rotation can be introduced to extend sessions without requiring re-entry of passwords.
