'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, AlertCircle, Check } from 'lucide-react';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import config from '@/config/env';

interface PremiumImageUploadProps {
    label: string;
    onImageUpload: (url: string) => void;
    value: string | undefined;
    required: boolean;
    preset: 'logo' | 'banner' | 'item_logo';
}

export function PremiumImageUpload({
    label,
    onImageUpload,
    value,
    required,
    preset,
}: PremiumImageUploadProps): React.JSX.Element {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isUploadComplete, setIsUploadComplete] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (): void => {
        setIsDragging(false);
    };

    const handleFile = async (file: File): Promise<void> => {
        setError(null);
        setFileName(file.name);
        setIsUploadComplete(false);

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        let progressInterval: NodeJS.Timeout | null = null;

        try {
            progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 100);

            const presetKey =
                preset === 'logo'
                    ? config.PUBLIC_CLOUDINARY_LOGO_PRESET
                    : preset == 'item_logo' ? config.PUBLIC_CLOUDINARY_BANNER_PRESET : config.PUBLIC_CLOUDINARY_ITEM_LOGO_PRESET;

            if (!presetKey) {
                throw new Error('Cloudinary preset is not configured');
            }

            const url: string = await uploadToCloudinary(file, presetKey);

            if (progressInterval) clearInterval(progressInterval);

            setUploadProgress(100);
            onImageUpload(url);
            setIsUploadComplete(true);

            setTimeout(() => {
                setUploadProgress(0);
            }, 1000);
        } catch (err) {
            if (progressInterval) clearInterval(progressInterval);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Upload failed');
            }
            setFileName(null);
            setUploadProgress(0);
            setIsUploadComplete(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleDelete = (): void => {
        onImageUpload('');
        setFileName(null);
        setUploadProgress(0);
        setError(null);
        setIsUploadComplete(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = (): void => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">
                {label}
                {required ? <span className="text-destructive ml-1">*</span> : null}
            </label>

            {value === '' ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`relative cursor-pointer transition-all duration-300 p-6 sm:p-8 rounded-lg border-2 border-dashed ${isDragging
                            ? 'border-accent bg-accent/10 dark:bg-accent/20 scale-105'
                            : 'border-border bg-muted dark:bg-muted hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/20'
                        }`}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className={`p-3 rounded-full transition-colors ${isDragging
                                    ? 'bg-accent/20 dark:bg-accent/30'
                                    : 'bg-muted dark:bg-muted'
                                }`}
                        >
                            <Upload
                                className={`h-6 w-6 ${isDragging ? 'text-accent' : 'text-muted-foreground'}`}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">
                                Drag and drop {preset === 'logo' ? 'logo' : 'banner'} here
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                or click to select (PNG, JPG up to 5MB)
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden bg-card border border-border shadow-sm">
                        <img
                            src={value === '' ? '/placeholder.svg' : value}
                            alt="Preview"
                            className="w-full h-40 sm:h-48 object-cover"
                        />
                        <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {fileName || 'Image uploaded'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isUploading
                                            ? 'Uploading...'
                                            : isUploadComplete
                                                ? 'Upload complete'
                                                : 'Ready to upload'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-lg transition-colors shrink-0"
                                    title="Delete image"
                                >
                                    <X className="h-5 w-5 text-destructive" />
                                </button>
                            </div>

                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Uploading...
                                        </span>
                                        <span className="text-xs font-semibold text-accent">
                                            {uploadProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-accent transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {isUploadComplete && !isUploading && (
                                <div className="flex items-center gap-2 p-2 bg-secondary/10 dark:bg-secondary/20 rounded-lg border border-secondary/20 dark:border-secondary/30">
                                    <Check className="h-4 w-4 text-secondary-foreground" />
                                    <span className="text-xs font-medium text-secondary-foreground">
                                        Successfully uploaded
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
            />
        </div>
    );
}
