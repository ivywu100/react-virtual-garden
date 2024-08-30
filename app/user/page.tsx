'use client'
import LevelSystemComponent from "@/components/level/LevelSystem";
import IconSelector from "@/components/user/icon/IconSelector";
import UsernameDisplay from "@/components/user/UsernameDisplay";
import UserStats from "@/components/user/UserStats";
import { useUser } from "@/hooks/contexts/UserContext";
import { useEffect, useState } from "react";

const UserPage = () => {
  
  const  RenderUser = () => {
    const {user, username, handleChangeUsername, icon, handleChangeIcon} = useUser();

    if (!user) {
      return <></>;
    }

    return <>
      <div className="w-full px-4 py-4 bg-reno-sand-200 text-black">
        <div className="flex">
          <div className={`w-1/3`}>
            <div className={`my-1 min-h-[8%] flex flex-row items-center justify-center `}>
              <IconSelector iconIndex={icon} onIconChange={handleChangeIcon}/>
              <UsernameDisplay username={username} onUsernameChange={handleChangeUsername}/>
            </div>
            <div className="mx-4 my-4">
              <LevelSystemComponent level={user.getLevel()} currentExp={user.getCurrentExp()} expToLevelUp={user.getExpToLevelUp()} />
            </div>
            <div>Friends List goes here!</div>
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