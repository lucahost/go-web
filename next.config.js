// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require('next-pwa')({
    dest: 'public',
    // put other next-pwa options here
})

const nextConfig = withPWA({
    reactStrictMode: true,
    // put other next js options here
})

export default nextConfig
