import React, { useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { readPsd } from "ag-psd";
import { TfiUpload } from "react-icons/tfi";

const faviconSizes = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512, 1000];

const Resize = () => {
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [isConverting, setIsConverting] = useState(false);

    const openUploadDialog = () => fileInputRef.current.click();

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split(".").pop().toLowerCase();

        // PSD Support
        if (ext === "psd") {
            const buffer = await file.arrayBuffer();
            const psd = readPsd(buffer);
            const canvas = document.createElement("canvas");
            canvas.width = psd.width;
            canvas.height = psd.height;
            const ctx = canvas.getContext("2d");
            const imageData = new ImageData(psd.imageData, psd.width, psd.height);
            ctx.putImageData(imageData, 0, 0);
            canvas.toBlob((blob) => {
                setSelectedImage(blob);
                setPreviewURL(URL.createObjectURL(blob));
            });
        } else {
            setSelectedImage(file);
            setPreviewURL(URL.createObjectURL(file));
        }
    };

    const resizeImage = (image, size) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, size, size);
                canvas.toBlob((blob) => resolve({ blob, size }));
            };
            img.src = URL.createObjectURL(image);
        });
    };

    const convertImages = async () => {
        if (!selectedImage) return;
        setIsConverting(true);

        const zip = new JSZip();
        const results = await Promise.all(faviconSizes.map(size => resizeImage(selectedImage, size)));

        results.forEach(({ blob, size }) => {
            zip.file(`favicon${size}.png`, blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "favicons.zip");

        setIsConverting(false);
    };

    return (
        <div className="font-inter p-2 xl:p-6 h-screen">
            <div className="h-28 flex justify-between items-center">
                <h1 className="text-light text-4xl xl:text-8xl tracking-tight">Resize</h1>

                <button
                    onClick={openUploadDialog}
                    className="bg-light h-10 xl:h-16 xl:w-40 cursor-pointer text-dark flex items-center gap-2 justify-center group transition-all duration-300"
                >
                    <span className="translate-x-3 group-hover:translate-x-0 transition-all duration-300">Upload Image</span>
                    <TfiUpload className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </button>
            </div>

            <input type="file" accept=".png,.jpg,.jpeg,.psd" ref={fileInputRef} className="hidden" onChange={handleUpload} />

            {!selectedImage ? (
                <div
                    onClick={openUploadDialog}
                    className="border border-dashed border-light w-full h-[calc(100%-7rem)] flex justify-center items-center cursor-pointer"
                >
                    <h2 className="text-light text-xl">Upload PNG, JPG, or PSD</h2>
                </div>
            ) : (
                <div className="flex flex-col xl:flex-row gap-4 h-[calc(100%-7rem)]">
                    <div className="border border-light p-4 flex justify-center items-center w-full xl:w-1/2">
                        <img src={previewURL} alt="preview" className="max-h-[70vh] mx-auto" />
                    </div>

                    <div className="border border-light p-4 w-full xl:w-1/2 flex flex-col justify-between">
                        <div>
                            <h3 className="text-light text-xl mb-4 tracking-wide">Will Generate:</h3>
                            <div className="text-light grid grid-cols-3 gap-2 text-sm">
                                {faviconSizes.map((s) => (
                                    <div key={s} className="px-3 py-2 border border-light text-center">
                                        {s}px
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={convertImages}
                            disabled={isConverting}
                            className="bg-light text-dark py-3 mt-6 hover:bg-white transition"
                        >
                            {isConverting ? "Converting..." : "Convert & Download ZIP"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resize;
