import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineStorage {
  static async set(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to offline storage:', error);
    }
  }

  static async get(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from offline storage:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from offline storage:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing offline storage:', error);
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  static async getMultiple(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result: { [key: string]: any } = {};

      values.forEach(([key, value]) => {
        if (value) {
          result[key] = JSON.parse(value);
        }
      });

      return result;
    } catch (error) {
      console.error('Error getting multiple values:', error);
      return {};
    }
  }

  static async setMultiple(keyValuePairs: {
    [key: string]: any;
  }): Promise<void> {
    try {
      const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error setting multiple values:', error);
    }
  }
}
