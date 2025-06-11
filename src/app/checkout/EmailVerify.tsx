import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { sendRequestToPublicAPI } from '@/lib/api-service';
import { FaCheckCircle } from 'react-icons/fa';
import TurnstileWidget, { TurnstileWidgetRef } from '@/components/TurnstileWidget';

interface EmailVerifyProps {
	email: string;
	error?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	setEmailVerified?: (v: boolean) => void;
	disabled?: boolean;
	onClearError?: (field: string) => void;
}

export interface EmailVerifyRef {
	checkEmail: () => void;
}

const STORE_SLUG = process.env.NEXT_PUBLIC_SLUG;

const EmailVerify = forwardRef<EmailVerifyRef, EmailVerifyProps>(
	({ email, error, onChange, setEmailVerified, disabled, onClearError }, ref) => {
		const [status, setStatus] = useState<'idle' | 'turnstile' | 'code' | 'valid'>('idle');
		const [isLoading, setIsLoading] = useState(false);
		const [code, setCode] = useState('');
		const [attempts, setAttempts] = useState(0);

		const turnstileRef = useRef<TurnstileWidgetRef>(null);
		const inputRef = useRef<HTMLInputElement>(null);
		const prevEmailRef = useRef<string>("");
		const fromInputRef = useRef(false);

		useImperativeHandle(ref, () => ({
			checkEmail: () => {
				// Always reset status and send code when called programmatically
				setStatus('idle');
				setTimeout(() => {
					if (email) {
						handleSendCode();
					}
				}, 0);
			}
		}));

		useEffect(() => {
			setStatus('idle');
			setCode('');
			setAttempts(0);
			setEmailVerified?.(false);
		}, [email, setEmailVerified]);

		useEffect(() => {
			// Only auto-send if email is set programmatically (not from input)
			if (
				email &&
				prevEmailRef.current === '' &&
				!fromInputRef.current &&
				status === 'idle'
			) {
				handleSendCode();
			}
			prevEmailRef.current = email;
			fromInputRef.current = false; // reset after effect
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [email]);

		const handleSendCode = () => {
			if (!email) return;
			setStatus('turnstile');
		};

		const handleTurnstileVerify = async (token: string) => {
			setIsLoading(true);
			try {
				const resp = await sendRequestToPublicAPI(
					'POST',
					'/email/send/',
					{ store_slug: STORE_SLUG, email, token },
					false
				);

				if (resp?.state === 'valid') {
					setStatus('valid');
					setEmailVerified?.(true);
				} else if (resp?.state === 'sent') {
					setStatus('code');
				} else {
					setStatus('idle');
				}
			} catch {
				setStatus('idle');
			}
			setIsLoading(false);
		};

		const handleCodeVerify = async () => {
			if (!email || !code) {
				return;
			}

			setIsLoading(true);

			try {
				const resp = await sendRequestToPublicAPI(
					'POST',
					'/email/verify/',
					{ store_slug: STORE_SLUG, email, code },
					false
				);

				if (resp?.state === 'valid') {
					setStatus('valid');
					setEmailVerified?.(true);
					setCode('');
				} else {
					const newAttempts = attempts + 1;
					setAttempts(newAttempts);
					setCode('');

					if (newAttempts >= 10) {
						setStatus('idle');
						setAttempts(0);
					}
				}
			} catch (e: any) {
				console.log('Email verification error:', e);
				const newAttempts = attempts + 1;
				setAttempts(newAttempts);
				setCode('');

				if (newAttempts >= 10) {
					setStatus('idle');
					setAttempts(0);
				}
			}
			setIsLoading(false);
		};

		return (
			<div>
				<label htmlFor="email" className="block text-sm font-medium mb-1">
					И-мэйл <span className="text-red-500">*</span>
				</label>
				<div className="flex gap-2 items-center relative">
					<input
						id="email"
						name="email"
						placeholder="И-мэйл"
						value={email}
						onChange={e => {
							fromInputRef.current = true;
							onChange(e);
							setStatus('idle');
							setCode('');
							setAttempts(0);
							setEmailVerified?.(false);
							if (onClearError) onClearError('email');
						}}
						className={`text-sm w-full px-4 py-3 bg-white text-black border rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-slate-500'
							}`}
						disabled={isLoading || disabled}
						ref={inputRef}
					/>
					{status === 'valid' ? (
						<span className="absolute right-4 text-green-600 text-xl">
							<FaCheckCircle />
						</span>
					) : (
						<button
							type="button"
							className="px-3 py-3 w-30 bg-green-600 text-white rounded-lg text-xs font-semibold disabled:opacity-60 border border-green-600 hover:scale-105 transition-transform"
							disabled={isLoading || status === 'turnstile' || !email}
							onClick={handleSendCode}
						>
							Код илгээх
						</button>
					)}
				</div>
				{error && <span className="text-xs text-red-500 block mt-1">{error}</span>}

				{status === 'turnstile' && (
					<div className="flex justify-center my-2">
						<TurnstileWidget
							ref={turnstileRef}
							onVerify={handleTurnstileVerify}
							siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
						/>
					</div>
				)}

				{status === 'code' && (
					<div className="flex flex-col gap-1 my-2 pb-2">
						<div className="flex gap-2 items-center">
							<input
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={code}
								onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
								className="w-32 h-12 text-center text-xl border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition bg-white"
								autoComplete="one-time-code"
								disabled={isLoading}
							/>
							<button
								type="button"
								className="px-3 py-3 border border-slate-600 bg-slate-600 text-white rounded text-sm font-semibold disabled:opacity-60 hover:scale-105 transition-transform"
								disabled={isLoading || code.length !== 6}
								onClick={handleCodeVerify}
							>
								Баталгаажуулах
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}
);


EmailVerify.displayName = 'EmailVerify';
export default EmailVerify;
