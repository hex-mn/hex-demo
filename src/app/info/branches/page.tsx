"use client";

import { sendRequestToPublicAPI } from "@/lib/api-service";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import InfoLoader from "@/app/info/InfoLoader";

const MapPickerInline = dynamic(() => import("@/components/address/MapPickerInlineWrapper"), { ssr: false });

export default function Page() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const response = await sendRequestToPublicAPI("GET", "/branch/list/");
            setBranches(response.branches || []);
            setLoading(false);
        };
        getData();
    }, []);

    return (
        <div className="max-w-2xl w-full mx-auto py-8 px-4 space-y-8 mb-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Салбарууд</h1>
            {loading ? (
                <InfoLoader />
            ) : branches.length === 0 ? (
                <div className="text-center text-gray-400">Салбар олдсонгүй.</div>
            ) : (
                branches.map((branch, idx) => {
                    const coords = branch.point ? branch.point.split(',').map(Number) : null;
                    const googleMapsUrl = coords ? `https://maps.google.com/?q=${coords[0]},${coords[1]}` : null;
                    return (
                        <div key={branch.id || idx} className="bg-white rounded-xl shadow p-6 space-y-4 border border-slate-100">
                            {branch.point && (
                                <div className="w-full mb-2">
                                    <MapPickerInline initialPoint={branch.point} zoom={15} />
                                </div>
                            )}
                            <div className="flex flex-col md:flex-row gap-4 items-stretch">
                                {branch.image && (
                                    <div className="md:w-1/4 w-full flex items-center justify-center mb-2 md:mb-0">
                                        <img src={branch.image} alt="Салбар зураг" className="w-full max-h-48 object-cover rounded-lg" />
                                    </div>
                                )}
                                {branch.description && (
                                    <div className="md:w-3/4 w-full prose prose-slate max-w-none mb-2 md:mb-0 flex flex-col justify-between">
                                        <div dangerouslySetInnerHTML={{ __html: branch.description }} />
                                        {coords && googleMapsUrl && (
                                            <div className="mt-2 flex justify-end">
                                                <a
                                                    href={googleMapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-600 underline text-sm"
                                                >
                                                    Google Map дээр харах
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
