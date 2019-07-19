"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VehicleArrivalSchema = new mongoose_1.default.Schema({
    vehicleReg: { type: String, required: true, trim: true },
    vehicleId: { type: String, required: true, trim: true },
    landmarkId: { type: String, required: true, trim: true },
    landmarkName: { type: String, required: true },
    position: { type: Map, required: true },
    dateArrived: { type: String, required: true, default: new Date().toISOString() },
    vehicleType: { type: {}, required: true },
    created: { type: String, required: true, default: new Date().toISOString() },
});
const VehicleArrival = mongoose_1.default.model('VehicleArrival', VehicleArrivalSchema);
exports.default = VehicleArrival;
//# sourceMappingURL=vehicle_arrival.js.map