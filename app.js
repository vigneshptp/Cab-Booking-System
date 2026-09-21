const socket = io();

const bookButton =
    document.getElementById("bookButton");

const rideDetails =
    document.getElementById("rideDetails");

const locationBox =
    document.getElementById("locationBox");

let currentRide = null;


// Book ride
bookButton.addEventListener("click", () => {

    const customerName =
        document.getElementById("customerName")
            .value.trim();

    const pickup =
        document.getElementById("pickup")
            .value.trim();

    const destination =
        document.getElementById("destination")
            .value.trim();


    if (!customerName || !pickup || !destination) {

        alert("Please fill all fields.");

        return;
    }


    socket.emit("bookRide", {

        customerName,
        pickup,
        destination

    });

});


// Ride created
socket.on("rideCreated", (ride) => {

    currentRide = ride;

    rideDetails.classList.remove("hidden");

    document.getElementById("rideId")
        .textContent = ride.id;

    document.getElementById("ridePickup")
        .textContent = ride.pickup;

    document.getElementById("rideDestination")
        .textContent = ride.destination;

    document.getElementById("rideFare")
        .textContent = ride.fare;

    document.getElementById("rideStatus")
        .textContent = ride.status;

});


// Driver assigned
socket.on("driverAssigned", (ride) => {

    currentRide = ride;

    document.getElementById("rideStatus")
        .textContent = ride.status;


    document.getElementById("driverDetails")
        .innerHTML = `
            <div class="driver-card">
                <h3>🚗 Driver Assigned</h3>
                <p>
                    Driver:
                    <strong>${ride.driverName}</strong>
                </p>
            </div>
        `;

    locationBox.classList.remove("hidden");

});


// Ride status update
socket.on("rideStatusUpdated", (ride) => {

    document.getElementById("rideStatus")
        .textContent = ride.status;

});


// Driver location
socket.on("driverLocation", (location) => {

    document.getElementById("locationText")
        .textContent =
        `Latitude: ${location.latitude.toFixed(5)}
         | Longitude: ${location.longitude.toFixed(5)}`;

});
