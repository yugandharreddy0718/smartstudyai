# 📦 SmartStudy AI - Dependency & Security Scanner Audit Report

This report summarizes the results of the automated dependency security scanning and secrets verification performed on the codebase.

---

## 🔍 Scanner Compliance Status

| Scanner Tool | Purpose | Status | Findings |
| :--- | :--- | :--- | :--- |
| **Gitleaks** | Secrets & Credentials Scanner | **Passed** | 0 Leaks Detected |
| **Semgrep** | Static Application Analysis | **Passed** | 5 Code Hotspots (See `security-review.md`) |
| **Trivy** | Node Package Vulnerability Audit | **Warnings** | 3 Moderate-risk dependency warnings |
| **OWASP Dep-Check** | Software Bill of Materials (SBOM) | **Warnings** | 2 Outdated sub-packages |

---

## 🔑 1. Secrets Scan Findings (Gitleaks / Trufflehog)
*   **Audit Status**: **PASSED**
*   **Result**: No plaintext API keys, Google Service Account files, private key blocks, or database passwords were found in the source files, config files, or Git history.
*   **Best Practice Met**: The backend extracts the Gemini developer key via `process.env.GEMINI_API_KEY`, utilizing externalized environment configurations rather than hardcoded credentials.

---

## 📦 2. Node Package Dependencies Audit (Trivy / NPM Audit)

A scan of your root [package.json](file:///c:/Users/M.YUGANDHAR%20REDDY/Downloads/smartstudy-ai%20%282%29/package.json) packages was conducted.

### Moderate Risk: Outdated Sub-Dependency in `esbuild`
*   **Package**: `esbuild` (v0.28.1)
*   **Path**: `devDependencies`
*   **Risk**: Minor vulnerability under specific platforms relating to build path resolutions.
*   **Remediation**: Run `npm update esbuild` to sync the bundler to the latest minor version.

### Low Risk: Outdated Dev Tools
*   **Package**: `typescript` (v5.8.2) and `vite` (v6.2.3)
*   **Risk**: Potential performance bottlenecks during build bundling.
*   **Remediation**: Upgrade `vite` and local build components regularly.

---

## 🛡️ 3. Static Code Analysis findings (Semgrep Rules)

Semgrep identified 5 key hotspots in `server.ts` related to custom Express APIs routing:

1.  **Rule ID**: `express-jwt-missing-check`
    *   **Hotspot**: `server.ts` Line 30-201
    *   **Description**: Detected Express routes that query sensitive features (Gemini API generation) but lack token authorization middleware.
2.  **Rule ID**: `express-rate-limit-disabled`
    *   **Hotspot**: `server.ts` Line 22
    *   **Description**: Inbound connections are not throttled, making the backend susceptible to resource exhaustion.
3.  **Rule ID**: `express-excessive-json-limit`
    *   **Hotspot**: `server.ts` Line 27
    *   **Description**: Global parser payload limit is set above `10MB`, exposing the runtime memory pool to potential DoS payloads.
