 import {Router} from 'express';
 import { registerUser,loginUser,logoutUser,refreshAccessToken } from '../controllers/user.controller.js';
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
router.route("/refresh-token").post(VerifyJWT,refreshAccessToken);
 
 export default router
