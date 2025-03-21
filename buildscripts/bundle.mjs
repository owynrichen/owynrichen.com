import { build } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

await build({
    entryPoints: [`${import.meta.dirname}/../theme/static/js/main.js`],
    bundle: true,
    format: 'esm',
    minify: true,
    sourcemap: true,
    loader: {
        '.png': 'dataurl',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
        '.eot': 'dataurl',
        '.ttf': 'dataurl',
        '.svg': 'dataurl',
    },
    // plugins: [
    //     sassPlugin({
    //         type: 'style',
    //         loadPaths: [`${import.meta.dirname}/node_modules`],
    //         quietDeps: true,
    //       }),
    //     {
    //         name: 'webfonts',
    //         setup(build) {
    //             build.onResolve({filter: /gstatic/}, args => {
    //             console.log(args)
    //             })
    //             build.onLoad({filter: /gstatic/}, args => {
    //             console.log(args)
    //             })
    //         }
    //     }
    // ],
    outfile: `${import.meta.dirname}/../theme/static/js/packed.js`,
})

await build({
    entryPoints: [`${import.meta.dirname}/../theme/static/css/style.css`,
        `${import.meta.dirname}/../theme/static/css/index.css`
    ],
    bundle: true,
    minify: true,
    loader: {
        '.png': 'dataurl',
        '.woff': 'dataurl',
        '.woff2': 'dataurl',
        '.eot': 'dataurl',
        '.ttf': 'dataurl',
        '.svg': 'dataurl',
    },
    // plugins: [
    //     sassPlugin({
    //         type: 'style',
    //         loadPaths: [`${import.meta.dirname}/node_modules`],
    //         quietDeps: true,
    //       }),
    //     {
    //         name: 'webfonts',
    //         setup(build) {
    //             build.onResolve({filter: /gstatic/}, args => {
    //             console.log(args)
    //             })
    //             build.onLoad({filter: /gstatic/}, args => {
    //             console.log(args)
    //             })
    //         }
    //     }
    // ],
    outdir: `${import.meta.dirname}/../theme/static/css/min/`,
})