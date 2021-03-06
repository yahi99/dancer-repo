"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = __importDefault(require("../models/route"));
const log_1 = require("../log");
const uuid = require("uuid");
const mongoose_1 = require("mongoose");
const route_distance_1 = __importDefault(require("../models/route_distance"));
const messaging_1 = __importDefault(require("../helpers/messaging"));
const route_fare_1 = __importDefault(require("../models/route_fare"));
class RouteController {
    routes(app) {
        log_1.log(`🏓    RouteController: 💙  setting up default Route routes ... `);
        /////////
        app.route("/getRoutesByAssociation").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦💦 💦  POST: /getRoutesByAssociation requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const assID = req.body.associationID;
                const now = new Date().getTime();
                log_1.log(`💦 💦 💦 💦 💦 💦 associationID for routes: ☘️☘️ ${assID} ☘️☘️`);
                const result = yield route_1.default.find({ associationID: assID });
                log_1.log(result);
                result.forEach((m) => {
                    if (m.associationID === assID) {
                        log_1.log(`😍 ${m.name} - 😍 - association ${assID} is OK: route: ${m.name} 🍎rawRoutePoints: ${m.rawRoutePoints.length} `);
                        log_1.log(`😍 ${m.name} - 😍 - association ${assID} is OK: route: ${m.name} 🍎routePoints: ${m.routePoints.length} \n\n`);
                    }
                });
                const end = new Date().getTime();
                log_1.log(`🔆🔆🔆 elapsed time: ${end / 1000 - now / 1000} seconds for query. found 😍 ${result.length} routes`);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getRoutes failed'
                });
            }
        }));
        app.route("/getRouteIDsByAssociation").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦💦 💦  POST: /getRouteIDsByAssociation requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const assID = req.body.associationID;
                const now = new Date().getTime();
                log_1.log(`💦 💦 💦 💦 💦 💦 associationID for routes: ☘️☘️ ${assID} ☘️☘️`);
                const result = yield (yield route_1.default.find({ associationID: assID }, { routeID: 1, name: 2 }));
                log_1.log(result);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getRoutes failed'
                });
            }
        }));
        app.route("/getRouteById").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /getRouteById requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            log_1.log(`🧩 🧩 🧩 🧩 🧩 🧩 🍎🍎 EXPENSIVE CALL! 🍎🍎 🧩 🧩 🧩 🧩 🧩 🧩 - RETURNS routePoints `);
            console.log(req.body);
            try {
                const routeID = req.body.routeID;
                const now = new Date().getTime();
                log_1.log(`💦 💦 💦 💦 💦 💦 associationID for routes: ☘️☘️ ${routeID} ☘️☘️`);
                const result = yield route_1.default.findOne({ routeID: routeID });
                log_1.log(result);
                const end = new Date().getTime();
                log_1.log(`🔆🔆🔆 elapsed time: ${end / 1000 - now / 1000} seconds for query. found 😍route`);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getRoutes failed'
                });
            }
        }));
        app.route("/addRoute").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addRoute requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const route = new route_1.default(req.body);
                route.routeID = uuid();
                route.created = new Date().toISOString();
                const result = yield route.save();
                log_1.log(`result ${result}`);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 addRoute failed'
                });
            }
        }));
        app.route("/addRouteFare").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addRouteFare requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const routeFare = new route_fare_1.default(req.body);
                routeFare.created = new Date().toISOString();
                const result = yield routeFare.save();
                log_1.log(`routeFare added to db: ${result}`);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ` 🍎🍎🍎🍎 addRouteFare failed: ${err}`
                });
            }
        }));
        app.route("/addLandmarkFare").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addLandmarkFare requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const routeFare = route_fare_1.default.find({ routeID: req.body.routeID });
                if (!routeFare.landmarkFares) {
                    routeFare.landmarkFares = [];
                }
                routeFare.landmarkFares.push(req.body);
                const result = yield routeFare.save();
                log_1.log(`landmarkFare added to db: ${result}`);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ` 🍎🍎🍎🍎 addLandmarkFare failed: ${err}`
                });
            }
        }));
        app.route("/getRouteFaresByAssociation").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦💦 💦  POST: /getRouteFaresByAssociation requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const assID = req.body.associationID;
                const now = new Date().getTime();
                const result = yield route_fare_1.default.find({ associationID: assID });
                log_1.log(result);
                const end = new Date().getTime();
                log_1.log(`🔆🔆🔆 elapsed time: ${end / 1000 - now / 1000} seconds for query. found 😍 ${result.length} routes`);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ` 🍎🍎🍎🍎 getRouteFaresByAssociation failed: ${err}`
                });
            }
        }));
        app.route("/getRouteFares").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦💦 💦  POST: /getRouteFare requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const routeID = req.body.routeID;
                const now = new Date().getTime();
                const result = yield route_fare_1.default.find({ routeID: routeID });
                log_1.log(result);
                const end = new Date().getTime();
                log_1.log(`🔆🔆🔆 elapsed time: ${end / 1000 - now / 1000} seconds for query`);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ` 🍎🍎🍎🍎 getRouteFare failed: ${err}`
                });
            }
        }));
        app.route("/addRouteDistanceEstimation").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addRouteDistanceEstimation requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                //TODO - should this go to DB????? or just to messaging?
                const estimation = new route_distance_1.default(req.body);
                if (!estimation.vehicle) {
                    throw new Error(`Vehicle missing from estimation`);
                }
                estimation.created = new Date().toISOString();
                yield estimation.save();
                yield messaging_1.default.sendRouteDistanceEstimation(req.body);
                log_1.log(`addRouteDistanceEstimations added  🍎 1 🍎 to database & messaging service`);
                res.status(200).json({
                    message: `Route Distance Estimation FCM message sent`
                });
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: '🍎🍎 addRouteDistanceEstimation failed'
                });
            }
        }));
        app.route("/addRouteDistanceEstimations").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addRouteDistanceEstimations requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                //TODO - should this go to DB????? or just to messaging?
                const list = req.body.estimations;
                let cnt = 0;
                for (const estimate of list) {
                    const estimation = new route_distance_1.default(req.body);
                    if (!estimation.vehicle) {
                        throw new Error(`Vehicle missing from estimation`);
                    }
                    estimation.created = new Date().toISOString();
                    yield estimation.save();
                    yield messaging_1.default.sendRouteDistanceEstimation(estimate);
                    cnt++;
                }
                log_1.log(`addRouteDistanceEstimations added  🍎 ${cnt} 🍎 to database & messaging service`);
                res.status(200).json({
                    message: `Route Distance Estimations: ${cnt} FCM messages sent`
                });
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ` 🍎🍎🍎🍎 addRouteDistanceEstimations failed: ${err}`
                });
            }
        }));
        app.route("/addCalculatedDistances").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addCalculatedDistances requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const route = yield route_1.default.findOne({ routeID: req.body.routeID });
                route.calculatedDistances = req.body.calculatedDistances;
                const result = yield route.save();
                log_1.log(`💙💙 Distances added to route. ${route.calculatedDistances.length} - 🧡💛 ${route.name}`);
                // log(result);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 addCalculatedDistances failed'
                });
            }
        }));
        app.route("/addRoutePoints").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addRoutePoints requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const route = yield route_1.default.findOne({ routeID: req.body.routeID });
                // check clear flag
                if (req.body.clear == true) {
                    route.routePoints = [];
                    yield route.save();
                }
                req.body.routePoints.forEach((p) => {
                    route.routePoints.push(p);
                });
                const result = yield route.save();
                log_1.log(`💙💙 Points added to route: ${route.routePoints.length} - 🧡💛 ${route.name}`);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 addRoutePoints failed'
                });
            }
        }));
        app.route("/addRawRoutePoints").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n💦  POST: /addRawRoutePoints requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const route = yield route_1.default.findOne({ routeID: req.body.routeID });
                if (req.body.clear == true) {
                    route.rawRoutePoints = [];
                    yield route.save();
                }
                req.body.routePoints.forEach((p) => {
                    route.rawRoutePoints.push(p);
                });
                const result = yield route.save();
                log_1.log(`💙💙 Raw Route Points added to route: ${route.rawRoutePoints.length} - 🧡💛 ${route.name}`);
                // log(result);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 addRawRoutePoints failed'
                });
            }
        }));
        app.route("/updateLandmarkRoutePoints").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /updateLandmarkRoutePoints requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const routeID = req.body.routeID;
                const routePoints = req.body.routePoints;
                const route = yield route_1.default.findOne({ routeID: routeID });
                if (!route) {
                    throw new Error('Route not found');
                }
                log_1.log(`🔆🔆🔆 💙 ROUTE: ${route.name} updated. Will update route points ....`);
                for (const routePoint of routePoints) {
                    const mRes = yield route_1.default.updateOne({ "_id": new mongoose_1.Types.ObjectId(route.id), "routePoints.index": routePoint.index }, {
                        $set: {
                            "routePoints.$.landmarkID": routePoint.landmarkID,
                            "routePoints.$.landmarkName": routePoint.landmarkName
                        }
                    });
                    log_1.log(`🔆🔆🔆 routePoint updated. 🍎🍎🍎🍎 sweet!: 💙 ${routePoint.landmarkName}`);
                    console.log(mRes);
                }
                res.status(200).json({
                    message: `${routePoints.length} route points updated for Landmarks`
                });
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 updateLandmarkRoutePoints failed'
                });
            }
        }));
        app.route("/findNearestRoutePoint").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /findNearestRoutePoint requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const now = new Date().getTime();
                const latitude = parseFloat(req.body.latitude);
                const longitude = parseFloat(req.body.longitude);
                const RADIUS = parseFloat(req.body.radiusInKM) * 1000;
                const routeID = req.body.routeID;
                const result = yield route_1.default.find({
                    position: {
                        $near: {
                            $geometry: {
                                coordinates: [longitude, latitude],
                                type: "Point",
                            },
                            $maxDistance: RADIUS,
                        },
                    },
                });
                //// log(result);
                const end = new Date().getTime();
                log_1.log(`🔆🔆🔆 elapsed time: 💙 ${end / 1000 - now / 1000} 💙seconds for query: landmarks found: 🍎 ${result.length} 🍎`);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getLandmarks failed'
                });
            }
        }));
        app.route("/findNearestRoutes").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /findNearestRoutes requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const now = new Date().getTime();
                const latitude = parseFloat(req.body.latitude);
                const longitude = parseFloat(req.body.longitude);
                const RADIUS = parseFloat(req.body.radiusInKM) * 1000;
                const result = yield route_1.default.find({
                    'routePoints.position': {
                        $near: {
                            $geometry: {
                                coordinates: [longitude, latitude],
                                type: "Point",
                            },
                            $maxDistance: RADIUS,
                        }
                    }
                });
                log_1.log(` 🍎🍎🍎🍎 🍎🍎🍎🍎 ROUTES FOUND  🍎🍎🍎🍎 ${result.length}`);
                const end = new Date().getTime();
                log_1.log(`🔆🔆🔆 elapsed time: 💙 ${end / 1000 - now / 1000} 💙seconds for query: routes found: 🍎 ${result.length} 🍎`);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 findNearestRoutes failed'
                });
            }
        }));
        app.route("/updateRoutePoint").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /updateRoutePoint requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const routePoint = req.body;
                if (!routePoint.landmarkID) {
                    throw new Error(`landmarkID is not found in routePoint`);
                }
                if (!routePoint.landmarkName) {
                    throw new Error(`landmarkName is not found in routePoint`);
                }
                if (!routePoint.routeID) {
                    throw new Error(`routeID is not found in routePoint`);
                }
                const route = yield route_1.default.findOne({ routeID: routePoint.routeID });
                const list = [];
                route.routePoints.forEach((p) => {
                    if (p.index === routePoint.index) {
                        list.push(routePoint);
                    }
                    else {
                        list.push(p);
                    }
                });
                route.routePoints = list;
                yield route.save();
                log_1.log(`💙💙 💙💙 💙💙 RoutePoint index: ${routePoint.index} updated on route: 🧡💛 ${route.name}`);
                res.status(200).json({ status: 'OK', message: `RoutePoint index ${routePoint.index} updated route: 🧡💛 ${route.name} - landmark: ${routePoint.landmarkName}` });
            }
            catch (err) {
                console.log(err);
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 updateRoutePoint failed'
                });
            }
        }));
    }
    static fixRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield route_1.default.find();
            let cnt = 0;
            for (const m of list) {
                if (m.associationDetails)
                    m.associationID = m.associationDetails[0].associationID;
                m.associationName = m.associationDetails[0].associationName;
                yield m.save();
                cnt++;
                log_1.log(`❇️❇️❇️ Route #${cnt} updated 🍎 ${m.associationName} 🍎 ${m.name}`);
            }
            return {
                message: `${cnt} routes have been updated`,
            };
        });
    }
}
exports.RouteController = RouteController;
exports.default = RouteController;
//# sourceMappingURL=route_controller.js.map