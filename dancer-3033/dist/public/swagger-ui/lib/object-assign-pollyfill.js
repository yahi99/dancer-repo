"use strict";
"function" != typeof Object.assign && !function () { Object.assign = function (n) {
    "use strict";
    if (void 0 === n || null === n)
        throw new TypeError("Cannot convert undefined or null to object");
    for (var t = Object(n), o = 1; o < arguments.length; o++) {
        var r = arguments[o];
        if (void 0 !== r && null !== r)
            for (var e in r)
                Object.prototype.hasOwnProperty.call(r, e) && (t[e] = r[e]);
    }
    return t;
}; }();
//# sourceMappingURL=object-assign-pollyfill.js.map