import React, { useEffect, useRef, useState } from 'react'
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { renderAsync } from "docx-preview";
import { TfiUpload, TfiFullscreen } from "react-icons/tfi";

const Home = () => {

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [textContent, setTextContent] = useState(null);
    const [htmlContent, setHtmlContent] = useState(null);
    const previewRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const getExtension = (name) => name.split('.').pop().toLowerCase();

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            previewRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleUpload = (e) => {
        const selectedFiles = Array.from(e.target?.files || []);
        setFiles((prev) => [...prev, ...selectedFiles]);
    };

    const openUploadDialog = () => fileInputRef.current.click();

    const toggleSelectedFile = (file) => {
        if (selectedFile && selectedFile.name === file.name) {
            setSelectedFile(null);
            setPreviewURL(null);
            setTextContent(null);
            setHtmlContent(null);
        } else {
            setSelectedFile(file);
            previewFile(file);
        }
    };

    const previewFile = async (file) => {
        setTextContent(null);
        setPreviewURL(null);
        setHtmlContent(null);

        const ext = getExtension(file.name);

        // IMAGE
        if (file.type.startsWith("image")) {
            setPreviewURL(URL.createObjectURL(file));
            return;
        }

        // PDF
        if (ext === "pdf") {
            setPreviewURL(URL.createObjectURL(file));
            return;
        }

        // DOCX
        if (ext === "docx") {
            const arrayBuffer = await file.arrayBuffer();
            const container = document.createElement("div");
            await renderAsync(arrayBuffer, container);
            setHtmlContent(container.innerHTML);
            return;
        }

        // XLSX / CSV
        if (ext === "xlsx" || ext === "csv") {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const html = XLSX.utils.sheet_to_html(sheet);
            setHtmlContent(html);
            return;
        }

        // Text / Code readable
        if (
            file.type.startsWith("text") ||
            /\.(js|py|java|cpp|ts|html|css|md|json)$/i.test(file.name)
        ) {
            const reader = new FileReader();
            reader.onload = () => setTextContent(reader.result);
            reader.readAsText(file);
            return;
        }

        // ✅ UNIVERSAL FALLBACK PREVIEW (NO UNSUPPORTED MESSAGE)
        const size = (file.size / 1024).toFixed(2) + " KB";
        setTextContent(
            `File Preview Unavailable for Visual Rendering

Name: ${file.name}
Size: ${size}
Type: ${file.type || "Unknown"}

You can download it and open with an appropriate application.`
        );
    };

    useEffect(() => {
        if (files.length === 1) {
            setSelectedFile(files[0]);
            previewFile(files[0]);
        }
    }, [files]);

    return (
        <div className="font-inter p-2 xl:p-6 xl:h-screen xl:overflow-y-hidden"
            onDragOver={files.length > 0 ? (e) => e.preventDefault() : null}
            onDrop={files.length > 0 ? handleDrop : null}
        >
            <div className='h-28 flex justify-between items-center '>
                <h1 className="text-light text-4xl xl:text-8xl tracking-tight">All Files Viewer</h1>
                {files.length > 0 &&
                    <button
                        onClick={openUploadDialog}
                        className='bg-light h-10  xl:h-16 xl:w-40 xl:mr-4 cursor-pointer text-dark flex items-center gap-2 group justify-center transition-all duration-300'
                    >
                        <span className='translate-x-3 hidden xl:block group-hover:translate-x-0 duration-300 transition-all'>Upload more</span>
                        <span className='translate-x-3 xl:hidden block group-hover:translate-x-0 duration-300 transition-all'>Upload</span>
                        <TfiUpload
                            className='opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300'
                        />
                    </button>

                }
            </div>

            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleUpload} />

            <div className=" xl:flex h-[calc(100%-7rem)] w-full xl:space-x-4">
                <div className='w-full transition-all duration-300'>
                    {selectedFile ? (
                        <div ref={previewRef} className='w-full transition-all duration-300 border border-light h-full p-4 pt-0 overflow-y-auto'>
                            <div className='justify-between flex items-center sticky top-0 bg-dark py-4 pb-2 z-40 xl:h-20'>
                                <h2 className="text-light truncate text-sm xl:text-xl  tracking-wide  mb-4">{selectedFile.name}</h2>
                                <button
                                    className='bg-light xl:flex items-center hidden gap-2 w-32 h-12 justify-center cursor-pointer group transition-all duration-300'
                                    onClick={toggleFullScreen}
                                >
                                    <span className='translate-x-3 group-hover:translate-x-0 duration-300 transition-all'>{isFullscreen ? "Exit Full Screen" : "Full Screen"}</span>
                                    <TfiFullscreen
                                        className='opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300'
                                    />
                                </button>
                            </div>

                            {previewURL && selectedFile.type.startsWith("image") && (
                                <div className='flex flex-col justify-center  h-[calc(100%-5rem)] '>
                                    <img src={previewURL} alt="preview" className="max-h-[70vh] mx-auto" />
                                </div>
                            )}

                            {previewURL && selectedFile.type === "application/pdf" && (
                                <iframe src={previewURL + "#toolbar=0&navpanes=0&scrollbar=0"} className="w-full h-[calc(100%-5rem)]" style={{ border: "none" }} />
                            )}

                            {htmlContent && (
                                <div className="text-light" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            )}

                            {textContent && (
                                <pre className="text-light whitespace-pre-wrap text-sm">
                                    {textContent}
                                </pre>
                            )}

                        </div>
                    ) : (
                        <div
                            className={`border w-full border-dashed border-light min-h-80 xl:h-full flex justify-center items-center transition 
        ${isDragging ? "bg-white text-dark" : ""}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                setIsDragging(false);
                                handleDrop(e);
                            }}
                            onClick={openUploadDialog}
                        >
                            <div>
                                <h2 className={`text-lg xl:text-2xl font-light tracking-tight 
            ${isDragging ? "text-dark" : "text-light"}`}>
                                    Drag & Drop the File(s) to preview
                                </h2>
                            </div>
                        </div>
                    )}
                </div>

                <div className="xl:max-w-72 mt-4 xl:mt-0 overflow-x-auto">
                    {files.length > 1 && (
                        <div className="flex xl:flex-col gap-2 xl:gap-4  xl:overflow-y-auto h-full pr-4">
                            {files.map((file, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => toggleSelectedFile(file)}
                                    className={`p-4 border border-light rounded-lg hover:bg-white/5 hover:text-light transition cursor-pointer xl:min-h-52 flex flex-col xl:justify-center items-center xl:items-start xl:overflow-x-hidden ${selectedFile && selectedFile.name === file.name ? "bg-white text-dark" : "text-light"
                                        }`}
                                >
                                    <div className="text-4xl xl:mx-auto font-bold uppercase">{getExtension(file.name)}</div>
                                    <p className="xl:block hidden text-sm text-center truncate overflow-x-hidden max-w-60 text-wrap mt-2 ">{file.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home
