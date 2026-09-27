/**
 * Binary min-heap of node indices ordered by (primary, secondary, insertion order).
 * The insertion-order tie-break keeps every algorithm deterministic, which makes the
 * animations reproducible and lets equal-cost frontiers expand as clean "waves".
 */
export class MinHeap {
  private values: number[] = [];
  private primary: number[] = [];
  private secondary: number[] = [];
  private order: number[] = [];
  private counter = 0;

  get size() {
    return this.values.length;
  }

  push(value: number, primary: number, secondary = 0) {
    this.values.push(value);
    this.primary.push(primary);
    this.secondary.push(secondary);
    this.order.push(this.counter++);
    this.siftUp(this.values.length - 1);
  }

  /** Primary key of the smallest entry; Infinity when empty. */
  peekKey(): number {
    return this.values.length ? this.primary[0] : Infinity;
  }

  peek(): number {
    return this.values[0];
  }

  pop(): number {
    const top = this.values[0];
    const last = this.values.length - 1;
    this.swap(0, last);
    this.values.pop();
    this.primary.pop();
    this.secondary.pop();
    this.order.pop();
    if (this.values.length) this.siftDown(0);
    return top;
  }

  private less(a: number, b: number) {
    if (this.primary[a] !== this.primary[b]) return this.primary[a] < this.primary[b];
    if (this.secondary[a] !== this.secondary[b]) return this.secondary[a] < this.secondary[b];
    return this.order[a] < this.order[b];
  }

  private swap(a: number, b: number) {
    [this.values[a], this.values[b]] = [this.values[b], this.values[a]];
    [this.primary[a], this.primary[b]] = [this.primary[b], this.primary[a]];
    [this.secondary[a], this.secondary[b]] = [this.secondary[b], this.secondary[a]];
    [this.order[a], this.order[b]] = [this.order[b], this.order[a]];
  }

  private siftUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(i, parent)) return;
      this.swap(i, parent);
      i = parent;
    }
  }

  private siftDown(i: number) {
    const n = this.values.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.less(l, smallest)) smallest = l;
      if (r < n && this.less(r, smallest)) smallest = r;
      if (smallest === i) return;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}
