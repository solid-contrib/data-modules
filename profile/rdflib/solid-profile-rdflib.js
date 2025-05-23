// include this file in your HTML page after including rdflib
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');

function getNameFromStore(store, webId) {
  return store.any($rdf.sym(webId), FOAF('name')) || store.any($rdf.sym(webId), VCARD('fn'));
}
