import 'dart:async';

import 'package:aftarobotlibrary4/api/local_db_api.dart';
import 'package:aftarobotlibrary4/dancer/dancer_data_api.dart';
import 'package:aftarobotlibrary4/dancer/dancer_list_api.dart';
import 'package:aftarobotlibrary4/data/association_bag.dart';
import 'package:aftarobotlibrary4/data/associationdto.dart';
import 'package:aftarobotlibrary4/data/citydto.dart';
import 'package:aftarobotlibrary4/data/geofence_event.dart';
import 'package:aftarobotlibrary4/data/landmark.dart';
import 'package:aftarobotlibrary4/data/position.dart';
import 'package:aftarobotlibrary4/data/route.dart' as ar;
import 'package:aftarobotlibrary4/data/route_point.dart';
import 'package:aftarobotlibrary4/geofencing/locator.dart';
import 'package:aftarobotlibrary4/util/functions.dart';
import 'package:aftarobotlibrary4/util/maps/snap_to_roads.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_background_geolocation/flutter_background_geolocation.dart'
    as bg;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:latlong/latlong.dart';
import 'package:meta/meta.dart';
import 'package:permission_handler/permission_handler.dart';

final RouteBuilderBloc routeBuilderBloc = RouteBuilderBloc();

class RouteBuilderModel {
  List<ar.Route> _routes = List();
  List<Landmark> _landmarks = List();
  List<Landmark> _routeLandmarks = List();

  List<RoutePoint> _routePoints = List();
  List<VehicleGeofenceEvent> _geofenceEvents = List();
  List<Association> _associations = List();
  List<AssociationBag> _associationBags = List();
  List<CityDTO> _cities = List();

  List<CityDTO> get cities => _cities;
  List<ar.Route> get routes => _routes;
  List<Landmark> get landmarks => _landmarks;
  List<Landmark> get routeLandmarks => _routeLandmarks;
  List<RoutePoint> get routePoints => _routePoints;
  List<Association> get associations => _associations;
  List<AssociationBag> get associationBags => _associationBags;
  List<VehicleGeofenceEvent> get geofenceEvents => _geofenceEvents;
}

/*
This class manages thd app's business logic and connects the model to a stream for a reactive effect
*/
class RouteBuilderBloc {
  final StreamController<RouteBuilderModel> _appModelController =
      StreamController<RouteBuilderModel>.broadcast();
  final StreamController<String> _errorController =
      StreamController<String>.broadcast();
  final StreamController<bg.Location> _currentLocationController =
      StreamController<bg.Location>.broadcast();
  final StreamController<bg.GeofenceEvent> _geofenceEventController =
      StreamController<bg.GeofenceEvent>.broadcast();
  final StreamController<List<Landmark>> _marksNearPointController =
      StreamController.broadcast();

  final StreamController<List<RoutePoint>> _routePointController =
      StreamController.broadcast();
  final StreamController<List<Association>> _associationController =
      StreamController.broadcast();
  final StreamController<List<ar.Route>> _routeController =
      StreamController.broadcast();
  final StreamController<List<RoutePoint>> _rawRoutePointController =
      StreamController.broadcast();
  final StreamController<List<Landmark>> _routeLandmarksController =
      StreamController.broadcast();
  final StreamController<bool> _busyController = StreamController.broadcast();

  List<RoutePoint> _routePoints = List();
  List<RoutePoint> _rawRoutePoints = List();
  List<bg.GeofenceEvent> _geofenceEvents = List();
  List<Landmark> _routeLandmarks = List();
  List<ar.Route> _routes = List();

  final RouteBuilderModel _appModel = RouteBuilderModel();
  bg.Location _currentLocation;
  bg.Location get currentLocation => _currentLocation;
  RouteBuilderModel get model => _appModel;
  closeStream() {
    _appModelController.close();
    _errorController.close();
    _currentLocationController.close();
    _geofenceEventController.close();
    _marksNearPointController.close();
    _routePointController.close();
    _rawRoutePointController.close();
    _routeLandmarksController.close();
    _routeController.close();
    _associationController.close();
    _busyController.close();
  }

  Stream get busyStream => _busyController.stream;
  Stream get associationStream => _associationController.stream;
  Stream get routeStream => _routeController.stream;
  Stream get appModelStream => _appModelController.stream;
  Stream get currentLocationStream => _currentLocationController.stream;
  Stream get geofenceEventStream => _geofenceEventController.stream;
  Stream get landmarksNearPointStream => _marksNearPointController.stream;
  Stream get routePointsStream => _routePointController.stream;
  Stream get rawRoutePointsStream => _rawRoutePointController.stream;
  Stream get routeLandmarksStream => _routeLandmarksController.stream;
  Stream get errorStream => _errorController.stream;

  List<RoutePoint> get routePoints => _routePoints;
  List<RoutePoint> get rawRoutePoints => _rawRoutePoints;
  List<Landmark> get routeLandmarks => _routeLandmarks;

  RouteBuilderBloc() {
    _initialize();
  }
  static const GEOFENCE_PROXIMITY_RADIUS = 5000, DISTANCE_FILTER = 10.0;
  _initialize() async {
    print(
        '\n🔵 🔵 🔵 🔵 🔵 RouteBuilderBloc: ️ ✳️ initializing ... 🍀️🍀️🍀️ doing nothing so far 🔵 🔵 🔵 🔵 🔵 \n');
    await DotEnv().load('.env');
    print('🌸 DotEnv has been created. Check content of variables');
    var status = DotEnv().env['status'];
    var devURL = DotEnv().env['devURL'];
    var prodURL = DotEnv().env['prodURL'];
    print(
        '🌸 properties from .env : 🌸  status: $status 🌸  devURL: $devURL 🍏 prodURL: $prodURL 🍏 ');
  }

  Future<bool> checkUserSignedIn() async {
    print('\n🔵 🔵 🔵 ######################### 🔴 isUserSignedIn ??');
    try {
      var user = await isUserSignedIn();
      if (user == null) {
        print(
            '\n🔵 🔵 🔵 ######################### 🔴 isUserSignedIn ?? 🍎 🍎 🍎 NO 🍎 🍎 🍎 ');
        return false;
      } else {
        print(
            '\n🔵 🔵 🔵 ######################### 🔴 isUserSignedIn ??  🍀️🍀️🍀️  YES  🍀️🍀️🍀️ ');
        return true;
      }
    } catch (e) {
      print(e);
      return false;
    }
  }

  Future<bool> requestPermission() async {
    print('\n🔵 🔵 🔵 ######################### requestPermission ..');
    try {
      Map<PermissionGroup, PermissionStatus> permissions =
          await PermissionHandler()
              .requestPermissions([PermissionGroup.location]);
      print(permissions);
      permissions.values.forEach((perm) {
        myDebugPrint('🔵 🔵 🔵 check for perm:: Permission status: $perm');
      });
      print(
          "\n🔵 🔵 🔵  ########### permission request for location is:  ✅ ✅ ✅ ✅ ✅ ✅ ");
//      associations = await LocalDBAPI.getAssociations();
//      if (associations.isEmpty) {
//        getAssociations();
//      }

      return true;
    } catch (e) {
      print(e);
    }
    return false;
  }

  List<Association> associations;
  Future<bool> checkPermission() async {
    print('\n🔵 🔵 🔵 ######################### 🔴 checkPermission ..');
    try {
      PermissionStatus locationPermission = await PermissionHandler()
          .checkPermissionStatus(PermissionGroup.location);

      if (locationPermission == PermissionStatus.denied) {
        return requestPermission();
      } else {
        print(
            "\n ✅  ✅  location permission status is:  ✅  ✅ $locationPermission");
        getAssociations();
        return true;
      }
    } catch (e) {
      print(e);
      throw e;
    }
  }

  Future<List<Association>> getAssociations() async {
    myDebugPrint(
        '### ℹ️ ℹ️ ℹ️ 🧩🧩🧩🧩🧩  getAssociations: getting ALL Associations from mongoDB ..........\n');
    var asses = await DancerListAPI.getAssociations();
    await LocalDBAPI.deleteAssociations();
    await LocalDBAPI.addAssociations(associations: asses);

    myDebugPrint(
        ' 📍📍📍📍 adding ${asses.length} Associations to  📎 model and stream sink ...');
    _associationController.sink.add(asses);
    myDebugPrint('++++ ✅  Associations retrieved: ${asses.length}\n');
    return asses;
  }

  Future getRoutesByAssociation(String associationID, bool forceRefresh) async {
    try {
      _busyController.sink.add(true);
      var origin = 'LOCAL';
      _routes = await LocalDBAPI.getRoutesByAssociation(associationID);

      if (forceRefresh || _routes.isEmpty) {
        _routes = await DancerListAPI.getRoutesByAssociation(
            associationID: associationID);
        origin = 'REMOTE';
        await _cacheRoutes();
      }

      _routes.sort((a, b) => a.name.compareTo(b.name));
      _routeController.sink.add(_routes);
      _busyController.sink.add(false);
    } catch (e) {
      print(e);
      _errorController.sink.add(e.toString());
    }
    return _routes;
  }

  static const batchSize = 300;
  Future addRoutePointsToMongoDB(
      ar.Route route, List<RoutePoint> routePoints) async {
    var index = 0;
    routePoints.forEach((p) {
      p.index = index;
      p.position =
          Position(type: 'Point', coordinates: [p.longitude, p.latitude]);
      index++;
    });
    try {
      await LocalDBAPI.addRoutePoints(
          routeID: route.routeID,
          routePoints: routePoints,
          routeName: route.name);
      myDebugPrint(
          '\n\n🔵 🔵 🔵 🔵 🔵 Cached snapped route points: ${_routePoints.length} - ${route.name} ....');
      var batches = BatchUtil.makeBatches(routePoints, batchSize);
      if (routePoints.length < batchSize) {
        print(
            '🍎🍎🍎🍎 adding ${routePoints.length} route points to 🍎 ${route.name} ...');
        await DancerDataAPI.addRoutePoints(
            routeId: route.routeID, routePoints: routePoints, clear: true);
      } else {
        //batches of 300
        print(
            '🍎🍎🍎🍎 adding ${batches.length} batches of $batchSize route points to 🍎 ${route.name} to remote database');
        var index = 0;
        for (var batch in batches.values) {
          await DancerDataAPI.addRoutePoints(
              routeId: route.routeID,
              routePoints: batch,
              clear: index == 0 ? true : false);

          index++;
        }
      }
      route.routePoints = routePoints;
      await LocalDBAPI.addRoute(route: route);
      List<ar.Route> mList = List();
      mList.add(route);
      _routes.forEach((r) {
        if (r.routeID != route.routeID) {
          mList.add(r);
        }
      });
      _routes = mList;
      _routeController.sink.add(_routes);
      print(
          '🍎🍎🍎🍎 DONE !! 👌👌👌 added ${batches.length} batches of $batchSize route points to 🍎 ${route.name} 👌👌👌 ...');
      return null;
    } catch (e) {
      print(e);
      throw e;
    }
  }

  Future addRawRoutePointsToMongoDB(
      ar.Route route, List<RoutePoint> routePoints) async {
    var index = 0;
    routePoints.forEach((p) {
      p.index = index;
      p.position =
          Position(type: 'Point', coordinates: [p.longitude, p.latitude]);
      index++;
    });
    try {
      if (routePoints.length < batchSize) {
        print(
            '🍎🍎🍎🍎 adding ${routePoints.length} RAW route points to 🍎 ${route.name} ...');
        await DancerDataAPI.addRawRoutePoints(
            routeID: route.routeID, routePoints: routePoints, clear: true);
      } else {
        var batches = BatchUtil.makeBatches(routePoints, batchSize);
        print(
            '🍎🍎🍎🍎 adding ${batches.length} batches of $batchSize RAW route points to 🍎 ${route.name} to remote database');
        var index = 0;
        for (var batch in batches.values) {
          await DancerDataAPI.addRawRoutePoints(
              routeID: route.routeID,
              routePoints: batch,
              clear: index == 0 ? true : false);

          index++;
        }
      }
      return null;
    } catch (e) {
      print(e);
      throw e;
    }
  }

  Future addRoutesToMongo(List<ar.Route> routes) async {
    for (var route in routes) {
      addRouteToMongo(route);
    }
  }

  Future addRouteToMongo(ar.Route route) async {
    var res = await LocalDBAPI.addRoute(route: route);
    print(res);
  }

  Future<ar.Route> addRoute(ar.Route route) async {
    myDebugPrint('### ℹ️  ℹ️  ℹ️  add new route to database ..........☘\n');
    assert(route.name != null);
    if (route.color == null) {
      route.color = 'white';
    }
    var result = await DancerDataAPI.addRoute(
        color: route.color,
        name: route.name,
        associationId: route.associationID,
        associationName: route.associationName);

    if (result.routeID == null) {
      myDebugPrint('\n\n\n🍎 🍎 RouteID of fresh route is 🍎 🍎 NULL 🍎 🍎 ');
      throw Exception('RouteID of fresh route is NULL');
    }
    await LocalDBAPI.addRoute(route: result);
    myDebugPrint(
        ' 📍📍📍📍📍📍 adding route ${result.name} to model and stream sink ...');
    prettyPrint(result.toJson(),
        'NEW route added to stream ... ♻️♻️♻️️♻️♻ check for routeID️');

    _routes.add(result);
    _routes.sort((a, b) => a.name.compareTo(b.name));
    _routeController.sink.add(_routes);
    return result;
  }

  Future<Landmark> addLandmark(Landmark landmark, RoutePoint point) async {
    myDebugPrint(
        '### ℹ️  📌 📌 📌 add new landmark 🍏 ${landmark.landmarkName} : addLandmark and 🍏 update routePoint ..........ℹ️  ℹ️  ℹ️  ');
    assert(landmark.routeDetails.length == 1);
    Landmark result;
    List<Map> mapList = List();
    landmark.routeDetails.forEach((d) {
      mapList.add(d.toJson());
    });
    try {
      result = await DancerDataAPI.addLandmark(
          landmarkName: landmark.landmarkName,
          latitude: landmark.latitude,
          longitude: landmark.longitude,
          routeDetails: mapList);

      await LocalDBAPI.addLandmarks(landmarks: [result]);

      //update route point
      point.landmarkID = result.landmarkID;
      point.landmarkName = result.landmarkName;
      await DancerDataAPI.updateRoutePoint(routePoint: point);

      prettyPrint(result.toJson(),
          '❤️ 🧡 💛 NEW LANDMARK added: ${landmark.landmarkName} - updated routePoint, to do same on local database');
      routeLandmarks.add(result);
      _routeLandmarksController.sink.add(_routeLandmarks);

      var localRoute = await LocalDBAPI.getRoute(routeID: point.routeID);
      var mList = List<RoutePoint>();
      localRoute.routePoints.forEach((p) {
        if (p.index == point.index) {
          mList.add(point);
        } else {
          mList.add(p);
        }
      });
      localRoute.routePoints = mList;
      await updateLocalRoute(localRoute);
    } catch (e) {
      print('🌶 🌶 🌶  $e  🌶 🌶 🌶 ');
      throw e;
    }
    return result;
  }

  Future addCityToLandmark(Landmark landmark, CityDTO city) async {
    myDebugPrint(
        '📍 📍 📍  update landmark ${landmark.landmarkName} on Firestore ..........\n');

    _appModel.landmarks.remove(landmark);
    landmark.cities.add(BasicCity(
        name: city.name,
        longitude: city.longitude,
        latitude: city.latitude,
        provinceName: city.provinceName));
    await DancerDataAPI.addCityToLandmark(
        cityId: city.cityID, landmarkId: landmark.landmarkID);
    myDebugPrint(
        '❤️ 🧡 💛 ${landmark.landmarkName} updated;  🍀 add to model and stream sink ...');
    _appModel.landmarks.add(landmark);
    _appModelController.sink.add(_appModel);
    return landmark;
  }

  Future updateLocalRoute(ar.Route route) async {
    myDebugPrint(
        '### 📍📍📍  updateLocalRoute:  ${route.name} routePoints: ${route.routePoints} ..........\n');
    _appModel.routes.remove(route);

    route.created = DateTime.now().toUtc().toIso8601String();
    await LocalDBAPI.deleteRoute(route.routeID);
    await LocalDBAPI.addRoute(route: route, listener: null);
    myDebugPrint(
        '🔆 🔆 Route has been updated on the local database, need to do the same on remote mongodb ........🔆 🔆 🔆 🔆 🔆 🔆 🔆 ');
    _appModel.routes.add(route);
    _appModelController.sink.add(_appModel);
    return null;
  }

  Future<List<CityDTO>> getCities(String countryId) async {
//    myDebugPrint('### ℹ️  getCities: getting cities in Firestore ..........\n');
//    var cities = await LocalDBAPI.getCities();
//    if (cities == null || cities.isEmpty) {
//      cities = await DancerListAPI.getCountryCities(countryId);
//      if (cities.isNotEmpty) {
//        await LocalDB.saveCities(Cities(cities));
//      }
//    }
//
//    myDebugPrint(
//        ' 📍 adding model with ${cities.length} cities to model and stream sink ...');
//    _appModel.cities.clear();
//    _appModel.cities.addAll(cities);
//    _appModelController.sink.add(_appModel);
//    myDebugPrint('++++ ✅  cities retrieved: ${cities.length}\n');
    return _appModel.cities;
  }

  Future<List<Landmark>> findLandmarksNearRoutePoint(
      RoutePoint routePoint, double radiusInKM) async {
    assert(routePoint != null);
    if (routePoint == null) {
      _marksNearPointController.sink.add(List());
      prettyPrint(
          routePoint.toJson(), '\n\n💀 💀 💀 BAD ROUTE POINT 💀 💀 💀 ');
      return List();
    }

    List<Landmark> list = await LocalDBAPI.findLandmarksByLocation(
        latitude: routePoint.latitude,
        longitude: routePoint.longitude,
        radiusInKM: radiusInKM);
    if (list.isEmpty) {
      list = await DancerListAPI.findLandmarksByLocation(
        latitude: routePoint.latitude,
        longitude: routePoint.longitude,
        radiusInKM: radiusInKM,
      );
    }

    _marksNearPointController.sink.add(list);
    return list;
  }

  Future<List<CityDTO>> findCitiesByLocation(
      {@required double latitude,
      @required double longitude,
      @required double radiusInKM}) async {
    var list = await DancerListAPI.findCitiesByLocation(
      latitude: latitude,
      longitude: longitude,
      radiusInKM: radiusInKM,
    );

    return list;
  }

  Future<List<CityDTO>> findCitiesNearLandmark({
    @required Landmark landmark,
    @required double radiusInKM,
  }) async {
    var list = await DancerListAPI.findCitiesByLocation(
      latitude: landmark.latitude,
      longitude: landmark.longitude,
      radiusInKM: radiusInKM,
    );
    return list;
  }

  Distance _distanceUtil = Distance();

  Future<RoutePoint> findRoutePointNearestLandmark(
      {ar.Route route, Landmark landmark}) async {
    assert(landmark != null);
    assert(route != null);

    Map<double, RoutePoint> distances = Map();
    route.routePoints.forEach((p) {
      double distance = _distanceUtil.distance(
          LatLng(landmark.latitude, landmark.longitude),
          LatLng(p.latitude, p.longitude));
      distances[distance] = p;
    });
    List sortedKeys = distances.keys.toList()..sort();
    var point = distances[sortedKeys.elementAt(0)];
    point.landmarkID = landmark.landmarkID;
    point.landmarkName = landmark.landmarkName;

    return point;
  }

  Future addRouteToLandmark(
      {ar.Route route, Landmark landmark, RoutePoint routePoint}) async {
    assert(route != null);
    assert(landmark != null);
    assert(routePoint != null);

    prettyPrint(
        routePoint.toJson(), 'addRouteToLandmark: route point 🔆 🔆 🔆 ');
    prettyPrint(landmark.toJson(),
        'addRouteToLandmark: LANDMARK - check routeDetails: must be > 1 🔆 🔆 🔆 ');
    await DancerDataAPI.updateRoutePoint(routePoint: routePoint);
    var m = await DancerDataAPI.addRouteToLandmark(
        routeId: route.routeID,
        landmarkId: landmark.landmarkID,
        routePoint: routePoint);

    await LocalDBAPI.updateLocalLandmark(landmark: m);

    await getRouteLandmarks(route);
    return m;
  }

  Future<List<Landmark>> getRouteLandmarks(ar.Route route) async {
    var marks = await DancerListAPI.getRouteLandmarks(routeId: route.routeID);

    _routeLandmarks.clear();
    _routeLandmarks.addAll(marks);
    _routeLandmarksController.sink.add(_routeLandmarks);
    myDebugPrint(
        'routeBuilderBloc; ✅ route landmarks retrieved: ${_routeLandmarks.length}\n');

    return _routeLandmarks;
  }

  Future<List<RoutePoint>> getRawRoutePoints({ar.Route route}) async {
    myDebugPrint(
        '\n🔵 🔵 🔵 🔵 🔵 ️ getRawRoutePoints: getting RAW route points : 🧩🧩  ${route.name}\n');

    _rawRoutePoints =
        await LocalDBAPI.getRawRoutePoints(routeID: route.routeID);

    print(
        '\n🚨 🚨 🚨 🚨  rawRoutePoints found : 🍀️🍀️ ${_rawRoutePoints.length}  🍀️🍀️  for route  ✳️  ${route.routeID} - ${route.name}\n\n');
    _rawRoutePointController.sink.add(_rawRoutePoints);

    return _rawRoutePoints;
  }

  Future<List<RoutePoint>> getRoutePoints({ar.Route route}) async {
    myDebugPrint('ℹ️  getRoutePoints getting route points ..........');
//    var mRoute = await DancerListAPI.getRoute(routeId: route.routeID);
//    _rawRoutePoints = mRoute.routePoints;
//    _routePointController.sink.add(mRoute.routePoints);
    myDebugPrint(
        'ℹ️  🍎 🍎 🍎 🍎  getRoutePoints found: 🍎 ${_routePoints.length}');
    return _routePoints;
  }

  Future _cacheRoutes() async {
    myDebugPrint(
        'ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️  cacheRoutes  ..........');

    for (var route in _routes) {
      myDebugPrint(
          'ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️ ℹ️  cacheRoutes  : 🍎  ${route.name} ..........');
      await LocalDBAPI.addRoute(route: route);
    }
    myDebugPrint(
        '\n\n️ℹ️ ℹ️ ℹ️ ℹ️   🍎 🍎 🍎 🍎  Routes cached: 🍎 ${_routes.length}');
    return _routePoints;
  }

  Timer timer;
  int timerDuration = 10;
  int index;
  ar.Route _route;

  startRoutePointCollectionTimer(
      {@required ar.Route route, @required int collectionSeconds}) async {
    print('🌽 🌽 🌽 🌽   startRoutePointCollectionTimer   🌽 🌽 🌽 🌽 🌽 ');
    assert(route != null);
    assert(collectionSeconds != null);
    index = 0;
    _route = route;
    _rawRoutePoints.clear();
    _rawRoutePointController.sink.add(_rawRoutePoints);
    _collectRawRoutePoint();
    Timer.periodic(Duration(seconds: collectionSeconds), (mTimer) {
      timer = mTimer;
      myDebugPrint(
          "🔆 🔆 🔆  timer triggered for  🌺  $collectionSeconds seconds  🌺  get GPS location and save");
      _collectRawRoutePoint();
    });
    myDebugPrint(
        "\n\n🔆 🔆 🔆  timer set up to start point collection every  🌺  $collectionSeconds seconds  🌺 ");
  }

  double _prevLatitude, _prevLongitude;
  Future _collectRawRoutePoint() async {
    var currentLocation = await LocationUtil.getCurrentLocation();
    //todo - get route from method .......
    var routeID = _route.routeID;
    if (routeID == null) {
      return null;
    }
    if (currentLocation == null) {
      return null;
    }
    myDebugPrint(
        '🧩 🧩  🧩 🧩  🧩 🧩 _collectRawRoutePoint : add point for 🔆  routeID:  👌 $routeID.............');
    _addRawRoutePoint(
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    );

    return currentLocation;
  }

  _addRawRoutePoint({double latitude, double longitude}) async {
    print(
        '🚺 🚺 🚺   _addRawRoutePoint: processing route point.  ⏰ check previous distance');

    try {
      if (_prevLatitude != null) {
        var ld = LandmarkDistance();
        ld.calculateDistance(
            fromLatitude: _prevLatitude,
            fromLongitude: _prevLongitude,
            toLatitude: latitude,
            toLongitude: longitude);

        print(
            '🥦  🥦  Distance from previous point: ${ld.distanceMetre} : ${DateTime.now().toIso8601String()}');
        if (ld.distanceMetre < 50.0) {
          print(
              ' 🥦  🥦 🥦  🥦 Looks like we are NOT moving. Distance:  🚹 ${ld.distanceMetre} metres:  🍷 🍷 🍷 Ignoring location');
          return;
        } else {
          await _writeRawPoint(latitude: latitude, longitude: longitude);
          _prevLatitude = latitude;
          _prevLongitude = longitude;
        }
      } else {
        await _writeRawPoint(latitude: latitude, longitude: longitude);
        _prevLatitude = latitude;
        _prevLongitude = longitude;
      }
    } catch (e) {
      //todo - error handling here
      print('⚠️ ⚠️ ⚠️  $e');
      _errorController.sink.add(
          '_addRawRoutePoint: ⚠️ Problem adding route point to Local MongoDB');
    }
  }

  Future _writeRawPoint({double latitude, double longitude}) async {
    var routeID = _route.routeID;
    myDebugPrint(
        '🧩 🧩  🧩 🧩  🧩 🧩 _writeRawPoint : add routePoint to LOCAL DB for 🔆  routeID:  👌 $routeID.............');
    assert(routeID != null);
    assert(latitude != null);
    assert(longitude != null);

    var point = RoutePoint(
      latitude: latitude,
      longitude: longitude,
      created: DateTime.now().toUtc().toIso8601String(),
      index: index,
      routeID: routeID,
      position: Position(type: 'Point', coordinates: [longitude, latitude]),
    );

    try {
      await LocalDBAPI.addRawRoutePoint(routeID: routeID, routePoint: point);
      myDebugPrint(
          '🔴 🔴 🔴 🔴 🔴 🔴  _writeRawPoint collected point written: to localDB 🧩🧩  point #$index  🧩🧩');
      _rawRoutePoints.add(point);
      _rawRoutePointController.sink.add(_rawRoutePoints);
    } catch (e) {
      print('👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿👿');
      print(e);
      _errorController.sink.add(
          '_writeRawPoint: ⚠️ Problem writing routeID point to Local MongoDB');
    }
    return null;
  }

  void cancelTimer() {
    if (timer != null) {
      timer.cancel();
      timer = null;
      myDebugPrint('\n\n🧩🧩 🧩🧩 🧩🧩 Timer cancelled and 👿👿👿 nulled');
    }
  }

  Future stopRoutePointCollectionTimer() async {
    index = null;
    clearPreviousLocation();
    if (timer == null) {
      print('---------- timer is null. ⚠️  ---- quit.');
    } else {
      print("🚨 🚨 🚨 🚨  cancelling collection timer ⚠️  ⚠️ ");
      timer.cancel();
      timer = null;
    }
    return null;
  }

  clearPreviousLocation() {
    _prevLongitude = null;
    _prevLatitude = null;
  }
}

abstract class LocationListener {
  void onRoutePointsFound(String routeID, List<RoutePoint> routePoints);
}
