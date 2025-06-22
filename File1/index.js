require('dotenv').config() 

const express = require('express')
// import express from "express"
const app = express()

const gitHubData = {  // ths is object // calling
     "login": "NasimReja077",
     "id": 168109439,
     "node_id": "U_kgDOCgUlfw",
     "avatar_url": "https://avatars.githubusercontent.com/u/168109439?v=4",
     "gravatar_id": "",
     "url": "https://api.github.com/users/NasimReja077",
     "html_url": "https://github.com/NasimReja077",
     "followers_url": "https://api.github.com/users/NasimReja077/followers",
     "following_url": "https://api.github.com/users/NasimReja077/following{/other_user}",
     "gists_url": "https://api.github.com/users/NasimReja077/gists{/gist_id}",
     "starred_url": "https://api.github.com/users/NasimReja077/starred{/owner}{/repo}",
     "subscriptions_url": "https://api.github.com/users/NasimReja077/subscriptions",
     "organizations_url": "https://api.github.com/users/NasimReja077/orgs",
     "repos_url": "https://api.github.com/users/NasimReja077/repos",
     "events_url": "https://api.github.com/users/NasimReja077/events{/privacy}",
     "received_events_url": "https://api.github.com/users/NasimReja077/received_events",
     "type": "User",
     "user_view_type": "public",
     "site_admin": false,
     "name": "Nasim Reja Mondal",
     "company": null,
     "blog": "",
     "location": null,
     "email": null,
     "hireable": null,
     "bio": null,
     "twitter_username": null,
     "public_repos": 14,
     "public_gists": 0,
     "followers": 0,
     "following": 1,
     "created_at": "2024-04-25T14:58:19Z",
     "updated_at": "2025-03-13T15:00:45Z"
   }


const port = 4000 // free port // this valu store in .env file

app.get('/', (req, res) => { // '/' is importen
  res.send('Hello World!')
})

app.get('/twitter', (req, res) =>{ // () =>{} call Back mathod
     res.send('nasimcom')
})

app.get('/login', (req, res) =>{
     res.send('<h1>Please login at my chat app.</h1>')
})

app.get('/youtub', (req, res) =>{
     res.send('<h1>Hi ther.. This is youtube backend</h1>')
})

app.get('/github', (req, res) =>{
     res.json(gitHubData)
})
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


app.listen(process.env.PORT, () => {
     console.log(`Example app listening on port ${port}`)
   })

// when add new line and save but server is not update then stop and start server and refrache then run 
// using nodemon for this error.

// PS C:\Users\User\Desktop\Backend\File1> npm run start       

// > nasimbackendcode@1.0.0 start
// > node index.js

// Example app listening on port 4000
// app is lesaning // this is server
// https://expressjs.com/en/starter/hello-world.html 

// for security resain not show your sensativ data for use - npm i dotenv, https://www.npmjs.com/package/dotenv 