


export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
}