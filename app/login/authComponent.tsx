// AuthComponent.tsx
import React, { useContext, useEffect, useState } from 'react';
 // Import the AuthContext
import { registerUser, loginUser, logoutUser, loginWithGoogle, getUserCustomClaims, fetchAccountObjects } from './authClientService';
import { useAuth } from '../hooks/contexts/AuthContext';
import { Garden } from '@/models/garden/Garden';
import { Inventory } from '@/models/itemStore/inventory/Inventory';
import { Store } from '@/models/itemStore/store/Store';
import User from '@/models/user/User';
import { saveGarden } from '@/utils/localStorage/garden';
import { saveInventory } from '@/utils/localStorage/inventory';
import { saveStore } from '@/utils/localStorage/store';
import { saveUser } from '@/utils/localStorage/user';
import { useUser } from '../hooks/contexts/UserContext';
import { useInventory } from '../hooks/contexts/InventoryContext';
import { useGarden } from '../hooks/contexts/GardenContext';
import { useStore } from '../hooks/contexts/StoreContext';
import { useAccount } from '../hooks/contexts/AccountContext';

const AuthComponent: React.FC = () => {
    const { firebaseUser, loading, logout } = useAuth(); // Access user and loading state
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const { user, reloadUser, resetUser } = useUser();
    const { inventory, reloadInventory, resetInventory } = useInventory();
    const { store, reloadStore, resetStore } = useStore();
    const { garden, reloadGarden, resetGarden } = useGarden();
    const { account, guestMode, setGuestMode } = useAccount();
    const allowFirebase = process.env.NEXT_PUBLIC_TEST_ENV_KEY;

    const syncAccountObjects = async () => {
        const result = await fetchAccountObjects();
        console.log('result:');
        console.log(result);
        if (!result) {
            console.error(`Could not find result of fetchAccountObjects!`);
        }

        saveUser(User.fromPlainObject(result.plainUserObject));
        saveGarden(Garden.fromPlainObject(result.plainGardenObject));
        saveInventory(Inventory.fromPlainObject(result.plainInventoryObject));
        saveStore(Store.fromPlainObject(result.plainStoreObject));
        reloadUser();
        reloadGarden();
        reloadInventory();
        reloadStore();
    }

    const handleRegister = async () => {
        if (allowFirebase !== 'this is the local environment') {
            setMessage(`Error: Firebase registration is disabled at this time. Please use guest mode instead.`);
            return;
        }
        setMessage(``);
        try {
            const userCredential = await registerUser(email, password);
            setMessage(`User registered: ${userCredential.user.email}`);
            syncAccountObjects();
            setGuestMode(false);
        } catch (error) {
            setMessage("Registration failed. Please try again.");
        }
    };

    const handleLogin = async () => {
        if (allowFirebase !== 'this is the local environment') {
            setMessage(`Error: Firebase login is disabled at this time. Please use guest mode instead.`);
            return;
        }
        setMessage(``);
        try {
            const userCredential = await loginUser(email, password);
            setMessage(`User logged in: ${userCredential.user.email}`);
            syncAccountObjects();
            setGuestMode(false);
        } catch (error) {
            setMessage("Login failed. Please check your credentials.");
        }
    };

    const handleLogout = async () => {
        setMessage(``);
        try {
            await logout();
            setMessage("User logged out successfully.");
            setGuestMode(false);
        } catch (error) {
            setMessage("Logout failed. Please try again.");
        }
    };

    const handleGoogleLogin = async () => {
        if (allowFirebase !== 'this is the local environment') {
            setMessage(`Error: Firebase login is disabled at this time. Please use guest mode instead.`);
            return;
        }
        setMessage(``);
        try {
            const userCredential = await loginWithGoogle();
            setMessage(`User logged in with Google: ${userCredential.user.email}`);
            syncAccountObjects();
            setGuestMode(false);
        } catch (error) {
            setMessage("Google login failed. Please try again.");
        }
    };

    const printCustomClaims = async () => {
        await getUserCustomClaims();
    }

    const enterGuestMode = () => {
        if (guestMode) {
            setMessage("You are already in guest mode. Local data will be deleted upon registration or login.");
            return;
        }
        resetUser();
        resetGarden();
        resetStore();
        resetInventory();
        setGuestMode(true);
        setMessage("Entered guest mode. Local data will be deleted upon registration or login.");
    }

    if (loading) {
        return <p>Loading...</p>; // Show a loading message while checking auth state
    }

    return (
        <div className="flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Sign in to Virtual Garden</h2>
                {firebaseUser ? (
                    <div>
                        <p className="text-center">Welcome, {firebaseUser.email}</p> {/* Display user's email */}
                        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded w-full hover:bg-red-600">
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-gray-300 p-2 mb-4 w-full rounded"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border border-gray-300 p-2 mb-4 w-full rounded"
                        />
                        <button onClick={handleRegister} className="bg-blue-500 text-white p-2 rounded w-full mb-2 hover:bg-blue-600">
                            Register
                        </button>
                        <button onClick={handleLogin} className="bg-green-500 text-white p-2 rounded w-full mb-2 hover:bg-green-600">
                            Login
                        </button>
                        <button onClick={handleGoogleLogin} className="bg-yellow-500 text-white p-2 rounded w-full mb-2 hover:bg-yellow-600">
                            Login with Google
                        </button>
                        <button onClick={enterGuestMode} className="bg-red-500 text-white p-2 rounded w-full hover:bg-red-600">
                            {guestMode ? 'Guest Mode is currently On' : 'Enter as Guest'}
                        </button>
                    </>
                )}
                {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            </div>
        </div>
    );
};

export default AuthComponent;