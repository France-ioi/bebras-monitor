
export function hexToBytes (hex) {
  var bytes = [];
  for (var i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
};

export function getKeyIP (key) {
  const md = /^IP\(([0-9a-f]+)\)$/.exec(key);
  if (!md) {
    return;
  }
  const hexIp = md[1];
  return hexToBytes(hexIp).join('.');
};
