import { ILocation, Coordinates } from './ILocation';

export class ApiGeoLocation implements ILocation {
  getLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La geolocalización no está soportada por este navegador.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('El usuario denegó el permiso de geolocalización.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('La ubicación no está disponible.'));
              break;
            case error.TIMEOUT:
              reject(new Error('La solicitud de geolocalización expiró.'));
              break;
            default:
              reject(new Error('Error desconocido al obtener la ubicación.'));
          }
        }
      );
    });
  }
}
