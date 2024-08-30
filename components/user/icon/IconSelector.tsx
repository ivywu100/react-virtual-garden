import { useUser } from '@/hooks/contexts/UserContext';
import { placeholderItemTemplates } from '@/models/items/templates/models/PlaceholderItemTemplate';
import Icon from '@/models/user/icons/Icon';
import { iconRepository } from '@/models/user/icons/IconRepository';
import React, { useState } from 'react';
import DropdownComponent from '../../lists/DropdownComponent';
import { PopupWindow } from '../../window/popupWindow';
import IconButton from './IconButton';

const availableIcons = iconRepository.Icons; // Example list of icons

const IconSelector = ({ iconIndex, onIconChange }: {iconIndex: string, onIconChange: Function}) => {
    const [showAllIcons, setShowAllIcons] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string | null>('');
    const { user } = useUser();
    const showAllIconsWindow = () => {
        setShowAllIcons(true);
    }

    const onIconClick = (iconOption: Icon) => {
        setShowAllIcons(false);
        return onIconChange(iconOption.getName());
    }

    const RenderCategoryFilter = () => {
		const categories = iconRepository.getIconCategories();
		const selectCategoryFilter = (value: string | null) => {
			setCategoryFilter(value);
		}

		return (<>
            <DropdownComponent
                label="Filter by Category"
                options={categories}
                selectedValue={categoryFilter}
                onChange={selectCategoryFilter}
                renderOptionLabel={(option) => option} // Just return the option since it's a string
            />
		</>
		);
	}

    const RenderIconChoices = () => {
        const iconSet: Icon[] = [];

        if (!categoryFilter || categoryFilter === '') {
            iconRepository.getIconCategories().map((categoryName) => {
                availableIcons[categoryName].map((iconOption) => {
                    if(user.isIconUnlocked(iconOption)) {
                        iconSet.push(iconOption);
                    }
                })
            });
        } else {
            availableIcons[categoryFilter].map((iconOption) => {
                if(user.isIconUnlocked(iconOption)) {
                    iconSet.push(iconOption);
                }
            });
        }

        const chunkedIcons = [];
        // Chunk the icons into arrays of 5
        for (let i = 0; i < iconSet.length; i += 5) {
            chunkedIcons.push(iconSet.slice(i, i + 5));
        }

        if (chunkedIcons.length === 0) {
            return <div className="max-h-[60vh] overflow-y-auto">
                No icons found. Try another category!
            </div>;
        }

        return <div className="max-h-[60vh] overflow-y-auto">
            {chunkedIcons.map((iconGroup, index) => (
            <div key={index} className="flex flex-row mx-4 my-4"> {/* Flexbox for horizontal alignment */}
              {iconGroup.map((iconOption) => (
                <IconButton key={iconOption.getName()} icon={iconOption.getName()} onClickFunction={() => onIconClick(iconOption)} borderColor={`coffee-700`} size={"text-8xl"}/>
              ))}
            </div>
          ))}
          </div>;
    }

    
	return (
        <span className="icon-selector">
            <IconButton icon={iconIndex} onClickFunction={showAllIconsWindow} borderColor={`coffee-700`} size={"text-4xl"}/>
            {/* <button onClick={showAllIconsWindow} className="px-1 py-1 border border-2 border-coffee-700 align-text-bottom text-center bg-gray-300 min-w-12 min-h-12 text-3xl text-purple-600 font-semibold rounded-lg" >{iconRepository.getIconByName(iconIndex)}</button> */}
            <PopupWindow showWindow={showAllIcons} setShowWindow={setShowAllIcons}>
                <div className="w-max bg-reno-sand-200 text-black p-8 rounded-lg shadow-md justify-between items-center">
                    <div className="text-2xl text-semibold"> Select a new icon: </div>
                    <div className="text-xl mb-2">{RenderCategoryFilter()}</div>
                    <div className="text-sm mb-4">Plant crops or place decorations to unlock new icons.</div>
                    {RenderIconChoices()}
                    </div>
            </PopupWindow>
        </span>
    );
}

export default IconSelector;