"use client";

import GridLayout from "@/components/GridLayout";
import { sendRequestToPublicAPI } from "@/lib/api-service";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const pageSlug = params?.slug;
    const [mobileData, setMobileData] = useState([]);
    const [desktopData, setDesktopData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [pageName, setPageName] = useState("");

    useEffect(() => {
        const getData = async () => {
            if (!pageSlug) return;
            const response = await sendRequestToPublicAPI("GET", `/page/get/${pageSlug}/`);
            setMobileData(response.mobile || []);
            setDesktopData(response.desktop || []);
            setPageName(response.name || "");
        };
        getData();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [pageSlug]);

    useEffect(() => {
        if (pageName) {
            document.title = pageName;
        }
    }, [pageName]);

    return (
        <>
            <GridLayout data={isMobile ? mobileData : desktopData} />
        </>
    );
}
