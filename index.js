const express = require('express'); //Import the express dependency
const Nylas = require('nylas');

const app = express();
const port = 5001;

// if working from the EU data centre change the apiServer --  https://developer.nylas.com/docs/sdks/node/getting-started/#step-3-change-the-base-api-url

Nylas.config({
 clientId: '',
 clientSecret: '',
 apiServer:'https://api.nylas.com'
});


app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname});
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});



app.get('/my-auth-callback', (req, res) => {

    let tokenPayload = undefined;

  if (req.query.code) {

            Nylas.exchangeCodeForToken(req.query.code).then(token => {
              // Save the token to the current session, save it to the user model, etc.
                console.log(token);
                tokenPayload = token;

            }).then(()=> {

                 const nylas = Nylas.with(tokenPayload['accessToken']);
                 nylas.account.get().then(account => console.log(account));

            }).then(()=>{
                res.sendFile('auth_callback.html', {root: __dirname});
            });
  } else if (req.query.error) {
    res.render('error', {
      message: req.query.reason,
      error: {
        status:
          'Please try authenticating again or use a different email account.',
        stack: '',
      },
    });
  }


});


//HOSTED AUTH FLOW:: redirect use to Nylas
app.get('/connect-to-nylas', (req, res, next) => {
  options = {
        redirectURI: 'http://127.0.0.1:5001/my-auth-callback', //this should be added to the callbacks in the Nylas dashboard for your application too
        scopes: [], //empty scopes will request ALL see Nylas docs to only request specific scopes
        loginHint:'dan.e@nylas.com' //hard coded but could capture from the user
  };
  res.redirect(Nylas.urlForAuthentication(options));
});



// Note for Hosted Auth:
// Your Google app should have a redirect back to Nylas
// Your Nylas app should have a redirect back to your platform






