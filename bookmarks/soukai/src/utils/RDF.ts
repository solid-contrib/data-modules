import type { JsonLD } from '@noeldemartin/solid-utils';

import IRI from '@/utils/IRI';

/**
 * RDF utility class for working with JSON-LD data.
 */
class RDF {

  /**
   * Gets the value of the given property from the provided JSON-LD object.
   *
   * Looks up the property in the JSON-LD object directly using the given property name.
   * If not found, checks the '@context' to find the full IRI for the property name.
   * Uses this to look up the value with the prefix added.
   *
   * Returns the property value or null if not found. The value is cast to the generic type T.
   * If the value is an array with one item, just returns that item.
   */
  public getJsonLDProperty<T = unknown>(
    json: JsonLD,
    property: string
  ): T | null {
    property = IRI(property);

    if (property in json) return this.getJsonLDPropertyValue(json[property]);

    if (!("@context" in json)) return null;

    const context = json["@context"] as Record<string, string>;
    const contextProperty = Object.entries(context).find(([_, url]) =>
      property.startsWith(url)
    );

    if (!contextProperty) return null;

    const propertyPrefix =
      contextProperty[0] === "@vocab" ? "" : `${contextProperty[0]}:`;
    const propertyValue =
      json[propertyPrefix + property.substr(contextProperty[1].length)];

    return this.getJsonLDPropertyValue(propertyValue);
  }

    private getJsonLDPropertyValue<T = unknown>(value: unknown): T | null {
        if (value === undefined)
            return null;

        return (Array.isArray(value) && value.length === 1) ? value[0] : value;
    }

}

export default new RDF();
