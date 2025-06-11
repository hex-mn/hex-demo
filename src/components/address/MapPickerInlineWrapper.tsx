"use client";

import dynamic from "next/dynamic";

const MapPickerInline = dynamic(() => import("./MapPickerInline"), { ssr: false });

export default MapPickerInline;