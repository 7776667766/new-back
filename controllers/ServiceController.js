const User = require("../models/UserModel");
const Business = require("../models/BusinessModal");
const Specialist = require("../models/SpecialistModel");
const Service = require("../models/Service/ServiceModel");
const ServiceType = require("../models/Service/ServiceTypeModel");
const validator = require("validator");
require("dotenv").config();

const addServiceTypeApi = async (req, res, next) => {
  try {
    if (req.user === undefined) {
      return res.status(400).json({ status: "error", message: "Invalid user" });
    }
    const { id } = req.user;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role === "user") {
      return res.status(400).json({
        status: "error",
        message: "You are not authorized to add service type",
      });
    }

    const isServiceTypeExist = await ServiceType.findOne({ name });
    if (isServiceTypeExist) {
      return res.status(400).json({
        status: "error",
        message: "Service type already exists",
      });
    }

    const newService = await ServiceType.create({
      name,
      createdBy: id,
    });

    res.status(200).json({
      status: "success",
      data: {
        id: newService._id,
        name: newService.name,
      },
      message: "Service type added successfully",
    });
  } catch (error) {
    console.log("Error in add service type", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getAllServicesTypeApi = async (req, res, next) => {
  try {
    const serviceTypes = await ServiceType.find().select({
      _id: 0,
      name: 1,
      id: {
        $toString: "$_id",
      },
    });
    res.status(200).json({
      status: "success",
      data: serviceTypes,
    });
  } catch (error) {
    console.log("Error in getting all service types", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const addServiceApi = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send("No image file uploaded");
    }

    const { id } = req.user;
    const {
      name,
      description,
      price,
      typeId,
      specialistId,
      timeInterval,
      businessId,
      timeSlots,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !typeId ||
      !specialistId ||
      !timeInterval ||
      !businessId ||
      !timeSlots
    ) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    if (!validator.isMongoId(typeId)) {
      return res.status(400).json({
        status: "error",
        message: "Type is invalid",
      });
    }

    if (!validator.isMongoId(specialistId)) {
      return res.status(400).json({
        status: "error",
        message: "Specialist is invalid",
      });
    }

    if (!validator.isMongoId(businessId)) {
      return res.status(400).json({
        status: "error",
        message: "Business is invalid",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role !== "owner") {
      return res.status(400).json({
        status: "error",
        message: "You are not authorized to add service",
      });
    }

    const isServiceTypeExist = await ServiceType.findById(typeId);
    if (!isServiceTypeExist) {
      return res.status(400).json({
        status: "error",
        message: "Service type does not exists",
      });
    }

    const isSpecialistExist = await Specialist.findById(specialistId);
    if (!isSpecialistExist) {
      return res.status(400).json({
        status: "error",
        message: "Specialist does not exists",
      });
    }

    const isBusinessExist = await Business.findById(businessId);
    if (!isBusinessExist) {
      return res.status(400).json({
        status: "error",
        message: "Business does not exists",
      });
    }

    const data = await Service.create({
      name,
      description,
      image: req.file.path,
      price,
      typeId,
      specialistId,
      timeInterval,
      businessId,
      timeSlots,
      ownerId: id,
    });

    const myService = await getServiceData(data);

    res.status(200).json({
      status: "success",
      data: myService,
      message: "Service added successfully",
    });
  } catch (error) {
    console.error("Error in creating service", error);

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const updateServiceApi = async (req, res, next) => {
  try {
    if (req.user === undefined) {
      return res.status(400).json({ status: "error", message: "Invalid user" });
    }
    const { serviceId } = req.params;
    const { id } = req.user;
    const { businessId, typeId, specialistId } = req.body;
    if (!serviceId) {
      return res.status(400).json({
        status: "error",
        message: "Service Id is required",
      });
    }

    if (!validator.isMongoId(serviceId)) {
      return res.status(400).json({
        status: "error",
        message: "Service Id is invalid",
      });
    }
    if (typeId) {
      if (!validator.isMongoId(typeId)) {
        return res.status(400).json({
          status: "error",
          message: "Type is invalid",
        });
      }
      const isServiceTypeExist = await ServiceType.findById(typeId);
      if (!isServiceTypeExist) {
        return res.status(400).json({
          status: "error",
          message: "Service type does not exists",
        });
      }
    }
    if (specialistId) {
      if (!validator.isMongoId(specialistId)) {
        return res.status(400).json({
          status: "error",
          message: "Specialist is invalid",
        });
      }
      const isSpecialistExist = await Specialist.findById(specialistId);
      if (!isSpecialistExist) {
        return res.status(400).json({
          status: "error",
          message: "Specialist does not exists",
        });
      }
    }

    if (businessId) {
      if (!validator.isMongoId(businessId)) {
        return res.status(400).json({
          status: "error",
          message: "Business is invalid",
        });
      }
      const isBusinessExist = await Business.findById(businessId);
      if (!isBusinessExist) {
        return res.status(400).json({
          status: "error",
          message: "Business does not exists",
        });
      }
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(400).json({
        status: "error",
        message: "Service not found",
      });
    }
    if (service.ownerId != id) {
      return res.status(400).json({
        status: "error",
        message: "You are not authorized to update this service",
      });
    }
    await Service.updateOne({ _id: serviceId }, req.body);
    res.status(200).json({
      status: "success",
      message: "Service updated successfully",
    });
  } catch (error) {
    console.log("Error in updating service", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getServicesApi = async (req, res, next) => {
  console.log("getServicesApi req.body", req.body);
  try {
    // if (req.user === undefined) {
    //   return res.status(400).json({ status: "error", message: "Invalid user" });
    // }
    // const { id } = req.user;
    // const user = await User.findById(id);
    // if (!user) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "User not found",
    //   });
    // }

    const { businessId } = req.body;
    // if (user.role !== "admin") {
    //   if (!businessId) {
    //     return res.status(400).json({
    //       status: "error",
    //       message: "Business Id is required",
    //     });
    //   }
    //   if (!validator.isMongoId(businessId)) {
    //     return res.status(400).json({
    //       status: "error",
    //       message: "Business Id is invalid",
    //     });
    //   }
    // }

    let myServices = [];
    const services = await Service.find(
      {
        businessId,
        // ownerId: id,
        active: true,
      }
      // user.role === "admin"
      //   ? {
      //       active: true,
      //     }
      //   : {
      //       businessId,
      //       ownerId: id,
      //       active: true,
      //     }
    );

    await Promise.all(
      services.map(async (service) => {
        const myServiceData = await getServiceData(service);
        myServices.push(myServiceData);
      })
    );

    res.status(200).json({
      status: "success",
      data: myServices,
    });
  } catch (error) {
    console.log("Error in getting services", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const getServiceDetailByIdApi = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Service Id is required",
      });
    }
    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        status: "error",
        message: "Service Id is invalid",
      });
    }
    const service = await Service.findById(id);
    if (!service) {
      return res.status(400).json({
        status: "error",
        message: "Service not found",
      });
    }
    const myServiceData = await getServiceData(service);
    res.status(200).json({
      status: "success",
      data: myServiceData,
    });
  } catch (error) {
    console.log("Error in getting service detail", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  addServiceTypeApi,
  getAllServicesTypeApi,
  addServiceApi,
  updateServiceApi,
  getServicesApi,
  getServiceDetailByIdApi,
};

const getServiceData = async (data) => {
  const { typeId, specialistId } = data;
  const type = await ServiceType.findById(typeId).select({
    _id: 0,
    name: 1,
    id: {
      $toString: "$_id",
    },
  });
  const specialist = await Specialist.findById(specialistId).select({
    _id: 0,
    name: 1,
    id: {
      $toString: "$_id",
    },
    email: 1,
  });
  const myServiceData = {
    id: data._id,
    name: data.name,
    description: data.description,
    image: process.env.SERVER_URL + data.image,
    price: data.price,
    timeInterval: data.timeInterval,
    type: type,
    specialist: specialist,
    timeSlots: data.timeSlots,
  };
  return myServiceData;
};
