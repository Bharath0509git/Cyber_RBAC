# Role-Permission Matrix (RBAC Enforcement)

This matrix specifies the access control rules configured in the Secure College Portal. All permissions are enforced **on the server side**, ensuring that client manipulation or hidden button bypasses are completely ineffective.

## Formal Access Control Policy Matrix

| Operation / Resource | Student | Faculty | Administrator | Enforcement Mechanism | Failure Response |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **View Own Student Profile** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | `authenticateUser` + `verifyStudentOwnership` | 403 Forbidden |
| **View Own Academic Marks** | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | `authenticateUser` + `verifyStudentOwnership` | 403 Forbidden |
| **View Own Class Attendance** | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | `authenticateUser` + `verifyStudentOwnership` | 403 Forbidden |
| **View Peer Student Records** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | Server-side ownership check (`ownershipMiddleware`) | 403 Forbidden (`FORBIDDEN_OWNERSHIP`) |
| **View Assigned Student Cohort** | ❌ DENIED | ✅ ALLOWED | ✅ ALLOWED | `authorize('faculty', 'admin')` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Update Student Marks** | ❌ DENIED | ✅ ALLOWED | ✅ ALLOWED | `authorize('faculty', 'admin')` + `auditLogger` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Update Student Attendance** | ❌ DENIED | ✅ ALLOWED | ✅ ALLOWED | `authorize('faculty', 'admin')` + `auditLogger` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Manage User Accounts (Create/Edit)** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | `authorize('admin')` + `auditLogger` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Modify User Roles** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | `authorize('admin')` + `auditLogger` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Deactivate / Activate Accounts** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | `authorize('admin')` + `auditLogger` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Query Security Audit Logs** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | `authorize('admin')` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Access System KPIs / Statistics** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | `authorize('admin')` | 403 Forbidden (`FORBIDDEN_ROLE`) |
| **Access Without Valid JWT** | ❌ DENIED | ❌ DENIED | ❌ DENIED | `authenticateUser` | 401 Unauthorized (`AUTH_TOKEN_MISSING`) |
| **Access With Expired JWT** | ❌ DENIED | ❌ DENIED | ❌ DENIED | `authenticateUser` | 401 Unauthorized (`TOKEN_EXPIRED`) |

## Security Principles Enforced

1. **Principle of Least Privilege (PoLP)**:
   - Students only possess read privileges on their personal records.
   - Faculty possess read and update privileges only on academic grading.
   - Administrative functions are restricted strictly to administrators.

2. **Deny-by-Default**:
   - Any unknown route or endpoint without explicit role clearance returns HTTP 404 or HTTP 401.

3. **Horizontal Isolation (Ownership Checks)**:
   - Prevents Insecure Direct Object References (IDOR). Student A cannot view Student B's data by guessing or substituting register numbers.

4. **Cryptographic Integrity & Session Governance**:
   - Passwords hashed with bcrypt (salt rounds = 10).
   - Sessions governed by short-lived JWT tokens (15m expiry).
