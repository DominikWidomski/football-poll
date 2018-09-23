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
  - [ ] later run into issues with gRPC or Firebase protos or something. It only works if I don't bundle it, probably because of a wrong environment or something?
  - https://github.com/serverless-heaven/serverless-webpack/issues/342
  - https://jlongster.com/Backend-Apps-with-Webpack--Part-I
  - https://github.com/gatsbyjs/gatsby/issues/3686
  - https://github.com/firebase/firebase-js-sdk/issues/221
  - https://github.com/mapbox/node-pre-gyp/issues/308
  - https://github.com/grpc/grpc-web/issues/98
  - https://github.com/liady/webpack-node-externals
  - https://github.com/gatsbyjs/gatsby/issues/3686
  - [ ] it was at this point that I learned about zeit serverless and started to consider it https://zeit.co/blog/serverless-docker
    - because I believe there's an issue with netlify doing a bunch of custom shit when building functions, they move files around etc, and the firestore also stupidly looks at some assumed things. which is dumb, I think the whole thing should just work once you bundle it WTF!?!??!
    - Quickly realised (I guess correctly) that zeit is just server, nothing specifically to do with serverless functions, so the routing to them is not handled of course. Back to figuring out the data persistance problem, sticking with Netlify for functions hosting
  - [ ] Switched firestore for MongoDB eventually, using Atlas MongoDB cloud Database as a Service
    - The config for how to connect to it wasn't exactly obvious or super simple. The errors were generic or not very useful and the documentation could have done better in telling me how exactly to connect to my replica set
      - had to go through some online question threads and several pages of documentation to figure out bits and pieces
      - really appreciating documentation of things like React, they've really put a lot of effort into it which helps with adoption of course
      - this is super important, we shouldn't have to be spending hours on just "hello world" connection to a service like that. The whole point is to make it as productive as soon as possible, for lazy developers like myself :)
    - Now that I have a MongoDB working locally, I have a feeling like Netlify functions deployment is broken altogether? Not sure what I could have broken to break it completely. Like WTF!!!
      - Nope. False alarm. Seems I had wrong leftover config :sweat_smile:
    - OK. Doesn't just fail. Saves to remote MongoDB but slack connection times out. Also Netlify task times out (possibly client doesn't close and process doesn't exit in time). Maybe if I just close the client right away it could work. Perhaps it's worth starting considering using the Slack API rather than just the response.
    - Seems that it's working but having issues with things in memory? Need to cleanup the monboDB client connection etc, not sure if it restarts fully new or whatever and has issues with connecting to it. Can't process.exit before response...
    - Last thing was the fact that I returned an object instead of a buffer (JSON.stringify(returnBody)), which Netlify didn't tell me because I did it in the callback, which I could have TRIED and then catch that error maybe? I had to run it locally and NGROK to it, then I could see it in the console, because it was a general error and they only come up if I `callback(error)` them... 
      - error was:
        Error during invocation:  TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be one of type string or Buffer. Received type object
          at write_ (_http_outgoing.js:603:11)
          at ServerResponse.write (_http_outgoing.js:575:10)
          at callback (/Users/dddom/Dev/private/sandbox/slack_football_poll/node_modules/netlify-lambda/lib/serve.js:26:14)
          at Object.handler (/Users/dddom/Dev/private/sandbox/slack_football_poll/dist/functions/actions.js:43082:5)
          at process._tickCallback (internal/process/next_tick.js:68:7)
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