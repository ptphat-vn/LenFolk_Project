const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File;

export function toFormData(body: Record<string, unknown>) {
  const formData = new FormData();

  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (isFile(item)) {
          formData.append(key, item);
        } else {
          formData.append(key, String(item));
        }
      });
      return;
    }

    formData.append(key, isFile(value) ? value : String(value));
  });

  return formData;
}

export function hasFileValue(body: Record<string, unknown>) {
  return Object.values(body).some((value) => {
    if (isFile(value)) return true;
    return Array.isArray(value) && value.some((item) => isFile(item));
  });
}
