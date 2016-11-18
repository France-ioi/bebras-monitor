
import Immutable from 'immutable';
import FingerTree from 'fingertree';

function Measure (size, minTotal, maxTotal, lru) {
  this.size = size;
  this.minTotal = minTotal;
  this.maxTotal = maxTotal;
  this.lru = lru;
}

const identity = new Measure(0, Infinity, -Infinity);

const measurer = {
  identity: () => identity,
  measure: function (x) {
    return new Measure(1, x.total, x.total, x.updatedAt);
  },
  sum: function (a, b) {
    return new Measure(
      a.size + b.size,
      Math.min(a.minTotal, b.minTotal),
      Math.max(a.maxTotal, b.maxTotal),
      Math.min(a.lru, b.lru)
    );
  }
};

function Entry (position, element) {
  this.position = position;
  this.element = element;
}

export default function LiveSet () {
  this.map = Immutable.Map();
  this.tree = FingerTree.fromArray([], measurer);
  Object.freeze(this);
};

LiveSet.prototype.mutated = function (func) {
  const copy = Object.create(LiveSet.prototype);
  copy.map = this.map;
  copy.tree = this.tree;
  func(copy);
  Object.freeze(copy);
  return copy;
};

LiveSet.prototype.size = function () {
  return this.tree.measure().size;
};

LiveSet.prototype.get = function (key) {
  const entry = this.map.get(key);
  return entry ? entry.element : null;
};

LiveSet.prototype.set = function (element) {
  const key = element.key;
  const entry = this.map.get(key);
  if (!entry) {
    const position = this.tree.measure().size;
    this.map = this.map.set(key, new Entry(position, element));
    this.tree = this.tree.addLast(element);
    return null;
  }
  // Replace the element with the same key.
  const trees = this.tree.split(m => m.size > entry.position);
  const left = trees[0], right = trees[1];
  const oldElement = right.peekFirst();
  const newRight = right.removeFirst().addFirst(element);
  this.map = this.map.set(key, new Entry(entry.position, element));
  this.tree = left.concat(newRight);
  return oldElement;
};

LiveSet.prototype.extract = function (key) {
  var entry = this.map.get(key);
  if (!entry) {
    return;
  }
  const position = entry.position;
  const trees = this.tree.split(part => part.size > position);
  return this._extract(trees[0], trees[1]);
};

LiveSet.prototype.extractMinTotal = function () {
  const minTotal = this.tree.measure().minTotal;
  const trees = this.tree.split(part => part.minTotal <= minTotal);
  return this._extract(trees[0], trees[1]);
};

LiveSet.prototype.extractMaxTotal = function () {
  const maxTotal = this.tree.measure().maxTotal;
  const trees = this.tree.split(part => part.maxTotal >= maxTotal);
  return this._extract(trees[0], trees[1]);
};

LiveSet.prototype.extractLru = function () {
  const lru = this.tree.measure().lru;
  const trees = this.tree.split(part => part.lru <= lru);
  return this._extract(trees[0], trees[1]);
};

LiveSet.prototype._extract = function (left, right) {
  if (right.isEmpty()) {
    // [left.peekLast(), left.removeLast()] ???
    return null;
  }
  const position = left.measure().size;
  const element = right.peekFirst();
  let newRight = right.removeFirst();
  if (!newRight.isEmpty()) {
    const replacement = right.peekLast();
    this.map = this.map.set(replacement.key, new Entry(position, replacement));
    newRight = right.removeLast().addFirst(replacement);
  }
  this.map = this.map.delete(element.key);
  this.tree = left.concat(newRight);
  return element;
};
