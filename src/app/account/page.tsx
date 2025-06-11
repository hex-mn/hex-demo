"use client";
import { useEffect, useState } from 'react';
import { sendRequestWithToken } from '@/lib/api-service';
import { isLoggedIn } from '@/lib/cookie-manipulation';
import MapPickerInline from '@/components/address/MapPickerInlineWrapper';
import { BiEdit, BiLogOut } from 'react-icons/bi';
import { Order, UserData } from '@/lib/interfaces';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function AccountPage() {
	const [user, setUser] = useState<UserData|null>(null);
	const [loading, setLoading] = useState(true);
	const [tab, setTab] = useState<'info'|'orders'>('info');
	const [orders, setOrders] = useState<any[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [ordersPage, setOrdersPage] = useState(1);
	const [ordersTotal, setOrdersTotal] = useState(0);
	const pageSize = 20;
	const { setup } = useStore();

	useEffect(() => {
		if (!isLoggedIn()) {
			setLoading(false);
			return;
		}
		sendRequestWithToken('GET', `${process.env.NEXT_PUBLIC_API_URL}/provider/user-info/`)
			.then((data) => {
				if (data) setUser(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (tab === 'orders') {
			setOrdersLoading(true);
			sendRequestWithToken('POST', `${process.env.NEXT_PUBLIC_API_URL}/provider/user-orders/`, {
				full_data: false,
				page: ordersPage,
				page_size: pageSize,
			})
				.then((data) => {
					setOrders(data?.results || []);
					setOrdersTotal(data?.count || 0);
					setOrdersLoading(false);
				})
				.catch(() => setOrdersLoading(false));
		}
	}, [tab, ordersPage]);

	const loginUrl = `${process.env.NEXT_PUBLIC_OAUTH_LOGIN_URL}?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}`;

	if (loading) return (
		<div className="pt-24 flex flex-col items-center px-6">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
			<span className="ml-4 text-lg text-gray-600">Түр хүлээнэ үү...</span>
		</div>
	);

	if (!isLoggedIn()) {
		return (
			<div className="flex flex-col pt-24 items-center px-6">
				<h2 className="text-2xl font-bold mb-4 text-gray-800">Нэвтрэх шаардлагатай</h2>
				<a href={loginUrl}>
					<button className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg shadow transition-all font-semibold text-lg">
						Нэвтрэх
					</button>
				</a>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-xl flex flex-col py-8 px-6">
			{/* Tab Header */}
			<div className="flex border-b border-gray-200 mb-6">
				<button
					className={`px-4 py-2 font-semibold text-lg focus:outline-none ${tab === 'info' ? 'border-b-2 border-slate-700 text-slate-700' : 'text-gray-400'}`}
					onClick={() => setTab('info')}
				>
					Мэдээлэл
				</button>
				<button
					className={`ml-4 px-4 py-2 font-semibold text-lg focus:outline-none ${tab === 'orders' ? 'border-b-2 border-slate-700 text-slate-700' : 'text-gray-400'}`}
					onClick={() => setTab('orders')}
				>
					Захиалга
				</button>
			</div>

			{tab === 'info' && user && (
				<>
					<h2 className="text-2xl font-bold mb-4 text-slate-700 text-center">Таны мэдээлэл</h2>
					<div className='text-sm p-2 bg-gray-100 text-gray-500 mb-4 rounded-lg'>Доорх мэдээлэл нь таныг захиалга өгөхөд автоматоор бөглөгдөх боломжтой юм. Хэрвээ мэдээллийг засварлахыг хүсвэл засварлах товч дээр дарна уу.</div>
					{user?.profile && (
						<div className="w-full mb-6">
							<InfoGrid profile={user.profile} />
						</div>
					)}
					{user?.addresses?.length > 0 && (
						<div className="w-full">
							<h3 className="text-lg font-semibold mb-2 text-slate-600">Бүртгэлтэй хаяг</h3>
							<ul className="space-y-3">
								{user.addresses.map((addr: any) => (
									<AddressItem key={addr.id} addr={addr} />
								))}
							</ul>
						</div>
					)}
					<div className="flex justify-between items-center mt-4">
						<button
							onClick={async () => { (await import('@/lib/api-service')).logout(); }}
							className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-semibold shadow flex flex-row items-center gap-2"
						>
							<BiLogOut/> Гарах
						</button>
						<a
							href={`https://auth.hex.mn/?return_uri=${encodeURIComponent(window.location.href)}`}
							rel="noopener noreferrer"
						>
							<button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow flex flex-row items-center gap-2">
								<BiEdit/> Засварлах
							</button>
						</a>
					</div>
				</>
			)}

			{tab === 'orders' && (
				<div>
					<h2 className="text-2xl font-bold mb-4 text-slate-700 text-center">Таны захиалгууд</h2>
					{ordersLoading ? (
						<div className="flex flex-col items-center py-8">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-500"></div>
							<span className="ml-4 text-lg text-gray-600 mt-2">Түр хүлээнэ үү...</span>
						</div>
					) : (
						orders.length > 0 ? (
							<div >
								<ul className="divide-y divide-gray-200">
									{orders.map((order: Order) => (
										<Link key={order.id} href={`/order/${order.id}`}>
										<li className="py-4 cursor-pointer hover:bg-gray-50 px-2 rounded transition">
											<div className="flex justify-between items-center">
												<div>
													<div className="font-semibold text-slate-700">{order.name}</div>
													<div className="text-xs text-gray-500">{order.created_at?.slice(0, 16).replace('T', ' ')}</div>
												</div>
												<div className="text-sm text-gray-600">{
													(() => {
														const process = setup?.processes?.find(p => p.code === order.process_code);
														return process ? process.name : order.process_code;
													})()
												}</div>
											</div>
										</li>
										</Link>
									))}
								</ul>
								{/* Pagination */}
								<div className="flex justify-center items-center gap-2 mt-6">
									<button
										disabled={ordersPage === 1}
										className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50"
										onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
									>
										Өмнөх
									</button>
									<span>{ordersPage} / {Math.ceil(ordersTotal / pageSize) || 1}</span>
									<button
										disabled={ordersPage >= Math.ceil(ordersTotal / pageSize)}
										className="px-3 py-1 rounded bg-slate-200 disabled:opacity-50"
										onClick={() => setOrdersPage(p => p + 1)}
									>
										Дараах
									</button>
								</div>
							</div>
						) : (
							<div className="text-center text-gray-500 py-8">Захиалга олдсонгүй.</div>
						)
					)}
				</div>
			)}
		</div>
	);

	function InfoGrid({ profile }: { profile: any }) {
		return (
			<div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-800 text-sm">
				<span className="font-semibold">Нэр:</span>
				<span>{profile.name || '-'}</span>
				<span className="font-semibold">Имэйл:</span>
				<span>{profile.email || '-'}</span>
				{profile.is_business && (
					<><span className="font-semibold">ТТД:</span><span>{profile.ttd || '-'}</span></>
				)}
				{!profile.is_business && (
					<><span className="font-semibold">Хялбар бүртгэлийн дугаар:</span><span>{profile.consumer_no || '-'}</span></>
				)}
				<span className="font-semibold">Утасны дугаарууд:</span>
				<span>{profile.phone_numbers || '-'}</span>
			</div>
		);
	}

	function AddressItem({ addr }: { addr: any }) {
		return (
			<li className="border rounded border-gray-200 p-3 shadow-sm">
				<div className="text-sm text-gray-700 font-semibold mb-1">{addr.city}, {addr.district}, {addr.khoroo}, {addr.description}</div>
				<div className="text-xs text-gray-400"><MapPickerInline
					initialPoint={addr.point}
				/></div>
			</li>
		);
	}
}


