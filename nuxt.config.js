export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Visualization - COVID-19 Forecast Hub',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }
    ],
    script: [
      { src: '/analytics.js' },
      { src: 'https://secure.statcounter.com/counter/counter.js', async: true }
    ],
    noscript: [
      {
        innerHTML: '<div class="statcounter"><a title="web stats" href="https://statcounter.com/" target="_blank"><img class="statcounter" src="https://c.statcounter.com/12239903/0/3c7ad044/1/" alt="web stats" referrerPolicy="no-referrer-when-downgrade"></a></div>',
        body: true
      }
    ],
    __dangerouslyDisableSanitizers: ['noscript']
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '@/plugins/vue-plotly', mode: 'client' }
    // '~plugins/vuevega.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'bootstrap-vue/nuxt'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend: function (config, {isDev, isClient}) {
      config.node = {
        fs: 'empty'
      };
    }
  }
}
