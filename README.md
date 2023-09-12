# Front-end of the "Payments Control" app
MVP of the first Sprint of the graduate program in Software Engineering at PUC-Rio (**MVP Sprint 01**)

Author: Alexandre Alves Marinho

---
## How to run

Just download the project and open the index.html file in your browser.

## External API access
This Frontend is making direct access to an external API that provides monetary exchange rates [https://manage.exchangeratesapi.io/dashboard].
The required access key is embedded in the code, so the usage is transparent to the user.

Attention: However, depending on your browser http protocol configuration, it may not work properly because the free access
key does not provide https security. If your browser is configured to force https connection even when a http connection is
required, then the connection will fail. So please adjust your browser accordingly.
A failure caused by this problem will
Firefox browser has this configuration turned off by default and is the safest alternative.
