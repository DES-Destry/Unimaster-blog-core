module.exports = {
    jwtSecret: process.env.JWT_SECRET_KEY,
    port: process.env.PORT || process.env.STANDART_PORT,
    dbUri: process.env.MONGO_URI,
    localDb: process.env.MONGO_LOCALHOST,
    saltValue: process.env.BCRYPT_SALT_VAL
}