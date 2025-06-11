import React from 'react';

interface LoaderProps {
	message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Түр хүлээнэ үү...' }) => (
	<div className="pt-24 flex flex-col items-center">
		<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
		<span className="ml-4 text-lg text-gray-600">{message}</span>
	</div>
);

export default Loader;
