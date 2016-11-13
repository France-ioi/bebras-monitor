SystemJS.config({
  paths: {
    "github:": "jspm_packages/github/",
    "npm:": "jspm_packages/npm/"
  },
  browserConfig: {
    "baseURL": "/",
    "paths": {
      "bebras-monitor/": "src/"
    }
  },
  nodeConfig: {
    "paths": {
      "bebras-monitor/": "frontend/"
    }
  },
  devConfig: {
    "map": {
      "babel-runtime": "npm:babel-runtime@6.18.0",
      "clean-css": "npm:clean-css@3.4.20",
      "core-js": "npm:core-js@1.2.7",
      "css": "github:systemjs/plugin-css@0.1.32",
      "babel": "npm:babel-core@6.18.2",
      "module": "npm:jspm-nodelibs-module@0.2.0"
    },
    "packages": {
      "npm:amdefine@1.0.1": {
        "map": {}
      },
      "npm:clean-css@3.4.20": {
        "map": {
          "commander": "npm:commander@2.8.1",
          "source-map": "npm:source-map@0.4.4"
        }
      },
      "npm:commander@2.8.1": {
        "map": {
          "graceful-readlink": "npm:graceful-readlink@1.0.1"
        }
      },
      "npm:graceful-readlink@1.0.1": {
        "map": {}
      },
      "npm:source-map@0.4.4": {
        "map": {
          "amdefine": "npm:amdefine@1.0.1"
        }
      },
      "npm:babel-core@6.18.2": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "lodash": "npm:lodash@4.16.6",
          "babel-helpers": "npm:babel-helpers@6.16.0",
          "babel-register": "npm:babel-register@6.18.0",
          "private": "npm:private@0.1.6",
          "babel-generator": "npm:babel-generator@6.18.0",
          "babel-code-frame": "npm:babel-code-frame@6.16.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "debug": "npm:debug@2.3.2",
          "babel-template": "npm:babel-template@6.16.0",
          "babel-traverse": "npm:babel-traverse@6.18.0",
          "babel-types": "npm:babel-types@6.18.0",
          "babylon": "npm:babylon@6.13.1",
          "json5": "npm:json5@0.5.0",
          "convert-source-map": "npm:convert-source-map@1.3.0",
          "slash": "npm:slash@1.0.0",
          "minimatch": "npm:minimatch@3.0.3",
          "path-is-absolute": "npm:path-is-absolute@1.0.1",
          "source-map": "npm:source-map@0.5.6"
        }
      },
      "npm:babel-helpers@6.16.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "babel-template": "npm:babel-template@6.16.0"
        }
      },
      "npm:babel-register@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "core-js": "npm:core-js@2.4.1",
          "lodash": "npm:lodash@4.16.6",
          "babel-core": "npm:babel-core@6.18.2",
          "home-or-tmp": "npm:home-or-tmp@2.0.0",
          "source-map-support": "npm:source-map-support@0.4.6",
          "mkdirp": "npm:mkdirp@0.5.1"
        }
      },
      "npm:babel-generator@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "lodash": "npm:lodash@4.16.6",
          "source-map": "npm:source-map@0.5.6",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-types": "npm:babel-types@6.18.0",
          "detect-indent": "npm:detect-indent@4.0.0",
          "jsesc": "npm:jsesc@1.3.0"
        }
      },
      "npm:babel-messages@6.8.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0"
        }
      },
      "npm:babel-template@6.16.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "lodash": "npm:lodash@4.16.6",
          "babylon": "npm:babylon@6.13.1",
          "babel-traverse": "npm:babel-traverse@6.18.0",
          "babel-types": "npm:babel-types@6.18.0"
        }
      },
      "npm:babel-traverse@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "debug": "npm:debug@2.3.2",
          "lodash": "npm:lodash@4.16.6",
          "babel-code-frame": "npm:babel-code-frame@6.16.0",
          "babel-messages": "npm:babel-messages@6.8.0",
          "babel-types": "npm:babel-types@6.18.0",
          "babylon": "npm:babylon@6.13.1",
          "invariant": "npm:invariant@2.2.1",
          "globals": "npm:globals@9.13.0"
        }
      },
      "npm:babel-types@6.18.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.18.0",
          "lodash": "npm:lodash@4.16.6",
          "to-fast-properties": "npm:to-fast-properties@1.0.2",
          "esutils": "npm:esutils@2.0.2"
        }
      },
      "npm:babel-code-frame@6.16.0": {
        "map": {
          "chalk": "npm:chalk@1.1.3",
          "js-tokens": "npm:js-tokens@2.0.0",
          "esutils": "npm:esutils@2.0.2"
        }
      },
      "npm:source-map-support@0.4.6": {
        "map": {
          "source-map": "npm:source-map@0.5.6"
        }
      },
      "npm:detect-indent@4.0.0": {
        "map": {
          "repeating": "npm:repeating@2.0.1"
        }
      },
      "npm:home-or-tmp@2.0.0": {
        "map": {
          "os-homedir": "npm:os-homedir@1.0.2",
          "os-tmpdir": "npm:os-tmpdir@1.0.2"
        }
      },
      "npm:mkdirp@0.5.1": {
        "map": {
          "minimist": "npm:minimist@0.0.8"
        }
      },
      "npm:repeating@2.0.1": {
        "map": {
          "is-finite": "npm:is-finite@1.0.2"
        }
      },
      "npm:is-finite@1.0.2": {
        "map": {
          "number-is-nan": "npm:number-is-nan@1.0.1"
        }
      }
    }
  },
  transpiler: "plugin-babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ],
    "plugins": [
      "babel-plugin-transform-react-jsx"
    ],
    "blacklist": []
  },
  sassPluginOptions: {
    "sassOptions": {
      "precision": 8
    }
  },
  map: {
    "babel-plugin-transform-react-jsx": "npm:babel-plugin-transform-react-jsx@6.8.0",
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.17"
  },
  packages: {
    "bebras-monitor": {
      "main": "index.js"
    },
    "npm:babel-plugin-transform-react-jsx@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.18.0",
        "babel-helper-builder-react-jsx": "npm:babel-helper-builder-react-jsx@6.18.0",
        "babel-plugin-syntax-jsx": "npm:babel-plugin-syntax-jsx@6.18.0"
      }
    },
    "npm:babel-helper-builder-react-jsx@6.18.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.18.0",
        "babel-types": "npm:babel-types@6.18.0",
        "esutils": "npm:esutils@2.0.2",
        "lodash": "npm:lodash@4.16.6"
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "buffer": "npm:jspm-nodelibs-buffer@0.2.0",
    "child_process": "npm:jspm-nodelibs-child_process@0.2.0",
    "constants": "npm:jspm-nodelibs-constants@0.2.0",
    "crypto": "npm:jspm-nodelibs-crypto@0.2.0",
    "domain": "npm:jspm-nodelibs-domain@0.2.0",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "fs": "npm:jspm-nodelibs-fs@0.2.0",
    "graceful-fs": "npm:graceful-fs@4.1.10",
    "http": "npm:jspm-nodelibs-http@0.2.0",
    "https": "npm:jspm-nodelibs-https@0.2.1",
    "os": "npm:jspm-nodelibs-os@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.1",
    "process": "npm:jspm-nodelibs-process@0.2.0",
    "querystring": "npm:jspm-nodelibs-querystring@0.2.0",
    "stream": "npm:jspm-nodelibs-stream@0.2.0",
    "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
    "url": "npm:jspm-nodelibs-url@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.1",
    "vm": "npm:jspm-nodelibs-vm@0.2.0",
    "zlib": "npm:jspm-nodelibs-zlib@0.2.0",
    "bootstrap-sass": "npm:bootstrap-sass@3.3.7",
    "classnames": "npm:classnames@2.2.5",
    "epic-component": "npm:epic-component@0.3.1",
    "epic-linker": "npm:epic-linker@1.0.5",
    "font-awesome": "npm:font-awesome@4.7.0",
    "lodash": "npm:lodash@4.16.6",
    "react": "npm:react@15.3.2",
    "react-bootstrap": "npm:react-bootstrap@0.30.6",
    "react-dom": "npm:react-dom@15.3.2",
    "react-redux": "npm:react-redux@4.4.5",
    "redux": "npm:redux@3.6.0",
    "redux-saga": "npm:redux-saga@0.12.1",
    "scss": "github:mobilexag/plugin-sass@0.5.0",
    "superagent": "npm:superagent@2.3.0"
  },
  packages: {
    "npm:asn1.js@4.9.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:bn.js@4.11.6": {
      "map": {}
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "buffer-xor": "npm:buffer-xor@1.0.3",
        "cipher-base": "npm:cipher-base@1.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "inherits": "npm:inherits@2.0.3",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "des.js": "npm:des.js@1.0.0",
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "elliptic": "npm:elliptic@6.3.2",
        "inherits": "npm:inherits@2.0.3",
        "parse-asn1": "npm:parse-asn1@5.0.0"
      }
    },
    "npm:browserify-zlib@0.1.4": {
      "map": {
        "pako": "npm:pako@0.2.9",
        "readable-stream": "npm:readable-stream@2.2.1"
      }
    },
    "npm:buffer-xor@1.0.3": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:cipher-base@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.2"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "inherits": "npm:inherits@2.0.3",
        "ripemd160": "npm:ripemd160@1.0.1",
        "sha.js": "npm:sha.js@2.4.8"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "inherits": "npm:inherits@2.0.3",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0",
        "randombytes": "npm:randombytes@2.0.3",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:domain-browser@1.1.7": {
      "map": {}
    },
    "npm:elliptic@6.3.2": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.6",
        "hash.js": "npm:hash.js@1.0.3",
        "inherits": "npm:inherits@2.0.3",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.6"
      }
    },
    "npm:pako@0.2.9": {
      "map": {}
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "asn1.js": "npm:asn1.js@4.9.0",
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:pbkdf2@3.0.9": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "create-hash": "npm:create-hash@1.1.2",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:randombytes@2.0.3": {
      "map": {}
    },
    "npm:ripemd160@1.0.1": {
      "map": {}
    },
    "npm:sha.js@2.4.8": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:jspm-nodelibs-stream@0.2.0": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.1"
      }
    },
    "npm:jspm-nodelibs-http@0.2.0": {
      "map": {
        "http-browserify": "npm:stream-http@2.5.0"
      }
    },
    "npm:jspm-nodelibs-buffer@0.2.0": {
      "map": {
        "buffer-browserify": "npm:buffer@4.9.1"
      }
    },
    "npm:stream-http@2.5.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.1",
        "builtin-status-codes": "npm:builtin-status-codes@2.0.0",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "xtend": "npm:xtend@4.0.1"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "ieee754": "npm:ieee754@1.1.8",
        "isarray": "npm:isarray@1.0.0",
        "base64-js": "npm:base64-js@1.2.0"
      }
    },
    "npm:jspm-nodelibs-string_decoder@0.2.0": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:jspm-nodelibs-crypto@0.2.0": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:jspm-nodelibs-os@0.2.0": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:jspm-nodelibs-domain@0.2.0": {
      "map": {
        "domain-browserify": "npm:domain-browser@1.1.7"
      }
    },
    "npm:jspm-nodelibs-zlib@0.2.0": {
      "map": {
        "zlib-browserify": "npm:browserify-zlib@0.1.4"
      }
    },
    "github:mobilexag/plugin-sass@0.5.0": {
      "map": {
        "autoprefixer": "npm:autoprefixer@6.5.3",
        "css-asset-copier": "npm:css-asset-copier@1.0.2",
        "css-url-rewriter-ex": "npm:css-url-rewriter-ex@1.0.6",
        "lodash": "npm:lodash@4.16.6",
        "postcss": "npm:postcss@5.2.5",
        "reqwest": "github:ded/reqwest@2.0.5",
        "sass.js": "npm:sass.js@0.9.13",
        "url": "npm:jspm-nodelibs-url@0.2.0",
        "path": "npm:jspm-nodelibs-path@0.2.0",
        "fs": "npm:jspm-nodelibs-fs@0.2.0"
      }
    },
    "npm:asap@2.0.5": {
      "map": {}
    },
    "npm:async@1.5.2": {
      "map": {}
    },
    "npm:autoprefixer@6.5.3": {
      "map": {
        "browserslist": "npm:browserslist@1.4.0",
        "caniuse-db": "npm:caniuse-db@1.0.30000580",
        "normalize-range": "npm:normalize-range@0.1.2",
        "num2fraction": "npm:num2fraction@1.2.2",
        "postcss": "npm:postcss@5.2.5",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:babel-runtime@6.18.0": {
      "map": {
        "core-js": "npm:core-js@2.4.1",
        "regenerator-runtime": "npm:regenerator-runtime@0.9.6"
      }
    },
    "npm:bootstrap-sass@3.3.7": {
      "map": {}
    },
    "npm:brace-expansion@1.1.6": {
      "map": {
        "balanced-match": "npm:balanced-match@0.4.2",
        "concat-map": "npm:concat-map@0.0.1"
      }
    },
    "npm:browserslist@1.4.0": {
      "map": {
        "caniuse-db": "npm:caniuse-db@1.0.30000580",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:buffer-shims@1.0.0": {
      "map": {}
    },
    "npm:chalk@1.1.3": {
      "map": {
        "ansi-styles": "npm:ansi-styles@2.2.1",
        "escape-string-regexp": "npm:escape-string-regexp@1.0.5",
        "has-ansi": "npm:has-ansi@2.0.0",
        "strip-ansi": "npm:strip-ansi@3.0.1",
        "supports-color": "npm:supports-color@2.0.0"
      }
    },
    "npm:combined-stream@1.0.5": {
      "map": {
        "delayed-stream": "npm:delayed-stream@1.0.0"
      }
    },
    "npm:core-js@1.2.7": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:core-js@2.4.1": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:core-util-is@1.0.2": {
      "map": {}
    },
    "npm:css-asset-copier@1.0.2": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.18.0",
        "fs-extra": "npm:fs-extra@0.30.0"
      }
    },
    "npm:css-url-rewriter-ex@1.0.6": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.18.0"
      }
    },
    "npm:debug@2.3.2": {
      "map": {
        "ms": "npm:ms@0.7.2"
      }
    },
    "npm:delayed-stream@1.0.0": {
      "map": {}
    },
    "npm:encoding@0.1.12": {
      "map": {
        "iconv-lite": "npm:iconv-lite@0.4.13"
      }
    },
    "npm:epic-component@0.3.1": {
      "map": {
        "react": "npm:react@15.3.2"
      }
    },
    "npm:fbjs@0.8.6": {
      "map": {
        "core-js": "npm:core-js@1.2.7",
        "isomorphic-fetch": "npm:isomorphic-fetch@2.2.1",
        "loose-envify": "npm:loose-envify@1.3.0",
        "object-assign": "npm:object-assign@4.1.0",
        "promise": "npm:promise@7.1.1",
        "ua-parser-js": "npm:ua-parser-js@0.7.11"
      }
    },
    "npm:font-awesome@4.7.0": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.32"
      }
    },
    "npm:form-data@1.0.0-rc4": {
      "map": {
        "async": "npm:async@1.5.2",
        "combined-stream": "npm:combined-stream@1.0.5",
        "mime-types": "npm:mime-types@2.1.12"
      }
    },
    "npm:formidable@1.0.17": {
      "map": {}
    },
    "npm:fs-extra@0.30.0": {
      "map": {
        "graceful-fs": "npm:graceful-fs@4.1.10",
        "jsonfile": "npm:jsonfile@2.4.0",
        "klaw": "npm:klaw@1.3.1",
        "path-is-absolute": "npm:path-is-absolute@1.0.1",
        "rimraf": "npm:rimraf@2.5.4"
      }
    },
    "npm:fs.realpath@1.0.0": {
      "map": {}
    },
    "npm:glob@7.1.1": {
      "map": {
        "fs.realpath": "npm:fs.realpath@1.0.0",
        "inflight": "npm:inflight@1.0.6",
        "inherits": "npm:inherits@2.0.3",
        "minimatch": "npm:minimatch@3.0.3",
        "once": "npm:once@1.4.0",
        "path-is-absolute": "npm:path-is-absolute@1.0.1"
      }
    },
    "npm:graceful-fs@4.1.10": {
      "map": {}
    },
    "npm:has-ansi@2.0.0": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:has-flag@1.0.0": {
      "map": {}
    },
    "npm:iconv-lite@0.4.13": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:inflight@1.0.6": {
      "map": {
        "once": "npm:once@1.4.0",
        "wrappy": "npm:wrappy@1.0.2"
      }
    },
    "npm:invariant@2.2.1": {
      "map": {
        "loose-envify": "npm:loose-envify@1.3.0"
      }
    },
    "npm:isomorphic-fetch@2.2.1": {
      "map": {
        "node-fetch": "npm:node-fetch@1.6.3",
        "whatwg-fetch": "npm:whatwg-fetch@1.0.0"
      }
    },
    "npm:js-base64@2.1.9": {
      "map": {}
    },
    "npm:jsonfile@2.4.0": {
      "map": {
        "graceful-fs": "npm:graceful-fs@4.1.10"
      }
    },
    "npm:klaw@1.3.1": {
      "map": {
        "graceful-fs": "npm:graceful-fs@4.1.10"
      }
    },
    "npm:loose-envify@1.3.0": {
      "map": {
        "js-tokens": "npm:js-tokens@2.0.0"
      }
    },
    "npm:mime-db@1.24.0": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:mime-types@2.1.12": {
      "map": {
        "mime-db": "npm:mime-db@1.24.0"
      }
    },
    "npm:mime@1.3.4": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:minimatch@3.0.3": {
      "map": {
        "brace-expansion": "npm:brace-expansion@1.1.6"
      }
    },
    "npm:node-fetch@1.6.3": {
      "map": {
        "encoding": "npm:encoding@0.1.12",
        "is-stream": "npm:is-stream@1.1.0"
      }
    },
    "npm:once@1.4.0": {
      "map": {
        "wrappy": "npm:wrappy@1.0.2"
      }
    },
    "npm:path-is-absolute@1.0.1": {
      "map": {}
    },
    "npm:postcss@5.2.5": {
      "map": {
        "chalk": "npm:chalk@1.1.3",
        "js-base64": "npm:js-base64@2.1.9",
        "source-map": "npm:source-map@0.5.6",
        "supports-color": "npm:supports-color@3.1.2"
      }
    },
    "npm:process-nextick-args@1.0.7": {
      "map": {}
    },
    "npm:promise@7.1.1": {
      "map": {
        "asap": "npm:asap@2.0.5"
      }
    },
    "npm:punycode@1.3.2": {
      "map": {}
    },
    "npm:react-bootstrap@0.30.6": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.18.0",
        "classnames": "npm:classnames@2.2.5",
        "dom-helpers": "npm:dom-helpers@2.4.0",
        "invariant": "npm:invariant@2.2.1",
        "keycode": "npm:keycode@2.1.7",
        "react": "npm:react@15.3.2",
        "react-dom": "npm:react-dom@15.3.2",
        "react-overlays": "npm:react-overlays@0.6.10",
        "react-prop-types": "npm:react-prop-types@0.4.0",
        "uncontrollable": "npm:uncontrollable@4.0.3",
        "warning": "npm:warning@3.0.0"
      }
    },
    "npm:react-dom@15.3.2": {
      "map": {
        "react": "npm:react@15.3.2"
      }
    },
    "npm:react-overlays@0.6.10": {
      "map": {
        "classnames": "npm:classnames@2.2.5",
        "dom-helpers": "npm:dom-helpers@2.4.0",
        "react": "npm:react@15.3.2",
        "react-dom": "npm:react-dom@15.3.2",
        "react-prop-types": "npm:react-prop-types@0.4.0",
        "warning": "npm:warning@3.0.0"
      }
    },
    "npm:react-prop-types@0.4.0": {
      "map": {
        "react": "npm:react@15.3.2",
        "warning": "npm:warning@3.0.0"
      }
    },
    "npm:react-redux@4.4.5": {
      "map": {
        "hoist-non-react-statics": "npm:hoist-non-react-statics@1.2.0",
        "invariant": "npm:invariant@2.2.1",
        "lodash": "npm:lodash@4.16.6",
        "loose-envify": "npm:loose-envify@1.3.0",
        "react": "npm:react@15.3.2",
        "redux": "npm:redux@3.6.0"
      }
    },
    "npm:react@15.3.2": {
      "map": {
        "fbjs": "npm:fbjs@0.8.6",
        "loose-envify": "npm:loose-envify@1.3.0",
        "object-assign": "npm:object-assign@4.1.0"
      }
    },
    "npm:readable-stream@2.2.1": {
      "map": {
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "core-util-is": "npm:core-util-is@1.0.2",
        "inherits": "npm:inherits@2.0.3",
        "isarray": "npm:isarray@1.0.0",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "string_decoder": "npm:string_decoder@0.10.31",
        "util-deprecate": "npm:util-deprecate@1.0.2"
      }
    },
    "npm:redux-saga@0.12.1": {
      "map": {}
    },
    "npm:redux@3.6.0": {
      "map": {
        "lodash": "npm:lodash@4.16.6",
        "lodash-es": "npm:lodash-es@4.16.6",
        "loose-envify": "npm:loose-envify@1.3.0",
        "symbol-observable": "npm:symbol-observable@1.0.4"
      }
    },
    "npm:regenerator-runtime@0.9.6": {
      "map": {}
    },
    "npm:rimraf@2.5.4": {
      "map": {
        "glob": "npm:glob@7.1.1"
      }
    },
    "npm:sass.js@0.9.13": {
      "map": {}
    },
    "npm:source-map@0.5.6": {
      "map": {}
    },
    "npm:string_decoder@0.10.31": {
      "map": {}
    },
    "npm:strip-ansi@3.0.1": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:superagent@2.3.0": {
      "map": {
        "component-emitter": "npm:component-emitter@1.2.1",
        "cookiejar": "npm:cookiejar@2.1.0",
        "debug": "npm:debug@2.3.2",
        "extend": "npm:extend@3.0.0",
        "form-data": "npm:form-data@1.0.0-rc4",
        "formidable": "npm:formidable@1.0.17",
        "methods": "npm:methods@1.1.2",
        "mime": "npm:mime@1.3.4",
        "qs": "npm:qs@6.3.0",
        "readable-stream": "npm:readable-stream@2.2.1",
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:supports-color@2.0.0": {
      "map": {}
    },
    "npm:supports-color@3.1.2": {
      "map": {
        "has-flag": "npm:has-flag@1.0.0"
      }
    },
    "npm:ua-parser-js@0.7.11": {
      "map": {
        "systemjs-json": "github:systemjs/plugin-json@0.1.2"
      }
    },
    "npm:uncontrollable@4.0.3": {
      "map": {
        "invariant": "npm:invariant@2.2.1",
        "react": "npm:react@15.3.2"
      }
    },
    "npm:util-deprecate@1.0.2": {
      "map": {}
    },
    "npm:warning@3.0.0": {
      "map": {
        "loose-envify": "npm:loose-envify@1.3.0"
      }
    },
    "npm:jspm-nodelibs-url@0.2.0": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "punycode": "npm:punycode@1.3.2",
        "querystring": "npm:querystring@0.2.0"
      }
    },
    "npm:epic-linker@1.0.5": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.18.0"
      }
    }
  }
});
