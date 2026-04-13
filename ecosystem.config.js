module.exports = {
    apps: [
        {
            name: "simart-nextjs",
            script: "node_modules/next/dist/bin/next",
            args: "start -p 3000",
            cwd: "/var/www/nextjs/simart-website",
            exec_mode: "cluster",
            instances: "max",
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};

