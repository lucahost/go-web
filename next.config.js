const prod = process.env.NODE_ENV === 'production'

const withPWA = require('next-pwa')({
    dest: 'public',
    disable: prod ? false : true,
})

const settings = withPWA({
    devIndicators: {
        buildActivity: false,
    },
})

module.exports = settings
