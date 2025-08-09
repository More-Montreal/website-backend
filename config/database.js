const path = require('path');
const parsePG = require('pg-connection-string').parse;

module.exports = ({ env }) => {
    if (env('NODE_ENV') === 'development' && env('DATABASE_URL') === undefined) {
        return {
            connection: {
                client: 'sqlite',
                connection: {
                    filename: path.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
                },
                useNullAsDefault: true,
            },
        }
    }

    const config = parsePG(env('DATABASE_URL'));
    return {
        connection: {
            client: 'postgres',
            connection: {
                host: config.host,
                port: config.port,
                database: config.database,
                user: config.user,
                password: config.password,
                ssl: {
                    rejectUnauthorized: false
                }
            }
        }
    }
};
    