import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = () => {
    const [image, setImage] = useState<File | null>(null);
    const [url, setUrl] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!image) return alert("Please select an image first!");

        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || '');
        // No need to append cloud_name in formData
        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData
            );
            setUrl(res.data.secure_url);
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        }
    };

    return (
        <div>
            <input type="file" onChange={handleImageChange} />
            <button onClick={handleUpload}>Upload</button>

            {url && (
                <div>
                    <h4>Uploaded Image:</h4>
                    <img src={url} alt="Uploaded" width="300" />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
