import { Garden } from '@/models/garden/Garden';
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

// Define your context type
interface GardenContextType {
    garden: Garden;
    resetGarden: () => void;
    gardenMessage: string;
    setGardenMessage: React.Dispatch<React.SetStateAction<string>>;
    instantGrow: boolean;
    toggleInstantGrow: () => void;
    gardenForceRefreshKey: number;
    updateGardenForceRefreshKey: () => void;
    // Add any other actions or state you need
}

// Create a context with default values
export const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const useGarden = () => {
    const context = useContext(GardenContext);
    if (!context) {
        throw new Error('useGarden must be used within a GardenProvider');
    }
    return context;
};