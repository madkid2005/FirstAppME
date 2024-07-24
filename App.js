import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [data, setData] = useState({
    fuelStationName: '',
    gasolineTanks: 0,
    gasTanks: 0,
    gasolineAmounts: [],
    gasAmounts: [],
    controlPeriod: { start: '', end: '' },
    initialGasoline: 0,
    initialGas: 0,
    receivedGasoline: 0,
    receivedGas: 0,
    electronicSalesGasoline: 0,
    electronicSalesGas: 0,
    gasolineNozzles: 0,
    gasNozzles: 0,
    gasolineNozzleAmounts: [],
    gasNozzleAmounts: [],
  });
  const [results, setResults] = useState({});

  const handleChange = (name, value) => {
    setData({ ...data, [name]: value });
  };

  const handleNestedChange = (parent, key, value) => {
    setData({ ...data, [parent]: { ...data[parent], [key]: value } });
  };

  const handleDynamicChange = (name, index, value) => {
    const updatedArray = [...data[name]];
    updatedArray[index] = value;
    setData({ ...data, [name]: updatedArray });
  };

  const calculateResults = () => {
    const {
      initialGasoline,
      initialGas,
      receivedGasoline,
      receivedGas,
      gasolineAmounts,
      gasAmounts,
      gasolineNozzleAmounts,
      gasNozzleAmounts,
    } = data;

    const totalGasolineInventory = initialGasoline + receivedGasoline;
    const totalGasInventory = initialGas + receivedGas;

    const totalGasolineSales = gasolineNozzleAmounts.reduce((acc, curr) => {
      const [start, end] = curr;
      return acc + (parseFloat(end) - parseFloat(start));
    }, 0);

    const totalGasSales = gasNozzleAmounts.reduce((acc, curr) => {
      const [start, end] = curr;
      return acc + (parseFloat(end) - parseFloat(start));
    }, 0);

    const finalGasolineInventory = gasolineAmounts.reduce((acc, curr) => acc + parseFloat(curr), 0);
    const finalGasInventory = gasAmounts.reduce((acc, curr) => acc + parseFloat(curr), 0);

    const totalGasolineOut = totalGasolineInventory - finalGasolineInventory;
    const totalGasOut = totalGasInventory - finalGasInventory;

    const postSaleGasolineInventory = totalGasolineInventory - totalGasolineSales;
    const postSaleGasInventory = totalGasInventory - totalGasSales;

    setResults({
      totalGasolineSales,
      totalGasSales,
      totalGasolineOut,
      totalGasOut,
      gasolineDifference: {
        value: postSaleGasolineInventory - finalGasolineInventory,
        status: postSaleGasolineInventory - finalGasolineInventory > 0 ? 'کسری' : 'سرک'
      },
      gasDifference: {
        value: postSaleGasInventory - finalGasInventory,
        status: postSaleGasInventory - finalGasInventory > 0 ? 'کسری' : 'سرک'
      }
    });
  };

  const generatePdf = async () => {
    const html = `
      <html>
        <body>
          <h1>Fuel Station Report</h1>
          <p>Total Gasoline Sales: ${results.totalGasolineSales}</p>
          <p>Total Gas Sales: ${results.totalGasSales}</p>
          <p>Total Gasoline Out: ${results.totalGasolineOut}</p>
          <p>Total Gas Out: ${results.totalGasOut}</p>
          <p>Gasoline Difference: ${results.gasolineDifference?.value} (${results.gasolineDifference?.status})</p>
          <p>Gas Difference: ${results.gasDifference?.value} (${results.gasDifference?.status})</p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder='Fuel Station Name'
        value={data.fuelStationName}
        onChangeText={(value) => handleChange('fuelStationName', value)}
      />
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='Number of Gasoline Tanks'
        value={data.gasolineTanks.toString()}
        onChangeText={(value) => handleChange('gasolineTanks', parseInt(value))}
      />
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='Number of Gas Tanks'
        value={data.gasTanks.toString()}
        onChangeText={(value) => handleChange('gasTanks', parseInt(value))}
      />
      {Array.from({ length: data.gasolineTanks }).map((_, index) => (
        <TextInput
          key={index}
          style={styles.input}
          keyboardType='numeric'
          placeholder={`Gasoline Tank ${index + 1} Amount`}
          value={data.gasolineAmounts[index] || ''}
          onChangeText={(value) => handleDynamicChange('gasolineAmounts', index, value)}
        />
      ))}
      {Array.from({ length: data.gasTanks }).map((_, index) => (
        <TextInput
          key={index}
          style={styles.input}
          keyboardType='numeric'
          placeholder={`Gas Tank ${index + 1} Amount`}
          value={data.gasAmounts[index] || ''}
          onChangeText={(value) => handleDynamicChange('gasAmounts', index, value)}
        />
      ))}
      <View style={styles.dateContainer}>
        <TextInput
          style={styles.input}
          placeholder='Control Period Start'
          value={data.controlPeriod.start}
          onChangeText={(value) => handleNestedChange('controlPeriod', 'start', value)}
        />
        <TextInput
          style={styles.input}
          placeholder='Control Period End'
          value={data.controlPeriod.end}
          onChangeText={(value) => handleNestedChange('controlPeriod', 'end', value)}
        />
      </View>
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='Initial Gasoline'
        value={data.initialGasoline.toString()}
        onChangeText={(value) => handleChange('initialGasoline', parseFloat(value))}
      />
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='Initial Gas'
        value={data.initialGas.toString()}
        onChangeText={(value) => handleChange('initialGas', parseFloat(value))}
      />
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='Received Gasoline'
        value={data.receivedGasoline.toString()}
        onChangeText={(value) => handleChange('receivedGasoline', parseFloat(value))}
      />
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        placeholder='Received Gas'
        value={data.receivedGas.toString()}
        onChangeText={(value) => handleChange('receivedGas', parseFloat(value))}
      />
      <Button title="Calculate Results" onPress={calculateResults} />
      <Button title="Generate PDF" onPress={generatePdf} />
      <Text style={styles.result}>Total Gasoline Sales: {results.totalGasolineSales}</Text>
      <Text style={styles.result}>Total Gas Sales: {results.totalGasSales}</Text>
      <Text style={styles.result}>Total Gasoline Out: {results.totalGasolineOut}</Text>
      <Text style={styles.result}>Total Gas Out: {results.totalGasOut}</Text>
      <Text style={styles.result}>
        Gasoline Difference: {results.gasolineDifference?.value} ({results.gasolineDifference?.status})
      </Text>
      <Text style={styles.result}>
        Gas Difference: {results.gasDifference?.value} ({results.gasDifference?.status})
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    width: '80%',
    paddingLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  result: {
    marginTop: 24,
    fontSize: 18,
  },
});
