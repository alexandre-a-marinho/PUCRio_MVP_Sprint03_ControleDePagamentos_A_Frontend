# Front-end of the "Payments Control" app
MVP of the first Sprint of the graduate program in Software Engineering at PUC-Rio (**MVP Sprint 01**)

Author: Alexandre Alves Marinho

---
## External API access
This Frontend is making direct access to an external API that provides monetary exchange rates [https://manage.exchangeratesapi.io/dashboard].
The required access key is embedded in the code, so the usage is transparent to the user.

Attention: However, depending on your browser http protocol configuration, it may not work properly because the free access
key does not provide https security. If your browser is configured to force https connection even when a http connection is
required, then the connection will fail. So please adjust your browser accordingly.
A failure caused by this problem will
Firefox browser has this configuration turned off by default and is the safest alternative.

---
## How to run (development mode)

Just download the project and open the index.html file in your browser.

---
## How to run (Docker mode)

Be sure to have [Docker](https://docs.docker.com/engine/install/) installed and in execution in your machine.

```
$ docker build -t front-paycontrol .
```

Once the image is created, to run the container simply execute, **as administrator**, the following command:

```
$ docker run --rm -p 8080:80 front-paycontrol
```

Once running, to access the Frontend, simply open [http://localhost:8080/#/](http://localhost:8080/#/) in the browser.
