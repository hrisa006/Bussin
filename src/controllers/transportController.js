const { where } = require("sequelize");
const { BusRoute, Direction, Stop } = require("../models/transportModel");
const getCoordinates = require("../utils/coordinatesFinder");
const generateSchedule = require("../utils/scheduleGenerator");

const addBusRoute = async (req, res) => {
  const { number, directions } = req.body;
  try {
    const busRoute = await BusRoute.create({ number });
    for (const directionData of directions) {
      const newDirection = await Direction.create({
        name: directionData.name,
        startTime: directionData.startTime,
        endTime: directionData.endTime,
        interval: directionData.interval,
        busRouteId: busRoute.id,
      });

      const schedule = generateSchedule(
        directionData.startTime.padStart(5, "0"),
        directionData.endTime.padStart(5, "0"),
        parseInt(directionData.interval, 10),
        directionData.stops
      );

      await Promise.all(
        directionData.stops.map(async (stop, index) => {
          // using Place API - not very accurate
          const coordinates = await getCoordinates(stop.name);
          if (!coordinates) {
            throw new Error(`Failed locating: ${stop.name}`);
          }
          await Promise.all(
            schedule[index].map(async (time) => {
              await Stop.create({
                name: stop.name,
                time: time,
                lat: coordinates.lat,
                lng: coordinates.lng,
                directionId: newDirection.id,
              });
            })
          );
        })
      );
    }

    res.status(201).send("Bus route created successfully: " + busRoute.number);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const getRoutesByStop = async (req, res) => {
  const { stopName } = req.body;
  if (!stopName) {
    return res.status(400).send("Name of the stop is required");
  }

  try {
    const directions = await Direction.findAll({
      include: [
        {
          model: Stop,
          as: "Stops",
          where: { name: stopName },
          required: true,
        },
        {
          model: BusRoute,
          attributes: ["id", "number"],
        },
      ],
    });

    if (directions.length === 0) {
      return res.status(404).send("No routes found for this stop");
    }

    const routesMap = directions.reduce((acc, direction) => {
      const route = direction.BusRoute;

      if (!acc.has(route.id)) {
        acc.set(route.id, {
          route: { id: route.id, number: route.number },
          directions: [],
        });
      }

      const routeEntry = acc.get(route.id);
      routeEntry.directions.push({
        id: direction.id,
        name: direction.name,
      });

      return acc;
    }, new Map());

    res.json(Array.from(routesMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

const getRouteSchedule = async (req, res) => {
  const { busRouteNum } = req.params;

  if (!busRouteNum) {
    return res.status(400).send("Route number of the bus is required");
  }

  try {
    const route = await BusRoute.findOne({
      where: { number: busRouteNum },
      include: [
        {
          model: Direction,
          as: "Directions",
          include: [{ model: Stop, as: "Stops" }],
        },
      ],
    });
    if (!route) {
      return res.status(404).send("Bus route not found");
    }

    const schedule = route.Directions.map((direction) => ({
      direction: direction.name,
      stops: direction.Stops.reduce((acc, stop) => {
        const existingStop = acc.find((s) => s.name === stop.name);
        existingStop
          ? existingStop.times.push(stop.time)
          : acc.push({ name: stop.name, times: [stop.getTimeFormatted()] });

        return acc;
      }, []),
    }));

    res.json(schedule);
  } catch {
    res.status(500).send();
  }
};

const getStops = async (req, res) => {
  try {
    const stops = await Stop.findAll({
      include: [
        {
          model: Direction,
          include: [
            {
              model: BusRoute,
              attributes: ["number"],
            },
          ],
        },
      ],
    });

    const uniqueStops = {};
    stops.forEach((stop) => {
      const key = `${stop.name}-${stop.lat}-${stop.lng}`;
      if (!uniqueStops[key]) {
        uniqueStops[key] = {
          id: stop.id,
          name: stop.name,
          lat: stop.lat,
          lng: stop.lng,
          routes: new Set(),
        };
      }

      if (stop.Direction && stop.Direction.BusRoute) {
        uniqueStops[key].routes.add(stop.Direction.BusRoute.number);
      }
    });

    const formattedStops = Object.values(uniqueStops).map((stop) => ({
      ...stop,
      routes: Array.from(stop.routes),
    }));

    res.json(formattedStops);
  } catch (err) {
    console.error(err);
    res.status(500).send("Грешка при зареждане на спирките");
  }
};

const getRouteCoordinates = async (req, res) => {
  const { busRouteNum } = req.params;

  if (!busRouteNum) {
    return res.status(400).send("Route number of the bus is required");
  }

  try {
    const route = await BusRoute.findOne({
      where: { number: busRouteNum },
      include: [
        {
          model: Direction,
          as: "Directions",
          include: [{ model: Stop, as: "Stops" }],
        },
      ],
    });
    if (!route) {
      return res.status(404).send("Bus route not found");
    }

    const coordinates = route.Directions[0].Stops.map((stop) => ({
      lat: stop.lat,
      lng: stop.lng,
    }));

    res.json(coordinates);
  } catch {
    res.status(500).send();
  }
};

module.exports = {
  addBusRoute,
  getRoutesByStop,
  getRouteSchedule,
  getStops,
  getRouteCoordinates,
};
