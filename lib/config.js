const { dirname, join } = require('path');
require('dotenv').config({ path: join(dirname(__dirname), '.env') });

module.exports = {
    jwtSecret: process.env.JWT_SECRET_KEY,
    port: process.env.PORT || process.env.STANDART_PORT,
    dbUri: process.env.MONGO_URI,
    localDb: process.env.MONGO_LOCALHOST,
    saltValue: process.env.BCRYPT_SALT_VAL,
    currentHost: process.env.CURRENT_URL,
    smtpLogin: process.env.SMTP_LOGIN,
    smtpPass: process.env.SMTP_PASSWORD,
    blogMail: process.env.BLOG_MAIL,
    avatarPath: join(dirname(__dirname), 'avatars'),
};
