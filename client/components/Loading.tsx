import React from 'react';
import { Spinner } from '@/components/ui/spinner';

export function LoadingPage() {
    return (
        <div className="flex justify-center items-center h-screen w-full">
            <Spinner className="size-10" />
        </div>
    );
}
