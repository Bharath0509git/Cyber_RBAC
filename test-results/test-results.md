# Role-Based Access Control (RBAC) - Security Testing Evidence

**Project:** Secure College Portal with Role-Based Access Control
**Program:** Cybersecurity Engineering Learning Program
**Date Executed:** 25/9/2026, 10:09:55 pm
**Test Suite Pass Rate:** 9 / 9 (100% PASS)

## Security Test Results Matrix

| ID | Test Scenario | Category | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Student views own record | Ownership & Data Access | Allowed (200 OK) | Allowed (200 OK) | **PASS** |
| **TC-02** | Student views peer record | Horizontal Privilege Escalation | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |
| **TC-03** | Student opens admin route | Vertical Privilege Escalation | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |
| **TC-04** | Protected URL without login | Authentication Enforcement | Denied (401 Unauthorized) | Denied (401 Unauthorized) | **PASS** |
| **TC-05** | Expired session | Session Management | Re-authentication required (401) | Re-authentication required (401) | **PASS** |
| **TC-06** | Faculty updates assigned student marks | Faculty Authorization | Allowed (200 OK) | Allowed (200 OK) | **PASS** |
| **TC-07** | Faculty accesses admin user management | Vertical Privilege Escalation | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |
| **TC-08** | Admin views audit logs and system activity | Administrative Oversight | Allowed (200 OK) | Allowed (200 OK) | **PASS** |
| **TC-09** | Deactivated student account login | Account Lifecycle & Suspension | Denied (403 Forbidden) | Denied (403 Forbidden) | **PASS** |

## Detailed Observations and Forensics

### TC-01: Student views own record
- **Category:** Ownership & Data Access
- **Simulated Identity/Role:** `student (Bharath)`
- **Target Endpoint:** `/api/students/STU001/marks`
- **Expected HTTP Code:** `200` | **Actual Code:** `200`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Student A successfully retrieved their own 4 subject marks via server ownership verification.

### TC-02: Student views peer record
- **Category:** Horizontal Privilege Escalation
- **Simulated Identity/Role:** `student (Bharath)`
- **Target Endpoint:** `/api/students/STU002/marks`
- **Expected HTTP Code:** `403` | **Actual Code:** `403`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Server-side ownership check correctly rejected Student 1 attempting to read Student 2 marks with 403 FORBIDDEN.

### TC-03: Student opens admin route
- **Category:** Vertical Privilege Escalation
- **Simulated Identity/Role:** `student`
- **Target Endpoint:** `/api/admin/users`
- **Expected HTTP Code:** `403` | **Actual Code:** `403`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** RBAC middleware blocked unauthorized access to administrator user registry and logged event to audit collection.

### TC-04: Protected URL without login
- **Category:** Authentication Enforcement
- **Simulated Identity/Role:** `Unauthenticated Anonymous`
- **Target Endpoint:** `/api/students/STU001/marks`
- **Expected HTTP Code:** `401` | **Actual Code:** `401`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Deny-by-default filter intercepted request with missing Bearer token, returning safe 401 Unauthorized.

### TC-05: Expired session
- **Category:** Session Management
- **Simulated Identity/Role:** `student (with expired JWT)`
- **Target Endpoint:** `/api/students/STU001/marks`
- **Expected HTTP Code:** `401` | **Actual Code:** `401`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Expired JWT detected by jwt.verify. Request terminated requiring re-authentication; prevents stale session replay.

### TC-06: Faculty updates assigned student marks
- **Category:** Faculty Authorization
- **Simulated Identity/Role:** `faculty (Dr. Alan Turing)`
- **Target Endpoint:** `/api/faculty/marks/25e8b848-09ca-4ac2-bb8c-30733a0301c6`
- **Expected HTTP Code:** `200` | **Actual Code:** `200`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Faculty successfully updated student internal and semester mark with automatic recalculation and audit trail entry.

### TC-07: Faculty accesses admin user management
- **Category:** Vertical Privilege Escalation
- **Simulated Identity/Role:** `faculty`
- **Target Endpoint:** `/api/admin/users`
- **Expected HTTP Code:** `403` | **Actual Code:** `403`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Faculty role correctly denied access to administrator endpoints; least privilege model enforced.

### TC-08: Admin views audit logs and system activity
- **Category:** Administrative Oversight
- **Simulated Identity/Role:** `admin`
- **Target Endpoint:** `/api/audit/logs`
- **Expected HTTP Code:** `200` | **Actual Code:** `200`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Administrator successfully queried full security audit collection, confirming previous test violation logs.

### TC-09: Deactivated student account login
- **Category:** Account Lifecycle & Suspension
- **Simulated Identity/Role:** `student (disabled)`
- **Target Endpoint:** `/api/auth/login`
- **Expected HTTP Code:** `403` | **Actual Code:** `403`
- **Verification Outcome:** ✅ PASS
- **Security Observation:** Deactivated account immediately halted during authentication without token issuance.

