import { Request, Response } from "express";
import CommuterRequest from "../models/commuter_request";
import log from '../log';
import moment from 'moment';
import CommuterArrivalLandmark from "../models/commuter_arrival_landmark";
import CommuterPickupLandmark from "../models/commuter_pickup_landmark";
import CommuterStartingLandmark from "../models/commuter_starting_landmark";
import CommuterRating from "../models/commuter_rating";
import CommuterPanic from "../models/commuter_panic";
import CommuterRatingsAggregate from "../models/commuter_ratings_aggregate";
import bodyParser = require("body-parser");
import uuid from 'uuid/v1';
import User from "../models/user";
import CommuterPanicLocation from "../models/commuter_panic_location";
import SafetyNetworkBuddy from "../models/safety_network_buddy";

export class CommuterController {

  public routes(app: any): void {
    console.log(
      `🏓🏓🏓    CommuterController:  💙  setting up default Commuter routes ...`,
    );
    app.route("/addCommuterRequest").post(async (req: Request, res: Response) => {
      const msg = `🌽 POST 🌽🌽 addCommuterRequest requested `;
      console.log(msg);

      try {
        const comm : any= new CommuterRequest(req.body);
        comm.commuterRequestID = uuid();
        comm.created = new Date().toISOString();
        comm.stringTime = new Date().toISOString();
        comm.time = new Date().getTime();
        comm.scanned = false;
        const result = await comm.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterRequest failed'
          }
        )
      }
    });
    app.route("/updateCommuterRequestScanned").post(async (req: Request, res: Response) => {
      const msg = `🌽 POST 🌽🌽 updateCommuterRequestScanned requested `;
      console.log(msg);

      try {
        const commuterRequestID = req.body.commuterRequestID;
        const commReq: any = await CommuterRequest.findOne({commuterRequestID: commuterRequestID});
        if (!commReq) {
          throw new Error('CommuterRequest not found');
        }
        commReq.scanned = req.body.scanned;
        commReq.associationID = req.body.associationID;
        commReq.associationName = req.body.associationName;
        commReq.vehicleID = req.body.vehicleID;
        commReq.vehicleReg = req.body.vehicleReg;
        const result = await commReq.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 updateCommuterRequestScanned failed'
          }
        )
      }
    });
    app.route("/updateCommuterRequestVehicle").post(async (req: Request, res: Response) => {
      const msg = `🌽 POST 🌽🌽 updateCommuterRequestVehicle requested `;
      console.log(msg);

      try {
        const commuterRequestID = req.body.commuterRequestID;
        const commReq: any = await CommuterRequest.findOne({commuterRequestID: commuterRequestID});
        if (!commReq) {
          throw new Error('CommuterRequest not found');
        }
        commReq.associationID = req.body.associationID;
        commReq.associationName = req.body.associationName;
        commReq.vehicleID = req.body.vehicleID;
        commReq.vehicleReg = req.body.vehicleReg;
        const result = await commReq.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 updateCommuterRequestVehicle failed'
          }
        )
      }
    });
    app.route("/updateCommuterRequestAutoDetected").post(async (req: Request, res: Response) => {
      const msg = `🌽 POST 🌽🌽 updateCommuterRequestAutoDetected requested `;
      console.log(msg);

      try {
        const commuterRequestID = req.body.commuterRequestID;
        const commReq: any = await CommuterRequest.findOne({commuterRequestID: commuterRequestID});
        if (!commReq) {
          throw new Error('CommuterRequest not found');
        }
        commReq.autoDetected = req.body.autoDetected;
        commReq.associationID = req.body.associationID;
        commReq.associationName = req.body.associationName;
        commReq.vehicleID = req.body.vehicleID;
        commReq.vehicleReg = req.body.vehicleReg;
        const result = await commReq.save();
        // log(result);

        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 updateCommuterRequestAutoDetected failed'
          }
        )
      }
    });
    app.route("/addCommuterRatingsAggregate").post(async (req: Request, res: Response) => {
      const msg = `🌽 POST 🌽🌽 addCommuterRatingsAggregate requested `;
      console.log(msg);

      try {
        const c: any = new CommuterRatingsAggregate(req.body);
        c.commuterRatingsAggregateID = uuid();
        c.created = new Date().toISOString();
        const result = await c.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterRatingsAggregate failed'
          }
        )
      }
    });
    app.route("/addCommuterArrivalLandmark").post(async (req: Request, res: Response) => {
      const msg = `🌽 POST 🌽🌽 addCommuterArrivalLandmark requested `;
      console.log(msg);

      try {
        const c: any = new CommuterArrivalLandmark(req.body);
        c.commuterArrivalLandmarkID = uuid();
        c.created = new Date().toISOString();
        const result = await c.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        log(err);
        res.status(400).json(
          {
            error: JSON.stringify(err),
            message: ' 🍎🍎🍎🍎 addCommuterArrivalLandmark failed'
          }
        )
      }
    });
    app.route("/addCommuterPickupLandmark").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addCommuterPickupLandmark requested `;
      console.log(msg);

      try {
        const c: any = new CommuterPickupLandmark(req.body);
        c.commuterPickupLandmarkID = uuid();
        c.created = new Date().toISOString();
        const result = await c.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterPickupLandmark failed'
          }
        )
      }
    });
    app.route("/getCommuterPickupLandmarks").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterPickupLandmarks requested `;
      console.log(msg);

      try {
        const minutes = parseInt(req.body.minutes);
        const landmarkID = req.body.landmarkID;
        const cutOff: string = moment().subtract(minutes, "minutes").toISOString();
        const result = await CommuterPickupLandmark.find({
          fromLandmarkID: landmarkID,
          created: {$gt: cutOff}
        });
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterPickupLandmarks failed'
          }
        )
      }
    });
    app.route("/getCommuterArrivalLandmarks").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterArrivalLandmarks requested `;
      console.log(msg);
      log(req.body);

      try {
        const minutes = parseInt(req.body.minutes);
        const landmarkID = req.body.landmarkID;
        const cutOff: string = moment().subtract(minutes, "minutes").toISOString();
        const result = await CommuterArrivalLandmark.find({
          fromLandmarkID: landmarkID,
          created: {$gt: cutOff}
        });
        // log(result);
        res.status(200).json(result);
        log(`\n\n 🍎🍎🍎🍎 getCommuterArrivalLandmarks: found : 🍎🍎🍎🍎 ${result.length} 🍎🍎🍎🍎\n\n`)
      } catch (err) {
        log(err);
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterArrivalLandmarks failed'
          }
        )
      }
    });
    app.route("/getCommuterStartingLandmarks").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterStartingLandmarks requested `;
      console.log(msg);

      try {
        const minutes = parseInt(req.body.minutes);
        const landmarkID = parseInt(req.body.landmarkID);
        const cutOff: string = moment().subtract(minutes, "minutes").toISOString();
        const result = await CommuterStartingLandmark.find({
          landmarkID: landmarkID,
          created: {$gt: cutOff}
        });
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterStartingLandmarks failed'
          }
        )
      }
    });
    app.route("/addCommuterStartingLandmark").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addCommuterStartingLandmark requested `;
      console.log(msg);

      try {
        const c: any = new CommuterStartingLandmark(req.body);
        c.commuterStartingLandmarkID = uuid();
        c.created = new Date().toISOString();
        const result = await c.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterStartingLandmark failed'
          }
        )
      }
    });
    app.route("/addCommuterArrivalLandmark").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addCommuterArrivalLandmark requested `;
      console.log(msg);

      try {
        const c: any = new CommuterArrivalLandmark(req.body);
        c.commuterArrivalLandmarkID = uuid();
        c.created = new Date().toISOString();
        const result = await c.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterArrivalLandmark failed'
          }
        )
      }
    });
    app.route("/addCommuterRating").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addCommuterRating requested `;
      console.log(msg);

      try {
        const c: any = new CommuterRating(req.body);
        c.commuterRatingID = uuid();
        c.created = new Date().toISOString();
        const result = await c.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterRating failed'
          }
        )
      }
    });
    app.route("/addSafetyNetworkBuddy").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addSafetyNetworkBuddy requested `;
      console.log(msg);

      try {
        const buddy = new SafetyNetworkBuddy(req.body)
          const result = await buddy.save();
          res.status(200).json(result);
        }

       catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addSafetyNetworkBuddy failed'
          }
        )
      }
    });
    app.route("/addCommuterPanicLocation").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addCommuterPanicLocation requested `;
      console.log(msg);

      try {
        const commuterPanic = await CommuterPanic.findById(req.body.commuterPanicID)

        if (commuterPanic) {
          const panicData: any = {
            position: {
              type: 'Points',
              coordinates: [
                req.body.longitude,
                req.body.latitude
              ]
            },
            commuterPanicID: req.body.commuterPanicID
          }
          const panic: any = new CommuterPanicLocation(panicData);
          panic.created = new Date().toISOString();
          const result = await panic.save();
          res.status(200).json(result);
        } else {
          res.status(400).json({
            message: 'Commuter Panic not found'
          })
        }
        
        // log(result);
        
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterPanicLocation failed'
          }
        )
      }
    });
    app.route("/addCommuterPanic").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 addCommuterPanic requested `;
      console.log(msg);

      try {
        const panic: any = new CommuterPanic(req.body);
        const result = await panic.save();
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 addCommuterPanic failed'
          }
        )
      }
    });
    app.route("/getCommuterPanicsByUserID").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterPanicsByUserID requested `;
      console.log(msg);

      try {
        const panics: any = await CommuterPanic.find({userID: req.body.userID})
        
        // log(result);
        res.status(200).json(panics);
      } catch (err) {
        console.log(err)
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterPanicsByUserID failed'
          }
        )
      }
    });
    app.route("/getPanicLocations").post(async(req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getPanicLocations requested `;
      console.log(msg);

      try {
        const panics: any = await CommuterPanicLocation.find({commuterPanicID: req.body.commuterPanicID})
        
        // log(result);
        res.status(200).json(panics);
      } catch (err) {
        console.log(err)
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getPanicLocations failed'
          }
        )
      }
    });
    app.route("/getCommuterRequestsByUserID").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterRequestsByFromLandmark requested `;
      console.log(msg);

      try {
        const uid = req.body.firebaseUID;
        const result = await  User.find({userID: uid});

        if (result == null) {
          res.status(400).json({
            error: 'User not found',
            message: 'User not found'
          })
        }
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterRequestsByUserID failed'
          }
        )
      }
    });
    app.route("/getCommuterRequestsByID").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterRequestsByID requested `;
      console.log(msg);

      try {
        const id = req.body.commuterRequestID;
        const result = await  CommuterRequest.findById(id);

        if (result == null) {
          res.status(400).json({
            error: 'Commuter request not found',
            message: 'Commuter request not found'
          })
        }
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterRequestsByID failed'
          }
        )
      }
    });
    app.route("/getCommuterRequestsByFromLandmark").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterRequestsByFromLandmark requested `;
      console.log(msg);

      try {
        const minutes = parseInt(req.body.minutes);
        const fromLandmarkID = parseInt(req.body.fromLandmarkID);
        const cutOff: string = moment().subtract(minutes, "minutes").toISOString();
        const result = await  CommuterRequest.find({fromLandmarkID: fromLandmarkID, created: { $gt: cutOff },});
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterRequestsByFromLandmark failed'
          }
        )
      }
    });
    app.route("/getCommuterRequestsByToLandmark").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 getCommuterRequestsByToLandmark requested `;
      console.log(msg);

      try {
        const minutes = parseInt(req.body.minutes);
        const toLandmarkID = req.body.toLandmarkID;
        const cutOff: string = moment().subtract(minutes, "minutes").toISOString();
        const result = await  CommuterRequest.find({toLandmarkID: toLandmarkID, created: { $gt: cutOff },});
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 getCommuterRequestsByToLandmark failed'
          }
        )
      }
    });
    app.route("/findCommuterRequestsByUserID").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 findCommuterRequestsByUserID requested `;
      console.log(msg);

      try {
        const uid = req.body.UID;
        const result = await  CommuterRequest.find({userID: uid});
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 findCommuterRequestsByUserID failed'
          }
        )
      }
    });
    app.route("/findCommuterRequestsByLocation").post(async (req: Request, res: Response) => {
      const msg = `\n\n🌽 POST 🌽🌽 findCommuterRequestsByLocation requested `;
      console.log(msg);

      try {
        const minutes = parseInt(req.body.minutes);
        const latitude = parseFloat(req.body.latitude);
        const longitude = parseFloat(req.body.longitude);
        const RADIUS = parseFloat(req.body.radiusInKM) * 1000;
        const cutOff: string = moment().subtract(minutes, "minutes").toISOString();
        const result = await  CommuterRequest.find({
          position: {
            $near: {
              $geometry: {
                coordinates: [longitude, latitude],
                type: "Point",
              },
              $maxDistance: RADIUS,
            },
          },
          createdAt: { $gt: cutOff }
        });
        // log(result);
        res.status(200).json(result);
      } catch (err) {
        console.log(err)
        res.status(400).json(
          {
            error: err,
            message: ' 🍎🍎🍎🍎 findCommuterRequestsByLocation failed'
          }
        )
      }
    });


  }
}