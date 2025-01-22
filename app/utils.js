


export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};

  for (const [key, value] of params) {
    result[key] = value;
  }

  return result;
}

export function getSecondParameterValue(url, parameterKey) {
  const params = new URLSearchParams(url.split('?')[1]);
  return params.get(parameterKey);
}