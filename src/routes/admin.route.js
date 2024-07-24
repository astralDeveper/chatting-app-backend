const { Router } = require("express");
const { CreateSuperAdmin, AdminLogin, CreateAdmin, GetUserById, GetUsers, BlockUser } = require("../controllers/admin/admin.controller");
const { verifyAdminToken } = require("../utlis/admin");
const route = Router();


route.post("/create-super-admin/123123", CreateSuperAdmin);
route.post("/create-admin", verifyAdminToken, CreateAdmin);
route.post("/login", AdminLogin);

route.get("/get-users", verifyAdminToken, GetUsers);
route.get("/get-user/:id", verifyAdminToken, GetUserById);
route.put("/block-user/:id", verifyAdminToken, BlockUser);



module.exports = route;