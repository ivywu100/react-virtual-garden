'use client'
import { UserContext } from '@/app/hooks/contexts/UserContext';
import Icon from '@/models/user/icons/Icon';
import User from '@/models/user/User';
import { loadUser, saveUser } from '@/utils/localStorage/user';
import React, { ReactNode, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define props for the provider
interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [icon, setIcon] = useState<string | null>(null);

	function setupUser(): User {
		let user = loadUser();
		console.log(user);
		if (!(user instanceof User)) {
		  console.log('user not found, setting up');
		  user = User.generateDefaultNewUser();
		  saveUser(user);
		}
		if (user.getIcon() === 'error') {
			console.log('user data corrupted, resetting');
			console.log(user);
			user = User.generateDefaultNewUser();
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

	function handleChangeIcon(newIcon: Icon) {
		if (!user) return;
		user.setIcon(newIcon.getName());
		setIcon(newIcon.getName());
		saveUser(user);
	}

	const resetUser = () => {
		const newUser = User.generateDefaultNewUser();
		setUser(newUser);
		saveUser(newUser);
		console.log(newUser.toPlainObject());
	}

	const reloadUser = () => {
		const user = setupUser();
		setUser(user);
		setUsername(user.getUsername());
		setIcon(user.getIcon());
	}

    return (
        <UserContext.Provider value={{ user: user!, username: username!, handleChangeUsername, icon: icon!, handleChangeIcon, resetUser, reloadUser }}>
            {children}
        </UserContext.Provider>
    );
};
