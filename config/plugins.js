module.exports = ({ env }) => {
    if (env('NODE_ENV') !== 'development') {
        return {
            upload: {
                config: {
                    provider: 'cloudinary',
                    providerOptions: {
                        cloud_name: env('CLOUDINARY_NAME'),
                        api_key: env('CLOUDINARY_KEY'),
                        api_secret: env('CLOUDINARY_SECRET'),
                    },
                    actionOptions: {
                        upload: {},
                        delete: {},
                    },
                },
            }
        }
    } else {
        return {};
    }
};