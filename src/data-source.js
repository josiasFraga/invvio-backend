require('reflect-metadata');
const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ["dist/**/*.entity.js"], // Aponta para os arquivos compilados
  migrations: ["dist/migrations/*.js"], // Aponta para as migrações compiladas
  migrationsTableName: "migrations",
  synchronize: false,
  //timezone: 'America/Sao_Paulo', // Define o fuso horário
  logging: ['query', 'error'],
});

module.exports = AppDataSource;
