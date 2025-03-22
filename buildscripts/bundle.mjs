import { build } from "esbuild";
import https from "node:https";
import http from "node:http";

let httpPlugin = {
  name: 'http',
  setup(build) {
    // Intercept import paths starting with "http:" and "https:" so
    // esbuild doesn't attempt to map them to a file system location.
    // Tag them with the "http-url" namespace to associate them with
    // this plugin.
    build.onResolve({ filter: /^https?:\/\// }, args => ({
      path: args.path,
      namespace: 'http-url',
    }))

    // We also want to intercept all import paths inside downloaded
    // files and resolve them against the original URL. All of these
    // files will be in the "http-url" namespace. Make sure to keep
    // the newly resolved URL in the "http-url" namespace so imports
    // inside it will also be resolved as URLs recursively.
    build.onResolve({ filter: /.*/, namespace: 'http-url' }, args => ({
      path: new URL(args.path, args.importer).toString(),
      namespace: 'http-url',
    }))

    // When a URL is loaded, we want to actually download the content
    // from the internet. This has just enough logic to be able to
    // handle the example import from unpkg.com but in reality this
    // would probably need to be more complex.
    build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
      let [contents, loader] = await new Promise((resolve, reject) => {
        function fetch(url) {
          console.log(`Downloading: ${url}`)
          let lib = url.startsWith('https') ? https : http
          let req = lib.get(url, res => {
            if ([301, 302, 307].includes(res.statusCode)) {
              fetch(new URL(res.headers.location, url).toString())
              req.abort()
            } else if (res.statusCode === 200) {
              let chunks = []
              let loader = url.match(/fonts.googleapi/) ? 'css' : url.match(/[ttf|woff|eot]|$/) ? 'binary' : 'js'
              res.on('data', chunk => chunks.push(chunk))
              res.on('end', () => resolve([Buffer.concat(chunks), loader]))
            } else {
              reject(new Error(`GET ${url} failed: status ${res.statusCode}`))
            }
          }).on('error', reject)
        }
        fetch(args.path)
      })
      return { contents, loader }
    })
  },
}


await build({
    entryPoints: [`${import.meta.dirname}/../theme/static/js/main.js`],
    bundle: true,
    format: 'esm',
    minify: true,
    metafile: true,
    outfile: `${import.meta.dirname}/../theme/static/js/packed.js`,
})

await build({
    entryPoints: [`${import.meta.dirname}/../theme/static/css/style.css`,
        `${import.meta.dirname}/../theme/static/css/index.css`
    ],
    bundle: true,
    minify: true,
    loader: {
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
        '.eot': 'dataurl',
        '.ttf': 'dataurl',
        '.svg': 'dataurl',
    },
    // plugins: [ httpPlugin ],
    outdir: `${import.meta.dirname}/../theme/static/css/min/`,
})