'use client';

import { createContext, useContext } from 'react';
import { useStoreSetup } from '@/store/useStoreSetup';
import { StoreSettings } from '@/lib/interfaces';

interface StoreContextType {
	setup: StoreSettings;
	loading: boolean;
	setLoading?: (val: boolean) => void;
	error: boolean;
	setError?: (val: boolean) => void;
}

const StoreContext = createContext<StoreContextType>(null as any);

export const StoreProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {

	const { setup, isLoading, isError } = useStoreSetup();

	const loading = isLoading && !setup && !isError;

	return (
		<StoreContext.Provider
			value={{
				setup,
				loading,
				error: !!isError,
			}}
		>
			{children}
		</StoreContext.Provider>
	);
};

export const useStore = (): StoreContextType => {
	const context = useContext(StoreContext);
	if (!context) throw new Error('useStore must be used within StoreProvider');
	return context;
};
