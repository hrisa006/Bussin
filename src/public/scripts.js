let map, infoWindow;

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function initMap() {
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
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
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

      return distance <= 500;
    });

    const stopsList = document.getElementById("stops-list");
    stopsList.innerHTML = stops
      .map(
        (stop) => `<li>${stop.name} - Routes: ${stop.routes.join(", ")}</li>`
      )
      .join("");

    const stopSelect = document.getElementById("stop");
    stopSelect.innerHTML = stops
      .map((stop) => `<option value="${stop.id}">${stop.name}</option>`)
      .join("");

    const uniqueRoutes = new Set();
    stops.forEach((stop) => {
      stop.routes.forEach((route) => uniqueRoutes.add(route));
    });

    const routeSelect = document.getElementById("route");
    routeSelect.innerHTML = Array.from(uniqueRoutes)
      .map((route) => `<option value="${route}">${route}</option>`)
      .join("");

    stops.forEach((stop) => {
      new AdvancedMarkerElement({
        position: { lat: stop.lat, lng: stop.lng },
        map: map,
        title: stop.name,
      });
    });
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
