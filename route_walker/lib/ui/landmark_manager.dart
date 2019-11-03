import 'dart:async';

import 'package:aftarobotlibrary4/api/sharedprefs.dart';
import 'package:aftarobotlibrary4/data/landmark.dart';
import 'package:aftarobotlibrary4/data/position.dart';
import 'package:aftarobotlibrary4/data/route.dart' as aftarobot;
import 'package:aftarobotlibrary4/data/route_point.dart';
import 'package:aftarobotlibrary4/maps/route_distance_calculator.dart';
import 'package:aftarobotlibrary4/maps/route_map.dart';
import 'package:aftarobotlibrary4/util/functions.dart';
import 'package:aftarobotlibrary4/util/slide_right.dart';
import 'package:aftarobotlibrary4/util/snack.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:route_walker/bloc/route_builder_bloc.dart';

import 'cards.dart';
import 'flag_routepoint_landmarks.dart';
import 'landmark_city_page.dart';

class LandmarksManagerPage extends StatefulWidget {
  @override
  _LandmarksManagerPageState createState() => _LandmarksManagerPageState();
}

class _LandmarksManagerPageState extends State<LandmarksManagerPage>
    implements SnackBarListener, RouteMapListener, LandmarkEditorListener {
  final GlobalKey<ScaffoldState> _key = GlobalKey();

  List<Landmark> _landmarks = List();
  Completer<GoogleMapController> _completer = Completer();
  GoogleMapController _mapController;
  CameraPosition _cameraPosition = CameraPosition(
    target: LatLng(0.0, 0.0),
    zoom: 14.0,
  );
  BitmapDescriptor _markerIcon;
  aftarobot.Route _route;

  @override
  void initState() {
    super.initState();
    print('🔆 🔆 🔆  ManageLandmarkPage: initState');
    _getRoute();
  }

  void _getRoute() async {
    _route = await Prefs.getRoute();
    assert(_route != null);
    await _setRoutePoints();
    //await _getLandmarks();
    setState(() {});
  }

  Future _getLandmarks() async {
    _landmarks = await routeBuilderBloc.getRouteLandmarks(_route);
    print('🔆🔆🔆 🔆🔆🔆 🔆🔆🔆 Landmarks on the route: ${_landmarks.length}');
    _buildItems();
    if (_mapController != null) {
      _setRouteMarkers();
    }
    setState(() {});
  }

  Future _buildMarkerIcon() async {
    if (_markerIcon != null) return;
    final ImageConfiguration imageConfiguration =
        createLocalImageConfiguration(context, size: Size.square(600.0));
    await BitmapDescriptor.fromAssetImage(imageConfiguration, 'assets/pin.png')
        .then((img) {
      _markerIcon = img;
      print('_buildLandmarkIcon Ⓜ️ Ⓜ️ Ⓜ️ has been created');
    }).catchError((err) {
      print(err);
    });
  }

  void _buildItems() {
    for (var m in _landmarks) {
      var item = DropdownMenuItem<Landmark>(
        value: m,
        child: ListTile(
          leading: Icon(
            Icons.my_location,
            color: getRandomColor(),
          ),
          title: Text(m.landmarkName),
        ),
      );
      _items.add(item);
    }
  }

  List<RoutePoint> _routePoints = List();

  Future _setRoutePoints() async {
    assert(_route != null);

    _routePoints = _route.routePoints;
    if (_route.routePoints.isNotEmpty) {
      showButton = false;
    }
    debugPrint(
        '\n\n🍏 🍎 🍏 🍎  Route points:  🧩  snapped: ${_routePoints.length} 🧩\n\n');
    _setRouteMarkers();
    setState(() {});
  }

  Set<Marker> _markers = Set();

  void _setRouteMarkers() async {
    print(
        '🔵 set markers ... 🔵 ...🔵 ...🔵 ... 🔵 ... points: ${_route.routePoints.length} 🍀️🍀️🍀️');
    _markers.clear();
    var icon =
        BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange);
    // await _buildMarkerIcon();
    try {
      _route.routePoints.forEach((m) {
        if (m.landmarkID != null) {
          icon =
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
        } else {
          icon =
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
        }
        _markers.add(Marker(
            onTap: () {
              print(
                  'LandmarkManager: 🔴 marker tapped!! ❤️ 🧡 💛   ${m.created}');
              _onMarkerTapped(m);
            },
            icon: icon,
            markerId: MarkerId(DateTime.now().toIso8601String()),
            position: LatLng(m.latitude, m.longitude),
            infoWindow: InfoWindow(
                title: m.landmarkID == null ? m.created : m.landmarkName,
                snippet: m.landmarkID == null ? m.created : 'LANDMARK')));
      });
      print('🍏 🍎 markers added: ${_markers.length}');
      if (_route.routePoints.isNotEmpty) {
        _setRoutePolyline();
      }
      _mapController.animateCamera(
          CameraUpdate.newLatLngZoom(_markers.elementAt(0).position, 15));
    } catch (e) {
      print(e);
    }
  }

  Set<Polyline> polyLines = Set();

  void _setRoutePolyline() async {
    polyLines.clear();
    try {
      List<LatLng> latLngs = List();
      try {
        _routePoints.forEach((m) {
          latLngs.add(LatLng(m.latitude, m.longitude));
        });
      } catch (e) {
        print(
            '👿 👿 👿 👿 👿 👿  Houston, we have a fucking problem! setting up LatLng in list 👿 👿 👿 👿 👿 👿 👿 👿');
      }
      print(
          '📌 📌 📌 create polyline 🔵 🔵 🔵 🔵 latLngs:🍀️🍀️ ${latLngs.length} 🍀️🍀️\n');
      var polyLine = Polyline(
          polylineId: PolylineId('${DateTime.now().toIso8601String()}'),
          color: Colors.white,
          width: 12,
          consumeTapEvents: true,
          onTap: () {
            print('🥩 🥩 polyline tapped, 🥩 now what??? - .....');
          },
          geodesic: true,
          points: latLngs);

      polyLines.add(polyLine);
      _mapController.animateCamera(CameraUpdate.newLatLngZoom(
          LatLng(_routePoints.elementAt(0).latitude,
              _routePoints.elementAt(0).longitude),
          14));
    } catch (e) {
      print(e);
    }
  }

  bool showLandmarkEditor = false, showButton = false;
  List<DropdownMenuItem<Landmark>> _items = List();

  _onMarkerTapped(RoutePoint routePoint) async {
    print('Marker tapped: route: ${routePoint.created}');
    await _mapController.animateCamera(CameraUpdate.newCameraPosition(
        CameraPosition(
            target: LatLng(routePoint.latitude, routePoint.longitude),
            zoom: 16.0)));
    Navigator.push(
        context,
        SlideRightRoute(
            widget: LandmarkEditor(
                routePoint: routePoint,
                route: _route,
                withScaffold: true,
                listener: this)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _key,
      appBar: AppBar(
        title: Text(
          'Landmark Manager',
          style: Styles.blackBoldSmall,
        ),
        backgroundColor: Colors.teal.shade400,
        bottom: _getBottom(),
        actions: <Widget>[
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: IconButton(
              icon: Icon(Icons.map),
              onPressed: () {
                _startRouteMap(false);
              },
            ),
          ),
//          Padding(
//            padding: const EdgeInsets.all(8.0),
//            child: IconButton(
//              icon: Icon(Icons.refresh),
//              onPressed: _getRoutePoints,
//            ),
//          ),
        ],
      ),
      body: Stack(
        children: <Widget>[
          GoogleMap(
            initialCameraPosition: _cameraPosition,
            mapType: MapType.hybrid,
            markers: _markers,
            polylines: polyLines,
            myLocationEnabled: true,
            compassEnabled: true,
            zoomGesturesEnabled: true,
            rotateGesturesEnabled: true,
            scrollGesturesEnabled: true,
            tiltGesturesEnabled: true,
            onLongPress: _onLongPress,
            onMapCreated: (mapController) {
              if (!_completer.isCompleted) {
                _completer.complete(mapController);
                _mapController = mapController;
                print(
                    ' ❤️ 🧡 💛  onMapCreated!! ❤️ 🧡 💛   ${_mapController.toString()}');
              }
              _setRouteMarkers();

              if (_routePoints != null && _routePoints.isNotEmpty) {
                _mapController.animateCamera(CameraUpdate.newLatLngZoom(
                    LatLng(_routePoints.elementAt(0).latitude,
                        _routePoints.elementAt(0).longitude),
                    16.0));
              }
            },
          ),
          Positioned(
            top: 12,
            left: 12,
            child: FloatingActionButton(
              backgroundColor: Colors.pink.shade900,
              elevation: 16,
              child: Icon(Icons.airport_shuttle),
              onPressed: () {
                Navigator.push(
                  context,
                  SlideRightRoute(
                    widget: FlagRoutePointLandmarks(
                      route: _route,
                    ),
                  ),
                );
//                  _setRoutePolyline();
              },
            ),
          ),
          isBusy == false
              ? Container()
              : Card(
                  child: Center(
                    child: Column(
                      children: <Widget>[
                        SizedBox(
                          height: 60,
                        ),
                        Container(
                          width: 60,
                          height: 60,
                          child: CircularProgressIndicator(
                            backgroundColor: Colors.teal,
                            strokeWidth: 24,
                          ),
                        ),
                        SizedBox(
                          height: 40,
                        ),
                        Text(
                          'Snapping ... Please Wait',
                          style: Styles.blackMedium,
                        ),
                      ],
                    ),
                  ),
                ),
        ],
      ),
    );
  }

  int sequenceNumber;
  Landmark landmark;
  String landmarkName;

  @override
  onActionPressed(int action) {
    List<aftarobot.Route> list = List();
    list.add(_route);
    Navigator.pop(context);
    switch (action) {
      case 2:
        _startRouteMap(true);
        break;
      case 3:
        assert(landmark != null);
        Navigator.push(
          context,
          SlideRightRoute(
              widget: LandmarkCityPage(
            landmark: landmark,
          )),
        );

        break;
    }
  }

  void _startRouteMap(bool showConfirm) {
    List<aftarobot.Route> list = List();
    list.add(_route);
    Navigator.push(
        context,
        SlideRightRoute(
          widget: RouteMap(
            routes: list,
            hideAppBar: false,
            listener: this,
            title: _route.name,
            landmarkIconColor: RouteMap.colorRed,
            containerHeight: showConfirm == false ? 0 : 60,
            container: showConfirm == false
                ? Container()
                : Container(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: RaisedButton(
                        color: Colors.blue.shade800,
                        elevation: 16,
                        onPressed: () {
                          debugPrint(
                              '🧩 🧩 🧩 🧩 Confirm Route button pressed  🧩 🧩 🧩 🧩 ');
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            '🧩 🧩 Confirm Route?',
                            style: Styles.whiteSmall,
                          ),
                        ),
                      ),
                    ),
                  ),
          ),
        ));
  }

  TextEditingController controller = TextEditingController();
  LatLng pressedLatLng;

  void _onLongPress(LatLng latLng) {
    debugPrint('🧩🧩🧩  map has been long pressed, 🧩 $latLng');
    pressedLatLng = latLng;
    showDialog(
        context: context,
        builder: (_) => new AlertDialog(
              title: new Text(
                "Add Landmark",
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor),
              ),
              content: Container(
                height: 160.0,
                child: Column(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Column(
                        children: <Widget>[
                          Text(
                            'New Landmark Name',
                            style: Styles.blackBoldSmall,
                          ),
                          SizedBox(
                            height: 12,
                          ),
                          TextField(
                            controller: controller,
                            onChanged: _onNameChanged,
                            keyboardType: TextInputType.text,
                            decoration: InputDecoration(hintText: 'Enter Name'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              actions: <Widget>[
                FlatButton(
                  child: Text(
                    'NO',
                    style: TextStyle(color: Colors.grey),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 20.0),
                  child: RaisedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _saveLandmark();
                    },
                    elevation: 4.0,
                    color: Colors.blue.shade700,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Add Landmark',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ),
                ),
              ],
            ));
  }

  String name;

  void _onNameChanged(String value) async {
    print(value);
    name = value;
  }

  _saveLandmark() async {
    if (name == null || name.isEmpty) {
      AppSnackbar.showErrorSnackbar(
          scaffoldKey: _key, message: 'Enter landmark name');
      return;
    }
    //todo - route point must be updated
    var m = Landmark(
      landmarkName: name,
      latitude: pressedLatLng.latitude,
      longitude: pressedLatLng.longitude,
      position: Position(
          type: 'Point',
          coordinates: [pressedLatLng.longitude, pressedLatLng.latitude]),
      routeIDs: [_route.routeID],
      routeDetails: [
        RouteInfo(
          name: _route.name,
          routeID: _route.routeID,
        )
      ],
    );
    await routeBuilderBloc.addLandmark(m);
    debugPrint(
        '️♻️ ♻️♻️ ♻️   🐸 New landmark added : 🍎 ${m.landmarkName} 🍎 ');
    List<CalculatedDistance> list =
        await RouteDistanceCalculator.calculate(route: _route);
    list.forEach((cd) {
      print('Calculated Distance: 🍎 🍎 ${cd.toJson()}');
    });
  }

  @override
  onLandmarkInfoWindowTapped(Landmark landmark) {
    debugPrint(
        ' 🥬 CreateRoutePointsPage:  🐸 onLandmarkInfoWindowTapped: 🧩🧩 ${landmark.landmarkName}  🍎 ');
    landmark.routeDetails.forEach((m) {
      debugPrint(
          ' 🐸 🐸 🐸  You can get on route :  🍎 ${m.name} from 🧩🧩 ${landmark.landmarkName}');
    });
  }

  @override
  onLandmarkTapped(Landmark landmark) {
    debugPrint(
        ' 🥬 CreateRoutePointsPage:  🐸 onLandmarkTapped: 🧩🧩 ${landmark.landmarkName}  🥬 ');
    // todo - show UPDATE landmark editor
  }

  @override
  onLongPress(LatLng latLng) {
    debugPrint(
        ' 🥬 CreateRoutePointsPage:  🐸 onLongPress: map pressed on latLng: 🧩🧩 $latLng  💛 ');
    // todo - show NEW landmark editor
  }

  @override
  onPointInfoWindowTapped(RoutePoint point) {
    debugPrint(
        ' 🥬 CreateRoutePointsPage:  🐸 onPointInfoWindowTapped: 🧩🧩 created: ${point.created}  🧡 index: ${point.index}');
    // todo - show NEW landmark editor
  }

  @override
  onPointTapped(RoutePoint point) {
    debugPrint(
        ' 🥬 CreateRoutePointsPage:  🐸 onPointTapped: 🧩🧩  created: ${point.created}  ❤️ index: ${point.index}');
    // todo - show NEW landmark editor
  }

  Widget _getBottom() {
    return PreferredSize(
      preferredSize: Size.fromHeight(100),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: <Widget>[
            Text(
              _route == null ? 'No Route?' : _route.name,
              style: Styles.whiteBoldSmall,
            ),
            SizedBox(
              height: 8,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
//                showButton == false
//                    ? Container()
//                    : RaisedButton(
//                        color: Colors.pink,
//                        elevation: 16,
//                        child: Padding(
//                          padding: const EdgeInsets.all(12.0),
//                          child: Text(
//                            'Confirm Route Points',
//                            style: Styles.whiteSmall,
//                          ),
//                        ),
//                        onPressed: _confirmSave),

                SizedBox(
                  width: 8,
                ),
                Counter(
                  label: 'Collected',
                  total: _routePoints.length,
                  totalStyle: Styles.blackBoldMedium,
                  labelStyle: Styles.blackSmall,
                ),
                SizedBox(
                  width: 40,
                ),
              ],
            ),
            SizedBox(
              height: 8,
            ),
          ],
        ),
      ),
    );
  }

  bool isBusy = false;

  @override
  onCancel() {
    print('onCancel: 🔴  🔴 ');
    return null;
  }

  @override
  onError(String message) {
    print('onError: 🔴  $message 🔴 ');
    return null;
  }

  @override
  onSuccess(Landmark landmark) {
    print('onSuccess: 👌 👌 👌 👌 👌 👌 👌 👌 }');
    prettyPrint(landmark.toJson(), ' 🧩 🧩 🧩 Landmark returned');
    return null;
  }
}