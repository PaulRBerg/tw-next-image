const FILE_EXT_REGEX = /\.[^.]+$/;

/**
 * Extracts alt text from an image src path.
 * Returns the filename without extension.
 */
export function getAltFromSrc(src: string): string {
  const filename = src.split("/").pop() ?? "";
  return filename.replace(FILE_EXT_REGEX, "");
}
