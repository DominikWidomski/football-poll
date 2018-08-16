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

This app's functions are hosted with Netlify. All it takes to deploy is to push to `master` branch. (technically any? branch gets deployed with branch deploys)
Might then need to update the URL in slack's config.

---

## Problems:
- Build:
  - [x] I either excludeExternals and it builds, or fetch is still not available becuase of BS inside of `iconv-loader`
- Environment:
  - [ ] Would like to setup NODE_ENV correctly or maybe have some additional variable to specify not production branch or dev or whatever, `local` vs `hosted`
    - `master` can have proper production config
    - any other branches should be `development` but also `hosted`
    - locally, `development` and `local`
- Database:
  - [ ] In production, will I have to plug into firebase or something?!
  - [ ] Probably would be better to just build with firebase, TinyDB is not even done, there are some other alternatives tho, but could add those later for convenicence.
  - [ ] Seems like the production thing is stuck, times out, not sure why exactly, if it's the DB thing is wrong but then the funciton remains stuck? or it's just an issue with how it was developed and was setup with the DB, so once I have removed the dependancy on tinyDB and switched to Firebase I will work as expected.
  - [ ] Works in local dev, once deployed even just requireing the firebase.js file causes slack call to time out.
    - [ ] Gonna check from postman, rather than Slack... other than the firebase thing it works fine.
    - [ ] I'm starting to think, if it will appear to be actual timeout based on the database interaction, might need to use the API and not based on the response. Perhaps if it is then somehow netlify fails and doesn't log anything... :\ that would be _terrible_
    - [ ] Still pending breaking down further. It's like it hangs because I get no logs AT ALL!

### Show'n'Tell Notes:

General objective:
- How can I present this project, kind of show any value from it, the tech stack, show a bit of excitement, the possibilities, what it was suppose to be and where it's currently, how on track it is, show it in a positive light. Kinda like to a client especially if the project isn't going swimmingly.

- "This is not a workshop or a tutorial as such, more a bit of a demo of a little side hack-day type project"
	- It's work in progress and I'd love to see more people sharing their work in progress projects in sho'n'tells
- Motivation for this project (slack, football, poll, football app)
- Was looking for the simplest thing to deploy a single endpoint
- Moti suggested Netlify amongst a few other solutions
- I forgot about that, we've used it to deploy a static website for LBX
- Netlify provides static site hosting and continuous deployment, as well as "functions"
- What is serverless, not too in depth, no history, just roughly the concept
- Probably familiar with AWS Lambda
- I started with a single function, then grew it out to another one, as I wanted to have interactive elements in the Slack message
- Provides local dev server for the functions via `netlify-lambda`
	- local dev still kinda awkward with Slack but setting up a Slack app makes it easier to manage and wrap your head around (another show'n'tell on that)
	- I setup `netlify-lambda dev` and run `ngrok` then paste those URLs
- had to create `netlify.toml` to specify the functions on build
- There were some issues with some module dependencies but Netlify accepts custom `webpack.config.js`
  - it's merged with their config so you can specify only the things you want to override
  - "lambda-dev": "AWS_LAMBDA_JS_RUNTIME=nodejs8.10 netlify-lambda serve ./functions -c ./webpack.config.js",
- I think as far as netlify setup I just had to specify the build command and that was it
- Netlify has a free tier so you can try and setup today
- Handling errors:
  - at some point when deploying to production I didn't realise what I was doing wrong:
    - no errors in browser
    - no erros in postman
    - no errors in netlify logs
  - I realised I can't just throw errors, I need to call `callback` with them!
  - at which point logs started comming in correctly! (WAS IT?!)
  - This was a bit confusing at first because it was not explained and I only kind of realised this because I knew a bit about AWS Lambda

### FURTHER WORK:

- Something I'm looking to do right now is figuring out database interactivity
	- if I can setup some globals per environment i could use a file database when in local dev and connect to actual online database instance when in production
    - I considered the option of a `connectedHandler`, which would under the hood connect to things and create the necessary global deps, bit of dep injection.
    - *HOWEVER*, I wouldn't unnecessarily want to initialise DB and take time if the handler won't use it
    - *SO* maybe just have a bunch of utility functions which initialise these deps and in the handler file we can have a `async function setup`.
    - *MAYBE* those utils are even environment aware so e.g. they get you the DB and you don't worry which it is because also the interface is the same across envs.
	- need to understand how the functions are deployed, their environment, response times (AWS Lambda sometimes takes time to warm up)
	- I'm looking to create a web app next to this so we can see the data in a web UI
  - Branch deploys are already kinda cool
    - branch name prefixes so you can test before pushing to production (https://formatting-wip--doms-slack.netlify.com/.netlify/functions/actions)
    - I found Netlify didn't instantly pick up the other branch as I pushed it to GitHub, give it some time
	- Netlify has "split testing" with branch deploys, worth exploring
- You like Jake Archibald, recent tweet: https://twitter.com/jaffathecake/status/1008705035532947461
- Add Flow
- Add prettier and eslint

### Issues:

- Have issues with Netlify where it crashes because of the statusCode of undefined or whatever, can't quite tell what's wrong with it.
  - Perhpas it's an issue with the lambda-dev server and won't be a problem when deployed.
  - Especially when things recompile and restart the server the error appears as many times as there were auto-reloads, meaning things might also not be cleaned up properly.
  - Otherwise I might be doing something wrong, maybe async problems, and would be good to simplify the case to debug.
- So, I did Slack message updating with slack by responding with an updated message.
  - So this is one way of doing it. And I'm not sure if it would be easy enough to translate this to using the Slack web API. What would be the need to do that, is something not possible with the current approach?
- Don't like how the error in the netlify logs doesn't show the actual callback error... it's a bit confusing and can't see everything in one place.

### Notes:

- Could format things differently, can we have a table? To show who's in and who's not in on what days easier (showing overlap and delta between days).