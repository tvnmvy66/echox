import { Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const requestLocationPermission = async () => {
    try {
      const fine = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (fine === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Fine location granted');

        // Now request background
        if (Number(Platform.Version) >= 29) {
          const bg = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: 'Background Location Permission',
              message: 'This app needs background location to work properly.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (bg === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Background location granted ');
          } else {
            console.log('Background location denied ');
          }
        }
      } else {
        console.log('Fine location denied ');
      }
    } catch (err) {
      console.warn(err);
    }
  };


export const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude,longitude)
        return { latitude, longitude };
      },
      (error) => {
        console.log(error.message);
        return null
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };