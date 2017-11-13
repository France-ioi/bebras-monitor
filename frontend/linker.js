
export function link (rootBundle) {
  const context = {views: {}, actionBuilders: {}, selectors: {}, sagas: []};
  Object.assign(context, finalizeBundle(linkBundle(rootBundle, context)));
  return context;
}

function linkBundle (bundle, context) {
  const {earlyReducer, lateReducer} = bundle;
  const actionReducer = makeActionReducer(bundle.actionReducers);
  if (bundle.actionBuilders) {
    /* TODO: check for conflicts */
    Object.assign(context.actionBuilders, bundle.actionBuilders);
  }
  if (bundle.views) {
    /* TODO: check for conflicts */
    Object.assign(context.views, bundle.views);
  }
  if (bundle.selectors) {
    /* TODO: check for conflicts */
    Object.assign(context.selectors, bundle.selectors);
  }
  if (bundle.sagas) {
    Array.prototype.push.apply(context.sagas, bundle.sagas);
  }
  let result = {earlyReducer, actionReducer, lateReducer};
  if (bundle.includes) {
    bundle.includes.forEach(bundle => {
      result = combineBundles(result, linkBundle(bundle, context));
    });
  }
  return result;
}

function finalizeBundle (bundle) {
  const {earlyReducer, actionReducer, lateReducer} = bundle;
  const reducer = sequenceReducers(earlyReducer, actionReducer, lateReducer) ||
    ((state, action) => state);
  return {reducer};
}

function combineBundles (fst, snd) {
  const earlyReducer = sequenceReducers(fst.earlyReducer, snd.earlyReducer);
  const actionReducer = sequenceReducers(fst.actionReducer, snd.actionReducer);
  const lateReducer = sequenceReducers(fst.lateReducer, snd.lateReducer);
  return {earlyReducer, actionReducer, lateReducer};
}

function makeActionReducer (obj) {
  if (!obj) {
    return undefined;
  }
  if (typeof obj !== 'object') {
    throw new Error('action reducer must be an object');
  }
  if (Object.keys(obj).length === 0) {
    return undefined;
  }
  return function (state, action) {
    const reducer = obj[action.type];
    return typeof reducer === 'function' ? reducer(state, action) : state;
  };
}

function sequenceReducers (...reducers) {
  let result = undefined;
  for (var i = 0; i < reducers.length; i += 1) {
    var reducer = reducers[i];
    if (!reducer) {
      continue;
    }
    if (typeof reducer !== 'function') {
      throw new Error('reducer must be a function', reducer);
    }
    if (!result) {
      result = reducer;
    } else {
      result = composeReducers(result, reducer);
    }
  }
  return result;
}

function composeReducers (fst, snd) {
  return (state, action) => snd(fst(state, action), action);
}
