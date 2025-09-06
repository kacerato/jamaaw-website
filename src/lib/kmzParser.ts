import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export interface ParsedKmzCoordinate {
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
}

/**
 * Parses a KMZ file (which is a zipped KML file) and extracts coordinates.
 * @param file The KMZ file as a Blob or File.
 * @returns A promise that resolves to an array of parsed coordinates.
 */
export async function parseKmzFile(file: Blob): Promise<ParsedKmzCoordinate[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);

  let kmlContent: string | undefined;

  // Find the KML file (usually .kml extension, often doc.kml)
  for (const filename in contents.files) {
    if (filename.toLowerCase().endsWith(".kml")) {
      kmlContent = await contents.files[filename].async("text");
      break;
    }
  }

  if (!kmlContent) {
    throw new Error("No KML file found inside the KMZ archive.");
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true,
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: true,
    cdataPropName: "__cdata",
  });
  const jsonObj = parser.parse(kmlContent);

  const coordinates: ParsedKmzCoordinate[] = [];

  // Helper function to extract placemarks
  const extractPlacemarks = (obj: any) => {
    if (!obj) return;

    // Handle single Placemark or array of Placemarks
    const placemarks = Array.isArray(obj.Placemark) ? obj.Placemark : (obj.Placemark ? [obj.Placemark] : []);

    for (const placemark of placemarks) {
      const name = placemark.name || undefined;
      const description = placemark.description || undefined;

      // Look for Point coordinates
      if (placemark.Point && placemark.Point.coordinates) {
        const coords = String(placemark.Point.coordinates).trim().split(",");
        if (coords.length >= 2) {
          const longitude = parseFloat(coords[0]);
          const latitude = parseFloat(coords[1]);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            coordinates.push({ latitude, longitude, name, description });
          }
        }
      }

      // Look for LineString coordinates
      if (placemark.LineString && placemark.LineString.coordinates) {
        const lineCoords = String(placemark.LineString.coordinates).trim().split(/\s+/);
        for (const lineCoord of lineCoords) {
          const coords = lineCoord.split(",");
          if (coords.length >= 2) {
            const longitude = parseFloat(coords[0]);
            const latitude = parseFloat(coords[1]);
            if (!isNaN(latitude) && !isNaN(longitude)) {
              coordinates.push({ latitude, longitude, name, description });
            }
          }
        }
      }

      // Look for Polygon coordinates (only outer boundary for simplicity)
      if (placemark.Polygon && placemark.Polygon.outerBoundaryIs && placemark.Polygon.outerBoundaryIs.LinearRing && placemark.Polygon.outerBoundaryIs.LinearRing.coordinates) {
        const polyCoords = String(placemark.Polygon.outerBoundaryIs.LinearRing.coordinates).trim().split(/\s+/);
        for (const polyCoord of polyCoords) {
          const coords = polyCoord.split(",");
          if (coords.length >= 2) {
            const longitude = parseFloat(coords[0]);
            const latitude = parseFloat(coords[1]);
            if (!isNaN(latitude) && !isNaN(longitude)) {
              coordinates.push({ latitude, longitude, name, description });
            }
          }
        }
      }

      // Recursively check for Placemarks within Folders or Document
      if (placemark.Folder) {
        extractPlacemarks(placemark.Folder);
      }
      if (placemark.Document) {
        extractPlacemarks(placemark.Document);
      }
    }
  };

  // Start parsing from the root Document or Folder
  if (jsonObj.kml && (jsonObj.kml.Document || jsonObj.kml.Folder)) {
    extractPlacemarks(jsonObj.kml.Document);
    extractPlacemarks(jsonObj.kml.Folder);
  } else if (jsonObj.Document || jsonObj.Folder) { // Sometimes kml tag is omitted
    extractPlacemarks(jsonObj.Document);
    extractPlacemarks(jsonObj.Folder);
  }

  return coordinates;
}

