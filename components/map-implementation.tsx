"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export function MapImplementation() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="code">Implementação</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700">Mapa Interativo</h3>
          <p>O mapa interativo será o componente central do aplicativo, permitindo aos usuários:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Visualizar sua localização atual</li>
            <li>Selecionar destinos com sugestões automáticas</li>
            <li>Acompanhar o movimento da van em tempo real</li>
            <li>Ver a rota completa da viagem</li>
            <li>Receber estimativas de tempo de chegada</li>
          </ul>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              Utilizaremos Leaflet.js com OpenStreetMap como alternativa gratuita ao Google Maps, com a possibilidade de
              migração futura para APIs pagas se necessário.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700">Implementação do Mapa</h3>
          <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{`// Componente de Mapa Básico
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent({ userLocation, destination, vanLocation }) {
  return (
    <MapContainer 
      center={userLocation} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      
      {/* Marcador do usuário */}
      <Marker position={userLocation}>
        <Popup>Sua localização</Popup>
      </Marker>
      
      {/* Marcador do destino */}
      {destination && (
        <Marker position={destination}>
          <Popup>Seu destino</Popup>
        </Marker>
      )}
      
      {/* Marcador da van */}
      {vanLocation && (
        <Marker position={vanLocation} icon={vanIcon}>
          <Popup>Sua van está a caminho</Popup>
        </Marker>
      )}
      
      {/* Componente de rota será adicionado aqui */}
    </MapContainer>
  );
}`}</pre>
          </div>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("realtime")} className="mt-2">
            Ver implementação em tempo real
          </Button>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-700">Atualizações em Tempo Real</h3>
          <p>
            Para implementar o rastreamento em tempo real da van, utilizaremos WebSockets através da biblioteca
            Socket.io:
          </p>
          <div className="bg-gray-50 p-3 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{`// Backend (Node.js)
const io = require('socket.io')(server);

// Quando um motorista atualiza sua posição
io.on('connection', (socket) => {
  socket.on('van-position-update', (data) => {
    // Salvar posição no banco de dados
    saveVanPosition(data.vanId, data.position);
    
    // Emitir para todos os clientes interessados nesta van
    io.to(\`van-\${data.vanId}\`).emit('van-moved', {
      vanId: data.vanId,
      position: data.position,
      timestamp: Date.now()
    });
  });
  
  // Cliente se inscreve para receber atualizações de uma van específica
  socket.on('track-van', (vanId) => {
    socket.join(\`van-\${vanId}\`);
  });
});

// Frontend (React)
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function VanTracker({ vanId }) {
  const [vanPosition, setVanPosition] = useState(null);
  
  useEffect(() => {
    const socket = io('https://api.mobicomunidade.com');
    
    // Inscrever-se para atualizações desta van
    socket.emit('track-van', vanId);
    
    // Ouvir atualizações de posição
    socket.on('van-moved', (data) => {
      if (data.vanId === vanId) {
        setVanPosition(data.position);
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [vanId]);
  
  return (
    <div>
      {vanPosition ? (
        <p>Van está em: {vanPosition.lat}, {vanPosition.lng}</p>
      ) : (
        <p>Carregando posição da van...</p>
      )}
    </div>
  );
}`}</pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
