import { getRandomBytesAsync } from "expo-random";

class RandomValuesSync {
  generated = new ArrayBuffer(0);
  ready = undefined;
  curIndex = 0;
  constructor() {
    this.ready = init().catch(console.log);
  }

  async setCacheSize(cacheSize = 1024) {
    this.cacheSize = cacheSize;
    const data = await getRandomBytesAsync(this.cacheSize);
    this.generated = data;
  }
  async init() {
    if (window.crypto === undefined) window.crypto = {};
    if (window.crypto.getRandomValues === undefined) window.crypto.getRandomValues = this.getRandomValues;
    await this.setCacheSize();
  }
  async fillCache() {
    if (this.generated.byteLength > this.cacheSize * 0.5) return;
    const fill = await getRandomBytesAsync(this.cacheSize - this.generated.byteLength);
    const newCache = new Uint8Array(this.cacheSize);
    newCache.set(this.generated);
    newCache.set(fill, this.generated.byteLength);
    this.generated = newCache;
  }
  getRandomValues(typedArray) {
    if (typedArray.constructor.name !== "Uint8Array")
      throw new Error(`getRandomValues only supports Uint8Array got ${typedArray.name}`);
    if (this.generated.byteLength < typedArray.byteLength) throw new Error("not enough pregenerated random bytes");
    const copy = this.generated.subarray(0, typedArray.byteLength);
    typedArray.set(copy);
    this.generated = this.generated.slice(typedArray.byteLength);
    this.ready = this.fillCache();
    return typedArray;
  }
}
export default new RandomValuesSync();
