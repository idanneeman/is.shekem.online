const path = require('path');
let tailwind = path.join(__dirname, 'tailwind.js');

const pkg = require('./package');

module.exports = {
    mode: 'universal',

    serverMiddleware: ['~/server/api'],

    /*
     ** Headers of the page
     */
    head: {
        title: 'האם השק"ם פתוח?',
        meta: [
            { charset: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                hid: 'description',
                name: 'description',
                content: pkg.description
            },
            {
                name: 'apple-mobile-web-app-title',
                content: 'האם השק"ם פתוח?'
            }
        ],
        link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    },

    /*
     ** Customize the progress-bar color
     */
    loading: { color: '#fff' },

    /*
     ** Global CSS
     */
    css: ['~/assets/css/main.css', '~/assets/css/tailwind.css'],

    /*
     ** Plugins to load before mounting the App
     */
    plugins: [],

    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios',
        '@nuxtjs/pwa',

        'nuxt-fontawesome',
        '@nuxtjs/toast'
    ],
    toast: {
        position: 'bottom-center',
        duration: 3 * 1000,
        containerClass: ['rtl-direction'],
        register: [
            {
                name: 'ENTRY_CREATED',
                message: 'מצב השקם דווח בהצלחה!',
                options: {
                    type: 'success'
                }
            },
            {
                name: 'ENTRY_BLOCKED',
                message: 'ניתן לדווח מכל מכשיר רק פעם בחצי שעה',
                options: {
                    type: 'error'
                }
            }
        ]
    },
    fontawesome: {
        component: 'fa',
        imports: [
            {
                set: '@fortawesome/free-solid-svg-icons',
                icons: ['fas']
            }
        ]
    },
    /*
     ** Axios module configuration
     */
    axios: {
        // See https://github.com/nuxt-community/axios-module#options
        proxy: true
    },

    /*
     ** Build configuration
     */
    build: {
        /*
         ** You can extend webpack config here
         */
        extend(config, ctx) {
            // Run ESLint on save
            if (ctx.isDev && ctx.isClient) {
                config.module.rules.push({
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /(node_modules)/,
                    options: {
                        fix: true
                    }
                });
            }
        },
        postcss: {
            plugins: [require('tailwindcss')(tailwind), require('autoprefixer')]
        }
    }
};
