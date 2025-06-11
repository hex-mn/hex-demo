"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPickerInlineProps {
    initialPoint?: string;
    centerPoint?: string; // new prop
    onSelect?: (lat: number, lng: number) => void;
    zoom?: number;
}

const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
});

function ClickableMap({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MapPickerInline({ initialPoint, centerPoint, onSelect, zoom=13 }: MapPickerInlineProps) {
    const [marker, setMarker] = useState<[number, number]>(
        initialPoint ? (initialPoint.split(",").map(Number) as [number, number]) : [47.918, 106.917]
    );
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (centerPoint) {
            const [lat, lng] = centerPoint.split(",").map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMarker([lat, lng]);
            }
        }
    }, [centerPoint]);

    const handleMapClick = (lat: number, lng: number) => {
        setMarker([lat, lng]);
        if (onSelect) {
            onSelect(lat, lng);
        }
    };

    return (
        <div className="w-full h-[300px] flex flex-col border border-slate-200 rounded-lg overflow-hidden select-none">
            <div className="flex-1">
                {isClient && (
                    <MapContainer center={marker} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {onSelect && <ClickableMap onClick={handleMapClick} />}
                        <Marker position={marker} icon={defaultIcon} />
                        <RecenterMap center={marker} />
                    </MapContainer>
                )}
            </div>
        </div>
    );
}
