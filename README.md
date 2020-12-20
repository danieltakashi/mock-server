# Mock Server #
## Observations ###
<i><b>** This still a work in progess</b></i>



## TL;DR; ##

Simply add json files named as the models [as item provided on the URI path] on the ```payloads``` folders, then:
```
$ npm start
```
The server will start on PORT: ```8000```



### File Structure ###
```
.
├── README.md
├── app.js
├── bin
│   └── www
├── package.json
├── payloads
│   ├── brands.json
│   ├── cache
│   ├── products.json
│   └── users.json
└── routes
    ├── main.js
    └── users.js
```



### Dummy Models & File Alterations ###

```
.
├── payloads
│   ├── [model-name].json
│   ├── cache
│   │   └── [model-name-diff].json
```

JSON files named <b>```[model-name]```</b>.json should be placed in the ```payloads``` folder.

Any alterations on the provided data will be placed in the ```cache``` folder.

On the ```POST / PUT / DELETE``` requests, ```model-name-diff].json``` will be updated.
On the next ```GET``` request, the ```[model-name].json``` will be loaded and updated with ```model-name-diff].json``` and then the payload will be provided.