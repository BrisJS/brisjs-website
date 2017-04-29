Load Twitter data
=================

This tool pulls down the Twitter profile & avatar for users in the talks
spreadsheet.

Use this tool to build `/data/twitter.json` when the users in the spreadsheet
have changed.

Usage
-----

1. create a new app on Twitter https://apps.twitter.com/
2. create a `secret-credentials.json` file with the values from the previous step.
3. `npm run build-twitter`
