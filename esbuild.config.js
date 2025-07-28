esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outdir: 'dist',
    loader: {
        '.eot': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.svg': 'file'
    }
});
