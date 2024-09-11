import { pool, query } from "@/backend/connection/db";
import { PlacedItemEntity, PlacedItem } from "@/models/items/placedItems/PlacedItem";
import { placeholderItemTemplates } from "@/models/items/templates/models/PlaceholderItemTemplate";
import { getItemClassFromSubtype } from "@/models/items/utility/classMaps";
import { PoolClient } from "pg";
import { v4 as uuidv4 } from 'uuid';

class PlacedItemRepository {

	makePlacedItemObject(placedItemEntity: PlacedItemEntity): PlacedItem {
		if (!placedItemEntity || (typeof placedItemEntity.identifier !== 'string' || (typeof placedItemEntity.status !== 'string'))) {
			console.error(placedItemEntity);
			throw new Error(`Invalid types while creating PlacedItem from PlacedItemEntity`);
		}

		const itemData = placeholderItemTemplates.getPlacedTemplate(placedItemEntity.identifier);
		if (!itemData) {
			throw new Error(`Could not find placedItem matching id ${placedItemEntity.identifier}`)
		}
		const itemClass = getItemClassFromSubtype(itemData);

		const instance = new itemClass(placedItemEntity.id, itemData, placedItemEntity.status);
		if (!(instance instanceof PlacedItem)) {
			throw new Error(`Attempted to create non PlacedItem for id ${placedItemEntity.identifier}`);
		}
		return instance;
	}

	/**
	 * Throws an error. Do not use!
	 * May throw errors if the query is misshapped.
	 * @returns PlacedItemEntity[]
	 */
	async getAllPlacedItems(): Promise<PlacedItemEntity[]> {
		throw new Error('Not implemented yet!');
	}

	/**
	 * Given an id, returns the row data of a placedItem from the database.
	 * @id the id of the placedItem in the database
	 */
	async getPlacedItemById(id: string): Promise<PlacedItemEntity | null> {
		const result = await query<PlacedItemEntity>('SELECT id, owner, identifier, status FROM placed_items WHERE id = $1', [id]);
		// If no rows are returned, return null
		if (!result || result.rows.length === 0) return null;
		return result.rows[0];
		// Return the first item found
		// const instance = makePlacedItemObject(result.rows[0]);
		// return instance;
	}

	/**
	 * Given a plot id, returns the row data of a placedItem from the database.
	 * @plotId the id of the plot in the database
	 */
	async getPlacedItemByPlotId(plotId: string): Promise<PlacedItemEntity | null> {
		const result = await query<PlacedItemEntity>('SELECT id, owner, identifier, status FROM placed_items WHERE owner = $1', [plotId]);
		// If no rows are returned, return null
		if (!result || result.rows.length === 0) return null;
		return result.rows[0];
		// Return the first item found
		// const instance = makePlacedItemObject(result.rows[0]);
		// return instance;
	}

	/**
	 * Begins a transaction if there is not already one. Creates a new placedItem row.
	 * On error, rolls back.
	 * @plotId the id of the owner (plot) of this placedItem. If the owner cannot be found, fails.
	 * @placedItem the placedItem used to create this object
	 * @client the pool client that this is nested within, or null if it should create its own transaction.
	 * @returns a PlacedItemEntity with the corresponding data if success, null if failure (or throws error)
	 */
	async createPlacedItem(plotId: string, placedItem: PlacedItem, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}
			// Check if the placedItem already exists
			const existingPlacedItemResult = await client.query<PlacedItemEntity>(
				'SELECT id, owner, identifier, status FROM placed_items WHERE owner = $1 AND identifier = $2',
				[plotId, placedItem.itemData.id]
			);

			if (existingPlacedItemResult.rows.length > 0) {
				// PlacedItem already exists
				console.warn(`PlacedItem already exists for plot ${plotId} with this ID: ${existingPlacedItemResult.rows[0].id}`);
				return existingPlacedItemResult.rows[0];
				// return makePlacedItemObject(existingPlacedItemResult.rows[0]); 
			}
			
			const result = await query<PlacedItemEntity>(
				'INSERT INTO placed_items (id, owner, identifier, status) VALUES ($1, $2, $3, $4) RETURNING id, owner, identifier, status',
				[placedItem.getPlacedItemId(), plotId, placedItem.itemData.id, placedItem.getStatus()]
				);

			// Check if result is valid
			if (!result || result.rows.length === 0) {
				throw new Error('There was an error creating the placedItem');
			}

			if (shouldReleaseClient) {
				await client.query('COMMIT'); // Rollback the transaction on error
			}


			return result.rows[0];
			// Return the created PlacedItem as an instance
			// const instance = makePlacedItemObject(result.rows[0]);
			// return instance;
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error creating placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}

	/**
	 * Sets the identifier of the placedItem, effectively changing the item. Uses row level locking.
	 * @id the id of the placedItem
	 * @newIdentifier the item template id
	 * @newStatus the new status, defaults to empty string
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async replacePlacedItemById(id: string, newIdentifier: string, newStatus?: string, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string}>(
				'SELECT id FROM placed_items WHERE id = $1 FOR UPDATE',
				[id, newIdentifier]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for plotId: ${id}`);
			}

			if (!newStatus) {
				newStatus = '';
			}
		
			const placedItemResult = await client.query<PlacedItemEntity>(
				'UPDATE placed_items SET identifier = $1, status = $2 WHERE id = $3 RETURNING id, owner, identifier, status',
				[newIdentifier, newStatus, id]
				);


			// Check if result is valid
			if (!placedItemResult || placedItemResult.rows.length === 0) {
				throw new Error('There was an error updating the placedItem');
			}

			if (shouldReleaseClient) {
				await client.query('COMMIT'); // Rollback the transaction on error
			}
			const updatedRow = placedItemResult.rows[0];
			return updatedRow;
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error updating placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}

	/**
	 * Sets the identifier of the placedItem, effectively changing the item. Uses row level locking.
	 * @plotId the id of the owner (plot)
	 * @newIdentifier the item template id
	 * @newStatus the new status, defaults to empty string
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async replacePlacedItemByPlotId(plotId: string, newIdentifier: string, newStatus?: string, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string}>(
				'SELECT id FROM placed_items WHERE owner = $1 FOR UPDATE',
				[plotId, newIdentifier]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for plotId: ${plotId}`);
			}

			if (!newStatus) {
				newStatus = '';
			}
		
			const placedItemResult = await client.query<PlacedItemEntity>(
				'UPDATE placed_items SET identifier = $1, status = $2 WHERE owner = $3 RETURNING id, owner, identifier, status',
				[newIdentifier, newStatus, plotId]
				);


			// Check if result is valid
			if (!placedItemResult || placedItemResult.rows.length === 0) {
				throw new Error('There was an error updating the placedItem');
			}

			if (shouldReleaseClient) {
				await client.query('COMMIT'); // Rollback the transaction on error
			}
			const updatedRow = placedItemResult.rows[0];
			return updatedRow;
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error updating placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}


	/**
	 * Sets the status of the placedItem. Uses row level locking.
	 * @id the id of the placedItem
	 * @newStatus the new status
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async setPlacedItemStatusById(id: string, newStatus: string, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string}>(
				'SELECT id FROM placed_items WHERE id = $1 FOR UPDATE',
				[id]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for id: ${id}`);
			}
		
			const placedItemResult = await client.query<PlacedItemEntity>(
				'UPDATE placed_items SET status = $1 WHERE id = $2 RETURNING id, owner, identifier, status',
				[newStatus, id]
				);


			// Check if result is valid
			if (!placedItemResult || placedItemResult.rows.length === 0) {
				throw new Error('There was an error updating the placedItem');
			}

			if (shouldReleaseClient) {
				await client.query('COMMIT'); // Rollback the transaction on error
			}
			const updatedRow = placedItemResult.rows[0];
			return updatedRow;
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error updating placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}

	/**
	 * Sets the status of the placedItem. Uses row level locking.
	 * @plotId the id of the owner (plot)
	 * @newStatus the new status
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async setPlacedItemStatusByPlotId(plotId: string, newStatus: string, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string}>(
				'SELECT id FROM placed_items WHERE owner = $1 FOR UPDATE',
				[plotId]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for plotId: ${plotId}`);
			}
		
			const placedItemResult = await client.query<PlacedItemEntity>(
				'UPDATE placed_items SET status = $1 WHERE owner = $2 RETURNING id, owner, identifier, status',
				[newStatus, plotId]
				);


			// Check if result is valid
			if (!placedItemResult || placedItemResult.rows.length === 0) {
				throw new Error('There was an error updating the placedItem');
			}

			if (shouldReleaseClient) {
				await client.query('COMMIT'); // Rollback the transaction on error
			}
			const updatedRow = placedItemResult.rows[0];
			return updatedRow;
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error updating placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}

	/**
	 * Deletes the specified placedItem from the database. Returns the deleted row.
	 * @id the id of the placedItem
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async deletePlacedItemById(id: string, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string, current_status: number}>(
				'SELECT id, status AS current_status FROM placed_items WHERE id = $1 FOR UPDATE',
				[id]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for id: ${id}`);
			}
			const deleteResult = await client.query<PlacedItemEntity>(
				'DELETE FROM placed_items WHERE id = $1 RETURNING id, owner, identifier, status',
				[id]
			);
		
			if (shouldReleaseClient) {
				await client.query('COMMIT');
			}
		
			return deleteResult.rows[0];
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error deleting placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}


	/**
	 * Deletes the specified placedItem from the database. Returns the deleted row.
	 * @plotId the id of the owner (plot)
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async deletePlacedItemByPlotId(plotId: string, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string, current_status: number}>(
				'SELECT id, status AS current_status FROM placed_items WHERE owner = $1 FOR UPDATE',
				[plotId]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for plotId: ${plotId}`);
			}
			const deleteResult = await client.query<PlacedItemEntity>(
				'DELETE FROM placed_items WHERE owner = $1 RETURNING id, owner, identifier, status',
				[plotId]
			);
		
			if (shouldReleaseClient) {
				await client.query('COMMIT');
			}
		
			return deleteResult.rows[0];
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error deleting placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}

	/**
	 * Deletes the specified placedItem from the database. Returns the deleted row.
	 * @gardenId the id of the owner (garden)
	 * @rowIndex the row this plot is in
	 * @columnIndex the column this plot is in
	 * @returns a PlacedItemEntity with the new data on success (or throws error)
	 */
	async deletePlacedItemFromGarden(gardenId: string, rowIndex: number, columnIndex: number, client?: PoolClient): Promise<PlacedItemEntity | null> {
		const shouldReleaseClient = !client;
		if (!client) {
			client = await pool.connect();
		}
		try {
			if (shouldReleaseClient) {
				await client.query('BEGIN'); // Start the transaction
			}

			const existingPlotResult = await client.query<{plot_id: string}>(
				'SELECT id as plot_id FROM plots WHERE owner = $1 AND row_index = $2 and col_index = $3',
				[gardenId, rowIndex, columnIndex]
			);

			if (!existingPlotResult || existingPlotResult.rows.length === 0) {
				throw new Error(`Could not find plot for garden id: ${gardenId} at row ${rowIndex}, col ${columnIndex}`);
			}

			//Lock the row for update
			const lockResult = await client.query<{id: string, current_status: number}>(
				'SELECT id, status AS current_status FROM placed_items WHERE owner = $1 FOR UPDATE',
				[existingPlotResult.rows[0].plot_id]
			);

			if (lockResult.rows.length === 0) {
				throw new Error(`PlacedItem not found for plotId: ${existingPlotResult.rows[0].plot_id}`);
			}


			const deleteResult = await client.query<PlacedItemEntity>(
				'DELETE FROM placed_items WHERE owner = $1 RETURNING id, owner, identifier, status',
				[existingPlotResult.rows[0].plot_id]
			);
		
			if (shouldReleaseClient) {
				await client.query('COMMIT');
			}
		
			return deleteResult.rows[0];
		} catch (error) {
			if (shouldReleaseClient) {
				await client.query('ROLLBACK'); // Rollback the transaction on error
			}
			console.error('Error deleting placedItem:', error);
			throw error; // Rethrow the error for higher-level handling
		} finally {
			if (shouldReleaseClient) {
				client.release(); // Release the client back to the pool
			}
		}
	}
}

const placedItemRepository = new PlacedItemRepository();
export default placedItemRepository;