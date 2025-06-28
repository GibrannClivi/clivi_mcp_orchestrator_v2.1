/**
 * Cache Manager for MCP Orchestrator
 * Implements multi-layer caching (in-memory + Firestore)
 */
import NodeCache from 'node-cache';
import { config } from '../config';

export interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private memoryCache: NodeCache;
  private ttl: number;

  constructor() {
    this.ttl = config.cache.ttlSeconds;
    this.memoryCache = new NodeCache({
      stdTTL: this.ttl,
      checkperiod: this.ttl * 0.2,
      useClones: false,
    });
  }

  /**
   * Get data from cache
   */
  async get(key: string): Promise<any | null> {
    // Try memory cache first (L2)
    const memoryData = this.memoryCache.get(key);
    if (memoryData) {
      console.log(`Cache HIT (memory): ${key}`);
      return memoryData;
    }

    // TODO: Add Firestore cache (L1) here when implemented
    console.log(`Cache MISS: ${key}`);
    return null;
  }

  /**
   * Set data in cache
   */
  async set(key: string, data: any, customTtl?: number): Promise<void> {
    const ttl = customTtl || this.ttl;
    
    // Store in memory cache
    this.memoryCache.set(key, data, ttl);
    console.log(`Cache SET (memory): ${key} with TTL ${ttl}s`);

    // TODO: Add Firestore cache (L1) here when implemented
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.del(key);
    console.log(`Cache DELETE: ${key}`);
    
    // TODO: Add Firestore cache deletion here when implemented
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.flushAll();
    console.log('Cache CLEARED (memory)');
    
    // TODO: Add Firestore cache clearing here when implemented
  }

  /**
   * Generate cache key for user profile queries
   */
  generateProfileCacheKey(query: string, queryType: string): string {
    return `user_profile:${queryType}:${query.toLowerCase()}`;
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    return {
      memory: this.memoryCache.getStats(),
      ttl: this.ttl,
    };
  }
}

export default CacheManager;
