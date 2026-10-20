# CSV guide

Open Contacts & Companies → Add contact / company → Import List.

Use UTF-8 CSV, a header row, commas between columns, and quotes around values containing commas. Supported headers are case-insensitive and can appear in any order:

| Column | Value |
| --- | --- |
| company | Company/account name |
| name | Person's name |
| email | Email address |
| phone | Phone number, kept as text |
| type | `customer` or `lead`; blank uses the form's selected type |
| features | Existing feature names separated by semicolons |

Each row needs at least one company/name/email/phone value. Optional columns may be omitted. Maximum: 5,000 rows and 2 MB.

```csv
company,name,email,phone,type,features
"Example, Inc.",Alex Morgan,alex@example.com,+1 202-555-0100,lead,Advanced Reporting; Mobile App
Example Studio,Sam Lee,sam@example.com,+1 202-555-0101,customer,Automated Reports
```

Feature names must already exist. Matching ignores case and repeated whitespace. Unknown or ambiguous names reject the import; no records are saved. Rows with a blank features column use the checkboxes in the form. Rows that specify features use those assignments instead of the checkboxes.

Review the preview and click Save imported contacts. Existing matches on a feature are skipped rather than overwritten. New feature associations may be added for the same person. Cancel import clears the staged file.

Custom View → Create Custom View → Export to CSV downloads the displayed results with one row per grouped contact and a semicolon-separated features column. Quoted values and Unicode are supported. Spreadsheet formula-like values receive a protective apostrophe; Feature Flow removes that prefix on reimport. Exports can be reimported when the referenced features exist.

CSV export is a contact-list export, not a complete workspace backup.
