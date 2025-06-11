import { FC } from "react";

interface ToggleSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
	return (
		<label className="relative inline-flex items-center cursor-pointer">
			<input
				type="checkbox"
				className="sr-only peer"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				disabled={disabled}
			/>
			<div
				className={`w-12 h-7 rounded-full transition-colors duration-300 ${
					disabled
						? "bg-gray-300"
						: checked
						? "bg-emerald-500"
						: "bg-gray-200 peer-focus:ring-2 peer-focus:ring-emerald-300"
				} relative`}
			>
				<span
					className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${
						checked ? "translate-x-5" : ""
					}`}
				></span>
			</div>
		</label>
	);
};

export default ToggleSwitch;
