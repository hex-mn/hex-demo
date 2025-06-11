import React from 'react';

interface PersonalInfoProps {
	formFields: any;
	formErrors: any;
	handleFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onClearError?: (field: string) => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ formFields, formErrors, handleFieldChange, onClearError }) => (
	<>
		<h2 className="text-xl font-semibold mt-4">Хувийн мэдээлэл</h2>
		<div className="mt-4">
			<label htmlFor="name" className="block text-sm font-medium text-slate-800 mb-1">
				Нэр <span className="text-red-500">*</span>
			</label>
			<input
				id="name"
				type="text"
				name="name"
				placeholder="Нэр*"
				value={formFields.name}
				onChange={e => {
					handleFieldChange(e);
					if (onClearError) onClearError('name');
				}}
				className="text-sm w-full px-4 py-3 bg-white text-black border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
			/>
			{formErrors.name && <span className="text-xs text-red-500">{formErrors.name}</span>}
		</div>
		<div className="mt-4 flex items-center space-x-2 ms-1 mb-2">
			<span className="text-sm text-slate-800">
				{formFields.is_business ? 'Байгууллага' : 'Хувь хүн'}
			</span>
			<label className="relative inline-flex items-center cursor-pointer">
				<input
					type="checkbox"
					name="is_business"
					checked={formFields.is_business}
					onChange={e => {
						handleFieldChange(e);
						if (onClearError) onClearError('is_business');
					}}
					className="sr-only peer"
				/>
				<div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-500 rounded-full peer peer-checked:bg-yellow-500 transition-all"></div>
				<div className="w-5 h-5 bg-white rounded-full shadow-md absolute left-0.5 top-0.5 peer-checked:translate-x-full transition-transform"></div>
			</label>
		</div>
		{formFields.is_business ? (
			<div className="mt-4">
				<label htmlFor="ttd" className="block text-sm font-medium text-slate-800 mb-1">
					Татвар төлөгчийн дугаар
				</label>
				<input
					id="ttd"
					type="text"
					name="ttd"
					placeholder="Татвар төлөгчийн дугаар (Заавал биш)"
					value={formFields.ttd}
					onChange={e => {
						handleFieldChange(e);
						if (onClearError) onClearError('ttd');
					}}
					className="text-sm w-full px-4 py-3 bg-white text-black border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
				/>
				{formErrors.ttd && <span className="text-xs text-red-500">{formErrors.ttd}</span>}
			</div>
		) : (
			<div className="mt-4">
				<label htmlFor="consumer_no" className="block text-sm font-medium text-slate-800 mb-1">
					Хялбар бүртгэлийн дугаар
				</label>
				<input
					id="consumer_no"
					type="text"
					name="consumer_no"
					placeholder="Хялбар бүртгэлийн дугаар (Заавал биш)"
					value={formFields.consumer_no}
					onChange={e => {
						handleFieldChange(e);
						if (onClearError) onClearError('consumer_no');
					}}
					className="text-sm w-full px-4 py-3 bg-white text-black border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
				/>
				{formErrors.consumer_no && <span className="text-xs text-red-500">{formErrors.consumer_no}</span>}
			</div>
		)}
		<div className="mt-4">
			<label htmlFor="note" className="block text-sm font-medium text-slate-800 mb-1">
				Тэмдэглэл
			</label>
			<textarea
				id="note"
				name="note"
				placeholder="Тэмдэглэл (заавал биш)"
				value={formFields.note}
				onChange={e => {
					handleFieldChange(e);
					if (onClearError) onClearError('note');
				}}
				className="text-sm w-full px-4 py-3 bg-white text-black border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition min-h-[80px]"
			/>
		</div>
	</>
);

export default PersonalInfo;
