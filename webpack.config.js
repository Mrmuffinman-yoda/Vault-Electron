module.exports = {
    entry: '/main.js',
    output: {
        path: "/dist",
        filename: 'bundle.js'
    },
    mode: 'development',
   target : 'electron-renderer',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        symlinks: false
    },
}