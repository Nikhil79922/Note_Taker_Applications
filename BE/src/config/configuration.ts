export default () => ({
  port: parseInt(<string>process.env.PORT, 10) || 3000,
  database: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET,
});
