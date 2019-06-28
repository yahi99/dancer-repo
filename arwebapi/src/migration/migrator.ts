// import CommuterArrivalLandmark from '../models/commuter_arrival_landmark';
import {
  CollectionReference,
  Firestore,
  Query,
  QuerySnapshot,
} from "@google-cloud/firestore";
import * as admin from "firebase-admin";
// import polyline from 'google-polyline';
import { AssociationHelper } from "../helpers/association_helper";
import { RouteHelper } from "../helpers/route_helper";
import { VehicleHelper } from "../helpers/vehicle_helper";
import { CommuterRequestHelper } from "./../helpers/commuter_request_helper";
import { CityHelper, CountryHelper } from "./../helpers/country_helper";
import { LandmarkHelper } from "./../helpers/landmark_helper";
import Position from "../models/position";
import VehicleArrival from "../models/vehicle_arrival";
import VehicleDeparture from "../models/vehicle_departure";
import moment = require("moment");
const z = "\n";
console.log(
  `\n\n👺👺👺 🔑 Migrator: getting serviceAccount from json file  🔑🔑...`,
);
import { fs1, fs2 } from '../server/server';
import Route from '../models/route';
import Association from '../models/association';
import RoutePoint from '../models/route_point';
import Landmark from '../models/landmark';

class Migrator {
  public static async start() {
    console.log(`\n\n......Migrator is starting up ... ❤️ ❤️ ❤️  ....\n`);
    const start = new Date().getTime();

    // await this.migrateCountries();
    // await this.migrateAssociations();
    // await this.migrateCities("5ced8952fc6e4ef1f1cfc7ae");
    // await this.migrateVehicleTypes();
    // await this.migrateVehicles();
    await this.migrateRoutes();
    await this.migrateLandmarks();

    // await this.encodePolyline();
    // await this.toDancer();
    // await this.landmarksToDancer();
    // await this.commuterRequestsToDancer();
    // await this.migrateCommuterRequests();

    // await this.migrateVehicleArrivals();
    // await this.migrateVehicleDepartures();

    // await this.migrateCommuterLandmarkArrivals();
    const end = new Date().getTime();
    console.log(
      `\n\n♻️ ♻️ ♻️ ♻️ ♻️ ♻️  Migrator has finished the job:  ❤️  ${(end -
        start) /
        1000} seconds elapsed\n\n`,
    );

    return {
      migrator: `❤️️ ❤️ ❤️   Migrator has finished the job!  ❤️  ${(end -
        start) /
        1000} seconds elapsed  ❤️ ❤️ ❤️`,
      xdate: new Date(),
    };
  }
  public static async commuterRequestsToDancer(): Promise<any> {
    console.log(
      `\n\n\n🍎 🍎 migrating commuterRequests to Dancer ....  🍎 \n\n`,
    );
    const qs1 = await fs1.collection("commuterRequests").get();
    let cnt = 0;
    for (const doc of qs1.docs) {
      const id = doc.ref.id;
      const data = doc.data();
      if (data.fromLandmarkId && data.routeName && data.routeId) {
        await fs2
          .collection("commuterRequests")
          .doc(id)
          .set(data);
        cnt++;
        console.log(
          `🧡🧡 commuterRequest #${cnt} added ${
            doc.data().stringTime
          }  🍎🍎 \n\n`,
        );
      }
    }
    console.log(`\n\n🧡🧡🧡🧡🧡🧡 ${cnt} commuterRequests added:  🍎\n\n`);
  }
  public static async landmarksToDancer(): Promise<any> {
    console.log(`\n\n\n🍎 🍎 migrating landmarks to Dancer ....  🍎 \n\n`);
    const qs1 = await fs1.collection("newLandmarks").get();
    let cnt = 0;
    for (const doc of qs1.docs) {
      const id = doc.data().landmarkID;
      await fs2
        .collection("newLandmarks")
        .doc(id)
        .set(doc.data());
      cnt++;
      console.log(
        `🧡🧡 landmark #${cnt} added ${doc.data().landmarkName}  🍎🍎 \n\n`,
      );
    }
    console.log(`\n\n🧡🧡🧡🧡🧡🧡 ${cnt} landmarks added:  🍎\n\n`);
  }
  public static async toDancer(): Promise<any> {
    console.log(`\n\n\n🍎 🍎 migrating data to Dancer ....  🍎 \n\n`);
    const qs1 = await fs1.collection("associations").get();
    for (const doc of qs1.docs) {
      const id = doc.data().associationID;
      await fs2
        .collection("associations")
        .doc(id)
        .set(doc.data());
      console.log(
        `🧡🧡 association added ${doc.data().associationName}  🍎🍎 \n\n`,
      );
    }
    const qs2 = await fs1.collection("newRoutes").get();
    for (const doc of qs2.docs) {
      const id = doc.data().routeID;
      await fs2
        .collection("newRoutes")
        .doc(id)
        .set(doc.data());
      let cnt = 0;
      let cnt2 = 0;
      const qs3 = await doc.ref.collection("rawRoutePoints").get();
      for (const m of qs3.docs) {
        await fs2
          .collection("newRoutes")
          .doc(id)
          .collection("rawRoutePoints")
          .add(m.data());
        cnt++;
      }
      const qs4 = await doc.ref.collection("routePoints").get();
      for (const m of qs4.docs) {
        await fs2
          .collection("newRoutes")
          .doc(id)
          .collection("routePoints")
          .add(m.data());
        cnt2++;
      }
      console.log(
        `rawRoutePoints added:  🍎 ${cnt} routePoints added:  🍎 ${cnt2}`,
      );
      console.log(`🧡🧡 route added ${doc.data().name} 🧡🧡\n\n`);
    }
  }
  public static async encodePolyline() {
    const routeID = "-LgWJGYelWehA41IfbsS";
    const qs = await fs1
      .collection("newRoutes")
      .doc(routeID)
      .collection("routePoints")
      .get();
    console.log(`....... Firestore routePoints found:  🍎 ${qs.docs.length}`);

    const points: any = [];
    let cnt = 0;
    for (const doc of qs.docs) {
      const data: any = doc.data();
      cnt++;
      points.push([data.latitude, data.longitude]);
    }
    // const encoded = polyline.encode(points);
    // console.log(
    //   `🌸  🌸  🌸  encoded polyline:  🍀 ${encoded}  🍀 length: ${
    //     encoded.length
    //   }`,
    // );
    console.log(`\n🔑 🔑 🔑   route points encoded:  🍀  ${cnt}  🍀`);
  }
  public static async migrateCommuterRequests(): Promise<any> {
    console.log(
      `\n\n🍎  Migrating commuter requests to Mongo........................`,
    );
    const qs = await fs2.collection("commuterRequests").get();
    console.log(
      `\n\n....... Firestore commuterRequests found:  🍎 ${qs.docs.length}`,
    );

    let cnt = 0;
    for (const doc of qs.docs) {
      const data: any = doc.data();
      const loc = data.commuterLocation;
      const point = new Position();
      point.type = "Point";
      if (loc.lng && loc.lat) {
        point.coordinates = [parseFloat(loc.lng), parseFloat(loc.lat)];
        data.position = point;
        console.log(`about to write ${JSON.stringify(data)}`);
        const cr = await CommuterRequestHelper.addCommuterRequest(data);
        cnt++;
        console.log(
          `🍀 🍀 🍎 #${cnt} 🍎 commuter request migrated:  🍀 ${cr.stringTime}`,
        );
      } else {
        console.error("👿 👿 👿 fucked up! 👿 coordinates missing ");
      }
    }
    console.log(
      `\n🔑 🔑 🔑   commuterRequests migrated:  🍀  ${qs.docs.length}  🍀`,
    );
  }
  public static async migrateVehicleDepartures(): Promise<any> {
    console.log(
      `\n\n🍎  Migrating migrateVehicleDepartures to Mongo........................`,
    );
    const qs = await fs1.collection("vehicleDepartures").get();
    console.log(
      `\n\n....... Firestore vehicleDepartures found:  🍎 ${qs.docs.length}`,
    );

    let cnt = 0;
    for (const doc of qs.docs) {
      const docRef = await fs1
        .collection("newLandmarks")
        .where('landmarkName', '==', doc.data().landmarkName)
        .get();
      if (docRef.docs.length > 0) {
        const mark = docRef.docs[0].data();
        const position = new Position();
        position.type = "Point";
        position.coordinates = [mark.longitude, mark.latitude];
        const data: any = doc.data();
        const veh = data.vehicle;
        const departure = new VehicleDeparture();
        departure.capacity = veh.vehicleType.capacity;
        departure.make = veh.vehicleType.make;
        departure.model = veh.vehicleType.model;
        const date = new Date(data.dateDeparted).toISOString();
        departure.dateDeparted = date;
        departure.landmarkId = data.landmarkID;
        departure.landmarkName = data.landmarkName;
        departure.vehicleId = veh.vehicleID;
        departure.vehicleReg = veh.vehicleReg;

        console.log(`about to write ${JSON.stringify(departure)}`);
        const vehicleDepModel = new VehicleDeparture().getModelForClass(
          VehicleDeparture,
        );

        const vehicleDeparture = new vehicleDepModel({
          vehicleId: departure.vehicleId,
          landmarkName: departure.landmarkName,
          landmarkId: departure.landmarkId,
          position,
          vehicleReg: departure.vehicleReg,
          dateDeparted: departure.dateDeparted,
          make: departure.make,
          model: departure.model,
          capacity: departure.capacity,
          latitude: mark.latitude,
          longitude: mark.longitude,
        });
        const m = await vehicleDeparture.save();
        m.vehicleDepartureId = m.id;
        await m.save();
        cnt++;
        console.log(
          `🍀 🍀 🍎 #${cnt} 🍎 vehicle departure migrated:  🍀 ${vehicleDeparture.vehicleReg} at ${vehicleDeparture.landmarkName}`,
        );
      } else {
        console.log(`landmark not found: ${doc.data().landmarkID} ${doc.data().landmarkName}`);
      }
    }
    console.log(
      `\n🔑 🔑 🔑   vehicle departures migrated:  🍀  ${cnt}  🍀`,
    );
  }
  // public static async migrateCommuterLandmarkArrivals(): Promise<any> {
  //   console.log(
  //     `\n\n🍎  Migrating migrateCommuterLandmarkArrivals to Mongo........................`,
  //   );
  //   const qs = await fs1.collection("commuterArrivalLandmark").get();
  //   console.log(
  //     `\n\n....... Firestore commuterArrivalLandmarks found:  🍎 ${qs.docs.length}`,
  //   );

  //   for (const doc of qs.docs) {
  //     const position = doc.data().position;
  //     const data = doc.data();
  //     const mPosition = new Position();
  //     mPosition.coordinates = [position.geopoint.longitude, position.geopoint.latitude];
  //     data.position = mPosition;
  //     const commuterArrivalLandmarkModel = new CommuterArrivalLandmark().getModelForClass(CommuterArrivalLandmark);
  //     console.log(`....... 😍 😍 😍  about to add CommuterArrivalLandmark:  👽 👽 👽`);
  //     const commuterArrivalLandmark = new commuterArrivalLandmarkModel({
  //     commuterRequestId: data.commuterRequestId,
  //     fromLandmarkId: data.fromLandmarkId,
  //     fromLandmarkName: data.fromLandmarkName,
  //     position: data.position,
  //     routeId: data.routeId,
  //     routeName: data.routeName,
  //     createdAt: moment().date(data.createdAt).toISOString(),
  //     toLandmarkId: data.toLandmarkId,
  //     toLandmarkName: data.toLandmarkName,
  //     userId: data.userId,
  //     vehicleId: data.vehicleId,
  //     vehicleReg: data.vehicleReg,
  //     departureId: data.departureId,
  //   });
  //     const m = await commuterArrivalLandmark.save();
  //     m.commuterArrivalLandmarkId = m.id;
  //     await m.save();
  //   }
  // }
  public static async migrateVehicleArrivals(): Promise<any> {
    console.log(
      `\n\n🍎  Migrating migrateVehicleArrivals to Mongo........................`,
    );
    const qs = await fs1.collection("vehicleArrivals").get();
    console.log(
      `\n\n....... Firestore VehicleArrivals found:  🍎 ${qs.docs.length}`,
    );

    let cnt = 0;
    for (const doc of qs.docs) {
      const docRef = await fs1
        .collection("newLandmarks")
        .where('landmarkName', '==', doc.data().landmarkName)
        .get();
      if (docRef.docs.length > 0) {
        const mark = docRef.docs[0].data();
        const position = new Position();
        position.type = "Point";
        position.coordinates = [mark.longitude, mark.latitude];
        const data: any = doc.data();
        const veh = data.vehicle;
        const arr = new VehicleArrival();
        arr.capacity = veh.vehicleType.capacity;
        arr.make = veh.vehicleType.make;
        arr.model = veh.vehicleType.model;
        const date = new Date(data.dateArrived).toISOString();
        arr.dateArrived = date;
        arr.landmarkId = data.landmarkID;
        arr.landmarkName = data.landmarkName;
        arr.vehicleId = veh.vehicleID;
        arr.vehicleReg = veh.vehicleReg;

        console.log(`about to write ${JSON.stringify(arr)}`);
        const vehicleArrivalModel = new VehicleArrival().getModelForClass(
          VehicleArrival,
        );
  
        const vehicleArrival = new vehicleArrivalModel({
          vehicleId: arr.vehicleId,
          landmarkName: arr.landmarkName,
          landmarkId: arr.landmarkId,
          position,
          vehicleReg: arr.vehicleReg,
          dateArrived: arr.dateArrived,
          make: arr.make, model: arr.model, capacity: arr.capacity,
          latitude: mark.latitude,
          longitude: mark.longitude,
        });
        const m = await vehicleArrival.save();
        m.vehicleArrivalId = m.id;
        await m.save();
        cnt++;
        console.log(
          `🍀 🍀 🍎 #${cnt} 🍎 vehicle arrival migrated:  🍀 ${arr.vehicleReg} at  ${arr.landmarkName}`,
        );
      } else {
        console.log(`landmark not found: ${doc.data().landmarkID} ${doc.data().landmarkName}`);
      }
    }
    console.log(
      `\n🔑 🔑 🔑   vehicle arrivals migrated:  🍀  ${cnt}  🍀`,
    );
  }
  public static async migrateCountries(): Promise<any> {
    console.log(`\n\n🍎  Migrating countries ........................`);
    const qs = await fs1.collection("countries").get();
    console.log(`....... Firestore countries found:  🍎 ${qs.docs.length}`);

    for (const doc of qs.docs) {
      const data: any = doc.data();
      console.log(data);
      const country = await CountryHelper.addCountry(
        data.name,
        data.countryCode,
      );
      this.countries.push(country);
      console.log(country);
    }
    console.log(`\n🔑 🔑 🔑   countries migrated: ${this.countries.length}`);
    for (const c of this.countries) {
      if (c.name === "South Africa") {
        console.log(c);
        await this.migrateCities(c.countryID);
      }
    }
  }
  public static async migrateCities(countryID: string): Promise<any> {
    console.log(
      `\n\n🍎 🍎 🍎  Migrating cities, 🍎 countryID: ${countryID} ....... 🍎 🍎 🍎 `,
    );
    // const start = new Date().getTime();
    // // tslint:disable-next-line: forin
    // let cnt = 0;
    // // tslint:disable-next-line: forin
    // for (const m in citiesJson) {
    //   const city: any = citiesJson[m];
    //   const x = await CityHelper.addCity(
    //     city.name,
    //     city.provinceName,
    //     countryID,
    //     "South Africa",
    //     city.latitude,
    //     city.longitude,
    //   );
    //   cnt++;
    //   console.log(
    //     `🌳 🌳 🌳  city #${cnt}  added to Mongo: 🍎 id: ${x.countryID}  🍎 ${
    //       city.name
    //     }  💛  ${city.provinceName}  📍 📍 ${city.latitude}  📍  ${
    //       city.longitude
    //     }`,
    //   );
    // }
    // const end = new Date().getTime();
    // console.log(
    //   `\n\n💛 💛 💛 💛 💛 💛   Cities migrated: ${end -
    //     start / 1000} seconds elapsed`,
    // );
  }
  public static async migrateAssociations(): Promise<any> {
    console.log(`\n\n🍎  Migrating associations .............`);
    const qs = await fs1.collection("associations").get();
    console.log(`associations found:  🍎  ${qs.docs.length}`);

    const countryID = "75758d10-8b0b-11e9-af98-9b65797ec338";
    const countryName = "South Africa";
    let cnt = 0;
    for (const doc of qs.docs) {
      const data: any = doc.data();
      console.log(data);
      await AssociationHelper.addAssociation(
        data.associationName,
        "info@association.com",
        data.phone,
        countryID,
        countryName,
      );
      cnt++;
    }
    console.log(`\n🎸  🎸  🎸  associations added to Mongo: 🎀 ${cnt}`);
  }
  public static async migrateVehicles(): Promise<any> {
    console.log(`\n\n🍎  Migrating vehicles ............. 🍎🍎🍎`);
    const qs = await fs1.collection("vehicles").get();
    console.log(`🍎  Firestore vehicles found:  🍎  ${qs.docs.length}`);

    // get assocs from mongo
    const assocs: any = await AssociationHelper.getAssociations();
    console.log(`👽 👽 ${assocs.length} Associations from Mongo`);

    const vehicleTypeID = "45f2d1f0-8b1b-11e9-8cde-f7926ecb6f9c";
    let cnt = 0;
    for (const doc of qs.docs) {
      const vehicle: any = doc.data();
      for (const association of assocs) {
        if (association.associationName === vehicle.associationName) {
          await VehicleHelper.addVehicle(
            vehicle.vehicleReg,
            association.associationID,
            association.associationName,
            '',
            vehicle.ownerName,
            vehicleTypeID,
            [],
          );
          cnt++;
          console.log(` 🧡 🧡  vehicle #${cnt} added`);
        }
      }
    }
    console.log(`\n🎸  🎸  🎸  vehicles migrated to Mongo: 🎀 ${cnt} \n\n`);
  }
  public static async migrateVehicleTypes(): Promise<any> {
    console.log(`\n\n🍎  Migrating vehicleTypess .............`);
    const qs = await fs1.collection("vehicleTypes").get();
    console.log(`vehicleTypes found:  🍎  ${qs.docs.length}`);

    const countryID = "75758d10-8b0b-11e9-af98-9b65797ec338";
    const countryName = "South Africa";
    let cnt = 0;
    for (const doc of qs.docs) {
      const data: any = doc.data();
      console.log(data);
      await VehicleHelper.addVehicleType(
        data.make,
        data.model,
        data.capacity,
        countryID,
        countryName,
      );
      cnt++;
    }
    console.log(`\n🎸  🎸  🎸  vehicleTypes added to Mongo: 🎀 ${cnt}`);
  }
  public static async migrateRoutes(): Promise<any> {
    console.log(`\n\n🍎  Migrating routes ............. 🍎🍎🍎\n\n`);
    const s = new Date().getTime();
    const routesQuerySnap: QuerySnapshot = await fs2
      .collection("newRoutes")
      .get();
    console.log(
      `🍎  Firestore routes found:  🍎  ${routesQuerySnap.docs.length}`,
    );
    
    // get assocs from mongo
    const assocs: any = await AssociationHelper.getAssociations();
    console.log(
      `\n\nmigrateRoutes: 👽 👽 👽 👽 👽 👽 👽 👽  ${
        assocs.length
      } Associations from Mongo 💛 💛\n\n`,
    );

    let cnt = 0;
    for (const doc of routesQuerySnap.docs) {
      const route: any = doc.data();
      for (const association of assocs) {
        if (route.associationNames) {
          if (
            this.isAssociationFound(
              route.associationNames,
              association.associationName,
            )
          ) {
            await this.processRoute(
              route,
              association,
              cnt,
            );
            cnt++;
          }
        } else {
          if (route.associationName === association.associationName) {
            await this.processRoute(
              route,
              association,
              cnt,
            );
            cnt++;
          }
        }
      }
    }
    const e = new Date().getTime();
    const elapsed = `\n🎁 🎁 🎁  Migration took ${(e - s) /
      100} elapsed seconds 🎁 🎁 🎁`;
    console.log(`\n🎸  🎸  🎸  routes migrated to Mongo: 🎀  \n`);
    console.log(`\n🎸  🎸  🎸  landmarks migrated to Mongo: 🎀  \n\n`);

    console.log(elapsed);
  }
  private static countries: any = [];

  private static async processRoute(
    route: Route,
    association:  Association,
    cnt: number,
  ) {
    console.log(
      `\n\n💛💛💛  ... about to call: RouteHelper.addRoute(): 🎀 ${route.name}`,
    );
    // get route points into Mongo
    const qs = await fs2.collection('newRoutes').doc(route.routeID).collection('routePoints').get();
    route.routePoints = [];
    for (const doc of qs.docs) {
      const point = doc.data();
      const mPoint: RoutePoint = new RoutePoint();
      mPoint.routeId = route.routeID;
      mPoint.latitude = point.latitude;
      mPoint.longitude = point.longitude;
      const pos = {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      }
      mPoint.position = pos;
      route.routePoints.push(mPoint);
    }
    const qs2 = await fs2.collection('newRoutes').doc(route.routeID).collection('rawRoutePoints').get();
    route.rawRoutePoints = [];
    for (const doc of qs2.docs) {
      const point = doc.data();
      const mPoint: RoutePoint = new RoutePoint();
      mPoint.routeId = route.routeID;
      mPoint.latitude = point.latitude;
      mPoint.longitude = point.longitude;
      route.rawRoutePoints.push(mPoint);
    }
    console.log(`💛 routePoints: ${qs.docs.length}  💛  rawRoutePoints ${qs2.docs.length}`);
    route.associationIDs = [association.associationID];
    
    const mRoute = await RouteHelper.addRoute(route);
    cnt++;
    console.log(
      `\n💛💛💛  Migrator: route #${cnt} added  💛 ${
        mRoute.name
      }, will do the  landmarks ...\n`,
    );
    // get all route landmarks by name and migrate
    console.log(mRoute);
  }
  private static isAssociationFound(
    associations: string[],
    associationID: string,
  ): boolean {
    let isFound = false;
    associations.forEach((ass) => {
      if (ass === associationID) {
        isFound = true;
      }
    });
    return isFound;
  }
  private static isRouteFound(routeNames: any[], name: string): boolean {
    let isFound = false;
    routeNames.forEach((routeDetail) => {
      if (routeDetail.name === name) {
        isFound = true;
      }
    });
    return isFound;
  }
  private static async migrateLandmarks() {
    
    const landmarkModel = new Landmark().getModelForClass(Landmark);
    const landmarksQuerySnapshot = await fs2.collection('newLandmarks').get();
    console.log(`😍 😍 😍  about to add landmarks: ${landmarksQuerySnapshot.docs.length}`);
    for (const mdoc of landmarksQuerySnapshot.docs) {
      const data = mdoc.data();    
      const landmark = new landmarkModel({
        landmarkID: data.landmarkID,
        landmarkName: data.landmarkName,
        latitude: data.latitude,
        longitude: data.longitude,
        position: {
          coordinates: [data.longitude, data.latitude],
          type: "Point",
        },
        routeDetails: data.routeNames,
        routeIDs: data.routeIDs,
        cities: data.cities,
      });
      const m = await landmark.save();
      console.log(
        `\n👽 👽 👽 👽 👽 👽 👽 👽  Landmark added  🍎  ${m.landmarkName} \n\n`,
      );
    }
    return null;
  }
}

export default Migrator;