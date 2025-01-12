import mongoose from "mongoose";
const { Schema } = mongoose;
const subcriptionSchema = new Schema({
    
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subscriber :
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",


        }
    

}, {
    timestamps: true
});
export const Subcription = mongoose.model("Subcription", subcriptionSchema);