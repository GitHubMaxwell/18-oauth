![cf](http://i.imgur.com/7v5ASc8.png) OAuth
===
## OAUTH with Github
https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/

## Instructions
* fork / clone down
* make env file for BACK-end (in auth-server folder)
* copy paste env vars from auth-server README into .env file
* turn on mongod
* turn on auth-server in separate terminal window = node index.js
* turn on web-server in separate terminal window = node index.js
* open chrome and go to localhost:8080
* click login with github
* in chrome dev tools > Application tab > cookies > copy "auth" cookie JWT
* with Mod Header chrome plugin enter the Authorization Bearer <JWT>
* reload page and see "show me all the ca$h"
* this is the same process John showed in the class demo