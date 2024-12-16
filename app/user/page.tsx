'use client'
import LevelSystemComponent from "@/components/level/LevelSystem";
import IconSelector from "@/components/user/icon/IconSelector";
import UsernameDisplay from "@/components/user/UsernameDisplay";
import UserStats from "@/components/user/UserStats";
import { useUser } from "@/app/hooks/contexts/UserContext";
import Icon, { IconEntity } from "@/models/user/icons/Icon";
import { useInventory } from "../hooks/contexts/InventoryContext";
import { useGarden } from "../hooks/contexts/GardenContext";
import { useStore } from "../hooks/contexts/StoreContext";
import { saveUser } from "@/utils/localStorage/user";
import User from "@/models/user/User";
import { Garden } from "@/models/garden/Garden";
import { Inventory } from "@/models/itemStore/inventory/Inventory";
import { Store } from "@/models/itemStore/store/Store";
import { saveGarden } from "@/utils/localStorage/garden";
import { saveInventory } from "@/utils/localStorage/inventory";
import { saveStore } from "@/utils/localStorage/store";
import { useAccount } from "../hooks/contexts/AccountContext";
import { Suspense, useEffect, useState } from "react";
import { env } from "process";
import { makeApiRequest } from "@/utils/api/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/contexts/AuthContext";
import RedirectingMessage from "@/components/errorPages/redirectingMessage";

const UserPage = () => {
  
  const  RenderUser = () => {
    const { firebaseUser } = useAuth();
    const {user, username, handleChangeUsername, icon, handleChangeIcon, reloadUser} = useUser();
    const { inventory, reloadInventory } = useInventory();
    const { store, reloadStore } = useStore();
    const { garden, reloadGarden } = useGarden();
    const { account, guestMode, setGuestMode, environmentTestKey } = useAccount();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);

    
    useEffect(() => {
      if (!firebaseUser && !guestMode) {
        setIsRedirecting(true); // Trigger the redirecting state

        // Delay the redirect by 2 seconds (adjust the time as needed)
        const timer = setTimeout(() => {
          router.push('/login');
        }, 2000); // 2 seconds delay before redirecting

        return () => clearTimeout(timer); // Cleanup the timer if the component is unmounted or the condition changes
      } else {
        setIsRedirecting(false);
      }
    }, [firebaseUser, guestMode, router]);

    // Show the redirecting message if needed
    if (!firebaseUser && !guestMode) {
      let redirectDivElement;
      if (isRedirecting) {
        redirectDivElement = <RedirectingMessage targetPage="login page"/>;
      } else {
        redirectDivElement = <div>{`Fetching user data...`}</div>;
      }

      return (<>
        <div className="w-full px-4 py-4 bg-reno-sand-200 text-black"> 
            {redirectDivElement}
        </div>
        </>
      );
    }

    if (!user || !account) {
      return <></>;
    }

    const handleCreateAccountButton = async () => {
      try {
        // Making the POST request to your API endpoint
        const response = await fetch('/api/account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plainUserObject: user.toPlainObject(),
            plainInventoryObject: inventory.toPlainObject(),
            plainStoreObject: store.toPlainObject(),
            plainGardenObject: garden.toPlainObject()
          }), // Send the new user data in the request body
        });
  
        // Check if the response is successful
        if (!response.ok) {
          throw new Error('Failed to post new account');
        }
  
        // Parsing the response data
        const result = await response.json();
        console.log('Successfully posted:', result);
      } catch (error) {
        console.error(error);
      }
    }

    const handleSaveAccountButton = async () => {
      try {
        // Making the POST request to your API endpoint
        const response = await fetch('/api/account', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plainUserObject: user.toPlainObject(),
            plainInventoryObject: inventory.toPlainObject(),
            plainStoreObject: store.toPlainObject(),
            plainGardenObject: garden.toPlainObject()
          }), // Send the new user data in the request body
        });
  
        // Check if the response is successful
        if (!response.ok) {
          throw new Error('Failed to update account');
        }
  
        // Parsing the response data
        const result = await response.json();
        console.log('Successfully updated:', result);
      } catch (error) {
        console.error(error);
      }
    }

    const handleFetchAccountButton = async () => {
      try {
        const userId = user.getUserId();
        // Making the GET request to your API endpoint
        const response = await fetch(`/api/account/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        // Check if the response is successful
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        // Parsing the response data
        const result = await response.json();
        console.log('Successfully fetched:', result);
        console.log(User.fromPlainObject(result.plainUserObject));
        console.log(Garden.fromPlainObject(result.plainGardenObject));
        console.log(Inventory.fromPlainObject(result.plainInventoryObject));
        console.log(Store.fromPlainObject(result.plainStoreObject));
        saveUser(User.fromPlainObject(result.plainUserObject));
        saveGarden(Garden.fromPlainObject(result.plainGardenObject));
        saveInventory(Inventory.fromPlainObject(result.plainInventoryObject));
        saveStore(Store.fromPlainObject(result.plainStoreObject));
        reloadUser();
        reloadGarden();
        reloadInventory();
        reloadStore();
      } catch (error) {
        console.error(error);
      }
    }

    const onIconChangeHandler = async (icon: Icon) => {
      handleChangeIcon(icon);

      // Terminate early before api call
      if (guestMode) {
        return;
      }

      try {
        const data = {
          userId: user.getUserId(),
          newIcon: icon.getName()
        }
        const apiRoute = `/api/user/${user.getUserId()}/icon`;
        const result = await makeApiRequest('PATCH', apiRoute, data, true);
        console.log('Successfully posted:', result);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    const onUsernameChangeHandler = async (username: string) => {
      handleChangeUsername(username);

      // Terminate early before api call
      if (guestMode) {
        return;
      }

      try {
        const data = {
          userId: user.getUserId(),
          newUsername: username
        }
        const apiRoute = `/api/user/${user.getUserId()}/username`;
        const result = await makeApiRequest('PATCH', apiRoute, data, true);
        console.log('Successfully posted:', result);
      } catch (error) {
        console.error(error);
      }
      return;
    }

    function renderAccountManagementButtons() {
      // const environmentTestKey = await fetchEnvironmentTestKey();

      if (!environmentTestKey) {
        return (
          <>
            <div>Could not fetch environment, currently in local save mode</div>
          </>
        );
      }

      // Check the value of environmentTestKey and render buttons accordingly
      if (environmentTestKey === 'this is the local environment' || environmentTestKey === 'this is the dev environment') {
        return (
          <>
          <div>Environment test key successfully returned.</div>
          </>
          // <>
          //   <div><button onClick={handleCreateAccountButton}> Create user in Database </button></div>
          //   <div><button onClick={handleSaveAccountButton}> Save user to Database </button></div>
          //   <div><button onClick={handleFetchAccountButton}> Fetch user from Database </button></div>
          //   <div><button onClick={handleToggleGuestModeButton}> {`Toggle Cloud Saving ${guestMode ? '(Currently on)' : '(Currently off)'}`} </button></div>
          // </>
           );
      } else if (environmentTestKey === 'this is the prod environment') {
        return (<></>);
      } else {
        return (
          <>
            <div>{environmentTestKey}</div>
          </>
        );
      }
    }

    return <>
      <div className="w-full px-4 py-4 bg-reno-sand-200 text-black">
        <div className="flex">
          <div className={`w-1/3`}>
            <div className={`my-1 min-h-[8%] flex flex-row items-center justify-center `}>
              <IconSelector iconIndex={icon} onIconChange={onIconChangeHandler}/>
              <UsernameDisplay username={username} onUsernameChange={onUsernameChangeHandler}/>
            </div>
            <div className="mx-4 my-4">
              <LevelSystemComponent level={user.getLevel()} currentExp={user.getCurrentExp()} expToLevelUp={user.getExpToLevelUp()} />
            </div>
            <div>{`The friends list will go here, once it's ready!`}</div>
            <Suspense fallback={<div>Loading...</div>}>
              {renderAccountManagementButtons()}
            </Suspense>
            </div>

          <div className={`w-2/3`}>
            <UserStats />
          </div>
        </div>
      </div>
    </>
  }

  return (<>
    <div className="w-full px-4 py-4 bg-reno-sand-200 text-black"> 
      {RenderUser()}
    </div>
    </>
  );
}

export default UserPage;