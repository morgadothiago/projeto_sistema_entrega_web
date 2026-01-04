'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DeliveryTrackingMap } from '@/components/delivery/DeliveryTrackingMap';
import axios from 'axios';

interface DeliveryData {
  code: string;
  status: string;
  deliveryman?: {
    id: number;
    name: string;
    phone: string;
  };
  originAddress: {
    latitude: number;
    longitude: number;
    street: string;
    number: string;
    city: string;
    state: string;
  };
  clientAddress: {
    latitude: number;
    longitude: number;
    street: string;
    number: string;
    city: string;
    state: string;
  };
}

export default function DeliveryTrackingPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deliveryCode = params?.code as string;

  useEffect(() => {
    if (!session?.accessToken || !deliveryCode) return;

    // Busca dados da entrega
    const fetchDeliveryData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/gps/delivery/${deliveryCode}/latest`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        console.log('📍 Dados da entrega recebidos:', response.data);
        console.log('📍 Endereço de origem:', response.data.originAddress);
        console.log('📍 Endereço do cliente:', response.data.clientAddress);

        setDeliveryData(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Erro ao buscar dados da entrega:', err);
        setError(
          err.response?.data?.message ||
            'Erro ao carregar dados da entrega'
        );
        setLoading(false);
      }
    };

    fetchDeliveryData();
  }, [session, deliveryCode]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Autenticação Necessária
          </h1>
          <p className="text-gray-600">
            Você precisa estar logado para acessar o rastreamento.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rastreamento...</p>
        </div>
      </div>
    );
  }

  if (error || !deliveryData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
          <p className="text-gray-600">{error || 'Entrega não encontrada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Rastreamento em Tempo Real
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Entrega: <span className="font-semibold">{deliveryData.code}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  deliveryData.status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-700'
                    : deliveryData.status === 'COMPLETED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {deliveryData.status === 'IN_PROGRESS'
                  ? 'Em Andamento'
                  : deliveryData.status === 'COMPLETED'
                  ? 'Concluída'
                  : 'Pendente'}
              </span>
            </div>

            {/* Entregador */}
            {deliveryData.deliveryman && (
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {deliveryData.deliveryman.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {deliveryData.deliveryman.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {deliveryData.deliveryman.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 p-4">
        <DeliveryTrackingMap
          deliveryCode={deliveryCode}
          token={session.accessToken as string}
          originAddress={deliveryData.originAddress}
          clientAddress={deliveryData.clientAddress}
          className="h-full shadow-lg"
        />
      </div>

      {/* Footer com informações */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Origem:</p>
            <p className="font-semibold text-gray-800">
              {deliveryData.originAddress.street}, {deliveryData.originAddress.number} -{' '}
              {deliveryData.originAddress.city}/{deliveryData.originAddress.state}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Destino:</p>
            <p className="font-semibold text-gray-800">
              {deliveryData.clientAddress.street}, {deliveryData.clientAddress.number} -{' '}
              {deliveryData.clientAddress.city}/{deliveryData.clientAddress.state}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
