import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
 cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
 });
const uploadCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "auto",
        });
             
        return result;
    }
    catch (e) {
        fs.unlinkSync(file.path
        ); // remove file from server  after upload to cloudinary 
        console.error(e);
        return null;
    }
}
export {uploadCloudinary}