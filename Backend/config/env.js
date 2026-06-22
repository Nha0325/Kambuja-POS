const path = require("path")
const dotenv = require("dotenv")

const backendEnvPath = path.resolve(__dirname, "../.env")

dotenv.config({ path: backendEnvPath, override: true })

const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

process.env.NODE_ENV ||= "development"
process.env.PORT ||= process.env.SERVER_PORT || "8080"
process.env.JWT_LIFETIME ||= `${process.env.JWT_ACCESS_TOKEN_MINUTES || 60}m`
process.env.SUPER_USERNAME = process.env.BOOTSTRAP_ADMIN_MANAGER_NAME || process.env.SUPER_USERNAME
process.env.SUPER_EMAIL = process.env.BOOTSTRAP_ADMIN_MANAGER_EMAIL || process.env.SUPER_EMAIL
process.env.SUPER_PASSWORD = process.env.BOOTSTRAP_ADMIN_MANAGER_PASSWORD || process.env.SUPER_PASSWORD
process.env.COOKIE_EXPIRE ||= "1"
process.env.COOKIE_DOMAIN ||= "localhost"
process.env.COOKIE_SAMESITE ||= "lax"
process.env.LOCAL_DOMAIN ||= corsOrigins[0] || "http://localhost:5173"
process.env.CLIENT_DOMAIN ||= corsOrigins[1] || corsOrigins[0] || "http://localhost:5173"

module.exports = {
    backendEnvPath,
}
