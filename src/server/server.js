'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const config = require('./config')

const app = express()
const port = config.server.port
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy

passport.serializeUser((user, done) => {
   done(null, user.oid)
})

passport.deserializeUser((oid, done) => {
   done(null, oid)
})

const displayname = (token) => {
    try {
      return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())['name']
    } catch (err) {
      console.log(err)
      return 'unknown user'
    }
  }

passport.use(
   new OIDCStrategy(
      {
         identityMetadata: config.oidc.identityMetadata,
         clientID: config.oidc.clientID,
         responseType: config.oidc.responseType,
         responseMode: config.oidc.responseMode,
         redirectUrl: config.oidc.redirectUrl,
         allowHttpForRedirectUrl: config.oidc.allowHttpForRedirectUrl,
         clientSecret: config.oidc.clientSecret,
         validateIssuer: config.oidc.validateIssuer,
         isB2C: config.oidc.isB2C,
         issuer: config.oidc.issuer,
         passReqToCallback: config.oidc.passReqToCallback,
         scope: config.oidc.scope,
         useCookieInsteadOfSession: config.oidc.useCookieInsteadOfSession,
         cookieEncryptionKeys: config.oidc.cookieEncryptionKeys,
         loggingLevel: config.oidc.loggingLevel
      },
      (req, iss, sub, profile, jwtClaims, access_token, refresh_token, params, done) => {
        if (iss !== `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`
           && iss !== `https://sts.windows.net/${process.env.TENANT_ID}/v2.0`) {
           return done(new Error("unknown issuer"), null)
        }
        if (!profile.oid) {
           return done(new Error("No oid found"), null)
        }
        return done(null, profile, params)
      }
   )
)

app.use(passport.initialize())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.disable('x-powered-by')
app.use('/static', express.static('dist'))
app.use((_, res, next) => {
   res.header('X-Frame-Options', 'DENY')
   res.header('X-Xss-Protection', '1; mode=block')
   res.header('X-Content-Type-Options', 'nosniff')
   res.header('Referrer-Policy', 'no-referrer')
   res.header('Feature-Policy', 'geolocation \'none\'; microphone \'none\'; camera \'none\'')
   next()
})

app.get('/isAlive', (req, res) => res.send('alive'))
app.get('/isReady', (req, res) => res.send('ready'))

app.get('/login',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/error', 'session': false })
)

app.post('/callback',
  passport.authenticate('azuread-openidconnect', { "session": false }),
  (req, res) => {
    console.log('callback')
    console.log(req.body)
    res.cookie('speil', `${req.authInfo.id_token}`, { secure: true })
    res.cookie('spade', `${req.authInfo.access_token}`, { httpOnly: true, secure: true })
    res.redirect('/')
  })

app.get('/logout', (req, res) => {
   req.session.destroy(_ => {
      req.logOut()
      res.redirect(config.destroySessionUrl)
   })
})

app.get('/me', (req, res) => {
    if (req.cookies['speil']) {
       res.send(`${displayname(req.cookies['speil'])}`)
    } else {
       res.redirect('/login')
    }

})

 app.get('/error', (req, res) => {
    res.clearCookie('speil', { secure: true })
    res.clearCookie('spade', { httpOnly: true, secure: true })
    res.send('innlogging mislyktes')
 })

app.get('/', (_, res) => {
   res.redirect('/static')
})

app.listen(port, () => console.log(`Speil backend listening on port ${port}!`))
