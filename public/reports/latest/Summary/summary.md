# Android Appium E2E Execution Summary

- **Execution Date:** 21/8/2026, 11:38:45 am
- **Execution Mode:** SIMULATED (Local Fallback)
- **Device:** Mock Device
- **Android Version:** 13.0
- **Pass Rate:** 98.04%
- **Fail Rate:** 1.37%
- **Duration:** 2.05s

## Execution Metrics

| Metric | Count |
| :--- | :--- |
| **Total Test Cases** | 510 |
| **Executed** | 507 |
| **Passed** | 500 |
| **Failed** | 7 |
| **Skipped** | 3 |
| **Blocked** | 0 |

## Valid Test Case Summary

### PASSED TESTS (Sample)
✓ **TC_AUTH_001** - Valid Login with Google Account

✓ **TC_AUTH_002** - User Logout session termination

✓ **TC_AUTH_003** - Authentication verification check - Scenario #3

✓ **TC_AUTH_004** - Authentication verification check - Scenario #4

✓ **TC_AUTH_005** - Authentication verification check - Scenario #5

✓ **TC_AUTH_006** - Authentication verification check - Scenario #6

✓ **TC_AUTH_007** - Authentication verification check - Scenario #7

✓ **TC_AUTH_008** - Authentication verification check - Scenario #8

✓ **TC_AUTH_009** - Authentication verification check - Scenario #9

✓ **TC_AUTH_011** - Authentication verification check - Scenario #11

### FAILED TESTS
✗ **TC_AUTH_010** - Invalid OTP / Sign-in Verification Failure
  - *Reason:* OTP validation mismatch

✗ **TC_AZ_012** - Authorization verification check - Scenario #12
  - *Reason:* Unauthorized resource access restriction failed.

✗ **TC_DASH_004** - Dashboard verification check - Scenario #4
  - *Reason:* Dashboard stats widgets failed to re-render on database refresh.

✗ **TC_FORM_008** - Mandatory Field Validation on Custom Notes Creation
  - *Reason:* Validation message missing

✗ **TC_VAL_015** - Input Validation verification check - Scenario #15
  - *Reason:* Special character inputs allowed without escaping.

✗ **TC_ERR_007** - Error Handling verification check - Scenario #7
  - *Reason:* NullPointerException thrown during offline sync retry.

✗ **TC_UPL_002** - Large File Upload Boundary Check (PDF Limit)
  - *Reason:* Application crash

### SKIPPED TESTS (Sample)
- **TC_REG_014**
  - *Reason:* Third party OAuth registration endpoint unavailable.

- **TC_NOTIF_004**
  - *Reason:* Feature Disabled

- **TC_ACC_011**
  - *Reason:* Screen reader integration disabled on this platform version.
