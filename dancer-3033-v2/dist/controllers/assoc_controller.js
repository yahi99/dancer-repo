"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const v1_1 = __importDefault(require("uuid/v1"));
const association_1 = __importDefault(require("../models/association"));
const log_1 = require("../log");
class AssociationController {
    routes(app) {
        log_1.log(`🏓    AssociationController: 💙  setting up default Association routes ... `);
        /////////
        app.route("/getAssociations").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /getAssociations requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const asses = yield association_1.default.find();
                res.status(200).json(asses);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getRoutes failed'
                });
            }
        }));
        app.route("/addAssociation").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.log(`\n\n💦  POST: /addAssociation requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const association = new association_1.default(req.body);
                association.associationID = v1_1.default();
                association.created = new Date().toISOString();
                const result = yield association.save();
                // log(result);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 addAssociation failed'
                });
            }
        }));
    }
}
exports.AssociationController = AssociationController;
exports.default = AssociationController;
//# sourceMappingURL=assoc_controller.js.map