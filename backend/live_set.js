
import Immutable from 'immutable';
import FingerTree from 'fingertree';
import createTree from 'functional-red-black-tree';

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

function _indexAdd (index, value, key) {
  const it = index.find(value);
  if (it.valid) {
    return it.update(it.value.add(key));
  } else {
    return index.insert(value, Immutable.Set([key]));
  }
}

function _indexRemove (index, value, key) {
  const it = index.find(value);
  if (it === null) {
    return index;
  } else {
    return it.update(it.value.delete(key));
  }
}

export default function LiveSet () {
  this.byKey = Immutable.Map();
  this.tree = FingerTree.fromArray([], measurer);
  this.byTotal = createTree();
  Object.freeze(this);
};

LiveSet.prototype.mutated = function (func) {
  const copy = Object.create(LiveSet.prototype);
  copy.byKey = this.byKey;
  copy.tree = this.tree;
  copy.byTotal = this.byTotal;
  func(copy);
  Object.freeze(copy);
  return copy;
};

LiveSet.prototype.size = function () {
  return this.tree.measure().size;
};

LiveSet.prototype.get = function (key) {
  const entry = this.byKey.get(key);
  return entry ? entry.element : null;
};

LiveSet.prototype.set = function (element) {
  const key = element.key;
  const entry = this.byKey.get(key);
  if (!entry) {
    const position = this.tree.measure().size;
    this.byKey = this.byKey.set(key, new Entry(position, element));
    this.tree = this.tree.addLast(element);
    this.byTotal = _indexAdd(this.byTotal, element.total, key);
    return null;
  }
  // Replace the element with the same key.
  const trees = this.tree.split(m => m.size > entry.position);
  const left = trees[0], right = trees[1];
  const oldElement = right.peekFirst();
  const newRight = right.removeFirst().addFirst(element);
  this.byKey = this.byKey.set(key, new Entry(entry.position, element));
  this.tree = left.concat(newRight);
  this.byTotal = _indexAdd(_indexRemove(this.byTotal, oldElement.total, key), element.total, key);
  return oldElement;
};

LiveSet.prototype.extract = function (key) {
  var entry = this.byKey.get(key);
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
    this.byKey = this.byKey.set(replacement.key, new Entry(position, replacement));
    newRight = right.removeLast().addFirst(replacement);
  }
  const key = element.key;
  this.byKey = this.byKey.delete(key);
  this.tree = left.concat(newRight);
  this.byTotal = _indexRemove(this.byTotal, element.total, key);
  return element;
};

LiveSet.prototype.view = function (count) {
  let it = this.byTotal.end;
  const result = [];
  while (result.length < count && it.valid) {
    it.value.forEach(key => {
      if (result.length < count) {
        result.push(this.byKey.get(key).element);
      }
    });
    it.prev();
  }
  return result;
};
