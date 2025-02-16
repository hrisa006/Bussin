let map, infoWindow;

function getDistance(lat1, lng1, lat2, lng2) {
  const dx = lat2 - lat1;
  const dy = lng2 - lng1;

  return Math.hypot(dx, dy) * 111.32;
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 42.698334, lng: 23.319941 },
    zoom: 13,
  });

  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Location found.");
          infoWindow.open(map);
          map.setCenter(pos);

          findNearbyStops(pos.lat, pos.lng);
        },
        (error) => {
          console.error("Error while getting the location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  });
}

async function findNearbyStops(userLat, userLng) {
  try {
    const response = await fetch("/transport/stops", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error while searching for the stops");
    }

    const stops = await response.json();
    const stopsInRange = stops.filter((stop) => {
      const distance = getDistance(userLat, userLng, stop.lat, stop.lng);

      return distance <= 4;
    });

    const stopsList = document.getElementById("stops-list");
    stopsList.innerHTML = stopsInRange
      .map(
        (stop) => `<li>${stop.name} - Routes: ${stop.routes.join(", ")}</li>`
      )
      .join("");

    const stopSelect = document.getElementById("stop");
    stopSelect.innerHTML = stopsInRange
      .map((stop) => `<option value="${stop.id}">${stop.name}</option>`)
      .join("");

    const uniqueRoutes = new Set();
    stopsInRange.forEach((stop) => {
      stop.routes.forEach((route) => uniqueRoutes.add(route));
    });

    const routeSelect = document.getElementById("route");
    routeSelect.innerHTML = Array.from(uniqueRoutes)
      .map((route) => `<option value="${route}">${route}</option>`)
      .join("");

  } catch (error) {
    console.error("Error while searching for the stops:", error);
  }
}

async function getRouteSchedule(routeNum) {
  try {
    const response = await fetch(`transport/routes/${routeNum}/schedule`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch route schedule");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return null;
  }
}

function findNextArrivalTime(schedule, stopName) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  for (const direction of schedule) {
    for (const stop of direction.stops) {
      if (stop.name === stopName) {
        for (const time of stop.times) {
          const [hour, minute] = time.split(":").map(Number);
          if (
            hour > currentHour ||
            (hour === currentHour && minute > currentMinute)
          ) {
            return { hour, minute };
          }
        }
      }
    }
  }

  return null;
}

async function predictArrivalTime(stopName, routeNum, minutesBefore) {
  const schedule = await getRouteSchedule(routeNum);
  if (!schedule) {
    alert("Failed to fetch route schedule");
    return;
  }

  const nextArrival = findNextArrivalTime(schedule, stopName);

  if (!nextArrival) {
    alert(`There are no more buses on route №${routeNum} for today.`);
    return;
  }

  const now = new Date();
  const minutesLeft =
    (nextArrival.hour - now.getHours()) * 60 +
    (nextArrival.minute - now.getMinutes());

  if (minutesLeft > minutesBefore) {
    setTimeout(() => {
      alert(
        `Bus №${routeNum} will arrive to "${stopName}" after ${minutesBefore} minutes (${now.getHours()}:${String(
          now.getMinutes() + minutesBefore
        ).padStart(2, "0")}).`
      );
    }, (minutesLeft - minutesBefore) * 60000);
    console.log(minutesLeft, minutesBefore);
  } else {
    alert(
      `Bus №${routeNum} will arrive to "${stopName}" after ${minutesLeft} minutes (${
        nextArrival.hour
      }:${String(nextArrival.minute).padStart(2, "0")}).`
    );
  }
}

document
  .getElementById("notification-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const stopSelect = document.getElementById("stop");
    const stopName = stopSelect.selectedOptions[0].text;
    const routeNum = document.getElementById("route").value;
    const minutesBefore = parseInt(
      document.getElementById("minutes").value,
      10
    );

    predictArrivalTime(stopName, routeNum, minutesBefore);
  });

window.initMap = initMap;
