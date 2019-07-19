"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CommuterStartingLandmarkSchema = new mongoose_1.default.Schema({
    landmarkId: { type: String, required: true },
    landmarkName: { type: String, required: true },
    toLandmarkId: { type: String, required: true },
    toLandmarkName: { type: String, required: true },
    position: { type: Map, required: true },
    userId: { type: String, required: true, trim: true },
    created: { type: String, required: true, default: new Date().toISOString() },
});
const CommuterStartingLandmark = mongoose_1.default.model('CommuterStartingLandmark', CommuterStartingLandmarkSchema);
exports.default = CommuterStartingLandmark;
//# sourceMappingURL=commuter_starting_landmark.js.map