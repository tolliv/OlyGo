//=======================================================
// CODE Géolocalisation
//=======================================================

// Valeurs de gGeoStatus
// - 3 : fini, erreur non encore atteinte
// - 2 : fini, erreur permission refusée
// - 1 : fini, erreur géolocalisation non supportée
// = 0 : fini, précision atteinte
// > 9 : run,  précision non encore atteinte
let gGeoStatus = -99;
let gGeoLatitude = 0;
let gGeoLongitude = 0;
let gGeoEmplacement = "";
let gGeoAccuracy = 0;
let gGeoAltitude = 0;
let gGeoTimeout = 0;
let gGeoWatchId = 0;
let gGlobalTimeoutId = 0;
let gNbSimulationGeolocalisation = 0;

//-------------------------------------------------------
// Conversion de la chaine en coordonnées
//-------------------------------------------------------
function convertirChaineEnCoordonnees(pChaine)
{
  let lat = 0;
  let lon = 0;
  const tableauDeChaines = pChaine.split(','); [15]

  // Vérifie s'il y a bien deux éléments
  // Sinon on renvoie 0
  if (tableauDeChaines.length == 2)
  {
    // Convertit chaque élément en nombre à virgule flottante
    const tableauDeNombres = tableauDeChaines.map(Number);
    lat = tableauDeNombres[0];
    lon = tableauDeNombres[1];

    // Vérifie si les conversions ont réussi
    if (isNaN(lat))
    {
      lat = 0;
    }
    if (isNaN(lon))
    {
      lon = 0;
    }
  }
  return {lat: lat, lon: lon};
}

//-------------------------------------------------------
// Geolocalisation avec surveillance de la position
//-------------------------------------------------------
function GeolocalisationWatch(pPrecision)
{
  if (pid('ChkSimulation').checked)
  {
    const coord = convertirChaineEnCoordonnees(pid('TxtCoordonnees').value);
    gGeoAccuracy = 10;
    gGeoLatitude = coord.lat;
    gGeoLongitude = coord.lon;
    gGeoAltitude = 123;
    gGeoStatus = 0;
    return;
  }

  // Réinit du compteur pour la simulation
  gNbSimulationGeolocalisation = 0;

  // Lancé.
  // La prochaine valeur sera 2 à la prochaine position ou 0 si précision atteinte
  gGeoStatus = 1;

  // Options pour la demande de géolocalisation
  const lGeoOptions =
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  // Vérifie si l'API de géolocalisation est supportée par le navigateur
  if (!navigator.geolocation)
  {
    gGeoStatus = -1;
    return;
  }

  // Surveillance de la position
  gGeoWatchId = navigator.geolocation.watchPosition
  (
    //----- SUCCESS Fonction est appelée chaque fois que la position change -----
    (position) =>
    {
      gGeoLatitude = position.coords.latitude;
      gGeoLongitude = position.coords.longitude;
      gGeoAccuracy = Math.round(position.coords.accuracy);
      gGeoAltitude = Math.round(position.coords.altitude);
      if (gGeoAccuracy <= pPrecision)
      {
        gGeoStatus = 0; // Précision atteinte
        ArretGeolocalisation();
      }
      else
        gGeoStatus++;   // Nouvelle position mais précision non atteinte
    },

    //----- ERROR Fonction appelée en cas d'erreur -----
    (error) =>
    {
      switch (error.code)
      {
        case error.PERMISSION_DENIED:
          gGeoStatus = -2; // L'utilisateur a refusé la demande de géolocalisation, on arrête
          ArretGeolocalisation();
          break;

        case error.POSITION_UNAVAILABLE:
          // Les informations de localisation ne sont pas disponibles, on continue
          break;

        case error.TIMEOUT:
          // Expiration du timeout pour 1 mesure de position, on continue
          break;

        case error.UNKNOWN_ERROR:
          // Une erreur inconnue s'est produite, on continue
          break;
      }
    },
    lGeoOptions
  );
}

//-------------------------------------------------------
// Arrêt géolocalisation
//-------------------------------------------------------
function ArretGeolocalisation()
{
  if (gGeoWatchId != 0)
  {
    navigator.geolocation.clearWatch(gGeoWatchId);
    gGeoWatchId = 0;
  }
  if (gGlobalTimeoutId != 0)
  {
    clearTimeout(gGlobalTimeoutId);
    gGlobalTimeoutId = 0;
  }
}
