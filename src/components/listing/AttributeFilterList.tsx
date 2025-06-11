"use client";

import { MdKeyboardArrowUp } from "react-icons/md";
import { useEffect, useState } from "react";
import { Attribute } from "@/lib/interfaces";


interface AttributeFilterListProps {
    attributes: Attribute[];
    availableAttributes: Attribute[];
    onToggleValue: (name: string, value: string) => void;
    selectedAttributes: { attribute: string; value: string }[];
}

export default function AttributeFilterList({
    attributes,
    availableAttributes,
    onToggleValue,
    selectedAttributes,
}: AttributeFilterListProps) {
    const [expandedAttributes, setExpandedAttributes] = useState<Set<number>>(new Set());

    const toggleExpand = (i: number) => {
        setExpandedAttributes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(i)) {
                newSet.delete(i);
            } else {
                newSet.add(i);
            }
            return newSet;
        });
    };

     useEffect(() => {
        const newSet = new Set<number>();
        attributes.forEach((attr, i) => {
            if (selectedAttributes.some(sa => sa.attribute === attr.name)) {
                newSet.add(i);
            }
        });
        setExpandedAttributes(newSet);
    }, [selectedAttributes, attributes]);

    return (
        <>
            {attributes.map((attr, i) => {
                const isOpen = expandedAttributes.has(i);
                return (
                    <div key={i} className="mb-3 rounded shadow-sm bg-white px-2 py-1">
                        <button
                            onClick={() => toggleExpand(i)}
                            className="flex items-center justify-between w-full px-3 py-2 font-medium text-gray-800"
                        >
                            {attr.name}
                            <span
                                className={`transition-transform duration-400 ${isOpen ? "rotate-180" : ""
                                    }`}
                            >
                                <MdKeyboardArrowUp size={20} />
                            </span>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out`}
                            style={{
                                maxHeight: isOpen ? 500 : 0,
                                opacity: isOpen ? 1 : 0,
                                paddingTop: isOpen ? 8 : 0,
                                paddingBottom: isOpen ? 8 : 0,
                            }}
                        >
                            {isOpen && (
                                <div className="px-4 py-2">
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {attr.values.map((val, j) => {
                                            const isAvailable =
                                                availableAttributes
                                                    .find(a => a.name === attr.name)
                                                    ?.values.some(v => v.value === val.value) ?? false;

                                            const colorRegex = /^#([0-9a-fA-F]{3,8})$/;
                                            const multiColorRegex = /^#([0-9a-fA-F]{3,8})(\/#([0-9a-fA-F]{3,8}))+$/;
                                            const isSingleColor = colorRegex.test(val.value.trim());
                                            const isMultiColor = multiColorRegex.test(val.value.trim());

                                            const opacityClass = isAvailable ? "" : "opacity-20 pointer-events-none";

                                            if (isSingleColor || isMultiColor) {
                                                const colors = val.value
                                                    .split("/")
                                                    .map((c) => c.trim())
                                                    .filter((c) => colorRegex.test(c));
                                                const inputId = `color-${i}-${j}`;
                                                return (
                                                    <label key={j} htmlFor={inputId} className={`cursor-pointer ${opacityClass}`}>
                                                        <input
                                                            id={inputId}
                                                            type="checkbox"
                                                            className="hidden peer"
                                                            onChange={() => onToggleValue(attr.name, val.value)}
                                                            checked={selectedAttributes.some(
                                                                (item) => item.attribute === attr.name && item.value === val.value
                                                            )}
                                                            disabled={!isAvailable}
                                                        />
                                                        <span
                                                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mr-2 transition-all duration-200
                                peer-checked:ring-2 peer-checked:ring-white peer-checked:border-4 peer-checked:border-black
                                peer-checked:shadow-[0_0_0_3px_rgba(0,0,0,0.6)]"
                                                            style={{
                                                                background:
                                                                    colors.length === 1
                                                                        ? colors[0]
                                                                        : colors.length === 2
                                                                            ? `linear-gradient(45deg, ${colors[0]} 50%, ${colors[1]} 50%)`
                                                                            : `linear-gradient(90deg, ${colors.join(", ")})`,
                                                            }}
                                                        />
                                                    </label>
                                                );
                                            }

                                            const inputId = `attr-${i}-${j}`;
                                            return (
                                                <label
                                                    key={j}
                                                    htmlFor={inputId}
                                                    className={`flex items-center space-x-2 text-gray-800 cursor-pointer ${opacityClass}`}
                                                >
                                                    <input
                                                        id={inputId}
                                                        type="checkbox"
                                                        className="hidden peer"
                                                        onChange={() => onToggleValue(attr.name, val.value)}
                                                        checked={selectedAttributes.some(
                                                            (item) => item.attribute === attr.name && item.value === val.value
                                                        )}
                                                        disabled={!isAvailable}
                                                    />
                                                    <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center transition-all duration-200 peer-checked:border-slate-400 peer-checked:bg-slate-400 peer-checked:shadow peer-hover:shadow-md">
                                                        <svg
                                                            className="w-3 h-3 text-white hidden peer-checked:block"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                    <span>{val.value}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
