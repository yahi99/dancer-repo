"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
const log_1 = __importDefault(require("../log"));
const user_1 = __importDefault(require("../models/user"));
class UserController {
    routes(app) {
        log_1.default(`🏓🏓🏓🏓🏓    UserController: 💙  setting up default User routes ... ${database_1.default}`);
        /////////
        app.route("/getUsers").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.default(`\n\n💦  POST: /getUsers requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const users = yield user_1.default.find();
                res.status(200).json(users);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getUsers failed'
                });
            }
        }));
        app.route("/findUserByEmail").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.default(`\n\n💦  POST: /findUserByEmail requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const user = yield user_1.default.findOne({
                    email: req.body.email,
                });
                log_1.default(user);
                res.status(200).json(user);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 findUserByEmail failed'
                });
            }
        }));
        app.route("/getUsersByAssociation").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.default(`\n\n💦  POST: /getUsersByAssociation requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const users = yield user_1.default.find({
                    associationID: req.body.associationID,
                });
                res.status(200).json(users);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 getUsersByAssociation failed'
                });
            }
        }));
        app.route("/addUser").post((req, res) => __awaiter(this, void 0, void 0, function* () {
            log_1.default(`\n\n💦  POST: /addUser requested .... 💦 💦 💦 💦 💦 💦  ${new Date().toISOString()}`);
            console.log(req.body);
            try {
                const user = new user_1.default(req.body);
                const result = yield user.save();
                log_1.default(result);
                res.status(200).json(result);
            }
            catch (err) {
                res.status(400).json({
                    error: err,
                    message: ' 🍎🍎🍎🍎 addUser failed'
                });
            }
        }));
    }
}
exports.UserController = UserController;
exports.default = UserController;
//# sourceMappingURL=user_controller.js.map