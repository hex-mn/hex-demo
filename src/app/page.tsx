"use client";

import GridLayout from "@/components/GridLayout";
import { sendRequestToPublicAPI } from "@/lib/api-service";
import { useEffect, useState } from "react";

export default function Page() {
	const [mobileData, setMobileData] = useState([]);
	const [desktopData, setDesktopData] = useState([]);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const getData = async () => {
			const response = await sendRequestToPublicAPI("GET", "/homepage/get/");
			setMobileData(response.mobile);
			setDesktopData(response.desktop);
		};
		getData();

		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<GridLayout data={isMobile ? mobileData : desktopData} />
	);
}
