'use client';

import { useRouter } from 'next/navigation';

export function TableDevLinks() {
    const router = useRouter();
    const endpoints = [
        // Core Pages
        '/',

        // Authentication
        '/login',
        '/logout',

        // Create Account Flow
        '/create-account',
        '/create-account/verify',
        '/create-account/set-profile',
        '/create-account/success',

        // Reset Password Flow
        '/reset-password',
        '/reset-password/verify',
        '/reset-password/set-password',
        '/reset-password/success',
    ];

    return (
        <>
            <div className="min-h-screen bg-background p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-xl font-mono mb-6 text-center">Frontend Routes</h1>

                    <table className="w-full border-collapse border border-border text-sm">
                        <thead>
                            <tr className="bg-muted">
                                <th className="border border-border p-2 text-left font-mono">
                                    Route
                                </th>
                                <th className="border border-border p-2 text-center font-mono w-24">
                                    New Tab
                                </th>
                                <th className="border border-border p-2 text-center font-mono w-24">
                                    Same Tab
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {endpoints.map((endpoint) => (
                                <tr key={endpoint} className="hover:bg-muted/50">
                                    <td
                                        onClick={() => router.push(endpoint)}
                                        className="border border-border p-2 font-mono text-xs cursor-pointer"
                                    >
                                        {endpoint}
                                    </td>
                                    <td className="border border-border p-2 text-center">
                                        <button
                                            onClick={() => window.open(endpoint, '_blank')}
                                            className="text-primary underline-offset-2 hover:underline text-xs cursor-pointer"
                                        >
                                            Open
                                        </button>
                                    </td>
                                    <td className="border border-border p-2 text-center">
                                        <button
                                            onClick={() => router.push(endpoint)}
                                            className="text-primary underline-offset-2 hover:underline text-xs cursor-pointer"
                                        >
                                            Go
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
