# football-poll

## Dev

There is no custom dev environment available however setting up a new slack command in slack is pretty straight foward (add link to Slack's docs).
This would then allow you to test slash command responses with your local dev in the following steps:

_May be slightly outdated as it's now an app_

- run `npm run lambda-dev` in root
- run `ngrok http 9000`
- copy the `https` ngrok url into the slack integration config:
  - Slash command: inside specific slash commands followed by `/slack` (name of function file) e.g. `https://354b2426.ngrok.io/slack`
  - Interactive actions: followed by `/actions`
- interact with Slack to test responses

## Build and deploy

This app's functions are hosted with Netlify. All it takes to deploy is to push to `master` branch.
Might then need to update the URL in slack's config.