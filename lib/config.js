module.exports = {
    jwtSecret: process.env.JWT_SECRET_KEY,
    sessionSecret: process.env.SESSION_SECRET,
    port: process.env.PORT || process.env.STANDART_PORT,
    dbUri: process.env.MONGO_URI,
    localDb: process.env.MONGO_LOCALHOST,
    saltValue: process.env.BCRYPT_SALT_VAL
}