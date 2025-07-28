const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outdir: 'dist',
    loader: {
        '.eot': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.svg': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
        '.webp': 'file'
    },
    assetNames: 'assets/[name]-[hash][ext]',
    publicPath: '/',
    minify: true,
    sourcemap: true
}).catch(() => process.exit(1));
