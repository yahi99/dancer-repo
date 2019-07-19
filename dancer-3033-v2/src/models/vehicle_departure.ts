import mongoose from 'mongoose';

const VehicleDepartureSchema = new mongoose.Schema(
    {
        vehicleReg: {type: String, required: true, trim: true},
        vehicleId: {type: String, required: true, trim: true},
        landmarkId: {type: String, required: true, trim: true},
        landmarkName: {type: String, required: true},
        position: {type: Map, required: true},
        dateDeparted: {type: String, required: true, default: new Date().toISOString()},
        vehicleType: {type: {}, required: true},
        
        created: {type: String, required: true, default: new Date().toISOString()},

    }
);


const VehicleDeparture = mongoose.model('VehicleDeparture', VehicleDepartureSchema);
export default VehicleDeparture