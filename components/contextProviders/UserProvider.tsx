'use client'
import { UserContext } from '@/hooks/contexts/UserContext';
import User from '@/models/user/User';
import { loadUser, saveUser } from '@/utils/localStorage/user';
import React, { ReactNode, useEffect, useState } from 'react';

// Define props for the provider
interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [icon, setIcon] = useState<string | null>(null);

	function generateDefaultNewUser(): User {
		return new User('Test User', 'apple');
	}

	function setupUser(): User {
		let user = loadUser();
		console.log(user);
		if (!(user instanceof User)) {
		  console.log('user not found, setting up');
		  user = generateDefaultNewUser();
		  saveUser(user);
		}
		if (user.getIcon() === 'error') {
			console.log('user data corrupted, resetting');
			console.log(user);
			user = generateDefaultNewUser();
			saveUser(user);
		}
		return user;
	  }

	useEffect(() => {
		const user = setupUser();
		setUser(user);
		setUsername(user.getUsername());
		setIcon(user.getIcon());
	}, []);


	function handleChangeUsername(newUsername: string) {
		if (!user) return;
		user.setUsername(newUsername);
		setUsername(newUsername);
		saveUser(user);
	}

	function handleChangeIcon(newIcon: string) {
		if (!user) return;
		user.setIcon(newIcon);
		setIcon(newIcon);
		saveUser(user);
	}

	const resetUser = () => {
		const newUser = generateDefaultNewUser();
		setUser(newUser);
		saveUser(newUser);
		console.log(newUser.toPlainObject());
	}

    return (
        <UserContext.Provider value={{ user: user!, username: username!, handleChangeUsername, icon: icon!, handleChangeIcon, resetUser }}>
            {children}
        </UserContext.Provider>
    );
};