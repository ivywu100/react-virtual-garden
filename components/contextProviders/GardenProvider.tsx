'use client'
import { GardenContext } from '@/app/hooks/contexts/GardenContext';
import { Garden } from '@/models/garden/Garden';
import { loadGarden, saveGarden } from '@/utils/localStorage/garden';
import React, { ReactNode, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define props for the provider
interface GardenProviderProps {
    children: ReactNode;
}

export const GardenProvider = ({ children }: GardenProviderProps) => {
    const [garden, setGarden] = useState<Garden | null>(null);
	const [gardenMessage, setGardenMessage] = useState('');
	const [instantGrow, setInstantGrow] = useState(false);
	const [gardenForceRefreshKey, setGardenForceRefreshKey] = useState(0);

	function generateDefaultNewGarden(): Garden {
		const randomUuid = uuidv4();
		return new Garden(randomUuid, "Test User");
	}

	function setupGarden(): Garden {
		let garden = loadGarden();
		console.log(garden);
		if (!(garden instanceof Garden)) {
		  console.log('garden not found, setting up');
		  garden = generateDefaultNewGarden();
		  saveGarden(garden);
		}
		return garden;
	  }

	useEffect(() => {
		const garden = setupGarden();
		setGarden(garden);
	}, []);
	

	function resetGarden() {
		const garden = generateDefaultNewGarden();
		setGarden(garden);
		saveGarden(garden);
		console.log('finished reset');
	  }

	function toggleInstantGrow() {
		//Yes this is reversed, because instantGrow hasn't updated until the next render
		setGardenMessage(`instant grow is now: ${!instantGrow ? `on` : `off`}`);
		setInstantGrow((instantGrow) => !instantGrow);
	}

	const updateGardenForceRefreshKey = () => {
		setGardenForceRefreshKey((gardenForceRefreshKey) => gardenForceRefreshKey + 1);
	}

    return (
        <GardenContext.Provider value={
			{ garden: garden!, 
			resetGarden, 
			gardenMessage, 
			setGardenMessage, 
			instantGrow, 
			toggleInstantGrow,
			gardenForceRefreshKey,
			updateGardenForceRefreshKey  }}>
            {children}
        </GardenContext.Provider>
    );
};