// miscellaneous utility functions
import { format } from "date-fns";
import { StylesConfig } from 'react-select';


export const formatDateString = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-CA", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).format(date);
};


export const formatDayTimeString = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-CA", {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
	}).format(date);
};


export const formatPrice = (price: number) =>
	new Intl.NumberFormat().format(price) + "₮";


export const formatPriceString = (price: string) =>
	new Intl.NumberFormat().format(Number.parseFloat(price)) + "₮";

export const getDayCount = (start_date: string, end_date: string) => {
	return (Math.abs(new Date(end_date).getTime() - new Date(start_date).getTime()) /
		(1000 * 60 * 60 * 24)) + 1;
}

export const formatDate = (dateStr: string) => format(new Date(dateStr), "MM/dd");

export const formatDateWithYear = (dateStr: string) => format(new Date(dateStr), "yyyy/MM/dd");


export function extractHexColors(value: string): string[] {
	const matches = value
		.split("/")
		.map((v) => v.trim())
		.filter((v) => /^#([0-9A-F]{3}){1,2}$/i.test(v));
	return matches.slice(0, 2);
}


export const greySelectStyles = (hasError: boolean = false): StylesConfig<any, false> => ({
	control: (base, state) => ({
		...base,
		fontSize: '0.775rem',
		borderColor: hasError
			? 'red'
			: state.isFocused
				? '#999'
				: '#ccc',
		boxShadow: hasError
			? '0 0 0 1px red'
			: state.isFocused
				? '0 0 0 1px #aaa'
				: 'none',
		'&:hover': {
			borderColor: hasError ? 'red' : '#aaa',
		},
		backgroundColor: '#fff',
	}),
	option: (base, state) => ({
		...base,
		fontSize: '0.775rem',
		backgroundColor: state.isSelected
			? '#ccc'
			: state.isFocused
				? '#eee'
				: 'white',
		color: '#333',
		'&:active': {
			backgroundColor: '#ddd',
		},
	}),
	singleValue: (base) => ({
		...base,
		fontSize: '0.775rem',
		color: '#333',
	}),
	dropdownIndicator: (base, state) => ({
		...base,
		color: state.isFocused ? '#666' : '#999',
		'&:hover': {
			color: '#666',
		},
	}),
	indicatorSeparator: (base) => ({
		...base,
		backgroundColor: '#ccc',
	}),
	menu: (base) => ({
		...base,
		zIndex: 20,
	}),
});


export const generateId = () => {
	return typeof crypto !== 'undefined' && crypto.randomUUID
		? crypto.randomUUID()
		: Math.random().toString(36).substring(2, 10);
};