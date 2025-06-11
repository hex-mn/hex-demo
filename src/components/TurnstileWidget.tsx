import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

declare global {
	interface Window {
		turnstile?: {
			render: (el: HTMLElement, options: any) => any;
			reset: (widgetId: any) => void;
		};
	}
}

interface TurnstileWidgetProps {
	onVerify: (token: string) => void;
	siteKey: string;
}

export interface TurnstileWidgetRef {
	reset: () => void;
}

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
	({ onVerify, siteKey }, ref) => {
		const widgetRef = useRef<HTMLDivElement>(null);
		const widgetIdRef = useRef<any>(null);
		const initializedRef = useRef(false);

		const handleVerify = useCallback(
			(token: string) => {
				onVerify(token);
			},
			[onVerify]
		);

		const renderTurnstile = useCallback(() => {
			if (widgetRef.current && window.turnstile && !widgetIdRef.current) {
				widgetRef.current.innerHTML = "";
				widgetIdRef.current = window.turnstile.render(widgetRef.current, {
					sitekey: siteKey,
					callback: handleVerify,
				});
			}
		}, [handleVerify, siteKey]);

		useEffect(() => {
			if (initializedRef.current) return;
			initializedRef.current = true;
			const scriptId = "cf-turnstile-script";
			if (document.getElementById(scriptId)) {
				if (window.turnstile) {
					renderTurnstile();
				}
				return;
			}
			const script = document.createElement("script");
			script.id = scriptId;
			script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
			script.async = true;
			script.onload = () => {
				renderTurnstile();
			};
			document.body.appendChild(script);
		}, [renderTurnstile]);

		// Expose reset method to parent
		useImperativeHandle(ref, () => ({
			reset: () => {
				if (window.turnstile && widgetIdRef.current) {
					window.turnstile.reset(widgetIdRef.current);
				}
			},
		}));

		return <div ref={widgetRef} className="w-[300px] h-[60px] bg-gray-100 " />;
	}
);

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
