// const bcrypt = require("bcrypt");

// const users = [
//     {
//       username: "Goshko",
//       password: "$2b$10$NBE2rVzaMy7oKiSZZtn38uvJC7SkO3R7wvuo8S7pQ9/sXbOigHYhy",
//     },
//     {
//       username: "Hrisi",
//       password: "$2b$10$bj7IDDJtOrg76lUDhnhsI.jd0pQskP6pTY0j4ttXMvmid.cQv6WES",
//     },
//   ];

const Sequelize = require("sequelize");
const sequelize = require("../config/sequelizeConfig");

module.exports = (sequelize) => {
  sequelize.define("user", {
    username: {
      type: Sequelize.DataTypes.STRING,

      allowNull: false,
      unique: true,
    },

    password: {
      type: Sequelize.DataTypes.STRING,

      allowNull: false,
    },
  });

};
