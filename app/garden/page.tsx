'use client'
import GardenComponent from "./garden";
import UserProfileComponent from "@/components/garden/userProfile";
import { useInventory } from "@/hooks/contexts/InventoryContext";
import { useGarden } from "@/hooks/contexts/GardenContext";
import { useSelectedItem } from "@/hooks/contexts/SelectedItemContext";
import InventoryComponent from "@/components/inventory/inventory";
import { useUser } from "@/hooks/contexts/UserContext";

const GardenPage = () => {
  const { user } = useUser();
  const { garden, gardenForceRefreshKey } = useGarden();
  const { inventory } = useInventory();

  const {selectedItem, toggleSelectedItem} = useSelectedItem();

  const RenderUser = () => {
    if (!user) return <div>Loading User...</div>;
    return <UserProfileComponent/>
  }

  const RenderGarden = () => {
    if (!garden || !inventory) return <div>Loading Garden...</div>;
    return <GardenComponent key={gardenForceRefreshKey}/>;
  }

  const RenderInventory = () => {
    if (!inventory) return <div>Loading Inventory...</div>;
    return <InventoryComponent onInventoryItemClickFunction={toggleSelectedItem} costMultiplier={1}/>;
  }

  return (<>
    <div className="w-full px-4 py-4 bg-reno-sand-200 text-black">
      <div className="flex">
        <div className="w-1/4">
          {RenderUser()}
        </div>
        <div className="w-1/2 flex-col">
          {RenderGarden()}
        </div>
        <div className="w-1/4" data-testid="user-inventory">
          {RenderInventory()}
        </div>
      </div>
      
    </div>
    </>
  );
}

export default GardenPage;