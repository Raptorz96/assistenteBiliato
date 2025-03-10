// src/pages/DashboardPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registra i componenti di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dati mockup per lo sviluppo
const MOCK_DATA = {
  statsCards: {
    clientiTotali: { value: 145, trend: '+4%', icon: 'users' },
    onboardingAttivi: { value: 18, trend: '+12%', icon: 'clipboard-check' },
    procedureInCorso: { value: 27, trend: '-2%', icon: 'folder-open' },
    documentiRecenti: { value: 24, trend: '+8%', icon: 'document' }
  },
  clientDistribution: {
    labels: ['SRL', 'SAS', 'SNC', 'Ditte individuali', 'Professionisti', 'Altro'],
    data: [35, 22, 18, 43, 25, 7]
  },
  onboardingTrend: {
    labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago'],
    data: [4, 6, 9, 8, 12, 10, 14, 16]
  },
  proceduresStatus: {
    labels: ['Completate', 'In corso', 'In attesa', 'Bloccate'],
    data: [42, 27, 15, 8]
  },
  recentActivities: [
    { id: 1, tipo: 'Onboarding', cliente: 'Tecnosoft SRL', data: '2025-03-07 14:30', stato: 'Completato', icon: 'clipboard-check' },
    { id: 2, tipo: 'Dichiarazione', cliente: 'Studio Bianchi', data: '2025-03-06 10:15', stato: 'In corso', icon: 'document-text' },
    { id: 3, tipo: 'Consulenza', cliente: 'Lucia Rossi', data: '2025-03-06 09:45', stato: 'Pianificato', icon: 'chat' },
    { id: 4, tipo: 'Procedura', cliente: 'Elettronica SNC', data: '2025-03-05 16:20', stato: 'In corso', icon: 'folder-open' },
    { id: 5, tipo: 'Documento', cliente: 'Farmacia Centrale', data: '2025-03-05 11:30', stato: 'Completato', icon: 'document' },
  ],
  upcomingDeadlines: [
    { id: 1, titolo: 'F24 - Scadenza oggi', cliente: 'Mario Rossi', orario: '14:00', priorita: 'alta' },
    { id: 2, titolo: 'Dichiarazione - Scadenza domani', cliente: 'Giuseppe Verdi', orario: '10:30', priorita: 'media' },
    { id: 3, titolo: 'Consulenza - Tra 3 giorni', cliente: 'Lucia Bianchi', orario: '15:45', priorita: 'bassa' },
  ],
  notifications: [
    { id: 1, messaggio: 'Nuova normativa fiscale pubblicata', tempo: '10 minuti fa', letto: false },
    { id: 2, messaggio: 'Documenti caricati da Mario Rossi', tempo: '1 ora fa', letto: false },
    { id: 3, messaggio: 'Richiesta consulenza da Farmacia Centrale', tempo: '2 ore fa', letto: true },
    { id: 4, messaggio: 'Procedura completata: Elettronica SNC', tempo: 'Ieri', letto: true },
  ]
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('attivita');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);

  // Per chiudere le notifiche cliccando fuori
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simula il caricamento dati
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(MOCK_DATA);
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Icone SVG (funzioni helper)
  const getIcon = (iconName) => {
    const iconMap = {
      'users': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'clipboard-check': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      'folder-open': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
        </svg>
      ),
      'document': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'document-text': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'chat': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      'bell': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      'plus': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      'trending-up': (
        <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
      'trending-down': (
        <svg className="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    };

    return iconMap[iconName] || null;
  };

  // Configurazione e dati dei grafici
  const clientsDistributionData = {
    labels: stats.clientDistribution?.labels || [],
    datasets: [
      {
        label: 'Distribuzione Clienti',
        data: stats.clientDistribution?.data || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // blue-500
          'rgba(16, 185, 129, 0.7)', // emerald-500
          'rgba(239, 68, 68, 0.7)',  // red-500
          'rgba(245, 158, 11, 0.7)', // amber-500
          'rgba(139, 92, 246, 0.7)', // violet-500
          'rgba(75, 85, 99, 0.7)',   // gray-600
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(75, 85, 99)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const onboardingTrendData = {
    labels: stats.onboardingTrend?.labels || [],
    datasets: [
      {
        label: 'Onboarding Completati',
        data: stats.onboardingTrend?.data || [],
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgb(16, 185, 129)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(16, 185, 129)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const proceduresStatusData = {
    labels: stats.proceduresStatus?.labels || [],
    datasets: [
      {
        label: 'Procedure per Stato',
        data: stats.proceduresStatus?.data || [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // Completate (verde)
          'rgba(59, 130, 246, 0.7)', // In corso (blu)
          'rgba(245, 158, 11, 0.7)', // In attesa (arancione)  
          'rgba(239, 68, 68, 0.7)',  // Bloccate (rosso)
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)', 
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      }
    ],
  };

  // Opzioni dei grafici
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
      }
    },
    cutout: '70%',
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(160, 174, 192, 0.1)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(160, 174, 192, 0.1)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <svg className="loading-spinner" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="appear-animation">
      {/* Header con breadcrumbs e controlli */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>Dashboard</span>
              <svg className="w-3 h-3 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>Panoramica</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Benvenuto, {user?.firstName || "Utente"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Ecco il riepilogo delle attività dello studio
            </p>
          </div>

          {/* Azioni rapide */}
          <div className="flex items-center space-x-3 relative">
            {/* Pulsante notifiche */}
            <button 
              className="relative icon-button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifiche"
            >
              {getIcon('bell')}
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {stats.notifications?.filter(n => !n.letto).length || 0}
              </span>
            </button>

            {/* Dropdown notifiche */}
            {showNotifications && (
              <div 
                ref={notificationsRef}
                className="absolute right-0 top-10 z-10 w-80 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">Notifiche</h3>
                  <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                    Segna tutte come lette
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {stats.notifications?.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.letto ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.messaggio}</p>
                        {!notification.letto && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.tempo}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100 dark:border-gray-700">
                  <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    Visualizza tutte
                  </button>
                </div>
              </div>
            )}

            {/* Pulsante nuovo */}
            <div className="relative group">
              <button className="btn btn-primary flex items-center space-x-1">
                {getIcon('plus')}
                <span>Nuovo</span>
              </button>
              
              {/* Dropdown menu per azioni rapide */}
              <div className="absolute right-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-20">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Nuovo cliente
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Carica documento
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Genera procedura
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Nuova scadenza
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carte statistiche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {/* Clienti totali */}
        <div className="card dark:bg-gray-800 hover-scale overflow-hidden">
          <div className="flex items-stretch h-full">
            <div className="flex-grow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Clienti Totali</h3>
                <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                  {getIcon('trending-up')}
                  <span>{stats.statsCards?.clientiTotali?.trend}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.statsCards?.clientiTotali?.value}
              </p>
            </div>
            <div className="flex items-center justify-center px-5 bg-blue-500/10 dark:bg-blue-500/20">
              <div className="text-blue-600 dark:text-blue-400">
                {getIcon('users')}
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding attivi */}
        <div className="card dark:bg-gray-800 hover-scale overflow-hidden">
          <div className="flex items-stretch h-full">
            <div className="flex-grow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Onboarding Attivi</h3>
                <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                  {getIcon('trending-up')}
                  <span>{stats.statsCards?.onboardingAttivi?.trend}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.statsCards?.onboardingAttivi?.value}
              </p>
            </div>
            <div className="flex items-center justify-center px-5 bg-green-500/10 dark:bg-green-500/20">
              <div className="text-green-600 dark:text-green-400">
                {getIcon('clipboard-check')}
              </div>
            </div>
          </div>
        </div>

        {/* Procedure in corso */}
        <div className="card dark:bg-gray-800 hover-scale overflow-hidden">
          <div className="flex items-stretch h-full">
            <div className="flex-grow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Procedure in corso</h3>
                <div className="flex items-center text-xs font-medium text-red-600 dark:text-red-400">
                  {getIcon('trending-down')}
                  <span>{stats.statsCards?.procedureInCorso?.trend}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.statsCards?.procedureInCorso?.value}
              </p>
            </div>
            <div className="flex items-center justify-center px-5 bg-amber-500/10 dark:bg-amber-500/20">
              <div className="text-amber-600 dark:text-amber-400">
                {getIcon('folder-open')}
              </div>
            </div>
          </div>
        </div>

        {/* Documenti recenti */}
        <div className="card dark:bg-gray-800 hover-scale overflow-hidden">
          <div className="flex items-stretch h-full">
            <div className="flex-grow p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documenti Recenti</h3>
                <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                  {getIcon('trending-up')}
                  <span>{stats.statsCards?.documentiRecenti?.trend}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.statsCards?.documentiRecenti?.value}
              </p>
            </div>
            <div className="flex items-center justify-center px-5 bg-indigo-500/10 dark:bg-indigo-500/20">
              <div className="text-indigo-600 dark:text-indigo-400">
                {getIcon('document')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grafici principali */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Grafico distribuzione clienti */}
        <div className="card dark:bg-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuzione Clienti</h2>
          </div>
          <div className="h-64">
            <Doughnut 
              data={clientsDistributionData} 
              options={doughnutOptions}
            />
          </div>
        </div>

        {/* Grafico andamento onboarding */}
        <div className="card dark:bg-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Andamento Onboarding</h2>
          </div>
          <div className="h-64">
            <Line 
              data={onboardingTrendData} 
              options={lineOptions}
            />
          </div>
        </div>

        {/* Grafico procedure */}
        <div className="card dark:bg-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Procedure per Stato</h2>
          </div>
          <div className="h-64">
            <Bar 
              data={proceduresStatusData} 
              options={barOptions}
            />
          </div>
        </div>
      </div>

      {/* Attività recenti e scadenze */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attività recenti */}
        <div className="lg:col-span-2 card dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('attivita')}
              className={`flex-1 text-center py-4 px-4 text-sm font-medium ${
                activeTab === 'attivita' 
                  ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Attività Recenti
            </button>
            <button 
              onClick={() => setActiveTab('scadenze')}
              className={`flex-1 text-center py-4 px-4 text-sm font-medium ${
                activeTab === 'scadenze' 
                  ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Scadenze Imminenti
            </button>
          </div>

          {activeTab === 'attivita' ? (
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.recentActivities?.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400">
                              {getIcon(activity.icon)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{activity.tipo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{activity.cliente}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{activity.data}</td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${activity.stato === 'Completato' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                            activity.stato === 'In corso' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}
                          >
                            {activity.stato}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                  Visualizza tutte le attività
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {stats.upcomingDeadlines?.map(deadline => (
                <div 
                  key={deadline.id} 
                  className={`p-4 rounded-lg border-l-4 
                    ${deadline.priorita === 'alta' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 
                    deadline.priorita === 'media' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' : 
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-500'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-sm font-medium 
                        ${deadline.priorita === 'alta' ? 'text-red-800 dark:text-red-300' : 
                        deadline.priorita === 'media' ? 'text-yellow-800 dark:text-yellow-300' : 
                        'text-blue-800 dark:text-blue-300'}`}>
                        {deadline.titolo}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cliente: {deadline.cliente}</p>
                    </div>
                    <span className={`text-xs font-medium 
                      ${deadline.priorita === 'alta' ? 'text-red-800 dark:text-red-300' : 
                      deadline.priorita === 'media' ? 'text-yellow-800 dark:text-yellow-300' : 
                      'text-blue-800 dark:text-blue-300'}`}>
                      {deadline.orario}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 flex justify-center">
                <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300">
                  Visualizza tutte le scadenze
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Azioni rapide */}
        <div className="card dark:bg-gray-800 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni Rapide</h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Nuovo Cliente</span>
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 transition-colors">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Carica Documento</span>
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 transition-colors">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Nuova Procedura</span>
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 transition-colors">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Pianifica Scadenza</span>
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Riepilogo della giornata</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Clienti attivi oggi</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Documenti elaborati</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Scadenze gestite</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Consulenze pianificate</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;