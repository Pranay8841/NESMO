import { v2 as cloudinary } from "cloudinary";

const uploadImageToCloudinary = async (
    file, folder, height, quality
) => {
    const options = {folder};

    if (height) {
        options.height = height;
    }

    if (quality) {
        options.quality = quality;
    }

    options.resource_type = 'auto';

    const img = await cloudinary.uploader.upload(file.tempFilePath, options);
    return img;
}

export default uploadImageToCloudinary;