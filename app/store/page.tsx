"use client";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { InventoryItem } from "@/models/items/inventoryItems/InventoryItem";
import { useEffect, useState } from "react";
import StoreComponent from "./store";
import { Store } from "@/models/itemStore/store/Store";
import TradeWindowComponent from "./tradeWindow/tradeWindow";
import { useStore } from "@/app/hooks/contexts/StoreContext";
import { useInventory } from "@/app/hooks/contexts/InventoryContext";
import { useSelectedItem } from "@/app/hooks/contexts/SelectedItemContext";
import InventoryComponent from "@/components/inventory/inventory";

const StorePage = () => {
  const RenderStore = () => {
    const { store } = useStore();
    const { inventory } = useInventory();
    const { selectedItem, toggleSelectedItem, owner, setOwner } =
      useSelectedItem();
    // forceRefreshKey is supposed to help with resyncing store/inventory, but it doesn't work right now
    const [forceRefreshKey, setForceRefreshKey] = useState(0);

    const inventorySetSelected = (arg: InventoryItem | null) => {
      setOwner(inventory);
      toggleSelectedItem(arg);
    };

    const tradeWindowSetSelected = (arg: InventoryItem | null) => {
      setOwner(null);
      toggleSelectedItem(arg);
    };

    const storeSetSelected = (arg: InventoryItem | null) => {
      setOwner(store);
      toggleSelectedItem(arg);
    };

    const findStoreComponent = () => {
      if (!store) return <div>Loading Store...</div>;
      return (
        <StoreComponent
          onInventoryItemClickFunction={storeSetSelected}
          forceRefreshKey={forceRefreshKey}
        />
      );
    };

    const findTradeWindowComponent = () => {
      if (!inventory || !store) return <div>Loading Trade Window...</div>;
      return (
        <TradeWindowComponent
          costMultiplier={getCostMultiplier()}
          forceRefreshKey={forceRefreshKey}
          setForceRefreshKey={setForceRefreshKey}
        />
      );
    };

    const findInventoryComponent = () => {
      if (!inventory || !store) return <div>Loading Inventory...</div>;
      return (
        <>
          <div className="w-[80%]" data-testid="user-inventory">
            <InventoryComponent
              onInventoryItemClickFunction={inventorySetSelected}
              costMultiplier={store.getSellMultiplier()}
              forceRefreshKey={forceRefreshKey}
            />
          </div>
        </>
      );
    };

    const getCostMultiplier = () => {
      if (store && inventory && owner instanceof Inventory) {
        return store.getSellMultiplier();
      } else if (store && owner instanceof Store) {
        return store.getBuyMultiplier();
      } else {
        return 1;
      }
    };

    return (
      <>
        <div className="flex ">
          <div className="w-1/3 flex justify-center">
            {findStoreComponent()}
          </div>
          <div className="w-1/3 flex flex-col">
            {findTradeWindowComponent()}
          </div>
          <div className="w-1/3 flex justify-center">
            {findInventoryComponent()}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="w-full px-4 py-4 bg-reno-sand-200 text-black">
        {RenderStore()}
      </div>
    </>
  );
};

export default StorePage;
