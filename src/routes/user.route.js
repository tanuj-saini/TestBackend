 import {Router} from 'express';
 import { registerUser,loginUser,logoutUser,
  getCurrentUser,changePassword,updateUserDetails,getUserChannelProfile,watchHistorys,
  updateUserAvatar,updateUserCoverImage ,refreshAccessToken,
} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {VerifyJWT} from '../middlewares/auth.middleware.js';
 const router = Router();

//  router.route("/register").post(
//    upload.fields([
//          {name: 'avatar', maxCount: 1},
//          {name: 'cover', maxCount: 1}
//       ]
//    )
//    ,registerUser)
router.route("/register").post(
  upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 }
  ]),
  registerUser
);

router.route("/login").post(loginUser
);


//secure routes
router.route("/logout").post(VerifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/get-user").get(VerifyJWT,getCurrentUser);
router.route("/change-password").post(VerifyJWT,changePassword);
router.route("/update-details").patch(VerifyJWT,updateUserDetails);
router.route("/update-avatar").patch(VerifyJWT,upload.single('avatar'),updateUserAvatar);
router.route("/update-cover-image").patch(VerifyJWT,upload.single('coverImage'),updateUserCoverImage);

router.route("/c/:username").get(VerifyJWT,getUserChannelProfile);

router.route("/watch-history").get(VerifyJWT,watchHistorys); 


router
 
 export default router
