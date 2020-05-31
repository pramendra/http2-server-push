#  NextJS app using Server push

## dev setup
### clone and install npm dependency
```bash
$ git clone git@github.com:pramendra/http2-server-push.git
$ cd http2-server-push
$ npm i
```

### generate certificate 
```bash
$ openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout ssl_server.key -out ssl_server.crt 
```

#### enable chorme setting to test

> copy paste following url in chrome browser
chrome://flags/#allow-insecure-localhost

> Enable 

> relunch

### run the app
```bash
$ npm run build
$ npm run start
```
## debug
> check network tab in inspect 