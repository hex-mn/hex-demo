"use client";

import { sendRequestToPublicAPI } from "@/lib/api-service";
import InfoLoader from "@/app/info/InfoLoader";
import { useEffect, useState } from "react";

export default function Page() {
    const [pageContent, setPageContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const response = await sendRequestToPublicAPI("GET", `/description/get/`);
            setPageContent(response.description || "");
            setLoading(false);
        };
        getData();
    }, []);


    return (
        <div className="prose prose-slate max-w-3xl w-full text-lg md:text-xl text-gray-800 dark:prose-invert dark:text-gray-100 animate-fade-in mx-auto py-8 px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Бидний тухай</h1>
            {loading ? <InfoLoader /> : <div dangerouslySetInnerHTML={{ __html: pageContent }} />}
        </div>
    );
}
