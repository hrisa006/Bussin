const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BusRoute = sequelize.define("BusRoute", {
  number: {
    type: DataTypes.INTEGER,

    allowNull: false,
    unique: true,
  },
});

const Direction = sequelize.define("Direction", {
  name: {
    type: DataTypes.STRING,

    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,

    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,

    allowNull: false,
  },
  interval: {
    type: DataTypes.INTEGER,

    allowNull: false,
  },
  busRouteId: {
    type: DataTypes.INTEGER,

    allowNull: false,
  },
});

const Stop = sequelize.define("Stop", {
  name: {
    type: DataTypes.STRING,

    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,

    allowNull: false,
  },
  directionId: {
    type: DataTypes.INTEGER,

    allowNull: false,
  },
});

Stop.prototype.getTimeFormatted = function () {
  return this.time.slice(0, 5);
};

BusRoute.hasMany(Direction, { as: "Directions", foreignKey: "busRouteId" });
Direction.belongsTo(BusRoute, { foreignKey: "busRouteId" });
Direction.hasMany(Stop, { as: "Stops", foreignKey: "directionId" });
Stop.belongsTo(Direction, { foreignKey: "directionId" });

module.exports = {
  BusRoute,
  Direction,
  Stop,
};
