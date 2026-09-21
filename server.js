const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

// Store rides temporarily
let rides = [];

let rideId = 1;

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // Customer creates a ride
    socket.on("bookRide", (rideData) => {

        const ride = {
            id: rideId++,
            customerSocket: socket.id,
            customerName: rideData.customerName,
            pickup: rideData.pickup,
            destination: rideData.destination,
            fare: calculateFare(rideData.pickup, rideData.destination),
            status: "Searching for driver",
            driverName: null
        };

        rides.push(ride);

        // Send booking confirmation to customer
        socket.emit("rideCreated", ride);

        // Notify all drivers
        io.emit("newRide", ride);

        console.log("New ride:", ride);
    });


    // Driver accepts ride
    socket.on("acceptRide", (data) => {

        const ride = rides.find(
            (ride) => ride.id === data.rideId
        );

        if (!ride) {
            return;
        }

        ride.driverName = data.driverName;
        ride.driverSocket = socket.id;
        ride.status = "Driver assigned";

        // Notify customer
        io.to(ride.customerSocket).emit(
            "driverAssigned",
            ride
        );

        // Notify driver
        socket.emit("rideAccepted", ride);

        console.log(
            `Ride ${ride.id} accepted by ${data.driverName}`
        );
    });


    // Driver changes ride status
    socket.on("updateRideStatus", (data) => {

        const ride = rides.find(
            (ride) => ride.id === data.rideId
        );

        if (!ride) {
            return;
        }

        ride.status = data.status;

        // Send update to customer
        io.to(ride.customerSocket).emit(
            "rideStatusUpdated",
            ride
        );

        // Send update to driver
        socket.emit(
            "rideStatusUpdated",
            ride
        );
    });


    // Driver sends location
    socket.on("driverLocation", (data) => {

        const ride = rides.find(
            (ride) => ride.id === data.rideId
        );

        if (!ride) {
            return;
        }

        // Send driver location to customer
        io.to(ride.customerSocket).emit(
            "driverLocation",
            {
                latitude: data.latitude,
                longitude: data.longitude
            }
        );
    });


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


// Simple fare calculation
function calculateFare(pickup, destination) {

    // Demo fare
    const baseFare = 50;

    const distance = Math.floor(
        Math.random() * 10
    ) + 1;

    const pricePerKm = 15;

    return baseFare + distance * pricePerKm;
}


server.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
