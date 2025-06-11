'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens } from '@/lib/api-service';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const AuthorizePageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('authorization_code');
    const [error, setError] = useState<string | null>(null);
    const { refreshCart } = useCart();
    const { refreshWishlist } = useWishlist();
    const refreshCartRef = useRef(refreshCart);
    refreshCartRef.current = refreshCart;
    const refreshWishlistRef = useRef(refreshWishlist);
    refreshWishlistRef.current = refreshWishlist;

    useEffect(() => {
        if (code) {
            exchangeCodeForTokens(code, refreshCartRef.current, refreshWishlistRef.current)
                .then(() => {
                    router.replace('/account');
                })
                .catch((error) => {
                    setError('Нэвтрэхэд алдаа гарлаа. Дараа дахин оролдоно уу.');
                    console.error('Failed to exchange code for tokens:', error);
                });
        } else {
            setError('Баталгаажуулах код олдсонгүй.');
        }
    }, [code, router]);

    return (
        <div className="flex items-center justify-center pt-20">
            <div className="inset-0 bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
                {error ? (
                    <>
                    <div className="text-red-600 font-semibold mb-4">{error}</div>
                    <button
                        className="mt-2 px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                        onClick={() => router.replace('/')}
                    >
                        Нүүр хуудас
                    </button>
                    </>
                ) : (
                    <>
                    <div className="flex justify-center mb-4">
                        <span className="relative flex h-8 w-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-600 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-8 w-8 bg-slate-600"></span>
                        </span>
                    </div>
                    <div className="text-gray-700 font-medium">Баталгаажуулж байна...</div>
                    </>
                )}
            </div>
        </div>
    );
};

const AuthorizePage = () => (
    <Suspense fallback={<div className="flex items-center justify-center pt-20"><div className="text-gray-700">Уншиж байна...</div></div>}>
        <AuthorizePageContent />
    </Suspense>
);

export default AuthorizePage;
