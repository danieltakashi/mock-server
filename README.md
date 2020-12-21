# Mock Server #
## Observations ###
<i><b>** This still a work in progess</b></i>



## TL;DR; ##

Simply add json files named as the models [as item provided on the URI path] on the ```payloads``` folders, then:
```
$ npm start
```
The server will start on PORT: ```8000```

### Path Structure ###
```
http://localhost:8000/users/2/products/2/brands/
                      │     └── <id>
                      └── [model-name].json
```

### Return Types ###
```
http://localhost:8000/users/2/products/2/brands/
```

**Returns** <u>Array</u> of <u>All</u> _Brands_ 

from [Users]<2> [Products]<2>

```
http://localhost:8000/users/2/products/2/
```

**Returns** <u>object</u> <u>Single Record</u> _Product_ with ```id = 2``` 

from [Users]<2> [Products]<2>

```
http://localhost:8000/users/
```

**Returns** _All_ Users



### File Structure ###
```
.
├── README.md
├── bin
│   └── www
├── package.json
├── payloads
│   ├── brands.json
│   ├── cache
│   │   └── brands.json
│   ├── products.json
│   └── users.json
└── src
    ├── app.js
    ├── controller
    │   ├── get.controller.js
    │   └── post.controller.js
    ├── lib
    │   └── dataHandler.js
    └── routes
        └── index.js
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