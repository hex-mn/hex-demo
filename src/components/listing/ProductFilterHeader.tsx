'use client';

import { CgChevronDown } from 'react-icons/cg';
import { FaX } from 'react-icons/fa6';

type Attribute = {
	attribute: string;
	value: string;
};

interface ProductFilterHeaderProps {
	totalCount: number;
	selectedAttributes: Attribute[];
	setSelectedAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
	isNew: boolean;
	setIsNew: React.Dispatch<React.SetStateAction<boolean>>;
	isFeatured: boolean;
	setIsFeatured: React.Dispatch<React.SetStateAction<boolean>>;
	discounted: boolean;
	setDiscounted: React.Dispatch<React.SetStateAction<boolean>>;
	priceLow: number | null;
	setPriceLow: React.Dispatch<React.SetStateAction<number | null>>;
	priceHigh: number | null;
	setPriceHigh: React.Dispatch<React.SetStateAction<number | null>>;
	orderBy: string | null;
	setOrderBy: React.Dispatch<React.SetStateAction<string | null>>;
	query?: string | null;
	setQuery?: () => void;
}

const ProductFilterHeader: React.FC<ProductFilterHeaderProps> = ({
	totalCount,
	selectedAttributes,
	setSelectedAttributes,
	isNew,
	setIsNew,
	isFeatured,
	setIsFeatured,
	discounted,
	setDiscounted,
	priceLow,
	setPriceLow,
	priceHigh,
	setPriceHigh,
	orderBy,
	setOrderBy,
	query,
	setQuery,
}) => {
	const clearAll = () => {
		setSelectedAttributes([]);
		setIsNew(false);
		setIsFeatured(false);
		setDiscounted(false);
		setPriceLow(null);
		setPriceHigh(null);
	};

	return (
		<div className="py-4 flex flex-col md:flex-row items-center justify-between md:space-x-4 ">
			<div className='px-4 md:px-0 w-full'>
				<div className="">Бараа: {totalCount}</div>
				{(selectedAttributes.length > 0 || isNew || isFeatured || discounted || priceLow || priceHigh || query) && (
					<div className="mt-2 flex flex-wrap gap-2 text-sm">
						{query && setQuery && (
							<Tag label={`Хайлт: ${query}`} onRemove={setQuery} />
						)}
						{isNew && <Tag label="Шинэ" onRemove={() => setIsNew(false)} />}
						{isFeatured && <Tag label="Онцгой" onRemove={() => setIsFeatured(false)} />}
						{discounted && <Tag label="Хямдралтай" onRemove={() => setDiscounted(false)} />}
						{priceLow && <Tag value={`${priceLow}`} label={`Доод үнэ: ${priceLow}`} onRemove={() => setPriceLow(null)} />}
						{priceHigh && <Tag value={`${priceHigh}`} label={`Дээд үнэ: ${priceHigh}`} onRemove={() => setPriceHigh(null)} />}
						{selectedAttributes.map((attr, index) => (
							<Tag
								key={index}
								label={`${attr.attribute}: ${attr.value}`}
								value={attr.value}
								onRemove={() =>
									setSelectedAttributes((prev) => prev.filter((_, i) => i !== index))
								}
							/>
						))}
						<button
							onClick={clearAll}
							className="ml-2 text-xs uppercase font-semibold hover:underline"
						>
							Цэвэрлэх
						</button>
					</div>
				)}
			</div>

			<div className='w-full md:w-fit flex flex-row justify-end items-center gap-2 border-t border-gray-300 pt-4 mt-4 md:pt-0 md:mt-0 md:border-t-0 px-4 md:px-0'>
				<div className='text-gray-400'>Эрэмбэ</div>
				<div className="relative inline-block">
					<select
						className="text-sm border border-gray-300 rounded-lg p-3 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all duration-200 appearance-none"
						value={orderBy ?? ''}
						onChange={(e) => setOrderBy(e.target.value || null)}
					>
						<option value="new_to_old">Шинээс хуучин</option>
						<option value="old_to_new">Хуучнаас шинэ</option>
						<option value="price_low_to_high">Үнэ өсөх</option>
						<option value="price_high_to_low">Үнэ буурах</option>
						<option value="a_to_z">Үсгээр А-Я</option>
						<option value="z_to_a">Үсгээр Я-А</option>
					</select>
					<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center justify-center">
						<CgChevronDown/>
					</span>
				</div>
			</div>
		</div>
	);
};

export default ProductFilterHeader;

interface TagProps {
	label: string;
	value?: string;
	onRemove: () => void;
}
const Tag: React.FC<TagProps> = ({ label, value = null, onRemove }) => {
    // Color regexes
    const colorRegex = /^#([0-9a-fA-F]{3,8})$/;
    const multiColorRegex = /^#([0-9a-fA-F]{3,8})(\/#([0-9a-fA-F]{3,8}))+$/;
    // Color swatch (multi or single)
    if (multiColorRegex.test(value?.trim() || "") || colorRegex.test(value?.trim() || "")) {
        const colors = (value || "").trim().split("/").map((c) => c.trim());
        return (
            <span className="border border-gray-300 text-gray-800 px-3 py-2 rounded-lg flex items-center gap-2">
                <span>Өнгө:</span>
                <span className="flex items-center gap-1">
					<span
						className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
						style={{
							background:
								colors.length === 1
									? colors[0]
									: colors.length === 2
										? `linear-gradient(45deg, ${colors[0]} 50%, ${colors[1]} 50%)`
										: `linear-gradient(90deg, ${colors.join(", ")})`,
						}}
					/>
                </span>
                <button
                    onClick={onRemove}
                    className="text-xs rounded-full bg-gray-300 text-white p-1"
                >
                    <FaX size={10} />
                </button>
            </span>
        );
    }
    return (
        <span className="border border-gray-300 text-gray-800 px-3 py-2 rounded-lg flex items-center gap-2">
            <span>{label}</span>
            <button
                onClick={onRemove}
                className="text-xs rounded-full bg-gray-300 text-white p-1"
            >
                <FaX size={10} />
            </button>
        </span>
    );
};