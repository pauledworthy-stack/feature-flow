# Feature Flow v1 — QA report

Testing used an isolated localhost browser origin so the main 127.0.0.1 workspace and its records were not changed.

## Verified

- A fresh workspace starts blank.
- Loading samples adds 12 features alongside a user-created feature; clearing samples preserves that user-created feature; loading again restores the sample workspace.
- Contact additions remain in draft. Keep editing retains the session, and Discard removes the additions.
- Discarding a lead conversion restores the lead type across all six associated sample features.
- Contact edits save across all associated features and persist after refresh.
- A saved lead conversion persists after refresh and removes that contact from lead-only custom results across all associated features.
- Discarding a session containing both a contact removal and a relationship change restores both.
- Keyboard Enter expands the contact list. Escape from the feature dialog opens the unsaved-changes prompt. A focused search field can consume the first Escape to clear its query, which is native browser behavior.
- At a 390 × 844 viewport, the feature dialog stays within the page width, form controls remain accessible by scrolling, and Save Changes can be reached and activated. Custom View generates a ten-contact grouped list; its wide table uses horizontal scrolling.
- Contact identity checks: email comparison ignores case and surrounding whitespace; different nonempty emails stay distinct even for equal names; different names are not fuzzy-merged; matching name/company is used when emails are absent.
- No browser console errors were captured during the checked workflows.
- JavaScript syntax checks passed.

## Limits

This was desktop browser testing, including a narrow viewport—not real iPhone/Android touch testing or a full cross-browser certification. Native suggestion menus may differ across browsers. Name/company matching is a heuristic and can conflate people with the same name at the same company when distinguishing contact information is absent. Records remain local to this browser; clearing site data deletes them.

## 1.0 release checks — 2026-10-20

- Used an isolated localhost workspace to avoid changing the main 127.0.0.1 workspace.
- Imported a real CSV through the file chooser: two contacts, lead/customer types, a quoted company containing a comma, and three feature associations. No feature checkboxes were needed because the CSV specified assignments.
- Generated a custom view for the imported company: one grouped contact with the two intended features.
- Downloaded the resulting CSV and parsed the actual file. Verified company punctuation, contact type, grouped feature names and phone value.
- Corrected import handling of the spreadsheet-safety apostrophe added by export, so phone values can be read back without retaining that prefix.
- Reimported the exported file successfully; saving reported that the contact already existed on the selected features and did not add duplicates.
- Imported a file with an unknown feature; it was rejected with the row number and feature name before saving.
- Removed the two temporary imported people afterward.
- Updated version metadata, import/export guide, README, release notes and grid/map screenshots.

## Public-launch checks

Full-workspace JSON Backup & Restore was tested in an isolated browser origin: download the existing 13-feature workspace, replace it with a one-feature test backup, refresh, and restore the original downloaded backup. The original 13 features returned. Invalid format and missing-related-feature validation checks passed. No private workspace records are bundled with the app.
