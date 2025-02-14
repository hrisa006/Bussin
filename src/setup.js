const sequelize = require('sequelize');
const sequelizeConfig = require('./config/database.js');

const db = {};

db.sequelizeConfig = sequelizeConfig;

db.sequelize = sequelize;

db.user = require('./models/userModel.js')(sequelize, sequelizeConfig);

// db.token = require('../model/token.model')(sequelize, Sequelize)

module.exports= db;