import { Account } from "@/models/account/Account";
import { createContext, useContext } from "react";

// Define your context type
interface AccountContextType {
    account: Account;
    cloudSave: boolean;
    toggleCloudSave: () => boolean;
    environmentTestKey: string;
    // Add any other actions or state you need
}

// Create a context with default values
export const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within a AccountProvider');
    }
    return context;
};