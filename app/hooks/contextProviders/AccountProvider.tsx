'use client'
import { AccountContext } from "@/app/hooks/contexts/AccountContext";
import { loadAccount, saveAccount } from "@/utils/localStorage/account";
import { ReactNode, useEffect, useState } from "react";
import { Account } from '@/models/account/Account';

// Define props for the provider
interface AccountProviderProps {
    children: ReactNode;
}

export const AccountProvider = ({ children }: AccountProviderProps) => {
    const [account, setAccount] = useState<Account | null>(null);
	const [guestMode, setGuestMode] = useState<boolean>(false);
	const [environmentTestKey, setEnvironmentTestKey] = useState<string>('');

	function generateDefaultNewAccount(): Account {
		return new Account(false);
	}
	
	function setupAccount(): Account {
		let tempAccount = loadAccount();
		console.log(tempAccount);
		if (!(tempAccount instanceof Account)) {
		  console.log('account not found, setting up');
		  tempAccount = generateDefaultNewAccount();  
		  saveAccount(tempAccount);
		}
		return tempAccount;
	  }

	useEffect(() => {
		const account = setupAccount();
		setAccount(account);
		setGuestMode(account.guestMode);
	}, []);

	function setGuestModeHandler(value: boolean): void {
		setGuestMode(value);
		if (account) {
			account.guestMode = value;
			saveAccount(account);
		}
	}

	const fetchEnvironmentTestKey = async () => {
		try {
			const response = await fetch('/api/test', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				}
			});

			if (!response.ok) {
				throw new Error('Failed to fetch test key');
			}

			const result = await response.json();
			// console.log('Successfully fetched test key:', result);
			return result;
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		const updateTestKey = async () => {
			const testKey = process.env.NEXT_PUBLIC_TEST_ENV_KEY || 'error';
			// const testKey = await fetchEnvironmentTestKey();
			setEnvironmentTestKey(testKey);
		};

		updateTestKey();
	}, []);


    return (
        <AccountContext.Provider value={{ account: account!, guestMode: guestMode, setGuestMode: setGuestModeHandler, environmentTestKey}}>
            {children}
        </AccountContext.Provider>
    );
};
