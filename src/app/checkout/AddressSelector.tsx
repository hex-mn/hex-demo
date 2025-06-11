import React from 'react';
import { getCity, getDistrict, getKhoroo } from '@/components/address/addresses';
import MapPickerInline from '@/components/address/MapPickerInlineWrapper';
import { BiChevronDown } from 'react-icons/bi';

interface AddressSelectorProps {
	user: any;
	addressMode: 'manual' | 'saved';
	setAddressMode: (mode: 'manual' | 'saved') => void;
	formFields: any;
	setFormFields: any;
	districts: string[];
	setDistricts: any;
	khoroos: string[];
	setKhoroos: any;
	formErrors: any;
	handleCityChange: (city: string) => void;
	handleDistrictChange: (district: string) => void;
	handleKhorooChange: (khoroo: string) => void;
	handleFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	onClearError?: (field: string) => void;
}

const AddressSelector = React.forwardRef<any, AddressSelectorProps>(({
	user,
	addressMode,
	setAddressMode,
	formFields,
	setFormFields,
	districts,
	setDistricts,
	khoroos,
	setKhoroos,
	formErrors,
	handleCityChange,
	handleDistrictChange,
	handleKhorooChange,
	handleFieldChange,
	onClearError,
}, ref) => {
	// Ref for scrolling to the top of address section
	const addressTopRef = React.useRef<HTMLDivElement>(null);

	// Expose scrollToAddressTop method for parent
	React.useImperativeHandle(ref, () => ({
		scrollToAddressTop: () => {
			if (addressTopRef.current) {
				addressTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
				addressTopRef.current.focus?.();
			}
		}
	}), []);

	return (
		<>
			<div ref={addressTopRef} tabIndex={-1} />
			<h2 className="text-xl font-semibold mt-4">Хаяг</h2>
			{user && user.addresses?.length > 0 && (
				<div className="mt-4 flex flex-col gap-2 p-4 bg-white border border-slate-300 rounded-xl shadow-sm">
					<button
						type="button"
						className={`w-full text-left px-4 py-3 border rounded-sm transition text-sm flex items-center gap-2 
			  ${addressMode === 'manual' ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400 font-semibold' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
						onClick={() => setAddressMode('manual')}
						aria-pressed={addressMode === 'manual'}
					>
						{addressMode === 'manual' && (
							<svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
						)}
						<span>Бүртгэлгүй хаяг</span>
					</button>
					{user.addresses.map((addr: any) => {
						const isSelected =
							addressMode === 'saved' &&
							formFields.address_city === addr.city &&
							formFields.address_district === addr.district &&
							formFields.address_khoroo === addr.khoroo &&
							formFields.address_description === addr.description;
						return (
							<button
								key={addr.id}
								type="button"
								className={`w-full text-left px-4 py-3 border rounded-sm transition text-sm flex items-center gap-2 
				  ${isSelected ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400 font-semibold' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
								onClick={() => {
									setFormFields((prev: any) => ({
										...prev,
										address_city: addr.city,
										address_district: addr.district,
										address_khoroo: addr.khoroo,
										address_description: addr.description,
										address_point: addr.point,
									}));
									setDistricts(getDistrict(addr.city));
									setKhoroos(getKhoroo(addr.city, addr.district));
									setAddressMode('saved');
								}}
								aria-pressed={isSelected}
							>
								{isSelected && (
									<svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
								)}
								<span>{addr.city}, {addr.district}, {addr.khoroo}, {addr.description}</span>
							</button>
						);
					})}
				</div>
			)}
			<div className="mt-4">
				<label htmlFor="address_city" className="block text-sm font-medium text-slate-800 mb-1">
					Хот/Аймаг <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<select
						id="address_city"
						name="address_city"
						value={formFields.address_city}
						onChange={e => {
							handleCityChange(e.target.value);
							if (onClearError) onClearError('address_city');
						}}
						className={`appearance-none w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 transition pr-10
			${addressMode === 'saved' ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80' : 'bg-white text-black'}`}
						disabled={addressMode === 'saved'}
					>
						<option value="">Хот/Аймаг сонгох</option>
						{getCity().map((city: string) => (
							<option key={city} value={city}>{city}</option>
						))}
					</select>
					<span className="pointer-events-none absolute right-3 top-3 text-slate-400">
						<BiChevronDown size={24} />
					</span>
				</div>
				{formErrors.address_city && <span className="text-xs text-red-500">{formErrors.address_city}</span>}
			</div>
			<div className="mt-4">
				<label htmlFor="address_district" className="block text-sm font-medium text-slate-800 mb-1">
					Дүүрэг/Сум <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<select
						id="address_district"
						name="address_district"
						value={formFields.address_district}
						onChange={e => {
							handleDistrictChange(e.target.value);
							if (onClearError) onClearError('address_district');
						}}
						className={`appearance-none w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 transition pr-10
			${!formFields.address_city || addressMode === 'saved' ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80' : 'bg-white text-black'}`}
						disabled={!formFields.address_city || addressMode === 'saved'}
					>
						<option value="">Дүүрэг/Сум сонгох</option>
						{districts.map((district: string) => (
							<option key={district} value={district}>{district}</option>
						))}
					</select>
					<span className="pointer-events-none absolute right-3 top-3 text-slate-400">
						<BiChevronDown size={24} />
					</span>
				</div>
				{formErrors.address_district && <span className="text-xs text-red-500">{formErrors.address_district}</span>}
			</div>
			<div className="mt-4">
				<label htmlFor="address_khoroo" className="block text-sm font-medium text-slate-800 mb-1">
					Хороо/Баг <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<select
						id="address_khoroo"
						name="address_khoroo"
						value={formFields.address_khoroo}
						onChange={e => {
							handleKhorooChange(e.target.value);
							if (onClearError) onClearError('address_khoroo');
						}}
						className={`appearance-none w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 transition pr-10
			${!formFields.address_district || addressMode === 'saved' ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80' : 'bg-white text-black'}`}
						disabled={!formFields.address_district || addressMode === 'saved'}
					>
						<option value="">Хороо/Баг сонгох</option>
						{khoroos.map((khoroo: string) => (
							<option key={khoroo} value={khoroo}>{khoroo}</option>
						))}
					</select>
					<span className="pointer-events-none absolute right-3 top-3 text-slate-400">
						<BiChevronDown size={24} />
					</span>
				</div>
				{formErrors.address_khoroo && <span className="text-xs text-red-500">{formErrors.address_khoroo}</span>}
			</div>
			<div className="mt-4">
				<label htmlFor="address_description" className="block text-sm font-medium text-slate-800 mb-1">
					Дэлгэрэнгүй хаяг <span className="text-red-500">*</span>
				</label>
				<input
					id="address_description"
					type="text"
					name="address_description"
					placeholder="Дэлгэрэнгүй хаяг*"
					value={formFields.address_description}
					onChange={e => {
						handleFieldChange(e);
						if (onClearError) onClearError('address_description');
					}}
					className={`text-sm w-full px-4 py-3 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition 
			${addressMode === 'saved' ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-80' : 'bg-white text-black'}`}
					disabled={addressMode === 'saved'}
				/>
				{formErrors.address_description && <span className="text-xs text-red-500">{formErrors.address_description}</span>}
			</div>
			<div className='mt-4'>
				{addressMode === 'saved' ? <MapPickerInline
					zoom={13}
					centerPoint={formFields.address_point}
				/> : <MapPickerInline
					zoom={13}
					centerPoint={formFields.address_point}
					onSelect={(lat: number, lng: number) => {
						setFormFields((f: any) => ({ ...f, point: `${lat},${lng}` }));
					}}
				/>}
			</div>
		</>
	);
});
AddressSelector.displayName = 'AddressSelector';
export default AddressSelector;
