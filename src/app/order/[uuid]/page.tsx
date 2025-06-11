"use client";
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Order, StoreSettings } from '@/lib/interfaces';
import { sendRequestToPublicAPI, sendRequestWithToken } from '@/lib/api-service';
import { isLoggedIn } from '@/lib/cookie-manipulation';
import Link from 'next/link';
import { formatDateString, formatPrice } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { MdPayment, MdRefresh } from 'react-icons/md';

function renderField(label: string, value: any) {
	if (value === undefined || value === null || value === "") return null;
	return (
		<div className="flex justify-between w-full py-1 text-gray-700">
			<span className="font-medium">{label}:</span>
			<span className="text-right break-all">{value}</span>
		</div>
	);
}

function renderOrderProducts(products: Order["products"]) {
	if (!products?.length) return null;
	return (
		<div className="w-full mt-6">
			<h3 className="font-semibold mb-2 text-slate-700">Захиалсан бараанууд</h3>
			<div className="overflow-x-auto border border-gray-300 rounded-lg">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="">
							<th className="p-2  border-r border-gray-300">#</th>
							<th className="p-2  border-r border-gray-300">Нэр</th>
							<th className="p-2  border-r border-gray-300">SKU</th>
							<th className="p-2  border-r border-gray-300">Үнэ</th>
							<th className="p-2  border-r border-gray-300">Ширхэг</th>
							<th className="p-2">Дүн</th>
						</tr>
					</thead>
					<tbody>
						{products.map((p, i) => (
							<tr key={i} className="border-t border-gray-300">
								<td className="p-2 border-r border-gray-300 text-center">{i + 1}</td>
								<td className="p-2 border-r border-gray-300">{p.name}</td>
								<td className="p-2 border-r border-gray-300">{p.sku}</td>
								<td className="p-2 border-r border-gray-300">{formatPrice(p.price)}</td>
								<td className="p-2 border-r border-gray-300">{p.amount}</td>
								<td className="p-2">{formatPrice(p.subtotal)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function renderOrderHistory(history: Order["history"], setup: StoreSettings) {
	if (!history?.length) return null;
	return (
		<div className="w-full mt-6">
			<h3 className="font-semibold mb-2 text-slate-700">Захиалгын түүх</h3>
			<div className="overflow-x-auto border border-gray-300 rounded-lg">
				<table className="min-w-full text-sm">
					<thead>
						<tr>
							<th className="p-2 border-r border-gray-300">Огноо</th>
							<th className="p-2 border-r border-gray-300">Төлөв</th>
							<th className="p-2">Тайлбар</th>
						</tr>
					</thead>
					<tbody>
						{history.map((h, i) => (
							<tr key={i} className="border-gray-300 border-t">
								<td className="p-2 border-r border-gray-300">{formatDateString(h.created_at)}</td>
								<td className="p-2 border-r border-gray-300">{(() => {
						const process = setup?.processes?.find(p => p.code === h.process_code);
						return process ? process.name : h.process_code;
					})()}</td>
								<td className="p-2">{h.note || ""}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default function AccountPage() {
	const params = useParams();
	const uuid = params.uuid;
	const [loading, setLoading] = useState(true);
	const [order, setOrder] = useState<Order | null>(null);
	const { setup } = useStore();

	const fetchOrder = useCallback(async () => {
		let response;
		if (isLoggedIn()) {
			response = await sendRequestWithToken('POST', `${process.env.NEXT_PUBLIC_API_URL}/provider/track-order/`, { uuid }, true);
		} else {
			response = await sendRequestToPublicAPI('GET', `/order/track/?uuid=${uuid}`, undefined, true, true);
		}
		if (response)
			setOrder(response.order)
		setLoading(false);
	}, [uuid]);

	useEffect(() => {
		fetchOrder();
	}, [fetchOrder]);

	const handleRefresh = () => {
		setLoading(true);
		fetchOrder();
	};

	const handlePayment = () => {
		if (setup?.payment_system_url && typeof uuid === 'string') {
			const url = setup.payment_system_url.replace(/\*\*uuid\*\*/g, uuid);
			window.open(url, '_blank');
		}
	};

	if (loading) return (
		<div className="pt-24 flex flex-col items-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
			<span className="ml-4 text-lg text-gray-600">Түр хүлээнэ үү...</span>
		</div>
	);

	if (order) return (
		<div className="flex flex-col py-8 items-center">
			<div className="max-w-xl w-full p-8 flex flex-col items-center">
				<h2 className="text-2xl font-bold mb-2 text-slate-700">Захиалга</h2>
				<div className='text-xs text-gray-500 mb-4'>{order.id}</div>
				<div className="w-full space-y-1">
					{renderField("Овог нэр", order.name)}
					{renderField("Утас", order.phone_numbers)}
					{renderField("Имэйл", order.email)}
					
					{renderField("Тэмдэглэл", order.note)}
					{order.created_at && renderField("Огноо", formatDateString(order.created_at))}
					{order.delivered_at && renderField("Хүргэгдсэн огноо", formatDateString(order.delivered_at))}
					{order.paid_at && renderField("Төлбөр төлсөн огноо", formatDateString(order.paid_at))}
					{renderField("Хот", order.address_city)}
					{renderField("Дүүрэг", order.address_district)}
					{renderField("Хороо", order.address_khoroo)}
					{renderField("Дэлгэрэнгүй хаяг", order.address_description)}
					{/* {renderField("Байршлын цэг", order.address_point)} */}
					{renderField("Төлөв", (() => {
						const process = setup?.processes?.find(p => p.code === order.process_code);
						return process ? process.name : order.process_code;
					})())}
				</div>
				
				{renderOrderHistory(order.history, setup)}

				{renderOrderProducts(order.products)}
				<div className='mt-10 w-full'>
					<h3 className="font-semibold mb-2 text-slate-700">Үнийн дүн</h3>
					<div>
						{order.total_price && renderField("Барааны төлбөр", formatPrice(order.total_price - (order.delivery_fee || 0)))}
						{order.delivery_fee && renderField("Хүргэлтийн төлбөр", formatPrice(order.delivery_fee))}
						<div className='font-semibold text-lg border-t border-gray-200'>
							{order.total_price && renderField("Нийт", formatPrice(order.total_price))}
						</div>
					</div>
				</div>
				

				{setup.transaction_note_enabled &&
					<div className='mt-10 w-full'>
						<h3 className="font-semibold mb-2 text-slate-700">Төлбөр төлөх заавар</h3>
						<div className='border border-gray-300 w-full p-4 rounded-lg' dangerouslySetInnerHTML={{ __html: setup?.transaction_note || '' }} />
					</div>
				}
				<div className="flex flex-col sm:flex-row gap-4 w-full mt-6 justify-between">
					<button
						onClick={handleRefresh}
						className="w-full sm:w-auto px-6 py-2 rounded-lg bg-slate-600 text-white font-semibold shadow hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2"
					>
						<MdRefresh/>
						Мэдээлэл шинэчлэх
					</button>
					{setup.payment_system_enabled && setup.payment_system_url && (
						<button
							onClick={handlePayment}
							className="w-full sm:w-auto px-6 py-2 rounded-lg bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition-all border border-yellow-500 flex items-center justify-center gap-2"
						>
							<MdPayment/>
							Төлбөр төлөх
						</button>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="flex flex-col pt-20 items-center">
			<div className="max-w-xl w-full p-8 flex flex-col items-center">
				<h2 className="text-2xl font-bold mb-4 text-slate-700">Захиалга олдсонгүй</h2>
				<p className="text-gray-600">Захиалга олдсонгүй эсвэл танд захиалгыг харах эрх байхгүй байна.</p>
				{!isLoggedIn() && <Link href="/account" className="mt-4 text-slate-500 hover:underline">Нэвтрэх</Link>}
			</div>
		</div>
	)

}


