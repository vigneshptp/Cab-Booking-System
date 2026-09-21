const socket = io();

const ridesContainer =
    document.getElementById("rides");

const activeRide =
    document.getElementById("activeRide");

let selectedRide = null;


// New ride received
socket.on("newRide", (ride) => {

    addRide(ride);

});


// Add ride to dashboard
function addRide(ride) {

    const emptyMessage =
        ridesContainer.querySelector(".empty");

    if (emptyMessage) {
        emptyMessage.remove();
    }


    const rideElement =
        document.createElement("div");

    rideElement.className = "ride-card";

    rideElement.innerHTML = `

        <h3>🚕 Ride #${ride.id}</h3>

        <p>
            Customer:
            <strong>${ride.customerName}</strong>
        </p>

        <p>
            Pickup:
            ${ride.pickup}
        </p>

        <p>
            Destination:
            ${ride.destination}
        </p>

        <p>
            Fare:
            ₹${ride.fare}
        </p>

        <button>
            Accept Ride
        </button>
    `;


    const button =
        rideElement.querySelector("button");


    button.addEventListener(
        "click",
        () => acceptRide(ride)
    );


    ridesContainer.appendChild(
        rideElement
    );

}


// Accept ride
function acceptRide(ride) {

    const driverName =
        document.getElementById("driverName")
            .value.trim();


    if (!driverName) {

        alert("Enter your driver name first.");

        return;
    }


    selectedRide = ride;


    socket.emit("acceptRide", {

        rideId: ride.id,
        driverName: driverName

    });

}


// Ride accepted
socket.on("rideAccepted", (ride) => {

    selectedRide = ride;

    activeRide.classList.remove("hidden");


    document.getElementById("activeCustomer")
        .textContent = ride.customerName;

    document.getElementById("activePickup")
        .textContent = ride.pickup;

    document.getElementById("activeDestination")
        .textContent = ride.destination;

    document.getElementById("activeStatus")
        .textContent = ride.status;

});


// Update ride status
function updateStatus(status) {

    if (!selectedRide) {

        alert("No active ride.");

        return;
    }


    socket.emit("updateRideStatus", {

        rideId: selectedRide.id,
        status: status

    });

}


// Status updated
socket.on("rideStatusUpdated", (ride) => {

    selectedRide = ride;

    document.getElementById("activeStatus")
        .textContent = ride.status;

});


// Send location
document.getElementById("locationButton")
    .addEventListener("click", () => {

        if (!selectedRide) {

            alert("No active ride.");

            return;
        }


        if (!navigator.geolocation) {

            alert(
                "Geolocation is not supported."
            );

            return;
        }


        navigator.geolocation.getCurrentPosition(
            (position) => {

                socket.emit("driverLocation", {

                    rideId: selectedRide.id,

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude

                });

                alert(
                    "Location sent to customer!"
                );

            },

            () => {

                alert(
                    "Unable to get your location."
                );

            }
        );

    });
