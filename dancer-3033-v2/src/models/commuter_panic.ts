import mongoose from 'mongoose';

const CommuterPanicSchema = new mongoose.Schema(
    {
        active: {type: Boolean, required: true, default: true},
        type: {type: String, required: true},
        locations: {type: Array, required: true},
        commuterPanicId: {type: String, required: true},
        vehicleId: {type: String, required: true},
        vehicleReg: {type: String, required: true},
        userId: {type: String, required: true, trim: true},
        
        created: {type: String, required: true, default: new Date().toISOString()},

    }
);


const CommuterPanic = mongoose.model('CommuterPanic', CommuterPanicSchema);
export default CommuterPanic