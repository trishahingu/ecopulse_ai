
import { GoogleGenAI, Chat } from "@google/genai";
import { DashboardInsights, DashboardState } from "../types";

export const fetchDashboardInsights = async (state: DashboardState, storytelling: boolean = false): Promise<DashboardInsights> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const lastPoint = state.history[state.history.length - 1];
  const netDemand = state.currentPower - lastPoint.solar;
  const batteryCapacity = 50; 
  const currentCharge = (lastPoint.battery / 100) * batteryCapacity;
  const runtime = netDemand > 0 ? (currentCharge / netDemand).toFixed(1) : 'Infinite (Charging)';

  const modeInstruction = storytelling 
    ? "STORYTELLING MODE: You are the 'Ghost in the Machine'. Narrate the building's energy status as a rhythmic, cinematic journey. Describe the solar panels as 'thirsting for light', the battery as a 'beating heart of lead and lithium', and the sensors as 'nerves twitching in the dark'. Synthesize the data into a single, cohesive energy epic."
    : "ANALYTICAL MODE: You are a high-performance energy intelligence system. Provide cold, hard data analysis. Use professional technical terminology. Focus on efficiency, peaks, and direct optimizations.";

  const prompt = `
    Current System Telemetry:
    - Demand: ${state.currentPower}kW
    - Peak: ${state.peakToday}kW
    - Solar: ${lastPoint.solar}kW
    - Net Flow: ${netDemand.toFixed(2)}kW
    - Reserve: ${lastPoint.battery}% (Runtime: ${runtime}h)
    - Sensor Count: ${state.sensors.length}
    - Compromised Nodes: ${state.sensors.filter(s => s.status !== 'online').map(s => s.name).join(', ') || 'None'}

    MODE: ${modeInstruction}

    TASK:
    1. Ground with Google Search: Check for cloud cover or weather anomalies that might affect solar yield in the next few hours.
    2. Solar Forecast: 24h predictive yield.
    3. Output the following blocks exactly:
    [DASHBOARD STATUS]
    [ENERGY INSIGHT]
    [AI PREDICTION]
    [SOLAR FORECAST]
    [ALERT]
    [RECOMMENDED ACTION]
    [SUSTAINABILITY IMPACT]
    ${storytelling ? "[NARRATIVE]" : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: storytelling ? 0.8 : 0.1,
        topP: 0.95,
        tools: [{googleSearch: {}}],
      }
    });

    const text = response.text || '';
    
    return {
      status: extractSection(text, 'DASHBOARD STATUS'),
      insight: extractSection(text, 'ENERGY INSIGHT'),
      prediction: extractSection(text, 'AI PREDICTION'),
      solarForecast: extractSection(text, 'SOLAR FORECAST'),
      alert: extractSection(text, 'ALERT'),
      action: extractSection(text, 'RECOMMENDED ACTION'),
      impact: extractSection(text, 'SUSTAINABILITY IMPACT'),
      narrative: storytelling ? extractSection(text, 'NARRATIVE') : undefined,
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      status: "Error",
      insight: "Telemetry link severed.",
      prediction: "N/A",
      solarForecast: "N/A",
      alert: "System Failure",
      action: "Reconnect",
      impact: "Unknown"
    };
  }
};

export const initNeuralChat = (state: DashboardState): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const lastPoint = state.history[state.history.length - 1];

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `
        You are the EcoPulse Neural Query Interface. 
        You have direct access to building telemetry:
        - Current Demand: ${state.currentPower}kW
        - Solar: ${lastPoint.solar}kW
        - Battery: ${lastPoint.battery}%
        
        Respond with technical authority. Use a concise, terminal-style tone. 
        You are the building's core OS.
      `,
    }
  });
};

const extractSection = (text: string, sectionTitle: string): string => {
  const regex = new RegExp(`\\[${sectionTitle}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : "N/A";
};
