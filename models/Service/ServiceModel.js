const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  image: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    trim: true,
  },
  timeInterval: {
    type: Number,
    required: [true, "Time intervals are required"],
    trim: true,
  },

  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceType",
    required: [true, "Type is required"],
    trim: true,
  },

  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialist",
    trim: true,
  },

  specialistName:{
    type:String
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    // required: [true, "Business Id is required"],
  },
  timeSlots: {
    type: [
      {
        day: String,
        startTime: String,
        endTime: String,
        active: Boolean,
      },
    ],
    required: [true, "TimeSlots is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  deletedAt: {
    type: Date,
  },
  active: {
    type: String,
    default: true,
  },
});

module.exports = mongoose.model("Service", serviceSchema);

