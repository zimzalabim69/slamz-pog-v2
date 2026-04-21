import { useGameStore } from '@100/store/useGameStore';
import { SET_DEFS } from '@100/constants/setDefinitions';
import type { SetDef } from '@100/constants/setDefinitions';
import type { CollectionItem, SlamzData } from '@100/types/game';

/**
 * SetManager - Orchestrates collection logic and achievement triggering.
 * Migrated from store for architectural purity [SYS-GPL-102].
 */
export const SetManager = {
  /**
   * Processes a new capture and checks for set completion.
   */
  processCapture: (slamz: SlamzData) => {
    const state = useGameStore.getState();
    const { inventory, completedSets, unlockedSlammers } = state;

    const newItem: CollectionItem = {
      theme: slamz.theme,
      rarity: slamz.rarity,
      date: new Date().toISOString()
    };

    const newInventory = [...inventory, newItem];
    const newCompletedSets = [...completedSets];
    const newUnlockedSlammers = [...unlockedSlammers];

    // Find the set this slamz belongs to
    const setDef = Object.values(SET_DEFS).find((s) => s.members.includes(slamz.theme));

    if (setDef && !newCompletedSets.includes(setDef.id)) {
      const hasAllMembers = setDef.members.every((m) => 
        newInventory.some(invItem => invItem.theme === m)
      );

      if (hasAllMembers) {
        newCompletedSets.push(setDef.id);
        
        // Unlock associated slammer
        if (!newUnlockedSlammers.includes(setDef.slammer)) {
          newUnlockedSlammers.push(setDef.slammer);
        }

        console.log(`[SET_MANAGER] Set Complete: ${setDef.name}`);
      }
    }

    // Update store with new collection state
    useGameStore.setState({
      inventory: newInventory,
      completedSets: newCompletedSets,
      unlockedSlammers: newUnlockedSlammers
    });
  },

  /**
   * Helper to check if a specific theme is already in the collection.
   */
  hasTheme: (themeId: string): boolean => {
    return useGameStore.getState().inventory.some(item => item.theme === themeId);
  },

  /**
   * Returns the progress (0-1) for a specific set.
   */
  getSetProgress: (setId: string): number => {
    const setDef = SET_DEFS[setId];
    if (!setDef) return 0;
    
    const ownedCount = setDef.members.filter(m => 
      useGameStore.getState().inventory.some(item => item.theme === m)
    ).length;
    
    return ownedCount / setDef.members.length;
  }
};
