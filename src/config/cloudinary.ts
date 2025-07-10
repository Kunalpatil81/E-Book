import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";
import fs from 'node:fs'

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApi,
    api_secret: config.cloudinarySecret,
});

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if(!localFilePath) return null;
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        // file has been uploaded sccessfully
        // console.log("file is uploaded on cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async (public_id: string, resource_type="auto") => {
    try {
        if (!public_id) return null;

        //delete file from cloudinary
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: `${resource_type}`
        });
    } catch (error) {
        return error;
        console.log("delete on cloudinary failed", error);
    }
};

export {cloudinary, uploadOnCloudinary, deleteOnCloudinary};
