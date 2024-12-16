# Virtual-Garden-Blog

## Day 1

### Set up a new app using Next.js + React

### Upload to git

### Write design doc

## Day 2

### Building infrastructure/models/writing tests

### Run tests with npm test

## Day 3

### Building more infrastructure + writing more tests
  * Working on Inventory + ItemList right now, next goal is plots/gardens

## Day 4

### Add useItem functions to inventory/garden
  * Allows swapping/converting items into other forms (seed -> plant -> harvestedItem)

### Refactor code for readability

## Day 5

### Start working on ui for garden, plot component that displays the item icon

### Added placeItem function to plot

## Day 6

### Create Store class which holds a list of items for sale and modifies inventories

  * See design doc
  * Created ItemStore abstract class that is extended by Store and Inventory
  * Store contains functions to specifically buy/sell things from inventories
  * Added localStorage save/load to Store, Inventory, Garden

### Refactored ui code

## Day 7

### Added store page and trade window

  * Store page consists of store inventory, player inventory, trade window
  * Refactored item component to be reusable between player and store inventory
  * Refactored selector to differentiate player and store items
  * Trade window contains buttons to modify quantity of item being traded
  * Added LongPressButton component to continuously run the addQuantity function when holding down a button
  * Added exponential scaling to addQuantity, so that we can add up to 100000 items in about 10 seconds

## Day 8

### Converted store to a context + useStore 

  * Added store, restock, reset
  * TODO: convert garden and inventory to contexts

### Added LevelSystem for garden

### Improved serialize/deserialize methods for models, better error handling

## Day 9

### Converted garden and inventory to contexts + custom hook

### Redoing item templates and moving data to a data file for ease of content creation later

### Refactored items, item templates, fromPlainObject

  * Rewrote generatePlaceholder items
  * Added functions to get the class from an item
  * Turned inventory/placed items into abstract class, implemented subtypes as classes
  * Turned inventory/placed templates into abstract class, implemented subtypes
  * Wrote tests for to/fromPlainObject

## Day 10

### Added expand/shrink row buttons

  * Can only expand to 5 + level/5
  * Can shrink to 1

### Added tests to verify save/loading of item templates

  * Still need to add tests for items

### Added plantTime to plots and time to grow to plants

  * Setup for adding grow timers to plants
  * Plot background now changes colors when plants are finished growing
  * Plants can only be harvested when enough time has passed
  * Added messages to garden to display when plants are placed/harvested

## Day 11

### Built tooltip component

  * Plots now show tooltips on hover, displaying the value of the harvested item and how much grow time is remaining
  * Added infrastructure for inventory/trade window tooltips, though the content is to be desired
  * Added tooltips for inventory items

### Reworked store restock function

  * restockTime is now set to the time when restock is ready
  * New restockInterval field to determine the new restockTime
  * Loading a store (on refresh) will immediately restock if necessary
  * If restocking does not add any items, restockInterval is not changed
  * Store now restocks properly (interval seconds after items are purchased)

### Refactored items

  * Added item interfaces to prevent circular dependencies
  * Reworked fromPlainObject to only serialize the id, name, and type, and grab all relevant data from the items.json file
  * This causes items to update automatically when the user refreshes
  * If this ever goes live service might want to force a refresh when a new patch comes out, or users will see the wrong display

## Day 12

### Refactored items

  * Added item categories (mostly used for plant families) and descriptions
  * Updated templates + interfaces to reflect this change
  * Updated id formula to reflect this change
  * Renamed harvested x to just x; sharing names is okay because we split between plants and harvested

### UI Changes

  * Added item categories to the tooltips
  * Updated StoreProvider to more easily add new items to store
  * Fixed issue with tooltips not properly updating when the page is scrolled

## Day 13

### UI Changes

  * Moved selectedItem and owner to a provider/context, allowing easier access from internal components
  * SelectedItem now sets to null if you click an already selected item
  * Added tooltips for empty plots when a blueprint or seed is selected
  * Added dropdowns for filtering inventories by subtype and category
  * Refactored store and inventory for code reuse
  * Fixed issue with inventory not updating when garden is interacted with
    * Added inventoryForceRefreshKey as a hack to the inventoryProvider, used to refresh the item list manually
  * Updated text on plot tooltips to display more useful information on remaining time/grow time


## Day 14

### Added User Class

  * Only contains username, icon, levelsystem for now
  * Levelsystem was moved from garden to user; things that gave the garden xp now give the user xp
  * Added UserContextProvider with functions to modify username and icon
  * Need to implement history/stats tracker

### Added User page

  * Garden page now displays some basic user information
  * User page now allows modification of username and icon
  * Can only select icons from the plants subtype
  * Added popup for icon selection

### Other UI changes

  * Refactored ui to use const instead of functions for all permanent elements

### Added mango item

## Day 15

### Working on history class

  * Stores a record of how many times items/buttons were interacted with by a user
  * Building history, historylist, tests
  * ItemHistory and ActionHistory
  * Finished test cases for ActionHistory and ActionHistoryList

### UI Changes

  * Store now highlights changed prices in orange and displays the markup fee
  * Refactored tradeWindowItem for code reuse
  * Added new text colors for inventory items

## Day 16

### Adding History to User Page

  * Actionhistory, Itemhistory
  * IconSelector only displays icons for items that you have harvested before

### UI Changes

  * Selected item in inventory is now highlighted
  * Plot tooltips now only display numbers between 1 and growtime, causing lag at the start but finishing at 1s
  * Inventory cuts off at 60% of viewport height, and allows scrolling
  * Added more colors for tailwind
  * Removed debug options from main screen, now only accesible by clicking profile image 30 times
  * Moved garden expansion options into hidden folder, and gave them tooltips
  * Garden expansion options are disabled if too large/small

## Day 17

### Store update

  * New store.json and stocklist.json data files
  * Stores now grab stocklist from data files, so they will update instantly
  * Allows for future expansions of additional store types
  * Changed some text colors

### User Icon Selection now depends on plants/decorations harvested/placed

### Added multiple harvests to certain plants

  * Right now initial harvest takes growTime, then subsequent harvests take growTime/2
  * Eventually will change to have specific timers
  * Need to work out a way to better display this information

## Day 18

### Looking into how to host external database and poll user data from there

  * Added some test files for querying from local postgres db
  * Not pushing .env, some things will break if forked

## Day 19

### Added infrastructure for toolbox class

  * Users will have a toolbox, which appears on the garden screen for special actions
  * ie. a shovel to remove plants and move decorations
  * TODO: tools are upgradeable and can give special bonuses, so we store each user's individual set of tools
  * TODO: tools can be purchased in the store (on a separate page, not as part of the inventory), which removes the existing tool of that type if there is one (only 1 shovel at a time)
  * TODO: tools actually impact the garden

## Day 20

### Wasted money on AWS aurora instance even though the database was empty

### Added postgres local database

  * Accessible with pool/query
  * Writing services and apis to interact with db
  * Harvest all is broken for xp because it calculates the new xp before updating the database, so all writes will update the db with the same values. Need to stagger read times or calculate the expected xp increase.
  * Plots need ids (or just row/column/owner) so we can track them in database
  * Maybe plots are always in existence (once user is leveled), expanding/shrinking just shows/hides them and makes them uninteractable

## Day 21-30

### Working on database schemas, services, api routing, integrating database queries with updating backend models

### Added repository, service, routing for the following:
  * User
  * LevelSystem
  * Garden
  * Plot
  * PlacedItem
  * Inventory
  * InventoryItem
  * Store
  * StoreItem
  * ItemHistory
  * ActionHistory
  * Contains various functions to interact with database and send/receive data from api routes

### Create X Service functions should take in the model and use it to produce the entire object in database

### Plots are no longer deleted by resizing garden, only hidden

### Added service functions for the following:

  * Create/Save/Fetch Account
  * PlantSeed
  * PlaceDecoration
  * HarvestPlant
  * PickupDecoration
  * Expand/Shrink Garden Rows
  * Expand/Shrink Garden Columns
  * Buy/Sell Items
  * Update username/icon

### Added cloud save enable/disable button (currently disabled for production)

## Day 31

### Firebase auth

  * Setup firebase project and enable auth
  * Register this webapp to firebase project
  * npm install firebase
  * Create auth context and wrap content in it
  * Implement sign in and sign out buttons
  * Protect certain pages when not signed in 
  * Display user data
  * Link firebase auth with database
  * Protect api routes based on login

### Firebase account creation

  * New User
  * User has an empty User, Garden, Inventory, Store object: Good to go
  * User has existing User/Garden/Inventory/Store: data migration eventually, right now just a warning that it'll be deleted
  * User presses register account button
  * Firebase creates account, returning an auth token
  * Server verifies auth token (in api layer)
    * Add reusable middleware to avoid duplicating token verification code in every api route
  * Server creates database entries with default parameters
  * Server returns created objects
  * Firebase links returned role to custom claims
  * Client loads returned objects into memory and propagates to contexts
  * Added auth wrappers around most api calls
  * On login, loads the user's garden from database
  * On logout, unloads the garden ?
    * Garden/store/user shouldn't be visible while logged out anyways, it should redirect to login
    * Unless in guest mode

### UI changes

  * Updated header
  * Account icon and dropdown menu
  * Updated description on login screen
  * Added react-redux to track item quantities for instant updating when planting/harvesting/buying/selling


TODO:

Action items:
1. Make the redirect delayed and make it sit on a screen that says redirect to login page (may be changed in the future)
2. Fix the header and hide irrelevant buttons and make it cleaner and use less space 
3. Icon on message on top right for login/logout
4. UI indication that guest mode is on (in the header)
5. The login screen should be clear that logging in will disable guest mode through a popup window
6. Message for guest mode can not be disabled until logged in 
7. Popup for guest mode that says it is a new garden 
8. In the case when a user logs in then logs out then clicks guest mode. Guest mode should display fresh garden/inventory instead of previous user stuff. 

User page no longer allows create/save/fetch, we automatically create on account register with firebase,
save whenever an action is performed, fetch on login; add a debug force fetch option

Top right icon for user + username, clicking on it gives log out option

On garden page, user and inventory can be expanded/hidden

Design home page and login page

Admin panel

Validate garden bounds for plant/harvest

Change mouseover color for inventoryItems

Use redux for state management

Generate multiple store types/switch between stores/restock store
Clean up ui, especially font/scaling using rem, to accommodate more screen width
Trade Window Multiselect + Total

Make Garden more interactive than plant all -> harvest 

Add level requirement to plants/seeds

Add way to delete in progress plants, some sort of select delete tool

Add crop rotation - either assign plant families or just individual plants + soil health; low soil health -> cannot be fertilized for a duration + yield reduction, high soil health -> free stronger fertilizer

Add fertilizer item - chance for double harvest, or reduce grow time. fertilizer lasts x seconds and affects any plants that start (finish?) growing during that time. or linearly diminishing effect based on time since fertilizer application

Change plant categories to better reflect common terms

Make store not able to delete items, even if they drop to 0 quantity, and modify display to say out of stock

Add toolkit - select (plant, harvest, pickup, place); delete (only in progress plants)

Daily login bonus to prevent softlock - gives some money and a random assortment of seeds that add up to some value

Change value of slow plants so they aren't super efficient, make them high risk high reward by having high seed costs + add random events that can destroy them + fertilizer that makes them super efficient

Tooltips should not go off the screen; make them below if normally on top, or on top if normally below

Grow zombies/other creatures - randomly move around and give bonuses (automatic harvest/planting, fertilizer, harvest bonus)

User almanac - displays how many of each plant were grown, some extra details about them

User sends harvest plant request alongside their user auth token -> backend checks the token matches the user (or fetches the user that matches that token), attempts to perform the harvest plant request, sends back success/failure state -> frontend updates display based on result

auth0 provides a user id, which we need to stick into the sql database

New user -> backend sets up user, garden, inventory, store, etc. (choose uuids here) -> backend pushes to database, forcing uuids of certain type

Old user -> backend checks for current id -> grab data from database based on current id -> push to backend model


UI Bugs
Increasing the size of a tooltip while it is hovered does not change its position; this can cause issues where the tooltip goes off the screen or interferes with the mouse pointer, ie. when a plot goes from planted item to empty/displaying the harvested item vs planted. 

Stretch Goals
Instead of expanding row/col, have the user add 1 plot at a time
This is a design flaw, not a coding one -- right now supports exponential growth when it should be linear, also easier to make iterative progress
Probably requires an entirely new ui though for the user to select their next plot location
Or don't allow buying expansions/limit it per level
Add random events/natural disasters that interact with decorations ie. scarecrows, fences
Small, medium, large stores with different restock intervals and stock limits
Item metadata migration tool
Dev/Prod external dbs, and dev/prod branches
Garden Stock Market - buying/selling pressure, variable costs, options and futures

Crop rotation thoughts
Garden has Fertility, Structure, Biodiversity quantities. 
Fertility - Soil nutrient levels, determines crop yields and quality rating
Structure - Soil physical health, determines grow speed and natural disaster resistance
Biodiversity - Soil biological health, determines xp earned and pest resistance
Growing certain crops increases/decreases these respectively