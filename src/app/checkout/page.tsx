'use client';
import React, { useState, useRef, useEffect } from 'react';
import CartSummary from '@/components/menu/CartSummary';
import { getDistrict, getKhoroo, getPoint } from '@/components/address/addresses';
import { sendRequestToPublicAPI, sendRequestWithToken } from '@/lib/api-service';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { clearCart } from '@/lib/cart';
import { isLoggedIn } from '@/lib/cookie-manipulation';
import { UserData } from '@/lib/interfaces';
import Loader from './Loader';
import PersonalInfo from './PersonalInfo';
import AddressSelector from './AddressSelector';
import TurnstileWidget, { TurnstileWidgetRef } from '@/components/TurnstileWidget';
import EmailVerify, { EmailVerifyRef } from './EmailVerify';
import PhoneNumbers from './PhoneNumbers';


export default function CheckoutPage() {
	const { cart } = useCart();
	const cartSummaryRef = useRef<{ refreshVariantList: () => Promise<void> }>(null);
	const orderTurnstileRef = useRef<TurnstileWidgetRef>(null);
	const phoneInputRef = useRef<HTMLInputElement | null>(null); // Ref for PhoneNumbers
	const contactInfoRef = useRef<{ scrollToEmail: () => void; scrollToFirstInvalidPhone: () => void } | null>(null);
	const addressSelectorRef = useRef<{ scrollToAddressTop: () => void }>(null);
	const emailVerifyRef = useRef<EmailVerifyRef>(null);
	const [formFields, setFormFields] = useState({
		email: '',
		name: '',
		phone_numbers: '',
		is_business: false,
		ttd: '',
		consumer_no: '',
		note: '',
		address_city: 'Улаанбаатар',
		address_district: '',
		address_khoroo: '',
		address_description: '',
		address_point: '47.918, 106.917',
	});
	const [districts, setDistricts] = useState<string[]>(getDistrict("Улаанбаатар"));
	const [khoroos, setKhoroos] = useState<string[]>([]);
	const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
	const [submitting, setSubmitting] = useState(false);
	const [user, setUser] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [addressMode, setAddressMode] = useState<'manual' | 'saved'>('manual');
	const [emailVerified, setEmailVerified] = useState(false);
	const [showOrderTurnstile, setShowOrderTurnstile] = useState(false);
	const [pendingOrderPayload, setPendingOrderPayload] = useState<any>(null);
	const [mobileStickyTop, setMobileStickyTop] = useState(20);
	const lastScrollY = useRef(0);
	const [isMobile, setIsMobile] = useState(false);
	const [emailSetFromUser, setEmailSetFromUser] = useState(false);

	useEffect(() => {
		if (!isLoggedIn()) {
			setLoading(false);
			return;
		}
		
		sendRequestWithToken('GET', `${process.env.NEXT_PUBLIC_API_URL}/provider/user-info/`)
			.then((data) => {
				if (data) {
					setUser(data);
					setFormFields((prev) => ({
						...prev,
						email: data.profile.email || '',
						name: data.profile.name || '',
						phone_numbers: data.profile.phone_numbers || '',
						is_business: data.profile.is_business || false,
						ttd: data.profile.ttd || '',
						consumer_no: data.profile.consumer_no || '',
					}));
					setEmailSetFromUser(true);
				}
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (emailSetFromUser && formFields.email) {
			console.log('Email set from user, checking email verification...');
			emailVerifyRef.current?.checkEmail();
			setEmailSetFromUser(false);
		}
	}, [formFields.email, emailSetFromUser]);

	useEffect(() => {
		if (user && user.profile && user.profile.phone_numbers) {
			setFormFields((prev) => ({
				...prev,
				phone_numbers: user.profile.phone_numbers
			}));
		}
	}, [user]);

	useEffect(() => {
		cartSummaryRef.current?.refreshVariantList();
	}, []);

	// Responsive mobile detection
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 1024 && window.innerWidth > 768);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	useEffect(() => {
		if (!isMobile) return;
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					const currentY = window.scrollY;
					if (currentY < lastScrollY.current) {
						setMobileStickyTop(90); // Scrolling up
					} else {
						setMobileStickyTop(20); // Scrolling down
					}
					lastScrollY.current = currentY;
					ticking = false;
				});
				ticking = true;
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [isMobile]);

	const handleCityChange = (city: string) => {
		const cityPoint = getPoint(city)[0] || '47.918, 106.917';
		setFormFields((prev) => ({
			...prev,
			address_city: city,
			address_district: '',
			address_khoroo: '',
			address_point: cityPoint,
		}));
		setDistricts(getDistrict(city));
		setKhoroos([]);
	};
	const handleDistrictChange = (district: string) => {
		setFormFields((prev) => ({
			...prev,
			address_district: district,
			address_khoroo: '',
		}));
		setKhoroos(getKhoroo(formFields.address_city, district));
	};
	const handleKhorooChange = (khoroo: string) => {
		setFormFields((prev) => ({
			...prev,
			address_khoroo: khoroo,
		}));
	};
	const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type, checked } = e.target as HTMLInputElement;
		setFormFields((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};
	const validate = () => {
		const errors: { [k: string]: string } = {};
		if (!formFields.email) errors.email = 'И-мэйл шаардлагатай';
		if (!formFields.name) errors.name = 'Нэр шаардлагатай';
		if (!formFields.phone_numbers) errors.phone_numbers = 'Утас шаардлагатай';
		if (!formFields.address_city) errors.address_city = 'Хот/Аймаг сонгоно уу';
		if (!formFields.address_district) errors.address_district = 'Дүүрэг/Сум сонгоно уу';
		if (!formFields.address_khoroo) errors.address_khoroo = 'Хороо/Баг сонгоно уу';
		if (!formFields.address_description) errors.address_description = 'Дэлгэрэнгүй хаяг шаардлагатай';
		return errors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const errors = validate();
		if (!emailVerified) {
			contactInfoRef.current?.scrollToEmail();
			toast.error('Имэйлээ баталгаажуулна уу.');
			return;
		}
		if (!cart.length) {
			toast.error('Сагс хоосон байна. Бараа сонгоно уу.');
			return;
		}
		if (errors.phone_numbers) {
			setFormErrors(errors);
			contactInfoRef.current?.scrollToFirstInvalidPhone();
			return;
		}
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			if (errors.address_city || errors.address_district || errors.address_khoroo || errors.address_description) {
				addressSelectorRef.current?.scrollToAddressTop();
			}
			return;
		}
		const products = cart.map(({ sku, price, amount }: any) => ({ sku, price, amount }));
		const payload = {
			products,
			name: formFields.name,
			phone_numbers: formFields.phone_numbers,
			email: formFields.email,
			note: formFields.note,
			address_point: formFields.address_point,
			address_city: formFields.address_city,
			address_district: formFields.address_district,
			address_khoroo: formFields.address_khoroo,
			address_description: formFields.address_description,
			is_business: formFields.is_business,
			...(formFields.is_business && formFields.ttd ? { ttd: formFields.ttd } : {}),
			...(!formFields.is_business && formFields.consumer_no ? { consumer_no: formFields.consumer_no } : {})
		};
		setPendingOrderPayload(payload);
		setShowOrderTurnstile(true);
	};

	const handleOrderTurnstileVerify = async (token: string) => {
		if (!pendingOrderPayload) return;
		setSubmitting(true);
		let response;
		try {
			if (isLoggedIn()) {
				response = await sendRequestWithToken('POST', `${process.env.NEXT_PUBLIC_API_URL}/provider/submit-order/`, {
					...pendingOrderPayload,
					token, // Include Turnstile token
				});
			} else {
				response = await sendRequestToPublicAPI('POST', '/order/create/', {
					...pendingOrderPayload,
					token, // Include Turnstile token
				});
			}

			if (response && response.order && response.order.id) {
				toast.success('Захиалга амжилттай илгээгдлээ!');
				clearCart();
				window.location.href = `/order/${response.order.id}`;
			} else {
				window.scrollTo({ top: 0, behavior: 'smooth' });
				cartSummaryRef.current?.refreshVariantList();
				setSubmitting(false);
			}
		} catch (error) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
			console.error('Order submission failed:', error);
			toast.error('Захиалга илгээхэд алдаа гарлаа.');
			setSubmitting(false);
		} finally {
			setShowOrderTurnstile(false);
			setPendingOrderPayload(null);
		}
	};

	// Setup contactInfoRef for scrollToFirstInvalidPhone
	useEffect(() => {
		contactInfoRef.current = {
			scrollToEmail: () => {
				const emailInput = document.querySelector('input[name="email"]');
				if (emailInput) (emailInput as HTMLElement).focus();
			},
			scrollToFirstInvalidPhone: () => {
				if (phoneInputRef.current) {
					phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
					phoneInputRef.current.focus();
				}
			}
		};
	}, []);

	const onClearError = (field: string) => {
	setFormErrors((prev) => {
		const rest = { ...prev };
		delete rest[field];
		return rest;
	});
	};

	if (loading) return <Loader />;

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 min-h-screen'>
			<div className='md:bg-gray-100 md:order-2'>
				<div
					className="sticky self-start md:max-w-xl md:ps-6 md:pb-10 md:pe-4 px-4 md:pt-0 pt-6"
					style={{
						top: isMobile ? `${mobileStickyTop}px` : '130px',
						height: 'fit-content',
						transition: 'top 0.25s cubic-bezier(0.4,0,0.2,1)',
					}}
				>
					<h2 className="text-xl font-semibold px-4">Таны сагс</h2>
					<CartSummary ref={cartSummaryRef} noteEnabled={true}/>
				</div>
			</div>

			<div className='w-full flex flex-col items-end md:order-1'>
				<div className='md:max-w-xl flex flex-col items-end md:pe-10 md:pt-4 lg:pt-10 md:ps-4 pt-6 px-8'>
					{!user &&
						<div className="flex items-center bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 shadow-sm">
							<svg className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
							</svg>
							<div className="flex-1 text-sm text-gray-700">
								<div>
									<span className="font-medium text-gray-900">Бүртгүүлснээр</span> хаяг болон мэдээлэл автоматаар бөглөгдөх ба өөрийн захиалгын түүхийг хамгаалах, харах давуу талтай юм.
								</div>
								<Link
									className="inline-block mt-2 text-yellow-700 font-semibold underline hover:text-yellow-900 transition"
									href="/account"
								>
									Нэвтрэх / Бүртгүүлэх
								</Link>
							</div>
						</div>
					}
					<form id="checkout-form" onSubmit={handleSubmit}>
						<h2 className="text-xl font-semibold">Холбоо барих</h2>
						<div className='text-sm p-2 bg-gray-100 text-gray-600 rounded-xl mt-4'>Таны захиалгын мэдээллийг баталгаажуулсан имэйлд илгээх болохоор заавал нэг удаа имэйлээ баталгаажуулах шаардлагатай.</div>
						{/* INPUTS ARE ONLY PLACEHOLDERS CURRENTLY SHOULD BE CHANGED TO FIT YOUR USE CASE. */}
						<div className="mt-4">
							<EmailVerify
								email={formFields.email}
								error={formErrors.email}
								onChange={handleFieldChange}
								setEmailVerified={setEmailVerified}
								ref={emailVerifyRef}
								onClearError={(field) => onClearError(field)}
							/>
						</div>
						<div className="mt-4">
							<PhoneNumbers
								phoneNumbers={formFields.phone_numbers}
								onChange={handleFieldChange}
								error={formErrors.phone_numbers}
								ref={phoneInputRef}
								onClearError={(field) => onClearError(field)}
							/>
						</div>
						<AddressSelector
							user={user}
							addressMode={addressMode}
							setAddressMode={setAddressMode}
							formFields={formFields}
							setFormFields={setFormFields}
							districts={districts}
							setDistricts={setDistricts}
							khoroos={khoroos}
							setKhoroos={setKhoroos}
							formErrors={formErrors}
							handleCityChange={handleCityChange}
							handleDistrictChange={handleDistrictChange}
							handleKhorooChange={handleKhorooChange}
							handleFieldChange={handleFieldChange}
							ref={addressSelectorRef}
							onClearError={(field) => onClearError(field)}
						/>
						<PersonalInfo
							formFields={formFields}
							formErrors={formErrors}
							handleFieldChange={handleFieldChange}
							onClearError={(field) => onClearError(field)}
						/>

						{showOrderTurnstile && (
							<div className="flex justify-center my-4">
								<TurnstileWidget ref={orderTurnstileRef} onVerify={handleOrderTurnstileVerify} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />
							</div>
						)}
						<button
							type="submit"
							form="checkout-form"
							className="mt-4 w-full py-3 mb-8 bg-slate-800 text-white rounded-xl text-xl font-semibold shadow disabled:opacity-60"
							disabled={submitting || showOrderTurnstile}
						>
							{submitting ? 'Илгээж байна...' : 'Захиалга өгөх'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}