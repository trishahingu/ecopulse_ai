
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardState, DashboardInsights } from './types';
import { getInitialState } from './services/mockData';
import { fetchDashboardInsights } from './services/geminiService';
import { Icons, COLORS } from './constants';
import StatCard from './components/StatCard';
import { MainUsageChart, BatteryChart } from './components/EnergyCharts';
import ChatTerminal from './components/ChatTerminal';

const App: React.FC = () => {
  const [state, setState] = useState<DashboardState>(getInitialState());
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [storytelling, setStorytelling] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);

  const batteryMetrics = useMemo(() => {
    const lastPoint = state.history[state.history.length - 1];
    const batteryCapacity = 50; 
    const currentCharge = (lastPoint.battery / 100) * batteryCapacity;
    const netDemand = state.currentPower - lastPoint.solar;
    
    if (netDemand <= 0) {
      return { label: 'Charging', critical: false, value: 'INF' };
    }

    const hours = currentCharge / netDemand;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const isCritical = hours < 2;

    return {
      label: `${h}h ${m}m`,
      critical: isCritical,
      value: hours.toFixed(1)
    };
  }, [state]);

  const runAnalysis = useCallback(async (currentState: DashboardState, mode: boolean) => {
    setLoading(true);
    try {
      const newInsights = await fetchDashboardInsights(currentState, mode);
      setInsights(newInsights);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runAnalysis(state, storytelling);
  }, [storytelling]);

  const handleRefresh = () => {
    runAnalysis(state, storytelling);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${storytelling ? 'bg-indigo-950' : 'bg-slate-950'} text-slate-100`}>
      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${storytelling ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-blue-600 shadow-blue-900/20'} rounded-lg flex items-center justify-center shadow-lg transition-colors`}>
              <Icons.Bolt />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">EcoPulse AI</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Energy Intelligence System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Storytelling Toggle Switch */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full transition-all hover:bg-white/10">
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${!storytelling ? 'text-blue-400' : 'text-slate-500'}`}>Analytical</span>
              <button 
                onClick={() => setStorytelling(!storytelling)}
                className={`w-12 h-6 rounded-full relative transition-all duration-500 ${storytelling ? 'bg-emerald-500' : 'bg-blue-600'}`}
                title="Toggle Storytelling Mode"
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 transform ${storytelling ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${storytelling ? 'text-emerald-400' : 'text-slate-500'}`}>Storytelling</span>
            </div>

            <button 
              onClick={handleRefresh}
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-all rounded-lg border border-white/10 text-sm font-medium ${loading ? 'animate-pulse' : ''}`}
            >
              <Icons.Activity />
              {loading ? 'Processing...' : 'Sync Telemetry'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Dashboard Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Current Demand" value={state.currentPower} unit="kW" trend="+2.4%" icon={<Icons.Bolt />} />
            <StatCard title="Solar Yield" value={state.history[state.history.length-1].solar} unit="kW" trend="Optimal" trendColor="text-emerald-400" icon={<Icons.Leaf />} />
            <StatCard title="Daily Load" value={state.totalConsumption.toFixed(1)} unit="kWh" icon={<Icons.Activity />} />
            <StatCard title="CO2 Neutralized" value={state.carbonSaved} unit="kg" icon={<Icons.Leaf />} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full animate-pulse ${storytelling ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                Power Network Dynamics
              </h2>
              <MainUsageChart data={state.history} />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icons.Database /> Storage Nodes
                </h2>
               </div>
               <BatteryChart data={state.history} />
               <div className={`mt-4 p-4 rounded-xl border transition-all duration-500 flex justify-between items-center ${batteryMetrics.critical ? 'bg-red-500/10 border-red-500/30' : 'bg-black/40 border-white/5'}`}>
                 <div>
                   <p className="text-xs text-slate-500">Projected Depletion</p>
                   <p className={`text-lg font-bold flex items-center gap-2 ${batteryMetrics.critical ? 'text-red-400' : 'text-white'}`}>
                     {batteryMetrics.critical && <Icons.Alert />}
                     {batteryMetrics.label}
                   </p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-slate-500">Reserve Level</p>
                   <p className={`text-lg font-bold ${state.history[state.history.length-1].battery < 20 ? 'text-red-400' : 'text-orange-400'}`}>
                    {state.history[state.history.length-1].battery}%
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-6">IoT Intelligence Grid</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {state.sensors.map(sensor => (
                <div key={sensor.id} className="p-4 bg-black/20 border border-white/5 rounded-xl hover:border-white/20 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-slate-500">{sensor.id}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sensor.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{sensor.name}</h4>
                  <div className="w-full bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${sensor.load}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full sticky top-24 max-h-[calc(100vh-120px)] shadow-2xl">
            <div className={`p-4 flex items-center gap-2 transition-all duration-700 ${storytelling ? 'bg-emerald-700' : 'bg-blue-700'}`}>
              {storytelling ? <Icons.BookOpen /> : <Icons.Activity />}
              <h2 className="font-bold text-sm tracking-widest uppercase">
                {storytelling ? 'Narrative Synthesis' : 'Analytical Output'}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center opacity-50">
                  <div className={`w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin`}></div>
                  <p className="text-[10px] font-mono uppercase tracking-widest">
                    {storytelling ? 'Weaving the story...' : 'Synthesizing data...'}
                  </p>
                </div>
              ) : (
                <>
                  {storytelling && insights?.narrative ? (
                    <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
                      <div className="relative p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 shadow-inner">
                        <Icons.BookOpen />
                        <div className="mt-4 text-sm leading-relaxed text-emerald-100/90 font-serif italic text-lg text-center">
                          "{insights.narrative}"
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section className="animate-in fade-in duration-500">
                      <label className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3 block">Real-time status</label>
                      <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-sm leading-relaxed mono text-blue-100/80">
                        {insights?.status}
                      </div>
                    </section>
                  )}

                  <section className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <label className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                        <Icons.Leaf /> Strategic Insight
                      </label>
                      <p className="text-sm text-slate-300 leading-relaxed">{insights?.insight}</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 border-dashed">
                      <label className="text-[9px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                        <Icons.Sun /> 24h Solar Prediction
                      </label>
                      <p className="text-sm text-amber-100/70 italic">{insights?.solarForecast}</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <label className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2 block">System Alert</label>
                      <p className={`text-sm font-bold ${insights?.alert && insights.alert !== 'N/A' && insights.alert !== 'None' ? 'text-red-400' : 'text-slate-500'}`}>
                        {insights?.alert || 'All systems nominal.'}
                      </p>
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center px-6">
              <span className="text-[8px] uppercase tracking-widest text-slate-500">EcoPulse OS v2.6</span>
              <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Query Interface */}
      <button 
        onClick={() => setShowChat(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 z-40 group ${storytelling ? 'bg-emerald-600' : 'bg-blue-600'}`}
      >
        <Icons.MessageSquare />
      </button>

      {showChat && <ChatTerminal state={state} onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default App;
