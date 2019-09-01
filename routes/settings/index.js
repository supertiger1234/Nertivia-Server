const MainSettingsRouter = require("express").Router();
const busboy = require("connect-busboy");

// Middleware
const { passportJWT } = require("../../middlewares/passport");
const GDriveOauthClient = require("./../../middlewares/GDriveOauthClient");

// Policies
const settingsPolicy = require("../../policies/settingsPolicies");

// Change Status
MainSettingsRouter.route("/status").post(
  passportJWT,
  settingsPolicy.status,
  require("./changeStatus")
);

// Change appearance
MainSettingsRouter.route("/apperance").put(
  //TODO: fix typo in database and client and server.
  passportJWT,
  require("./changeAppearance")
);

// Emoji
MainSettingsRouter.route("/emoji")
  .post(passportJWT, GDriveOauthClient, busboy(), require("./addCustomEmoji"))
  .put(passportJWT, require("./renameCustomEmoji"))
  .delete(passportJWT, require("./deleteCustomEmoji"));

// Link Google Drive
MainSettingsRouter.use(
  "/drive",
  passportJWT,
  GDriveOauthClient,
  require("./linkGoogleDrive")
);

module.exports = MainSettingsRouter;