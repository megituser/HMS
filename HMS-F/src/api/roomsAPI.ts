/**
 * This file is now a bridge to the feature-based API services.
 * It's maintained for backward compatibility with existing hooks like useWards.ts.
 * New code should import directly from @/features/rooms/api
 */

export * from "../features/rooms/api/rooms.api";
export * from "../features/rooms/api/beds.api";
export * from "../features/rooms/api/admissions.api";

// Map old names to new ones if necessary
import { getRooms as getAllRooms } from "../features/rooms/api/rooms.api";
import { getCurrentAdmissions as getCurrentlyAdmitted } from "../features/rooms/api/admissions.api";

export { getAllRooms, getCurrentlyAdmitted };

// Re-export types from the new source of truth
export * from "../features/rooms/types";
