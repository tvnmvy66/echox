import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundService from 'react-native-background-actions';

function HomeScreen() {
    const sleep = (time:any) => new Promise((resolve:any) => setTimeout(() => resolve(), time));
    // const isDarkMode = useColorScheme() === 'dark';

    const veryIntensiveTask = async (taskDataArguments:any) => {
        // Example of an infinite loop task
        const { delay } = taskDataArguments;
        await new Promise( async (resolve:any) => {
            for (let i = 0; BackgroundService.isRunning(); i++) {
                console.log(i);
                await sleep(delay);
            }
        });
    }; 

    const options = {
        taskName: 'Example',
        taskTitle: 'ExampleTask title',
        taskDesc: 'ExampleTask description',
        taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
        },
        color: '#ff00ff',
        linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
        parameters: {
            delay: 1000,
        },
    };

    const startBackgroundService = async () => {
        console.log('starting Background Service');
        await BackgroundService.start(veryIntensiveTask, options);
        await BackgroundService.updateNotification({taskDesc: 'New ExampleTask description'}); // Only Android, iOS will ignore this call
        console.log('started Background Service');

    };

    const stopBackgroundService = async () => {
        console.log('Stopping Background Service');
        await BackgroundService.stop();
        console.log('Stopped Background Service');
    };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
      <TouchableOpacity style={styles.button} onPress={startBackgroundService}>
        <Text style={styles.buttonText}>Start Me</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={stopBackgroundService}>
        <Text style={styles.buttonText}>Stop Me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
