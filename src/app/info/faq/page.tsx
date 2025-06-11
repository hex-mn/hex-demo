"use client";

import { sendRequestToPublicAPI } from "@/lib/api-service";
import { useEffect, useState } from "react";
import { CgChevronDown } from "react-icons/cg";
import InfoLoader from "@/app/info/InfoLoader";

export default function Page() {
    const [faqs, setFaqs] = useState<{question: string; answer: string}[]>([]);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const response = await sendRequestToPublicAPI("GET", `/faq/get/`);
            setFaqs(response.faqs || []);
            setLoading(false);
        };
        getData();
    }, []);


    return (
        <div className="max-w-3xl w-full mx-auto py-8 px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Түгээмэл асуулт хариулт</h1>
            <div className="space-y-4">
                {loading ? (
                    <InfoLoader />
                ) : faqs.length === 0 ? (
                    <div className="text-center text-gray-400">Асуулт хариулт олдсонгүй.</div>
                ) : (
                    faqs.map((faq, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                            <button
                                className="w-full text-left px-5 py-4 font-semibold text-lg flex justify-between items-center focus:outline-none hover:bg-slate-50 transition"
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                aria-expanded={openIndex === idx}
                            >
                                <span>{faq.question}</span>
                                <span className={`ml-2 transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`}>
                                   <CgChevronDown/>
                                </span>
                            </button>
                            <div
                                className={`px-5 pb-4 text-gray-700 transition-all duration-300 ease-in-out prose max-w-none ${openIndex === idx ? 'block' : 'hidden'}`}
                            >
                                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
