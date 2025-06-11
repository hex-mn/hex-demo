// PhoneNumbers.tsx
// This component allows users to add, validate, and manage a list of Mongolian 8-digit phone numbers during checkout. It provides UI for input, validation, error display, and removal of phone numbers.
//
// Props:
// - phoneNumbers: Comma-separated string of phone numbers
// - onChange: Callback when the list of valid phone numbers changes
// - error: Optional error message
// - onClearError: Optional callback to clear errors

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { CgClose } from 'react-icons/cg';

interface PhoneNumbersProps {
	phoneNumbers: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	error?: string;
	onClearError?: (field: string) => void;
}

function validatePhone(phone: string) {
	const cleaned = phone.replace(/\D/g, '');
	return /^\d{8}$/.test(cleaned);
}

const PhoneNumbers = forwardRef<HTMLInputElement, PhoneNumbersProps>(
	({ phoneNumbers, onChange, error, onClearError }, ref) => {
		const [touched, setTouched] = useState(false);
		const [invalidIndexes, setInvalidIndexes] = useState<number[]>([]);
		const [inputList, setInputList] = useState<string[]>([]);
		const [currentInput, setCurrentInput] = useState('');

		useEffect(() => {
			const phones = (phoneNumbers || '')
				.split(',')
				.map((p) => p.trim())
				.filter((p) => p.length > 0);
			setInputList(phones);
		}, [phoneNumbers]);

		useEffect(() => {
			const invalids: number[] = [];
			inputList.forEach((p, i) => {
				if (!validatePhone(p)) invalids.push(i);
			});
			setInvalidIndexes(invalids);
		}, [inputList]);

		const inputRef = React.useRef<HTMLInputElement>(null);
		useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

		const handleAdd = (e?: React.FormEvent) => {
			if (e) e.preventDefault();
			const phone = currentInput.trim();
			if (!phone) return;
			setTouched(true);
			const newList = [...inputList, phone];
			setInputList(newList);
			setCurrentInput('');
			// Notify parent
			const validPhones = newList.filter((p) => validatePhone(p));
			const fakeEvent = {
				target: {
					name: 'phone_numbers',
					value: validPhones.join(',')
				}
			} as React.ChangeEvent<HTMLInputElement>;
			onChange(fakeEvent);
			if (onClearError) onClearError('phone_numbers');
		};

		const handleRemove = (idx: number) => {
			const newList = inputList.filter((_, i) => i !== idx);
			setInputList(newList);
			const validPhones = newList.filter((p) => validatePhone(p));
			const fakeEvent = {
				target: {
					name: 'phone_numbers',
					value: validPhones.join(',')
				}
			} as React.ChangeEvent<HTMLInputElement>;
			onChange(fakeEvent);
			if (onClearError) onClearError('phone_numbers');
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setCurrentInput(e.target.value);
			if (onClearError) onClearError('phone_numbers');
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				handleAdd();
			}
		};

		return (
			<div className="w-full">
				<label className="block text-sm font-medium text-slate-800 mb-1">Утасны дугаарууд</label>
				<div className="grid grid-cols-12 gap-2 w-full">
					<input
						ref={inputRef}
						type="text"
						name="phone_number_add"
						className={`col-span-9 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 w-full ${error || (touched && currentInput && !validatePhone(currentInput)) ? 'border-red-400' : 'border-gray-300'}`}
						value={currentInput}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder="Жишээ: 88112233"
						maxLength={8}
						autoComplete="off"
					/>
					<button
						type="button"
						className="col-span-3 bg-slate-500  text-white font-semibold rounded-lg px-2 py-2 w-full text-xs hover:scale-105 transition-transform"
						onClick={handleAdd}
					>
						Нэмэх
					</button>
				</div>
				<div className="mt-2 grid grid-cols-2 gap-2 w-full">
					{inputList.map((phone, idx) => (
						<div
							key={idx}
							className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${invalidIndexes.includes(idx) ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300 bg-gray-50 text-gray-800'}`}
						>
							<span>{phone}</span>
							<button
								type="button"
								className="ml-2 text-xs text-gray-400 hover:text-red-500"
								onClick={() => handleRemove(idx)}
								aria-label="Remove phone"
							>
								<CgClose size={16}/>
							</button>
						</div>
					))}
				</div>
				<div className="mt-1 text-xs text-gray-500">8 оронтой дугааруудыг тус бүрээр нь нэмнэ үү.</div>
				{((touched && invalidIndexes.length > 0) || error) && (
					<div className="mt-1 text-xs text-red-500">
						{error || 'Дараах дугаарууд буруу байна:'}
						<ul className="list-disc ml-5">
							{invalidIndexes.map((idx) => (
								<li key={idx}>{inputList[idx]}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	}
);

PhoneNumbers.displayName = 'PhoneNumbers';

export default PhoneNumbers;
