import Image from "next/image";

import React from 'react';

export function Logo() {
    return (
        <div className="flex h-10 w-10 p-0.5 items-center justify-center rounded-xl bg-linear-to-r from-primary to-primary/50 border-2 border-primary shadow-lg shadow-primary/20">
             <Image
                src="/logo1.png"        
                alt="Company Logo"
                width={50}
                height={50}
                className="rounded-md" 
            />
        </div>
    );
}
